# Setup Superuser - Guía Completa

## ¿Qué necesitas?

Para crear el usuario superuser (Brandon Randall Valencia Calderon), necesitas:

1. **SUPABASE_SERVICE_ROLE_KEY** - La clave de servicio de Supabase
2. **SETUP_SECRET** - Un secreto para proteger el endpoint
3. Tener la app corriendo en `http://localhost:3000`

## Paso 1: Obtener SUPABASE_SERVICE_ROLE_KEY

1. Ve a https://supabase.com
2. Entra a tu proyecto
3. Vete a **Settings** → **API**
4. Busca **Project API keys**
5. Copia la clave **service_role** (la larga que comienza con `eyJ...`)

## Paso 2: Configurar Variables de Entorno

En tu proyecto, crea o actualiza `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rrfcfigmyfpfvahguxmk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_KWu1IXa-q0iyvCrFDtlkbg_w0VkbN4P
SUPABASE_SERVICE_ROLE_KEY=<pega_aqui_la_clave_service_role>
SETUP_SECRET=dev-setup-secret
```

## Paso 3: Ejecutar Setup

### Opción A: Con npm (Recomendado)

```bash
# Terminal 1: Inicia la aplicación
npm run dev

# Terminal 2: Ejecuta el script de setup
node scripts/setup.js
```

### Opción B: Con curl (Si prefieres hacer request manual)

Primero, asegúrate de que la app esté corriendo en otro terminal:

```bash
curl -X POST http://localhost:3000/api/setup/superuser \
  -H "Content-Type: application/json" \
  -H "x-setup-secret: dev-setup-secret" \
  -d '{}'
```

## Resultado Esperado

Si todo funciona correctamente, verás:

```
==================================================
  UCSP Tuna - Superuser Setup
==================================================

Creating superuser account...
Email: brandon.valencia.calderon@gmail.com
Password: TUCSP2026.
Name: Brandon Randall Valencia Calderon

✓ SUCCESS!

Superuser created successfully:
  ID: [uuid]
  Email: brandon.valencia.calderon@gmail.com
  Name: Brandon Randall Valencia Calderon
  Mote: Psicopata
  Role: super_admin

You can now login at /auth/login with:
  Email: brandon.valencia.calderon@gmail.com
  Password: TUCSP2026.
```

## Solución de Problemas

### Error: "SUPABASE_SERVICE_ROLE_KEY is required"
**Solución:** Asegúrate de haber agregado `SUPABASE_SERVICE_ROLE_KEY` a `.env.local`

### Error: "Connection refused"
**Solución:** Verifica que la app esté corriendo con `npm run dev` en otro terminal

### Error: "Unauthorized: Invalid setup secret"
**Solución:** Verifica que `SETUP_SECRET=dev-setup-secret` esté en `.env.local`

### Error: "Failed to create user in Auth"
**Solución:** Asegúrate de que:
- El email `brandon.valencia.calderon@gmail.com` no existe previamente en Supabase Auth
- Las claves de Supabase son válidas

### Error: "Failed to create profile"
**Solución:** 
- Verifica que la tabla `profiles` exista en Supabase
- Si no existe, ejecuta el script `/scripts/setup-supabase.sql` primero

## Próximos Pasos

Una vez que el superuser esté creado:

1. Ve a http://localhost:3000
2. Haz clic en "Iniciar Sesión"
3. Usa las credenciales:
   - Email: `brandon.valencia.calderon@gmail.com`
   - Contraseña: `TUCSP2026.`
4. Accede al panel de admin para crear más usuarios

## Notas Importantes

- El endpoint `/api/setup/superuser` está protegido y solo funciona con la `SETUP_SECRET` correcta
- Se recomienda cambiar `SETUP_SECRET` en producción
- El servicio `SUPABASE_SERVICE_ROLE_KEY` debe guardarse en secreto (nunca versionar en Git)
- Después de crear el superuser, puedes eliminar estas variables de entorno si lo deseas
