#!/usr/bin/env node

/**
 * Script simple para probar el login del superuser
 * Uso: node scripts/test-login.js
 */

const fetch = require('node-fetch');

async function testLogin() {
  const email = 'brandon.valencia.calderon@gmail.com';
  const password = 'TUCSP2026.';
  const appUrl = 'http://localhost:3000';

  console.log('\n=== Test de Login - Superuser ===\n');
  console.log('Verificando que la app esté corriendo...\n');

  try {
    const healthCheck = await fetch(appUrl, { timeout: 5000 });
    if (!healthCheck.ok) throw new Error('App no respondió correctamente');
    console.log('✅ App está corriendo en', appUrl);
  } catch (error) {
    console.error('❌ Error: La app NO está corriendo en http://localhost:3000');
    console.error('Inicia con: npm run dev\n');
    process.exit(1);
  }

  console.log('\n📝 Credenciales a usar:');
  console.log('   Email:', email);
  console.log('   Contraseña: TUCSP2026.');
  console.log('\n💡 Pasos:');
  console.log('1. Abre http://localhost:3000');
  console.log('2. Haz clic en "Iniciar Sesión"');
  console.log('3. Ingresa las credenciales arriba');
  console.log('4. Si funciona, ¡el login está correcto!\n');
  console.log('Si falla, sigue las instrucciones en /FIX_LOGIN_NOW.md\n');
}

testLogin();
