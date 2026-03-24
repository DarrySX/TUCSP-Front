import { getSupabaseAdmin, getSupabaseAnon, getSupabaseWithToken } from '@/lib/supabase-admin';

export async function PUT(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    // Verify caller is authenticated
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { data: { user: caller }, error: authErr } = await getSupabaseAnon().auth.getUser(token);
    if (authErr || !caller) return Response.json({ error: 'No autorizado' }, { status: 401 });

    // Read caller's own profile using their JWT (RLS policy: auth.uid() = id)
    // This avoids depending on the service role key for the role check.
    const { data: callerProfile, error: profileErr } = await getSupabaseWithToken(token)
      .from('profiles').select('role').eq('id', caller.id).single();
    if (profileErr || callerProfile?.role !== 'super_admin') {
      return Response.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { userId, email, profileUpdates } = await request.json();
    if (!userId) return Response.json({ error: 'userId requerido' }, { status: 400 });

    // 1. Update auth.users email via SECURITY DEFINER function (bypasses admin API issues)
    if (email) {
      const { error: emailErr } = await supabaseAdmin.rpc('admin_update_user_email', {
        user_id: userId,
        new_email: email,
      });
      if (emailErr) {
        return Response.json({ error: emailErr.message }, { status: 400 });
      }
    }

    // 2. Update profiles table
    if (profileUpdates && Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ ...profileUpdates, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (profileError) {
        return Response.json({ error: profileError.message }, { status: 400 });
      }
    }

    return Response.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
