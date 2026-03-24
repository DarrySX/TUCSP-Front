import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    // Verify caller is authenticated and is super_admin
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !caller) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles').select('role').eq('id', caller.id).single();
    if (callerProfile?.role !== 'super_admin') {
      return Response.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { userId, email, profileUpdates } = await request.json();
    if (!userId) return Response.json({ error: 'userId requerido' }, { status: 400 });

    // 1. Update auth.users email if it changed
    if (email) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email, email_confirm: true }
      );
      if (authUpdateError) {
        return Response.json({ error: authUpdateError.message }, { status: 400 });
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
