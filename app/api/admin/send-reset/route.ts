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

    // 4. Get target profile email
    const { data: targetProfile, error: targetErr } = await callerClient
      .from('profiles').select('correo_electronico, first_name, last_name').eq('id', userId).single();
    if (targetErr || !targetProfile) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // 5a. User has a real synced email → send reset email normally
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

    // 5b. No real email yet → generate recovery link directly (admin bypasses email)
    // Admin shares this link manually with the member (WhatsApp, in person, etc.)
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: authEmail,
      options: { redirectTo: redirectUrl },
    });
    if (linkErr) throw linkErr;

    const name = [targetProfile.first_name, targetProfile.last_name].filter(Boolean).join(' ') || authEmail;
    return Response.json({
      message: `Link de recuperación generado para ${name}`,
      recoveryLink: linkData.properties?.action_link,
      warning: 'Este usuario no tiene correo real configurado. Comparte el link directamente con el miembro.',
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
