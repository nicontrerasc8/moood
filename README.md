# MOOOD

Aplicación web de bienestar, clima y comunicación organizacional construida con Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui y Supabase.

## Stack

- Next.js 14+ con App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth + Postgres + Storage + RLS
- SWR
- Recharts
- React Hook Form + Zod
- date-fns
- lucide-react

## Módulos incluidos

- Landing demo visual `/`
- Login real, recuperación, confirmación y update password en `/auth/*`
- Dashboard ejecutivo `/dashboard`
- Mood check-in `/mood`
- Encuestas `/surveys`
- Alertas `/alerts`
- Geografía `/geography`
- Estructura organizacional `/structure`
- Empleados `/employees`
- Configuración `/settings`

## Estructura

```txt
app/
  (auth)/
  (dashboard)/
  api/
components/
  alerts/
  charts/
  dashboard/
  employees/
  layout/
  maps/
  mood/
  org/
  surveys/
  ui/
hooks/
lib/
  auth/
  permissions/
  queries/
  schemas/
  supabase/
supabase/
types/
```

## Instalación

```bash
npm install
npm run dev
```

## Variables de entorno

Crear `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Auth y permisos

1. Ejecuta tu script base de BD.
2. Ejecuta `supabase/auth-setup.sql`.
3. Ejecuta `supabase/helpers.sql`.
4. Ejecuta `supabase/rls.sql`.
5. En Supabase Auth, habilita Email/Password.
6. Configura el redirect URL:

```txt
http://localhost:3000/auth/confirm
```

7. Crea o invita usuarios con el mismo email que existe en `public.employees.email`.

La app autentica con Supabase, vincula `auth.users.id` contra `public.employees.auth_user_id` y resuelve permisos por `public.employees.app_role`, con fallback de `employee_profiles.is_leader`.

## SQL incluido

- Seeds demo: `supabase/seed.sql`
- Setup de auth y roles: `supabase/auth-setup.sql`
- Helpers RLS: `supabase/helpers.sql`
- Políticas RLS propuestas: `supabase/rls.sql`

## Notas de integración

- `lib/queries/moood.ts` separa modo mock y modo Supabase real.
- `lib/supabase/repositories.ts` centraliza accesos a vistas y tablas.
- `proxy.ts` mantiene sesión y protege rutas vía Supabase SSR.
- `lib/auth/actions.ts` contiene `signIn`, `signOut`, `resetPassword` y `updatePassword`.
- `lib/auth/queries.ts` resuelve el usuario autenticado desde `employees` y `employee_profiles`.
- Donde falta conexión definitiva a tablas o vistas reales, quedó marcado con `TODO`.
