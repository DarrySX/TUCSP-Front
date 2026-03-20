# Configuración Manual del Superuser - SOLUCIÓN RÁPIDA

## Problema
Las credenciales de Supabase que proporcionaste no son suficientes para crear el usuario automáticamente.

## Solución - 2 Opciones

### OPCIÓN 1: Crear Usuario en Supabase UI (MÁS FÁCIL)

1. **Abre Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto
   - Ve a: Authentication → Users

2. **Crea el usuario manualmente**
   - Haz clic en "Invite user"
   - Email: `brandon.valencia.calderon@gmail.com`
   - Password: `TUCSP2026.`
   - Haz clic en "Send invite"

3. **Ejecuta el script para crear el perfil**
   ```bash
   node scripts/create-profile-only.js
   ```

4. **Prueba el login**
   - Ve a http://localhost:3000
   - Haz clic en "Iniciar Sesión"
   - Usa las credenciales arriba

---

### OPCIÓN 2: Usando Service Role Key (Automatizado)

1. **Obtén la Service Role Key**
   - Ve a Supabase → Settings → API
   - Copia la clave `service_role`

2. **Configura `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://rrfcfigmyfpfvahguxmk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_KWu1IXa-q0iyvCrFDtlkbg_w0VkbN4P
   SUPABASE_SERVICE_ROLE_KEY=<PEGA_LA_CLAVE_AQUI>
   SETUP_SECRET=dev-setup-secret
   ```

3. **Inicia la app**
   ```bash
   npm run dev
   ```

4. **Ejecuta el script de setup**
   ```bash
   node scripts/verify-and-setup.js
   ```

5. **Listo!**
   - Ahora puedes loguearte con:
     - Email: `brandon.valencia.calderon@gmail.com`
     - Contraseña: `TUCSP2026.`

---

## Diferencia entre claves

- **ANON_KEY**: Para cliente (operaciones básicas)
- **SERVICE_ROLE_KEY**: Para servidor (crear usuarios, admin operations)
- **PUBLISHABLE_DEFAULT_KEY**: Otra versión de la anon key

## Si sigue sin funcionar

1. Verifica que en Supabase el usuario existe en Authentication → Users
2. Confirma que el correo está confirmado (debe decir "Confirmed" en Supabase)
3. Asegúrate de que la contraseña sea exactamente: `TUCSP2026.`
4. Revisa la consola del navegador (F12) para ver errores específicos

## Dashboard Supabase
https://supabase.com/dashboard

Tu Proyecto URL: https://rrfcfigmyfpfvahguxmk.supabase.co
