# Configuración del Superuser

## Datos del Superuser
- **Nombre:** Brandon
- **Apellido:** Valencia Calderon
- **Mote:** Psicopata
- **Email:** brandon.valencia.calderon@gmail.com
- **Contraseña:** TUCSP2026.
- **Rol:** super_admin

## Pasos para crear el usuario:

### 1. Crear usuario en Supabase Auth
Accede a tu proyecto Supabase y ve a Authentication > Users. Click en "Invite". Ingresa:
- Email: brandon.valencia.calderon@gmail.com
- Password: TUCSP2026.
- Confirm Password: TUCSP2026.

O usa el SQL directo si tienes acceso a Auth Admin API.

### 2. Ejecutar script SQL
Una vez el usuario exista en auth.users, ejecuta:
```sql
-- Execute: scripts/create-superuser.sql
```

Este script insertará automáticamente el perfil con todos los datos en la tabla profiles.

### 3. Completar datos adicionales (opcional)
Si deseas agregar más información al perfil del superuser, puedes hacerlo directamente en la tabla profiles de Supabase:
- Fecha de nacimiento
- Tipo de sangre
- DNI
- Dirección
- Etc.

## Notas importantes:
- El superuser tiene acceso completo al admin panel
- Solo el superuser puede crear nuevos usuarios
- La opción de signup ha sido eliminada de la landing page
- Los usuarios se crean solo desde el admin panel
