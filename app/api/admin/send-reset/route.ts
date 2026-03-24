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
    const redirectUrl = 'https://tunaucsp.vercel.app/auth/reset-password';

    // 3. Get target's current auth email
    const { data: authEmail, error: authEmailErr } = await supabaseAdmin
      .rpc('get_user_auth_email', { user_id: userId });
    if (authEmailErr) throw authEmailErr;
    if (!authEmail) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    // 4. Get target profile for display name
    const { data: targetProfile, error: targetErr } = await callerClient
      .from('profiles').select('correo_electronico, first_name, last_name').eq('id', userId).single();
    if (targetErr || !targetProfile) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const name = [targetProfile.first_name, targetProfile.last_name].filter(Boolean).join(' ') || authEmail;

    // 5. For @tucsp.internal (no real email) → temp password
    if (authEmail.endsWith('@tucsp.internal')) {
      const { data: tempPassword, error: tempErr } = await supabaseAdmin
        .rpc('admin_set_temp_password', { p_user_id: userId });
      if (tempErr) throw tempErr;
      return Response.json({
        tempPassword,
        loginEmail: authEmail,
        message: `Contraseña temporal generada para ${name}`,
      });
    }

    // 6. Real email → generate recovery link via admin API (bypasses redirect URL whitelist)
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: authEmail,
      options: { redirectTo: redirectUrl },
    });
    if (linkErr) throw linkErr;

    const recoveryLink = linkData.properties?.action_link;

    // 7. Also attempt to send email (no redirectTo to avoid whitelist error)
    // This sends the built-in Supabase email with the reset link.
    const { error: emailErr } = await getSupabaseAnon().auth.resetPasswordForEmail(authEmail);
    const emailSent = !emailErr;

    return Response.json({
      message: emailSent
        ? `Correo enviado a ${authEmail}`
        : `No se pudo enviar el correo automáticamente`,
      recoveryLink,
      emailSent,
      recipientEmail: authEmail,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
