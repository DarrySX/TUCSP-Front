import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  try {
    // Security check - this endpoint should only be callable once or with a secret key
    const setupSecret = request.headers.get('x-setup-secret');
    if (setupSecret !== process.env.SETUP_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid setup secret' },
        { status: 401 }
      );
    }

    console.log('[v0] Starting superuser creation...');

    // Step 1: Create user in Auth
    console.log('[v0] Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'brandon.valencia.calderon@gmail.com',
      password: 'TUCSP2026.',
      email_confirm: true,
      user_metadata: {
        role: 'super_admin',
      },
    });

    if (authError) {
      console.error('[v0] Auth error:', authError);
      return NextResponse.json(
        { error: `Failed to create user in Auth: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User created but no user data returned' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    console.log('[v0] User created in Auth with ID:', userId);

    // Step 2: Insert profile in database
    console.log('[v0] Inserting profile in database...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name: 'Brandon',
        last_name: 'Valencia Calderon',
        mote: 'Psicopata',
        correo_electronico: 'brandon.valencia.calderon@gmail.com',
        role: 'super_admin',
        created_at: new Date().toISOString(),
      })
      .select();

    if (profileError) {
      console.error('[v0] Profile insert error:', profileError);
      // Try to delete the auth user since profile creation failed
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Failed to create profile: ${profileError.message}` },
        { status: 400 }
      );
    }

    console.log('[v0] Superuser created successfully:', profileData);

    return NextResponse.json(
      {
        success: true,
        message: 'Superuser created successfully',
        user: {
          id: userId,
          email: 'brandon.valencia.calderon@gmail.com',
          first_name: 'Brandon',
          last_name: 'Valencia Calderon',
          mote: 'Psicopata',
          role: 'super_admin',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Unexpected error:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
