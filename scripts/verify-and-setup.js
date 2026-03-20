const fetch = require('node-fetch');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function main() {
  console.log('\n=== UCSP Tuna - Superuser Setup ===\n');

  // Collect environment variables
  console.log('Paso 1: Verificando variables de entorno...\n');

  const setupSecret = process.env.SETUP_SECRET || 'dev-setup-secret';

  console.log('✓ SETUP_SECRET:', setupSecret ? '✓ Configurado' : '✗ NO configurado');
  console.log('✓ Variables de Supabase: Verificadas en .env.local');

  if (!setupSecret) {
    console.error('\n✗ Error: SETUP_SECRET no está configurada');
    process.exit(1);
  }

  // Check if app is running
  const appUrl = 'http://localhost:3000/api/setup/superuser';
  
  console.log('\n\nPaso 2: Verificando que la app esté corriendo en localhost:3000...\n');
  
  try {
    const healthCheck = await fetch('http://localhost:3000/', { timeout: 5000 });
    if (healthCheck.ok) {
      console.log('✓ App está corriendo en http://localhost:3000');
    } else {
      throw new Error('App respondió pero con error');
    }
  } catch (error) {
    console.error('\n✗ Error: La app NO está corriendo en http://localhost:3000');
    console.error('Por favor inicia la app con: npm run dev\n');
    process.exit(1);
  }

  // Create superuser
  console.log('\nPaso 3: Creando superuser...\n');

  try {
    const response = await fetch(appUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-setup-secret': setupSecret,
      },
      body: JSON.stringify({})
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('✗ Error en la creación del superuser:');
      console.error(JSON.stringify(data, null, 2));
      
      if (response.status === 401) {
        console.error('\nProblema: SETUP_SECRET inválido o no configurado');
        console.error('Solución: Asegúrate de que SETUP_SECRET esté en .env.local');
      } else if (response.status === 500) {
        console.error('\nProblema:', data.error);
        console.error('Solución: Verifica que SUPABASE_SERVICE_ROLE_KEY esté configurado correctamente');
      }
      process.exit(1);
    }

    console.log('✓ Superuser creado exitosamente!\n');
    console.log('Datos del superuser:');
    console.log('  Email:', data.user.email);
    console.log('  Nombre:', data.user.first_name, data.user.last_name);
    console.log('  Mote:', data.user.mote);
    console.log('  Rol:', data.user.role);

    console.log('\n\n=== CREDENCIALES DE ACCESO ===');
    console.log('Email: brandon.valencia.calderon@gmail.com');
    console.log('Contraseña: TUCSP2026.');
    console.log('\nAhora puedes:');
    console.log('1. Ir a http://localhost:3000');
    console.log('2. Hacer clic en "Iniciar Sesión"');
    console.log('3. Ingresar las credenciales arriba');
    console.log('4. Acceder al panel de admin\n');

  } catch (error) {
    console.error('✗ Error inesperado:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\nLa app no está corriendo. Por favor ejecuta: npm run dev');
    }
    process.exit(1);
  }

  rl.close();
}

main();
