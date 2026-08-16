# AGENTS.md — EAF Software

Documento vivo de progreso del proyecto y reglas operativas para agentes de IA (Claude, Cursor, Copilot, etc.).

**Regla fundamental:** Cada vez que un agente modifica código, completa un bloque o corrige un bug, debe actualizar la sección correspondiente de este archivo antes de hacer commit. El documento debe reflejar el estado real del sistema en todo momento.

---

## Reglas para agentes

### Antes de empezar
1. Leer este archivo completo para entender el estado actual del proyecto.
2. Leer `README.md` si existe, para contexto adicional.
3. No modificar código de módulos marcados como `🔒 NO TOCAR` sin confirmación explícita del humano.
4. Ante cualquier duda de arquitectura: preguntar antes de implementar.

### Durante el trabajo
1. Trabajar siempre en el branch `claude/repository-analysis-h1c380` (o el branch de feature activo indicado por el humano).
2. Nunca pushear directamente a `main` — siempre via PR.
3. Correr `npm run build` antes de cada commit. Si falla, corregir los errores antes de continuar.
4. Mantener `package.json` actualizado cuando se agreguen dependencias.

### Al terminar cada bloque o modificación significativa
1. Actualizar la sección **Progreso por Sprint** de este archivo.
2. Marcar los ítems completados con `✅` y la fecha.
3. Documentar cualquier decisión técnica importante tomada en la sección **Decisiones técnicas**.
4. Documentar bugs encontrados y cómo se resolvieron en **Bugs resueltos**.
5. Hacer commit incluyendo la actualización de este archivo.
6. Crear PR hacia `main` y mergearlo si el humano lo aprueba.

### Formato de commit
```
tipo: descripción corta en español

- Detalle 1
- Detalle 2

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_XXXXX
```

---

## Stack técnico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend / SSR | Next.js App Router | 14.2.14 |
| Lenguaje | TypeScript | ^5.6 |
| UI | Tailwind CSS + Shadcn/UI (manual) | 3.4 |
| Auth + DB | Supabase | JS 2.112.x |
| Supabase SSR | @supabase/ssr | 0.12.4 |
| Gráficos | Recharts | ^2.13 |
| Deploy frontend | Vercel | — |
| Deploy workers | Railway (Sprint 2+) | — |

**Proyecto Supabase:** `uxjdglgoqgsxyqmvavrm` — región `sa-east-1`

### Variables de entorno requeridas
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GHL_WEBHOOK_SECRET
```

### Variables de entorno Sprint 2 (Bloque B)
```
META_APP_ID
META_APP_SECRET
GHL_CLIENT_ID
GHL_CLIENT_SECRET
GHL_REDIRECT_URI
```

---

## Arquitectura de módulos

```
EAF Platform
├── Sintonizador (SDC / La Fábrica)    → /sdc
│   └── Video ganador → 5 variaciones FFmpeg → Meta Ads
├── Filtro de Banda (Blackhole 2.0)    → /campaigns
│   └── 4 capas: Exclusión 3s/10s, cold audiences
├── Bucle de Resonancia (B:52)         → /resonance
│   └── Pre-llamada: 4 pilares + email workflow
└── Emisor de Pulsos (Lazarus)         → /lazarus
    └── Webhook GHL → cola 48h → reactivación
```

### Modelo de datos (9 tablas en Supabase)
- `profiles` — espeja auth.users (trigger automático)
- `organizations` — multi-tenancy, status: pending/active/suspended
- `organization_members` — membresía
- `master_videos` — videos orgánicos validados
- `video_variants` — 5 variaciones por video (FFmpeg)
- `eaf_campaigns` — campañas Meta Ads
- `eaf_ad_sets` — ad sets dentro de campañas
- `lazarus_campaigns` — campañas de reactivación
- `lazarus_pulses` — pulsos individuales por lead

---

## Progreso por Sprint

### Sprint 1 — Infraestructura base ✅ (2026-08-16)

| Ítem | Estado | Fecha |
|---|---|---|
| Next.js 14 scaffold + todas las páginas shell | ✅ | 2026-08-16 |
| Migraciones SQL 001, 002, 003 corridas en Supabase | ✅ | 2026-08-16 |
| Auth email/password funcional | ✅ | 2026-08-16 |
| Middleware + rutas protegidas | ✅ | 2026-08-16 |
| Super admin panel + activation toggle | ✅ | 2026-08-16 |
| Webhook `/api/ghl/lost` | ✅ | 2026-08-16 |
| Deploy en Vercel | ✅ | 2026-08-16 |
| Google OAuth | ⏸️ Diferido — requiere verificación de app Google | — |

---

### Sprint 2 — Integraciones y datos reales

#### Bloque A — Foundations ✅ (2026-08-16)

| Ítem | Estado | Fecha |
|---|---|---|
| `lib/supabase/database.types.ts` — tipos generados desde Supabase real | ✅ | 2026-08-16 |
| Upgrade `@supabase/ssr` 0.5.2 → 0.12.4 (fix incompatibilidad tipos) | ✅ | 2026-08-16 |
| Clientes Supabase tipados con `Database` genérico | ✅ | 2026-08-16 |
| Eliminar todos los `(supabase as any)` casts | ✅ | 2026-08-16 |
| Fix bug `.single()` → `.maybeSingle()` en dashboard layout | ✅ | 2026-08-16 |
| `app/onboarding/page.tsx` — flujo de creación de organización | ✅ | 2026-08-16 |
| Redirect a `/onboarding` si el usuario no tiene org | ✅ | 2026-08-16 |
| `role = super_admin` seteado para owner del proyecto | ✅ | 2026-08-16 |

#### Bloque B — OAuth Meta + GHL 🔄 En progreso

| Ítem | Estado | Fecha |
|---|---|---|
| Página `/integrations` con botones "Conectar" | 🔄 | — |
| `GET /api/oauth/meta` — redirect a Meta OAuth | ⬜ | — |
| `GET /api/oauth/meta/callback` — exchange code → token | ⬜ | — |
| Guardar `meta_oauth_token` + `meta_business_id` en `organizations` | ⬜ | — |
| `GET /api/oauth/ghl` — redirect a GHL OAuth | ⬜ | — |
| `GET /api/oauth/ghl/callback` — exchange code → tokens | ⬜ | — |
| Guardar `ghl_access_token`, `ghl_refresh_token`, `ghl_location_id` | ⬜ | — |
| Token refresh automático para GHL (access token expira cada 24h) | ⬜ | — |

#### Bloque C — Módulos con datos reales ⬜ Pendiente

| Ítem | Estado | Fecha |
|---|---|---|
| SDC Monitor — Instagram Graph API → `master_videos` reales | ⬜ | — |
| Dashboard KPIs — queries reales a Supabase | ⬜ | — |
| Lazarus sender — cron/Edge Function para despachar pulsos | ⬜ | — |

---

### Sprint 3 — FFmpeg Pipeline (Railway) ⬜ Planificado

| Ítem | Estado | Fecha |
|---|---|---|
| Worker Node.js en Railway con BullMQ | ⬜ | — |
| FFmpeg: 5 variaciones de video por video ganador | ⬜ | — |
| Subida de variaciones a Supabase Storage | ⬜ | — |
| Actualización de `video_variants.status` en tiempo real | ⬜ | — |

---

## Decisiones técnicas

### 2026-08-16 — Upgrade @supabase/ssr 0.5.2 → 0.12.4
**Problema:** `@supabase/ssr` 0.5.2 importaba desde `@supabase/supabase-js/dist/module/lib/types`, ruta que no existe en supabase-js 2.112.3 (nueva estructura de dist). Esto hacía que todos los tipos de queries infirieran `never`.
**Solución:** Upgrade a `@supabase/ssr` 0.12.4 que requiere `supabase-js ^2.111.0`, compatible con la versión instalada.

### 2026-08-16 — Maybeasingle() en lugar de single() para org query
**Problema:** Dashboard layout usaba `.single()` para buscar la org del usuario. Si el usuario no tenía org (recién registrado), Supabase devolvía error y el layout crasheaba silenciosamente.
**Solución:** Cambiar a `.maybeSingle()` que devuelve `null` sin error cuando no hay filas. Luego redirigir a `/onboarding` si `org === null`.

### 2026-08-16 — Server Actions para onboarding
**Decisión:** Usar Server Actions de Next.js para el formulario de onboarding en lugar de una API route. Más limpio con App Router, sin roundtrip extra.

### 2026-08-16 — super_admin sin org
**Decisión:** El usuario `super_admin` puede acceder al dashboard aunque no tenga organización propia. La condición de redirect a onboarding es `!org && !isSuperAdmin`.

---

## Bugs resueltos

| Bug | Causa | Fix | Fecha |
|---|---|---|---|
| Tipos de queries Supabase inferían `never` | Incompatibilidad `@supabase/ssr` 0.5.2 con supabase-js 2.112.x | Upgrade SSR a 0.12.4 | 2026-08-16 |
| Dashboard crasheaba si usuario sin org | `.single()` retorna error si no hay filas | Cambiar a `.maybeSingle()` | 2026-08-16 |
| `next.config.ts` no soportado | Next.js 14.2 no soporta config en TypeScript | Renombrar a `next.config.mjs` con ESM | 2026-08-16 |

---

## Rutas del sistema

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | Redirect | → `/dashboard` o `/login` según sesión |
| `/login` | Public | Auth email/password + Google OAuth |
| `/onboarding` | Auth | Crear organización post-registro |
| `/dashboard` | Protected | KPIs y métricas principales |
| `/sdc` | Protected | Sintonizador / La Fábrica |
| `/campaigns` | Protected | Filtro de Banda / Blackhole 2.0 |
| `/resonance` | Protected | Bucle de Resonancia / B:52 |
| `/lazarus` | Protected | Emisor de Pulsos |
| `/integrations` | Protected | Conexión Meta, GHL, Hyros, Calendly |
| `/admin/super-user` | Super Admin | Activación de cuentas |
| `/api/auth/callback` | Public | Callback OAuth Supabase |
| `/api/ghl/lost` | Webhook | Recibe eventos ghost/no-show de GHL |
| `/api/oauth/meta` | Protected | Inicia flujo OAuth Meta (Sprint 2B) |
| `/api/oauth/meta/callback` | Public | Callback OAuth Meta (Sprint 2B) |
| `/api/oauth/ghl` | Protected | Inicia flujo OAuth GHL (Sprint 2B) |
| `/api/oauth/ghl/callback` | Public | Callback OAuth GHL (Sprint 2B) |
