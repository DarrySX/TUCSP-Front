import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const superuserData = {
  email: 'brandon.valencia.calderon@gmail.com',
  password: 'TUCSP2026.',
  firstName: 'Brandon',
  lastName: 'Valencia Calderon',
  mote: 'Psicopata',
  role: 'super_admin',
};

async function createSuperuser() {
  try {
    console.log('Starting superuser creation...');

    // Step 1: Create user in Auth
    console.log('Step 1: Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: superuserData.email,
      password: superuserData.password,
      email_confirm: true,
      user_metadata: {
        firstName: superuserData.firstName,
        lastName: superuserData.lastName,
        mote: superuserData.mote,
      },
    });

    if (authError) {
      console.error('Error creating user in Auth:', authError);
      process.exit(1);
    }

    const userId = authData.user.id;
    console.log('✓ User created in Auth with ID:', userId);

    // Step 2: Create profile in database
    console.log('Step 2: Creating profile in database...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          first_name: superuserData.firstName,
          last_name: superuserData.lastName,
          mote: superuserData.mote,
          role: superuserData.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Clean up: delete the user from auth if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      process.exit(1);
    }

    console.log('✓ Profile created successfully');

    // Step 3: Verify the user was created
    console.log('Step 3: Verifying user creation...');
    const { data: verification, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('Error verifying user:', verifyError);
      process.exit(1);
    }

    console.log('✓ User verified successfully');
    console.log('\n✅ SUPERUSER CREATED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${superuserData.email}`);
    console.log(`Password: ${superuserData.password}`);
    console.log(`Name: ${superuserData.firstName} ${superuserData.lastName}`);
    console.log(`Mote: ${superuserData.mote}`);
    console.log(`User ID: ${userId}`);
    console.log(`Role: ${superuserData.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

createSuperuser();
