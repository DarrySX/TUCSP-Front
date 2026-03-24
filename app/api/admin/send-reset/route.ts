import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    // Verify caller is super_admin
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !caller) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles').select('role').eq('id', caller.id).single();
    if (callerProfile?.role !== 'super_admin') {
      return Response.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { userId, redirectTo } = await request.json();
    if (!userId) return Response.json({ error: 'userId requerido' }, { status: 400 });

    // Get the user's email from auth
    const { data: authUser, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !authUser.user?.email) {
      return Response.json({ error: 'Usuario no encontrado o sin correo' }, { status: 404 });
    }

    // Send password reset email
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
      authUser.user.email,
      { redirectTo: redirectTo ?? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password` }
    );
    if (error) throw error;

    return Response.json({ message: `Correo de recuperación enviado a ${authUser.user.email}` });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
