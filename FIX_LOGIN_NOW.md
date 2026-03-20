# Solucionar Login - Guía Rápida

## Tu Problema
No puedes loguearte con `brandon.valencia.calderon@gmail.com` / `TUCSP2026.`

## Solución en 3 Pasos

### PASO 1: Crea el usuario en Supabase
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a: **Authentication → Users**
4. Haz clic en **Invite User**
5. Ingresa:
   - Email: `brandon.valencia.calderon@gmail.com`
   - Temporal Password: `TUCSP2026.`
6. Haz clic en **Send Invite**

**Espera a que aparezca en la lista de usuarios con status "Confirmed"**

---

### PASO 2: Copia el UUID del usuario

1. En la misma pantalla (Authentication → Users)
2. Busca el usuario `brandon.valencia.calderon@gmail.com`
3. Haz clic en la fila para expandirla
4. **Copia el UUID** (es un código largo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

---

### PASO 3: Crea su perfil

1. Inicia la app:
   ```bash
   npm run dev
   ```

2. En otra terminal, ejecuta:
   ```bash
   node scripts/create-profile-only.js
   ```

3. Pega el UUID cuando te lo pida

4. Listo! ✅

---

### PASO 4: Prueba el login

1. Ve a http://localhost:3000
2. Haz clic en **Iniciar Sesión**
3. Ingresa:
   - Email: `brandon.valencia.calderon@gmail.com`
   - Contraseña: `TUCSP2026.`
4. ¡Deberías estar dentro! 🎉

---

## Si falla el PASO 2

Si el usuario no aparece como "Confirmed":

1. Ve a Supabase → Authentication → Users
2. Haz clic en el usuario `brandon.valencia.calderon@gmail.com`
3. Busca el botón **Confirm user** o similar
4. Haz clic para confirmar el email manualmente

---

## Variables de Entorno Necesarias

Tu `.env.local` debe tener:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rrfcfigmyfpfvahguxmk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_KWu1IXa-q0iyvCrFDtlkbg_w0VkbN4P
```

(Ya las tienes configuradas)

---

## Dashboard de Supabase
https://supabase.com/dashboard

Proyecto: `rrfcfigmyfpfvahguxmk`

¡Eso es todo! El login debería funcionar después de estos pasos.
