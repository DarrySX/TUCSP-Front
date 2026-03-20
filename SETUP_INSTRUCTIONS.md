# 🚀 Instrucciones de Configuración - UCSP Tuna

## ✅ Lo que se ha completado:

### 1. **Base de Datos Actualizada**
   - ✓ Tabla `profiles` con nuevos campos:
     - Separación: `first_name`, `last_name` (obligatorios)
     - Campos opcionales: mote, fecha_ingreso, fecha_bautizo, padrino_id, lugar_bautizo, fecha_nacimiento, carrera, telefono, persona_emergencia, telefono_emergencia, direccion, correo_electronico, tipo_sangre, dni

### 2. **Sistema de Autenticación Bilingüe (ES/EN)**
   - ✓ Landing page completamente funcional
   - ✓ Sistema de idiomas global con Context Provider
   - ✓ Login/Logout con Supabase Auth
   - ✓ Registro deshabilitado (solo superuser puede crear usuarios)

### 3. **Panel de Administración**
   - ✓ Panel para crear miembros (solo accesible autenticado)
   - ✓ Formulario con validación completa
   - ✓ Creación automática en Auth + Base de datos
   - ✓ Botón Admin solo visible si está autenticado

### 4. **Script de Creación de Superuser**
   - ✓ API endpoint: `/api/setup/create-superuser`
   - ✓ Script Node.js para automatizar setup
   - ✓ Documentación completa

## 📝 Próximos Pasos:

### PASO 1: Agregar Variable de Entorno

En tu proyecto Vercel o archivo `.env.local`:

```
SETUP_SECRET=dev-setup-secret
```

(Usar un valor seguro en producción)

### PASO 2: Iniciar la Aplicación

```bash
npm run dev
```

Espera a que esté lista en http://localhost:3000

### PASO 3: Crear el Superuser

En otra terminal:

```bash
node scripts/setup-superuser.js
```

Expected output:
```
✓ SUCCESS: Superuser created successfully!

User Details:
  ID: [uuid]
  Email: brandon.valencia.calderon@gmail.com
  Name: Brandon Valencia Calderon
  Mote: Psicopata
  Role: super_admin
```

### PASO 4: Hacer Login

1. Ve a http://localhost:3000
2. Click en "Iniciar Sesión"
3. Credenciales:
   - Email: `brandon.valencia.calderon@gmail.com`
   - Password: `TUCSP2026.`
4. Deberías ver el botón "Admin" en el header
5. Accede a `/admin` para gestionar miembros

## 🔑 Credenciales del Superuser

```
Email: brandon.valencia.calderon@gmail.com
Contraseña: TUCSP2026.
Nombre: Brandon Randall Valencia Calderon
Mote: Psicopata
Rol: super_admin
```

## 📋 Archivos Relevantes

- `/app/api/setup/create-superuser/route.ts` - API endpoint
- `/scripts/setup-superuser.js` - Script de setup
- `/components/admin/create-member-form.tsx` - Formulario de crear miembros
- `/app/api/admin/create-member/route.ts` - Crear miembro en API
- `/SETUP_SUPERUSER.md` - Instrucciones detalladas
- `/.env.example` - Ejemplo de variables de entorno

## 🐛 Troubleshooting

### Error: "Failed to connect to the application"
- Asegúrate que `npm run dev` esté ejecutándose
- Verifica que BASE_URL sea correcto (default: http://localhost:3000)

### Error: "Unauthorized: Invalid setup secret"
- Verifica que SETUP_SECRET esté configurado correctamente
- En producción, asegúrate de usar el mismo secret en el script y en env vars

### Error en script de migraciones SQL
- Verifica que los scripts en `/scripts/` se hayan ejecutado correctamente
- Si no, ejecuta manualmente en Supabase SQL Editor

## ✨ Funcionalidades Disponibles

Después de hacer login como superuser:

- ✓ Acceder al panel de admin (`/admin`)
- ✓ Ver dashboard de miembros
- ✓ Crear nuevos miembros con todos los campos
- ✓ Ver listado de eventos
- ✓ Cambiar idioma (EN/ES) desde el header
- ✓ Logout

## 🔐 Notas de Seguridad

1. El endpoint `/api/setup/create-superuser` está protegido por `SETUP_SECRET`
2. Solo puede crear 1 superuser (si intenta crear otro con el mismo email, fallará)
3. Considera desabilitar el endpoint después de crear el superuser
4. Cambiar contraseña después del primer login
5. Usar valores seguros para `SETUP_SECRET` en producción

---

¡Sistema completamente configurado! 🎉
