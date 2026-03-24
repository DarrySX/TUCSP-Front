import { getSupabaseAdmin, getSupabaseAnon, getSupabaseWithToken } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    // 1. Verify caller JWT
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { data: { user: caller }, error: authErr } = await getSupabaseAnon().auth.getUser(token);
    if (authErr || !caller) return Response.json({ error: 'No autorizado' }, { status: 401 });

    // 2. Check caller is super_admin (reads own profile via RLS: auth.uid() = id)
    const callerClient = getSupabaseWithToken(token);
    const { data: callerProfile, error: profileErr } = await callerClient
      .from('profiles').select('role').eq('id', caller.id).single();
    if (profileErr || callerProfile?.role !== 'super_admin') {
      return Response.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { userId, redirectTo } = await request.json();
    if (!userId) return Response.json({ error: 'userId requerido' }, { status: 400 });

    // 3. Get real email from profiles (super_admin can read all profiles via RLS)
    const { data: targetProfile, error: targetErr } = await callerClient
      .from('profiles')
      .select('correo_electronico, first_name, last_name')
      .eq('id', userId)
      .single();

    if (targetErr || !targetProfile) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (!targetProfile.correo_electronico) {
      return Response.json(
        { error: 'Este usuario no tiene correo configurado. Edítalo primero y asígnale su correo real.' },
        { status: 400 }
      );
    }

    // 4. Verify auth.users.email matches correo_electronico.
    // resetPasswordForEmail looks up by auth.users.email — if they don't match it
    // silently does nothing (Supabase never reveals whether an email exists).
    const supabaseAdmin = getSupabaseAdmin();
    const { data: authEmail, error: authEmailErr } = await supabaseAdmin
      .rpc('get_user_auth_email', { user_id: userId });

    if (authEmailErr) throw authEmailErr;

    if (authEmail !== targetProfile.correo_electronico) {
      return Response.json(
        { error: 'El correo del perfil no coincide con el de autenticación. Guarda el correo del usuario primero.' },
        { status: 400 }
      );
    }

    // 5. Send reset email
    const { error: resetErr } = await getSupabaseAnon().auth.resetPasswordForEmail(
      targetProfile.correo_electronico,
      { redirectTo: redirectTo ?? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password` }
    );
    if (resetErr) throw resetErr;

    return Response.json({
      message: `Correo de recuperación enviado a ${targetProfile.correo_electronico}`,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
