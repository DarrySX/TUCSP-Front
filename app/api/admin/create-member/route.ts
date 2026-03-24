import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      mote,
      carrera,
      telefono,
      personaEmergencia,
      telefonoEmergencia,
      direccion,
      tipoSangre,
      dni,
      fechaNacimiento,
    } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create auth user using Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return Response.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return Response.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        mote: mote || null,
        carrera: carrera || null,
        telefono: telefono || null,
        persona_emergencia: personaEmergencia || null,
        telefono_emergencia: telefonoEmergencia || null,
        direccion: direccion || null,
        tipo_sangre: tipoSangre || null,
        dni: dni || null,
        fecha_nacimiento: fechaNacimiento || null,
        correo_electronico: email,
        role: role || 'aspirante',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      // Delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return Response.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return Response.json(
      {
        message: 'User created successfully',
        user: authData.user,
        profile: profileData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating member:', error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
