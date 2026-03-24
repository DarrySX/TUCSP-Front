import { getSupabaseAdmin, getSupabaseAnon, getSupabaseWithToken } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    // 1. Verify caller JWT
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { data: { user: caller }, error: authErr } = await getSupabaseAnon().auth.getUser(token);
    if (authErr || !caller) return Response.json({ error: 'No autorizado' }, { status: 401 });

    // 2. Check caller is super_admin
    const callerClient = getSupabaseWithToken(token);
    const { data: callerProfile, error: profileErr } = await callerClient
      .from('profiles').select('role').eq('id', caller.id).single();
    if (profileErr || callerProfile?.role !== 'super_admin') {
      return Response.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) return Response.json({ error: 'userId requerido' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();

    // 3. Get target's auth email
    const { data: authEmail, error: authEmailErr } = await supabaseAdmin
      .rpc('get_user_auth_email', { user_id: userId });
    if (authEmailErr) throw authEmailErr;
    if (!authEmail) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    // 4. Get target profile
    const { data: targetProfile, error: targetErr } = await callerClient
      .from('profiles').select('correo_electronico, first_name, last_name').eq('id', userId).single();
    if (targetErr || !targetProfile) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const name = [targetProfile.first_name, targetProfile.last_name].filter(Boolean).join(' ') || authEmail;

    // 5. Always generate a temp password via SQL (works for ALL users regardless of GoTrue state)
    const { data: tempPassword, error: tempErr } = await supabaseAdmin
      .rpc('admin_set_temp_password', { p_user_id: userId });
    if (tempErr) throw tempErr;

    // 6. Best-effort: also send reset email if user has a personal real email
    let emailSent = false;
    const personalEmail = targetProfile.correo_electronico;
    if (personalEmail && !personalEmail.endsWith('@tucsp.internal')) {
      const { error: emailErr } = await getSupabaseAnon().auth.resetPasswordForEmail(personalEmail);
      emailSent = !emailErr;
    }

    return Response.json({
      message: emailSent
        ? `Correo enviado a ${personalEmail} y contraseña temporal generada`
        : `Contraseña temporal generada para ${name}`,
      tempPassword,
      loginEmail: authEmail,
      emailSent,
      recipientEmail: personalEmail ?? undefined,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
