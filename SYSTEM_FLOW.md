# Sistema de Idiomas y Autenticación - Flujo Completo

## 🌐 Arquitectura de Idiomas

### 1. **Language Context Provider (Global)**
**Archivo:** `/app/providers.tsx`

```
LanguageProvider (Global Context)
├── Estado: language = 'es' (predeterminado)
├── Métodos:
│   ├── toggleLanguage() → cambia entre 'en' y 'es'
│   └── setLanguage(lang) → establece idioma específico
└── Hook: useLanguage() → acceso desde cualquier componente
```

### 2. **Flujo de Idiomas**
```
app/layout.tsx
└── <LanguageProvider>
    ├── app/page.tsx (Landing)
    │   ├── Header (botón EN/ES)
    │   ├── Hero (traducciones)
    │   ├── Features (traducciones)
    │   ├── Services (traducciones)
    │   ├── Events/Testimonials (traducciones)
    │   ├── CTA (traducciones)
    │   └── Footer (traducciones)
    │
    ├── app/auth/layout.tsx
    │   ├── Selector de idioma
    │   ├── app/auth/login/page.tsx
    │   │   └── LoginForm (traducciones)
    │   └── app/auth/signup/page.tsx
    │       └── SignUpForm (traducciones)
    │
    └── app/admin/** (Admin Panel)
```

### 3. **Archivos de Traducción**
**Archivo:** `/lib/translations.ts`

Estructura:
```typescript
translations = {
  en: {
    header: { services, packages, about, contact, admin, login, signup },
    hero: { title, subtitle, cta1, cta2, stat1, stat2, stat3 },
    features: { feature1-6, title, subtitle },
    services: { serenadeTitle, ceremonyTitle, celebrationTitle, customTitle, ... },
    testimonials: { title, subtitle, testimonial1-3 },
    cta: { title, subtitle, button1, button2 },
    footer: { about, services, contact, followUs, rights },
    auth: {
      login: { title, subtitle, email, password, submit, error, ... },
      signup: { title, subtitle, fullName, email, password, confirmPassword, ... }
    }
  },
  es: { ... }
}
```

---

## 🔐 Flujo de Autenticación

### 1. **Header - Lógica de Botón Admin**
**Archivo:** `/components/landing/header.tsx`

```
Header Component
├── useState(isAuthenticated) - verifica sesión
├── useEffect()
│   ├── checkAuth() → obtiene sesión actual
│   └── onAuthStateChange() → escucha cambios de auth
│
├── Botón Login → /auth/login
├── Botón Signup/Book Now → /auth/signup
└── Botón Admin (SOLO SI isAuthenticated) → /admin/login
```

### 2. **Rutas Protegidas**

**Landing (Pública)**
- GET / → Landing page (visible para todos)
- GET /auth/login → Login form (visible para todos)
- GET /auth/signup → Signup form (visible para todos)

**Dashboard (Protegido - Requiere login)**
- GET /dashboard → Requiere sesión activa
- GET /dashboard/events
- GET /dashboard/profile

**Admin (Super Admin Only)**
- GET /admin/login → Login admin (visible para todos)
- GET /admin → Requiere super_admin role
- GET /admin/members
- GET /admin/events

### 3. **Flujo de Sesión**
```
Supabase Auth
├── createClient() → inicializa cliente
├── getSession() → obtiene sesión actual
├── onAuthStateChange() → escucha cambios
└── session.user → información del usuario

Verificación de Rol
├── profiles tabla → columna 'role'
├── Roles: super_admin, tuno_admin, tuno, pardillo, aspirante
└── RLS Policies → control por rol
```

---

## 🎯 Casos de Uso

### Caso 1: Cambiar Idioma en Landing
```
1. Usuario hace click en botón "EN" (español)
2. Header → onClick(toggleLanguage)
3. LanguageProvider → setLanguage('en')
4. Todos los componentes usan useLanguage() → reciben t.en
5. Landing se actualiza completamente a inglés
6. Auth layout también cambia a inglés
```

### Caso 2: Usuario Sin Sesión
```
1. Usuario ve landing
2. Header:
   - ✓ Botón Language Toggle (EN/ES)
   - ✓ Botón Sign In → /auth/login
   - ✓ Botón Book Now → /auth/signup
   - ✗ Botón Admin (OCULTO)
```

### Caso 3: Usuario Con Sesión (Logueado)
```
1. Usuario completa signup en /auth/signup
2. Se crea cuenta en Supabase
3. Supabase devuelve sesión activa
4. Header detecta sesión:
   - ✓ Botón Language Toggle
   - ✓ Botón Sign In (o Sign Out si está logueado)
   - ✓ Botón Book Now
   - ✓ Botón Admin (VISIBLE)
5. Usuario puede acceder a /admin/login para admin panel
```

### Caso 4: Super Admin Login
```
1. Usuario logueado como super_admin accede a /admin/login
2. Admin login verifica credenciales
3. Si es super_admin:
   - ✓ Acceso a /admin dashboard
   - ✓ Gestión de miembros
   - ✓ Gestión de eventos
4. Si no es super_admin:
   - ✗ Acceso denegado
```

---

## 📝 Guía de Desarrollo

### Agregar Nueva Traducción
1. Abre `/lib/translations.ts`
2. Añade key en `en` y `es`
3. En componente: `const { t } = useLanguage()`
4. Usa: `{t.section.key}`

### Agregar Nueva Ruta Protegida
1. Crea componente server o client
2. Si requiere sesión:
   ```typescript
   import { getSession } from '@/lib/session';
   
   export default async function Page() {
     const session = await getSession();
     if (!session) redirect('/auth/login');
     // contenido
   }
   ```

### Verificar Rol
```typescript
import { getCurrentUser, getUserRole } from '@/lib/session';

const user = await getCurrentUser();
const role = await getUserRole(user.id);

if (role === 'super_admin') {
  // permitir acceso
}
```

---

## ✅ Checklist de Funcionalidad

- [x] Idioma predeterminado: Español
- [x] Cambio de idioma global (todos componentes se actualizan)
- [x] Landing traducida completamente (EN/ES)
- [x] Auth pages traducidas (EN/ES)
- [x] Botón Admin oculto si no hay sesión
- [x] Botón Admin visible si hay sesión
- [x] Sesión persistente con Supabase
- [x] Context Provider global (no hay conflictos de estado)
- [x] Header escucha cambios de auth en tiempo real
