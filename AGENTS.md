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

#### Bloque B — OAuth Meta + GHL ✅ (2026-08-16)

| Ítem | Estado | Fecha |
|---|---|---|
| Página `/integrations` con botones "Conectar" | ✅ | 2026-08-16 |
| `GET /api/oauth/meta` — redirect a Meta OAuth | ✅ | 2026-08-16 |
| `GET /api/oauth/meta/callback` — exchange code → long-lived token | ✅ | 2026-08-16 |
| Guardar `meta_oauth_token` + `meta_business_id` en `organizations` | ✅ | 2026-08-16 |
| `GET /api/oauth/ghl` — redirect a GHL OAuth | ✅ | 2026-08-16 |
| `GET /api/oauth/ghl/callback` — exchange code → tokens | ✅ | 2026-08-16 |
| Guardar `ghl_access_token`, `ghl_refresh_token`, `ghl_location_id` | ✅ | 2026-08-16 |
| Token refresh automático para GHL (access token expira cada 24h) | ⬜ | — |

#### Bloque C — Flujo de registro de usuarios ✅ (2026-08-16)

| Ítem | Estado | Fecha |
|---|---|---|
| Página `/register` — formulario con nombre, email, contraseña | ✅ | 2026-08-16 |
| Login actualizado con link "Registrate" → `/register` | ✅ | 2026-08-16 |
| Email de confirmación con redirect a `/onboarding` | ✅ | 2026-08-16 |
| Pantalla "Revisá tu email" post-registro | ✅ | 2026-08-16 |
| `full_name` pasado en signUp metadata → trigger lo guarda en `profiles` | ✅ | 2026-08-16 |

#### Bloque D — Módulos con datos reales ✅ (2026-08-16)

| Ítem | Estado | Fecha |
|---|---|---|
| Migración SQL: `caption` + `permalink` + unique index en `master_videos` | ✅ | 2026-08-16 |
| Dashboard KPIs — queries reales a Supabase (videos, pulsos, integraciones) | ✅ | 2026-08-16 |
| SDC Monitor — `master_videos` reales desde Supabase | ✅ | 2026-08-16 |
| `POST /api/sdc/sync` — sincroniza Reels desde Instagram Graph API | ✅ | 2026-08-16 |
| SDC `SyncButton` — botón client-side para trigger manual de sync | ✅ | 2026-08-16 |
| SDC `WinnerToggle` — marcado manual de Winners con Server Action | ✅ | 2026-08-16 |
| Lazarus — `lazarus_pulses` reales desde Supabase | ✅ | 2026-08-16 |
| `POST /api/lazarus/dispatch` — envía pulso vía GHL SMS API | ✅ | 2026-08-16 |
| Lazarus `DispatchButton` — botón client-side para envío manual | ✅ | 2026-08-16 |
| `lib/ghl/client.ts` — helpers GHL con refresh automático de token | ✅ | 2026-08-16 |

#### ✅ Qué funciona sin API keys externas (solo Supabase)
- Dashboard: muestra conteos reales de videos, pulsos y estado de integraciones
- Lazarus: muestra la cola de pulsos real, métricas de tasa de respuesta
- SDC: muestra los videos ya sincronizados en `master_videos`
- Toggle Winner: funciona con solo Supabase

#### 🔑 Qué requiere probar con cuentas reales conectadas

| Feature | Requiere | Cómo conectar |
|---|---|---|
| `POST /api/sdc/sync` — importar Reels desde Instagram | `meta_oauth_token` con scopes `instagram_basic` + `instagram_manage_insights` | `/integrations` → Conectar Meta |
| Insights de engagement (plays, reach, likes) | Cuenta de Instagram Business + scope `instagram_manage_insights` | `/integrations` → Conectar Meta |
| `POST /api/lazarus/dispatch` — enviar SMS vía GHL | `ghl_access_token` + lead existente en GHL con mismo `lead_id` | `/integrations` → Conectar GHL |
| Webhook `/api/ghl/lost` — recibir no-shows automáticamente | `GHL_WEBHOOK_SECRET` en env vars + webhook configurado en GHL | Configurar en GHL → Automation → Webhooks |
| Refresh automático GHL token (24h) | `GHL_CLIENT_ID` + `GHL_CLIENT_SECRET` en env vars | Ya en `.env` — se ejecuta automáticamente en el dispatch |

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

### 2026-08-16 — SDC sync via Instagram Basic Display API
**Decisión:** La ruta `/api/sdc/sync` usa `graph.instagram.com/me/media` (Instagram Basic Display API) con el `meta_oauth_token` almacenado en `organizations`. Los insights de engagement (plays, reach) se obtienen de `/{media_id}/insights` y requieren scope `instagram_manage_insights` + cuenta Business. Si no hay cuenta Business o el scope falla, la función degrada graciosamente a 0 en los campos de engagement.
**Nota:** El upsert usa `onConflict: 'instagram_media_id'` que mapea al unique index creado en la migración 004.

### 2026-08-16 — Lazarus dispatch manual vs automático
**Decisión:** La ruta `/api/lazarus/dispatch` permite despacho manual de pulsos uno a uno (para el MVP). El despacho automático (cron que procesa todos los pulsos con `scheduled_for <= now()`) va en Sprint 3 como Edge Function o worker Railway.
**GHL API:** Se usa `POST /conversations/messages` con `type: SMS`. El `contactId` es el `lead_id` almacenado en `lazarus_pulses` (viene del webhook de GHL como `contact_id`).

### 2026-08-16 — GHL token refresh automático
**Implementación:** `lib/ghl/client.ts` implementa refresh automático: si el envío devuelve 401, refresca el token con el `ghl_refresh_token` guardado, actualiza `organizations`, y reintenta. El refresh token de GHL dura 365 días.

---

## Bugs pendientes

| Bug | Síntomas | Hipótesis | Prioridad |
|---|---|---|---|
| Toggle de activación en `/admin/super-user` no persiste | El switch cambia visualmente pero revierte — el update no se ejecuta en Supabase | Posible problema con enum cast de `account_status` o con la cookie de sesión en el Server Action. Se intentó browser client (RLS) y Server Action con service client — ambos fallan. Investigar con logs en Supabase | Baja |

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
| `/login` | Public | Auth email/password (Google OAuth pendiente) |
| `/onboarding` | Auth | Crear organización post-registro (ruta legacy, no se usa con el flujo de super admin) |
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
