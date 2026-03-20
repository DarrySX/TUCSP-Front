# GUÍA FINAL DE CONFIGURACIÓN - UCSP TUNA

## Paso 1: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rrfcfigmyfpfvahguxmk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_KWu1IXa-q0iyvCrFDtlkbg_w0VkbN4P
SUPABASE_SERVICE_ROLE_KEY=<tu_service_role_key_aqui>
SETUP_SECRET=dev-setup-secret
```

### Cómo obtener SUPABASE_SERVICE_ROLE_KEY:
1. Ve a https://supabase.com
2. Selecciona tu proyecto
3. Ve a Settings → API
4. Copia la clave "service_role" (la larga)

## Paso 2: Iniciar la Aplicación

En Terminal 1:
```bash
npm run dev
```

La aplicación estará disponible en http://localhost:3000

## Paso 3: Crear el Superuser

En Terminal 2:
```bash
node scripts/setup.js
```

Este script creará:
- **Email:** brandon.valencia.calderon@gmail.com
- **Contraseña:** TUCSP2026.
- **Nombre:** Brandon Randall Valencia Calderon
- **Mote:** Psicopata
- **Rol:** super_admin

## Paso 4: Insertar Datos de los Tunos (59 Registros)

En Terminal 2 (o terminal nueva):
```bash
node scripts/insert-tunos-data.js
```

Este script:
- Inserta los 59 tunos de la tabla
- Relaciona automáticamente padrinos/madrinas por nombre (mote)
- Crea el registro con ROA como ID único
- Llena todos los campos disponibles

## Verificar la Instalación

1. Abre http://localhost:3000
2. Verifica que la landing page esté en español
3. Cambia de idioma a inglés (botón ES/EN)
4. Accede con:
   - Email: brandon.valencia.calderon@gmail.com
   - Contraseña: TUCSP2026.
5. Verifica que el botón "Admin" aparezca después de loguear

## Resultados Esperados

Después de ejecutar los scripts:

- ✅ Superuser creado en Auth y BD
- ✅ 59 tunos insertados con todos sus datos
- ✅ Relaciones de padrinos/madrinas configuradas
- ✅ Admin panel accesible solo para superuser
- ✅ Landing page completamente bilingüe
- ✅ Sistema de creación de usuarios por admin

## Archivos Importantes

- `/scripts/setup.js` - Crea el superuser
- `/scripts/insert-tunos-data.js` - Inserta datos de los tunos
- `/app/api/setup/superuser/route.ts` - Endpoint de setup
- `/app/admin/` - Panel de administración
- `/components/admin/create-member-form.tsx` - Formulario para crear miembros

## Datos de la Tabla

La tabla incluye información de 59 tunos:
- ROA: Número de identificación único
- Nombre y apellido (separados)
- Mote
- Fecha de bautizo (día, mes, año)
- Lugar de bautizo
- Padrino y Madrina
- Fecha de nacimiento
- Carrera
- Teléfono y teléfono de emergencia
- Dirección
- Correo electrónico
- Tipo de sangre

## Solución de Problemas

### Error de conexión a Supabase
- Verifica que SUPABASE_SERVICE_ROLE_KEY sea correcto
- Comprueba que la aplicación esté corriendo en Terminal 1

### Padrinos/Madrinas no se relacionan
- Asegúrate de que los nombres (motes) coincidan exactamente
- El script usa la primera palabra del padrino como mote

### Datos duplicados
- Ejecuta los scripts solo una vez
- Si necesitas reintentar, limpia la BD primero

---

¡Listo! Tu sistema UCSP Tuna está completamente configurado.
