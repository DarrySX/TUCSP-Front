# Guía Rápida - Configuración Inicial

## Paso 1: Crear Usuario Superuser en Supabase Auth

### Opción A: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto Supabase
2. Click en **Authentication** en la barra lateral izquierda
3. Click en la pestaña **Users**
4. Click en el botón **Invite** (esquina superior derecha)
5. Ingresa los siguientes datos:
   - **Email:** `brandon.valencia.calderon@gmail.com`
   - **Password:** `TUCSP2026.`
   - **Password (repeat):** `TUCSP2026.`
6. Click en **Send Invite**

### Opción B: Usando la Console SQL de Supabase

1. Ve a **SQL Editor** en Supabase
2. Click en **New Query**
3. Copia y ejecuta:

```sql
-- Nota: Esto crea un usuario directamente sin enviar invitación
SELECT 
  auth.uid(),
  auth.email() 
FROM auth.users 
WHERE email = 'brandon.valencia.calderon@gmail.com' 
LIMIT 1;
```

## Paso 2: Ejecutar Script SQL para Crear el Perfil

Una vez que el usuario existe en `auth.users`:

1. Ve a **SQL Editor** en Supabase
2. Click en **New Query**
3. Copia el contenido de: `scripts/create-superuser.sql`
4. Ejecuta la query

Esto creará automáticamente el perfil del superuser con:
- Nombre: Brandon
- Apellido: Valencia Calderon
- Mote: Psicopata
- Rol: super_admin

## Paso 3: Verifica que Todo Funcione

1. Abre tu aplicación
2. Click en **Iniciar Sesión** (en la landing)
3. Ingresa:
   - **Email:** `brandon.valencia.calderon@gmail.com`
   - **Contraseña:** `TUCSP2026.`
4. Deberías ver:
   - Botón **Admin** en el header
   - Acceso a `/admin/dashboard`
   - Opción para crear nuevos miembros

## Paso 4: Crear tu Primer Miembro

1. Click en **Admin** en el header
2. Click en **Members**
3. Click en **+ Create New Member**
4. Completa el formulario:
   - **Nombre:** (obligatorio)
   - **Apellido:** (obligatorio)
   - **Email:** (obligatorio, debe ser único)
   - **Rol:** Selecciona (aspirante, pardillo, tuño, etc.)
   - **Contraseña:** (obligatorio)
   - Llena los campos opcionales que desees
5. Click en **Crear Miembro**

## Datos del Superuser

| Campo | Valor |
|-------|-------|
| Nombre | Brandon |
| Apellido | Valencia Calderon |
| Mote | Psicopata |
| Email | brandon.valencia.calderon@gmail.com |
| Contraseña | TUCSP2026. |
| Rol | super_admin |

## Solución de Problemas

### "Email ya existe"
- El usuario ya está registrado en auth.users
- Comprueba en Supabase Authentication → Users

### "Acceso restringido" en signup
- Esto es normal, el registro está deshabilitado
- Solo el superuser puede crear usuarios

### No veo el botón Admin
- Debes estar logueado como super_admin
- Verifica que tu cuenta tenga role = 'super_admin' en la tabla profiles

### No puedo crear un usuario nuevo
- Asegúrate de que el email sea único
- La contraseña debe tener al menos 6 caracteres
- Todos los campos requeridos deben estar completos

## Variables de Entorno Necesarias

Asegúrate de tener en tu archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

El `SERVICE_ROLE_KEY` es necesario para crear usuarios desde el API (solo disponible en servidor).

## Estructura de la Base de Datos

### Tabla: profiles

```
id (UUID, Primary Key)
first_name (string, obligatorio)
last_name (string, obligatorio)
mote (string, opcional)
carrera (string, opcional)
telefono (string, opcional)
fecha_nacimiento (date, opcional)
dni (string, opcional)
tipo_sangre (string, opcional)
direccion (string, opcional)
correo_electronico (string)
persona_emergencia (string, opcional)
telefono_emergencia (string, opcional)
fecha_ingreso (date, opcional)
fecha_bautizo (date, opcional - solo tunos)
lugar_bautizo (string, opcional - solo tunos)
padrino_id (UUID, opcional - solo tunos)
role (enum: super_admin, tuno_admin, tuno, pardillo, aspirante)
created_at (timestamp)
updated_at (timestamp)
```

## Próximas Acciones

Después de configurar el superuser:

1. [ ] Crear otros administradores (tuno_admin)
2. [ ] Importar datos de miembros existentes
3. [ ] Configurar eventos y actividades
4. [ ] Personalizar datos del superuser en BD
5. [ ] Configurar notificaciones y emails

¡Listo para empezar! 🎉
