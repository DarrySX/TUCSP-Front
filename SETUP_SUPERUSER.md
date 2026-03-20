# Configuración del Superuser - UCSP Tuna

## 📋 Información del Superuser

- **Nombre:** Brandon Randall Valencia Calderon
- **Email:** brandon.valencia.calderon@gmail.com
- **Mote:** Psicopata
- **Contraseña:** TUCSP2026.
- **Rol:** super_admin

## 🚀 Pasos para Crear el Superuser

### Opción 1: Automática (Recomendado)

#### 1. Configurar la variable de entorno

Primero, necesitas establecer la variable `SETUP_SECRET` en tu proyecto Vercel:

```bash
# En el archivo .env.local (local development)
SETUP_SECRET=dev-setup-secret
```

O en Vercel Settings → Variables de entorno:
- Key: `SETUP_SECRET`
- Value: `dev-setup-secret` (o cualquier valor que uses)

#### 2. Iniciar la aplicación

```bash
npm run dev
```

La aplicación debe estar corriendo en `http://localhost:3000`

#### 3. Ejecutar el script de setup

En otra terminal:

```bash
node scripts/setup-superuser.js
```

O con una variable de entorno personalizada:

```bash
SETUP_SECRET=tu-secret BASE_URL=http://localhost:3000 node scripts/setup-superuser.js
```

#### 4. Verificar resultado

Si todo va bien, verás:
```
✓ SUCCESS: Superuser created successfully!

User Details:
  ID: [uuid-aqui]
  Email: brandon.valencia.calderon@gmail.com
  Name: Brandon Valencia Calderon
  Mote: Psicopata
  Role: super_admin

You can now login with:
  Email: brandon.valencia.calderon@gmail.com
  Password: TUCSP2026.
```

### Opción 2: Manual (Si el script falla)

#### 1. Ir a Supabase Console

Navega a https://app.supabase.com/project/[tu-proyecto]/auth/users

#### 2. Crear usuario manualmente

- Click en "Invite"
- Email: `brandon.valencia.calderon@gmail.com`
- Contraseña: `TUCSP2026.`
- Hacer click en "Send invite"

#### 3. Ejecutar SQL para el perfil

En Supabase → SQL Editor, ejecuta:

```sql
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  mote,
  correo_electronico,
  role,
  created_at
)
VALUES (
  '[USER_ID_FROM_AUTH]',
  'Brandon',
  'Valencia Calderon',
  'Psicopata',
  'brandon.valencia.calderon@gmail.com',
  'super_admin',
  NOW()
);
```

Reemplaza `[USER_ID_FROM_AUTH]` con el ID del usuario creado en Supabase Auth.

## ✅ Verificación

Una vez creado el superuser, puedes:

1. Ir a http://localhost:3000
2. Click en "Iniciar Sesión"
3. Usar las credenciales:
   - Email: `brandon.valencia.calderon@gmail.com`
   - Password: `TUCSP2026.`
4. Deberías ver el botón "Admin" en el header
5. Acceder a `/admin` para gestionar miembros

## 🔐 Seguridad

- El endpoint `/api/setup/create-superuser` requiere `x-setup-secret` header
- Solo funciona una vez (si intentas crear el mismo email, obtendrás error)
- El secret debe estar en variables de entorno
- Cambia `SETUP_SECRET` a un valor seguro en producción

## 📝 Notas

- Después de crear el superuser, puedes eliminar o asegurar el endpoint de setup
- Los demás datos del perfil (teléfono, dirección, etc.) pueden llenarse después en el admin panel
- El superuser puede crear nuevos miembros con todos los campos disponibles
