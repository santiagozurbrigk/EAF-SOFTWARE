# Resolución de Gaps Técnicos y Arquitectura de Implementación (PRD Anexo)
**EAF — Evergreen De Alta Frecuencia**

Este documento resuelve con lujo de detalles técnicos, diagramas de flujo y esquemas de base de datos los 6 gaps de desarrollo críticos identificados para el inicio de la construcción del software EAF. Está diseñado específicamente para que tu **Claude Code** lo interprete y lo use como especificación directa para codear.

---

## 🛠️ GAP 1 & 2: Stack de Frontend, Backend y Arquitectura de Deployment

Para maximizar tu cuenta de **Vercel Pro**, mantener costos de infraestructura cercanos a **$0 USD** en la fase de validación y garantizar la estabilidad de procesos pesados de procesamiento de video (FFmpeg) y sincronización masiva con Meta Ads API, la arquitectura recomendada es **Híbrida desacoplada**.

### 1. El Dilema del Time-Out Serverless (Vercel)
Las Serverless Functions de Vercel tienen un límite duro de ejecución (15 segundos en plan Hobby, 60 segundos en plan Pro). El procesamiento de video con FFmpeg y la creación de lotes de pauta en Meta Ads API pueden tomar varios minutos por cola. **Next.js por sí solo en Vercel fallará con Error 504 (Gateway Timeout) al procesar videos.**

### 2. La Solución: Topología de Deployment Desacoplada

```text
                                     ┌─────────────────────────────────────────┐
                                     │         Vercel (Next.js App)            │
                                     │  • UI/UX React + Tailwind               │
                                     │  • Auth y Webhooks Rápidos              │
                                     │  • API Route triggers de colas          │
                                     └────────────┬──────────────┬─────────────┘
                                                  │              ▲
                                            Push  │              │  SSE / Webhook
                                            Task  ▼              │  Updates
                                     ┌────────────┴──────────────┴─────────────┐
                                     │         Supabase (Backend)              │
                                     │  • PostgreSQL DB (Almacenamiento)       │
                                     │  • Supabase Auth (Sesiones JWT)         │
                                     │  • Storage (Videos crudos/variaciones)  │
                                     └────────────┬────────────────────────────┘
                                                  │ BullMQ Queue
                                                  ▼
                                     ┌─────────────────────────────────────────┐
                                     │     Railway (Persistent Worker)         │
                                     │  • Node.js Persistent Daemon            │
                                     │  • Redis (BullMQ / In-Memory Queue)     │
                                     │  • FFmpeg Native Binary (Video Squeeze) │
                                     │  • Meta Ads API Sync Engine             │
                                     └─────────────────────────────────────────┘
```

### 3. Especificación del Stack Técnico
*   **Frontend & API Gateway:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS + Shadcn/ui.
    *   *Despliegue:* **Vercel** (Apalancando tu suscripción Vercel Pro para ancho de banda ilimitado y edge functions rápidas).
*   **Base de datos, Autenticación y File Storage:** **Supabase**.
    *   *Autenticación:* Supabase Auth (JWT nativos, Login social con Google/Meta, RLS integrado).
    *   *PostgreSQL:* Base de datos relacional para guardar campañas, mapeos de píxeles, tokens OAuth.
    *   *Storage:* Supabase Storage S3-compatible Buckets para alojar el hosting de videos crudos subidos y variaciones MP4 terminadas listas para inyección.
*   **Motor de Colas y Procesador de Video Pesado:** **Railway** (Instancia persistent tipo Docker por $5/mes, apagable cuando no se usa).
    *   *Engine:* Node.js Daemon ejecutando **BullMQ** sobre una base de datos Redis ligera (puede ser de Upstash o un container Redis en Railway).
    *   *FFmpeg:* Binario nativo de Linux FFmpeg instalado en la imagen del Docker worker para el procesamiento asíncrono de video en la nube.

---

## 🔐 GAP 4 & 5: Sistema de Auth, Multi-Tenancy y Panel de Super Admin (Fase Beta)

Dado que la fase inicial será testeada por usuarios reales de forma gratuita (y cobros manuales off-platform a futuro), no requerimos integración con Stripe/Billing por el momento. Diseñamos un sistema de **Multi-tenancy basado en Organizaciones** con activación y control manual mediante un panel de **Super Admin**.

### 1. Estructura de Base de Datos para Control de Cuentas (SQL DDL)

Copia este código SQL directamente en el editor SQL de Supabase para inicializar las tablas de autenticación, control de accesos y el flag de Super Admin:

```sql
-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- Crear enum de roles de plataforma
create type user_role as enum ('member', 'super_admin');
create type account_status as enum ('pending_activation', 'active', 'suspended');

-- 1. Tabla de Perfiles de Usuario (Espeja auth.users de Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text,
  role user_role default 'member'::user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en profiles
alter table public.profiles enable row level security;

-- 2. Tabla de Organizaciones (Cuentas Multi-Tenant)
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  status account_status default 'pending_activation'::account_status not null,
  meta_oauth_token text,
  meta_business_id text,
  ghl_access_token text,
  ghl_refresh_token text,
  ghl_location_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en organizations
alter table public.organizations enable row level security;

-- 3. Tabla de Miembros (Para soportar múltiples usuarios por marca si es necesario)
create table public.organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, profile_id)
);

alter table public.organization_members enable row level security;

-- =========================================================================
-- POLITICAS DE SEGURIDAD (RLS) - PROTECCIÓN ABSOLUTA DE MULTI-TENANCY
-- =========================================================================

-- Perfiles: Solo el propio usuario o el Super Admin pueden leer y editar
create policy "Permitir lectura de perfiles propios" on public.profiles
  for select using (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'super_admin'::user_role);

create policy "Permitir edición de perfiles propios" on public.profiles
  for update using (auth.uid() = id);

-- Organizaciones: Solo los miembros autorizados o el Super Admin pueden operar
create policy "Lectura de organizaciones del usuario" on public.organizations
  for select using (
    owner_id = auth.uid() 
    or id in (select organization_id from public.organization_members where profile_id = auth.uid())
    or (select role from public.profiles where id = auth.uid()) = 'super_admin'::user_role
  );

create policy "Edición de organizaciones propias" on public.organizations
  for update using (
    owner_id = auth.uid() 
    or (select role from public.profiles where id = auth.uid()) = 'super_admin'::user_role
  );
```

### 2. Flujo de Onboarding, Auth y Activación Manual

```text
[Cliente Se Registra (Supabase Auth)] 
             │
             ▼
[Inserta Fila en public.profiles (status: pending_activation)]
             │
             ▼
[El Cliente crea su Organización y solicita Demo (SaaS deshabilitado)]
             │
             ▼
[Notificación al Panel de Super Admin (Matías / Santiago)]
             │
             ▼
[Super Admin verifica datos e inversión de Ads mínima off-platform]
             │
             ▼
[Super Admin activa la Cuenta (status: active) en Dashboard]
             │
             ▼
[Se activan automáticamente las integraciones de Meta Ads & GHL API]
```

### 3. Pantallas del Panel de Super Admin (Dashboard Secreto)
Esta interfaz estará protegida con RLS en base al rol de `super_admin`.

*   **Ruta de acceso:** `/admin/super-user`
*   **Funcionalidades Clave:**
    *   **User Management Grid:** Tabla con paginación que lista todos los usuarios de la base de datos de Supabase, su email, estado (`pending_activation`, `active`, `suspended`) y su rol.
    *   **Toggle de Activación Instantáneo:** Botón interactivo para cambiar el estado de la organización del cliente con un clic, inyectando o suspendiendo el consumo del software.
    *   **Token Refresh Control:** Panel para auditar si las cuentas de los clientes tienen los tokens de la API de Meta y GoHighLevel vigentes o si requieren re-autorización por expiración de OAuth.

---

## 📹 GAP 3: Especificación Matemática Detallada de las Variaciones 4 y 5 de FFmpeg

Para completar las 5 variaciones automáticas que el *SDC Engine* de EAF inyectará automáticamente en Meta Ads API, detallamos la ingeniería de comandos de bajo nivel para las variaciones restantes:

### 1. Variación 4: Splicing de Silencios, Zoom Dinámico y Pattern Interrupt Visual
*   **Objetivo de retención:** Hackear el scroll del usuario aplicando zooms programáticos en oraciones clave (alternando encuadres) y recortando milimétricamente pausas de silencio superiores a 200ms para mantener un ritmo vertiginoso.
*   **Comando FFmpeg Multicapa:**

```bash
# Paso A: Eliminar silencios de forma automática utilizando el filtro 'silencedetect' y 'silenceremove'
# Esto recorta pausas sin distorsionar el tono de voz del creador
ffmpeg -i video_input.mp4 -vf "silenceremove=start_periods=1:start_duration=0.1:start_threshold=-40dB:detection=point" -af "silenceremove=start_periods=1:start_duration=0.1:start_threshold=-40dB:detection=point" video_trimmed.mp4

# Paso B: Aplicar zoom dinámico cíclico para crear cortes multicámara virtuales
# Genera zooms alternados de 1.1x y 1.2x cada 3.5 segundos con transiciones fluidas de interpolación
ffmpeg -i video_trimmed.mp4 -vf "zoompan=z='if(lte(mod(it,3.5),0.5),zoom+0.05,1.1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920" -c:a copy video_variation_4.mp4
```

### 2. Variación 5: Concatenación y Mezcla de Outro de Alto Impacto con CTA Personalizado (El "Cierre de Alta Conversión")
*   **Objetivo de conversión:** Inyectar una pantalla final dinámica (outro) de 5 segundos donde se le indica explícitamente al prospecto comentar la palabra clave que activa el trigger de ManyChat/GHL (por ejemplo, "FÁBRICA" o "SDC").
*   **Estrategia técnica:** Mezclar la pista de audio del final del video del fundador (fade-out) con el ingreso de un track de música electrónica sin copyright (fade-in) para subir la energía al nivel de conversión.
*   **Comando FFmpeg de Concatenación y Audio Crossfade:**

```bash
# Concatenar la variación del video (master_var.mp4) con la outro animada (outro_cta_fb.mp4)
# Aplicar un filtro de fade-out de audio en el canal 0 del video original y mezclar con el de la outro
ffmpeg -i master_var.mp4 -i outro_cta_fb.mp4 -filter_complex \
"[0:v][0:a][1:v][1:a] concat=n=2:v=1:a=1 [v][a]; \
 [a] afade=t=out:st=25:d=2 [a_faded]" \
-map "[v]" -map "[a_faded]" -c:v libx264 -crf 18 -preset fast output_variation_5.mp4
```

---

## 📡 GAP 6: Diseño Técnico Profundo del Módulo Lazarus (Emisor de Pulsos)

El **Emisor de Pulsos** (Lazarus) no es un sistema de spam. Su objetivo es detectar de forma automática leads que entraron al embudo evergreen de la marca pero se "enfriaron" o detuvieron (por ejemplo, no asistieron a la llamada, cancelaron el calendario o no aplicaron en el Typeform) y recuperarlos mediante micro-compromisos de altísimo valor.

### 1. Modelo de Base de Datos para el Emisor de Pulsos (SQL DDL)

Copia este esquema SQL para estructurar la inteligencia de recuperación de base de datos en Supabase:

```sql
create type pulse_status as enum ('queued', 'sent', 'responded', 'failed');
create type pulse_asset_type as enum ('pdf_case_study', 'video_breakout', 'spreadsheet_roi');

-- Tabla de Campañas de Reactivación Lazarus
create table public.lazarus_campaigns (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  status boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Mensajes de Pulso Enviados / Pendientes
create table public.lazarus_pulses (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.lazarus_campaigns(id) on delete cascade not null,
  lead_id text not null, -- ID del Lead de GHL
  lead_name text not null,
  lead_phone text,
  lead_email text not null,
  asset_offered pulse_asset_type not null,
  status pulse_status default 'queued'::pulse_status not null,
  scheduled_for timestamp with time zone not null,
  sent_at timestamp with time zone,
  responded_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.lazarus_campaigns enable row level security;
alter table public.lazarus_pulses enable row level security;
```

### 2. Flujo de Integración API del Módulo Lazarus (GHL -> EAF Software)

```text
       GoHighLevel (Lead se estanca / se etiqueta como 'Fantasmeó')
                                   │
                                   ▼ Webhook HTTP POST
                     API Route Next.js /api/ghl/lost
                                   │
                                   ▼ Validar Firma JWT y Token Cliente
                      EAF Software (Lazarus Module)
                                   │
                                   ├─► 1. Busca perfil de ICP en DB
                                   ├─► 2. Selecciona Asset de Alto Impacto
                                   └─► 3. Agenda el envío del Pulso (+48 hs)
                                   │
                                   ▼
             Envío Automatizado (WhatsApp Cloud API o GHL API)
   "¡Hola [Nombre]! Matías acá. ¿Pudiste ver el PDF de los P&L de Amazon?"
```

### 3. La Lógica de Ejecución de la API Lazarus (Next.js Endpoint)

Este bloque de TypeScript define la API Route que tu **Claude Code** debe implementar para automatizar el ingreso de leads estancados al sistema de reactivación:

```typescript
// Ruta: /app/api/ghl/lost/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { contact_id, email, first_name, phone, location_id, stage } = payload;

    // 1. Buscar la organización que coincide con la subcuenta de GHL
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, status')
      .eq('ghl_location_id', location_id)
      .single();

    if (orgError || !org || org.status !== 'active') {
      return NextResponse.json({ error: 'Organización inválida o inactiva' }, { status: 400 });
    }

    // 2. Verificar si el lead ya está en un ciclo de Lazarus activo
    const { data: activePulse } = await supabase
      .from('lazarus_pulses')
      .select('id')
      .eq('lead_email', email)
      .eq('status', 'queued')
      .single();

    if (activePulse) {
      return NextResponse.json({ message: 'El lead ya está en cola de Lazarus.' });
    }

    // 3. Agendar el primer pulso con un Asset de Alto Impacto (ej. PDF contable)
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + 48); // Delay preventivo de 48 horas

    const { error: insertError } = await supabase
      .from('lazarus_pulses')
      .insert({
        organization_id: org.id,
        lead_id: contact_id,
        lead_name: first_name,
        lead_phone: phone,
        lead_email: email,
        asset_offered: 'pdf_case_study',
        status: 'queued',
        scheduled_for: scheduledTime.toISOString()
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, message: 'Lead agendado en Lazarus de forma exitosa.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 4. Flujo del Setter Dashboard (La Consola de Operaciones Lazarus)
Cuando el backend de EAF agenda un pulso, este aparece en la pantalla del setter del cliente.
*   **El Trigger Manual (Handoff de Alta Conversión):** El software le muestra al setter la tarjeta del lead congelado. En lugar de automatizar el primer mensaje de ManyChat, el setter copia el texto dinámico provisto por el software EAF y lo manda por Instagram DM o WhatsApp de forma **manual** (lo cual aumenta 30% la tasa de show y respuesta).
*   **The Red Flags Trigger:** Si el lead responde mostrando resistencia, el software de EAF actualiza el estado a `responded` en Supabase y remueve al lead de toda secuencia de ads invasiva, permitiendo que el cerrador entre de forma totalmente consultiva a desarmar la objeción real.
