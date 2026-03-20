# UCSP Tuna - Frontend

Plataforma de gestión de miembros y reservas de eventos para la Tuna Universitaria UCSP. Construido con **Next.js 16**, **React 19**, **Supabase**, **shadcn/ui** y **Tailwind CSS v4**.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + shadcn/ui (Radix) + Tailwind CSS v4 |
| Auth & DB | Supabase (Auth + PostgreSQL + RLS) |
| Formularios | React Hook Form + Zod |
| Idiomas | Sistema i18n propio (ES/EN) |
| Deploy | Vercel |

## Estructura del Proyecto

```
app/
├── page.tsx                    # Landing pública
├── layout.tsx                  # Root layout + LanguageProvider
├── providers.tsx               # Context global de idioma
├── auth/
│   ├── login/page.tsx          # Login
│   └── signup/page.tsx         # Registro (restringido)
├── dashboard/                  # Panel usuario (protegido)
│   ├── page.tsx
│   ├── profile/page.tsx
│   └── events/page.tsx
├── admin/                      # Panel admin (super_admin)
│   ├── page.tsx                # Dashboard admin
│   ├── members/page.tsx        # Lista miembros
│   ├── members/new/page.tsx    # Crear miembro
│   └── events/                 # Gestión eventos
└── api/
    ├── admin/login/route.ts
    ├── admin/logout/route.ts
    ├── admin/create-member/route.ts
    └── setup/superuser/route.ts

components/
├── landing/    # header, hero, features, services, events, cta, footer
├── auth/       # login-form, signup-form
├── admin/      # create-member-form
└── ui/         # shadcn/ui (40+ componentes)

lib/
├── auth.ts          # signUp, signIn, signOut, getCurrentUser
├── session.ts       # getSession, getUserRole
├── translations.ts  # Traducciones ES/EN completas
└── utils.ts         # cn() (tailwind-merge)

hooks/
├── use-mobile.ts
└── use-toast.ts

scripts/
├── setup.js                  # Setup automatizado superusuario
├── setup-superuser.js        # Alternativa setup superusuario
├── setup-supabase.sql        # Schema inicial DB (profiles, activities, attendance, activity_feed)
├── create-superuser.sql      # INSERT superusuario
├── update-profiles-schema.sql # Migración: campos adicionales profiles
├── create-profile-only.js    # Crear perfil manual (user ya existe en Auth)
├── insert-tunos-data.js      # Insertar 59 tunos con relaciones
└── verify-and-setup.js       # Verificación y setup automatizado
```

## Configuración Inicial

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Copiar el archivo de ejemplo y completar los valores:

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase (ver sección Variables de Entorno).

### 3. Configurar base de datos

En el **SQL Editor** de Supabase, ejecutar en orden:

1. `scripts/setup-supabase.sql` — Crea tablas: profiles, activities, attendance, activity_feed + RLS policies
2. `scripts/update-profiles-schema.sql` — Agrega campos extendidos a profiles

### 4. Crear superusuario

```bash
# Terminal 1
pnpm dev

# Terminal 2
node scripts/setup.js
```

### 5. Iniciar desarrollo

```bash
pnpm dev
# http://localhost:3000
```

## Variables de Entorno

| Variable | Descripción | Dónde obtenerla |
|----------|------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada del servidor | Supabase → Settings → API → service_role (⚠️ nunca exponer al cliente) |
| `SETUP_SECRET` | Secreto para endpoint de setup | Definir manualmente (`dev-setup-secret` en local) |

## Base de Datos

### Tabla `profiles`

| Campo | Tipo | Requerido |
|-------|------|-----------|
| id | UUID (FK auth.users) | ✅ |
| first_name, last_name | VARCHAR | ✅ |
| mote | VARCHAR | ❌ |
| role | ENUM | ✅ |
| carrera, telefono, dni | VARCHAR | ❌ |
| fecha_nacimiento | DATE | ❌ |
| tipo_sangre, direccion | VARCHAR | ❌ |
| correo_electronico | VARCHAR | ❌ |
| persona_emergencia, telefono_emergencia | VARCHAR | ❌ |
| fecha_ingreso, fecha_bautizo | DATE | ❌ |
| lugar_bautizo | VARCHAR | ❌ |
| padrino_id | UUID | ❌ |

### Roles

| Rol | Acceso |
|-----|--------|
| `super_admin` | Panel admin completo, CRUD miembros y eventos |
| `tuno_admin` | Gestión parcial |
| `tuno` | Dashboard personal |
| `pardillo` | Dashboard limitado |
| `aspirante` | Dashboard mínimo |

## Arquitectura

### Autenticación

```
Landing (público) → Login → Supabase Auth → Session
                                              ↓
                            profiles.role → super_admin? → /admin
                                          → otro rol?    → /dashboard
```

- El signup público está **deshabilitado**. Solo el superusuario crea miembros desde `/admin/members/new`.
- Las rutas admin verifican `role === 'super_admin'` desde la tabla `profiles`.
- RLS (Row Level Security) activo en todas las tablas.

### Sistema de Idiomas

- Idioma por defecto: **Español**
- Toggle EN/ES en el header
- `LanguageProvider` (Context global) en `app/providers.tsx`
- Hook: `useLanguage()` → `{ language, t, toggleLanguage }`
- Traducciones: `lib/translations.ts`

## Scripts Disponibles

```bash
pnpm dev          # Desarrollo local
pnpm build        # Build de producción
pnpm start        # Servidor de producción
pnpm lint         # ESLint
```

## API Endpoints

| Método | Ruta | Protección | Descripción |
|--------|------|-----------|-------------|
| POST | `/api/admin/login` | Público | Login admin |
| POST | `/api/admin/logout` | Público | Logout admin |
| POST | `/api/admin/create-member` | SERVICE_ROLE_KEY | Crear miembro |
| POST | `/api/setup/superuser` | x-setup-secret header | Crear superusuario (uso único) |
