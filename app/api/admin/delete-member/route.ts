import { getSupabaseAdmin, getSupabaseAnon, getSupabaseWithToken } from '@/lib/supabase-admin';

export async function DELETE(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    // Verify caller is authenticated
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { data: { user: caller }, error: authErr } = await getSupabaseAnon().auth.getUser(token);
    if (authErr || !caller) return Response.json({ error: 'No autorizado' }, { status: 401 });

    // Read caller's own profile using their JWT (RLS policy: auth.uid() = id)
    const { data: callerProfile, error: profileErr } = await getSupabaseWithToken(token)
      .from('profiles').select('role').eq('id', caller.id).single();
    if (profileErr || callerProfile?.role !== 'super_admin') {
      return Response.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) return Response.json({ error: 'userId requerido' }, { status: 400 });
    if (userId === caller.id) {
      return Response.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });
    }

    // Deleting from auth.users cascades to profiles
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return Response.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
