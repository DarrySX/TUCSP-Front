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

    const { userId, redirectTo } = await request.json();
    if (!userId) return Response.json({ error: 'userId requerido' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();
    const redirectUrl = redirectTo ?? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`;

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

    // 5a. User has real synced email → send reset email normally
    if (
      targetProfile.correo_electronico &&
      targetProfile.correo_electronico === authEmail
    ) {
      const { error: resetErr } = await getSupabaseAnon().auth.resetPasswordForEmail(
        targetProfile.correo_electronico,
        { redirectTo: redirectUrl }
      );
      if (resetErr) throw resetErr;
      return Response.json({
        message: `Correo de recuperación enviado a ${targetProfile.correo_electronico}`,
      });
    }

    // 5b. No real email → set a temporary password directly in the database.
    // This bypasses all email/API issues and is guaranteed to work for every user.
    const { data: tempPassword, error: tempErr } = await supabaseAdmin
      .rpc('admin_set_temp_password', { p_user_id: userId });
    if (tempErr) throw tempErr;

    return Response.json({
      message: `Contraseña temporal generada para ${name}`,
      tempPassword,
      loginEmail: authEmail,
      warning: 'Este usuario no tiene correo real. Comparte la contraseña temporal directamente.',
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
