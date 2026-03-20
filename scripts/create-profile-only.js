const fetch = require('node-fetch');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_URL o SUPABASE_KEY no están configuradas');
  console.error('Configura en .env.local:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

async function createProfile() {
  console.log('\n=== Creando Perfil del Superuser ===\n');

  try {
    // First, let's get the user ID - we'll need to ask the user
    console.log('Necesito el UUID del usuario que ya creaste en Supabase Auth.');
    console.log('Para obtenerlo:');
    console.log('1. Ve a https://supabase.com/dashboard');
    console.log('2. Selecciona tu proyecto');
    console.log('3. Ve a Authentication → Users');
    console.log('4. Busca el usuario "brandon.valencia.calderon@gmail.com"');
    console.log('5. Copia el UUID (está en la primer columna)\n');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Pega el UUID del usuario: ', async (userId) => {
      if (!userId || userId.length < 30) {
        console.error('❌ UUID inválido');
        process.exit(1);
      }

      console.log('\n⏳ Creando el perfil...\n');

      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            id: userId,
            first_name: 'Brandon',
            last_name: 'Valencia Calderon',
            mote: 'Psicopata',
            correo_electronico: 'brandon.valencia.calderon@gmail.com',
            role: 'super_admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('❌ Error al crear el perfil:');
          console.error(JSON.stringify(data, null, 2));
          process.exit(1);
        }

        console.log('✅ Perfil creado exitosamente!\n');
        console.log('📋 Datos del Superuser:');
        console.log('   Email: brandon.valencia.calderon@gmail.com');
        console.log('   Contraseña: TUCSP2026.');
        console.log('   Nombre: Brandon Valencia Calderon');
        console.log('   Mote: Psicopata');
        console.log('   Rol: super_admin\n');
        console.log('✨ Ahora puedes loguearte en http://localhost:3000\n');

      } catch (error) {
        console.error('❌ Error de red:', error.message);
        process.exit(1);
      }

      rl.close();
    });

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    process.exit(1);
  }
}

createProfile();
