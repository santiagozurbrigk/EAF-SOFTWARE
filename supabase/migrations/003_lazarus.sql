-- ====================================================
-- EAF — Migración 003: Módulo Lazarus (Emisor de Pulsos)
-- Ejecutar DESPUÉS de la migración 001 y 002
-- ====================================================

create type pulse_status as enum ('queued', 'sent', 'responded', 'failed');
create type pulse_asset_type as enum ('pdf_case_study', 'video_breakout', 'spreadsheet_roi');

-- ─── Tabla: lazarus_campaigns ────────────────────────────────────────────────
-- Contenedores de campañas de reactivación por organización
create table public.lazarus_campaigns (
  id               uuid default uuid_generate_v4() primary key,
  organization_id  uuid references public.organizations(id) on delete cascade not null,
  name             text not null,
  status           boolean default true not null,  -- true = activa
  created_at       timestamp with time zone default timezone('utc', now()) not null
);

alter table public.lazarus_campaigns enable row level security;

create policy "lazarus_campaigns_org" on public.lazarus_campaigns
  for all using (
    organization_id in (
      select id from public.organizations
      where owner_id = auth.uid()
      or id in (
        select organization_id from public.organization_members
        where profile_id = auth.uid()
      )
    )
  );

-- ─── Tabla: lazarus_pulses ───────────────────────────────────────────────────
-- Pulsos individuales por lead — scheduleados, enviados o respondidos
create table public.lazarus_pulses (
  id             uuid default uuid_generate_v4() primary key,
  campaign_id    uuid references public.lazarus_campaigns(id) on delete cascade not null,
  lead_id        text not null,      -- ID del contacto en GHL
  lead_name      text not null,
  lead_phone     text,
  lead_email     text not null,
  asset_offered  pulse_asset_type not null,
  status         pulse_status default 'queued'::pulse_status not null,
  scheduled_for  timestamp with time zone not null,
  sent_at        timestamp with time zone,
  responded_at   timestamp with time zone,
  created_at     timestamp with time zone default timezone('utc', now()) not null
);

alter table public.lazarus_pulses enable row level security;

create policy "lazarus_pulses_campaign" on public.lazarus_pulses
  for all using (
    campaign_id in (
      select id from public.lazarus_campaigns
      where organization_id in (
        select id from public.organizations
        where owner_id = auth.uid()
        or id in (
          select organization_id from public.organization_members
          where profile_id = auth.uid()
        )
      )
    )
  );

-- Service role bypasses RLS — necesario para el webhook handler de GHL
-- (El cliente de service role no tiene restricciones de RLS)

-- ─── Índices ─────────────────────────────────────────────────────────────────
create index idx_lazarus_pulses_email_status on public.lazarus_pulses(lead_email, status);
create index idx_lazarus_pulses_scheduled on public.lazarus_pulses(scheduled_for) where status = 'queued';
create index idx_lazarus_campaigns_org on public.lazarus_campaigns(organization_id, status);
