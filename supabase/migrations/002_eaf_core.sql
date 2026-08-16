-- ====================================================
-- EAF — Migración 002: Core SDC + Campañas de Meta Ads
-- Ejecutar DESPUÉS de la migración 001
-- ====================================================

create type video_variant_status as enum ('pending', 'processing', 'completed', 'failed');
create type campaign_type as enum ('sintonizador', 'filtro_banda', 'bucle_resonancia', 'emisor_pulsos');
create type budget_type as enum ('ABO', 'CBO');

-- ─── Tabla: master_videos ────────────────────────────────────────────────────
-- Videos originales del feed orgánico validados por el Validation Monitor
create table public.master_videos (
  id                       uuid default uuid_generate_v4() primary key,
  user_id                  uuid references public.profiles(id) on delete cascade not null,
  instagram_media_id       text unique,
  raw_video_url            text not null,
  organic_views            integer default 0,
  organic_engagement_rate  numeric(5, 2),
  is_winner                boolean default false,
  created_at               timestamp with time zone default timezone('utc', now()) not null
);

alter table public.master_videos enable row level security;

create policy "master_videos_owner" on public.master_videos
  for all using (user_id = auth.uid());

-- ─── Tabla: video_variants ───────────────────────────────────────────────────
-- Las 5 variaciones generadas por FFmpeg para cada video ganador
create table public.video_variants (
  id                   uuid default uuid_generate_v4() primary key,
  master_video_id      uuid references public.master_videos(id) on delete cascade not null,
  variant_number       integer not null check (variant_number between 1 and 5),
  hook_text            text,
  font_style           varchar(100),
  audio_track_url      text,
  processed_video_url  text,     -- URL en Supabase Storage o CDN
  status               video_variant_status default 'pending'::video_variant_status not null,
  created_at           timestamp with time zone default timezone('utc', now()) not null,
  unique(master_video_id, variant_number)
);

alter table public.video_variants enable row level security;

create policy "video_variants_owner" on public.video_variants
  for all using (
    master_video_id in (
      select id from public.master_videos where user_id = auth.uid()
    )
  );

-- ─── Tabla: eaf_campaigns ────────────────────────────────────────────────────
-- Campañas de Meta Ads gestionadas por EAF (Sintonizador, Filtro de Banda, B:52)
create table public.eaf_campaigns (
  id                 uuid default uuid_generate_v4() primary key,
  user_id            uuid references public.profiles(id) on delete cascade not null,
  meta_campaign_id   text unique,   -- ID real en Meta Ads Manager
  name               text not null,
  system_type        campaign_type not null,
  budget             numeric(10, 2) not null,
  budget_type        budget_type default 'ABO'::budget_type not null,
  status             text default 'paused' not null,
  created_at         timestamp with time zone default timezone('utc', now()) not null
);

alter table public.eaf_campaigns enable row level security;

create policy "eaf_campaigns_owner" on public.eaf_campaigns
  for all using (user_id = auth.uid());

-- ─── Tabla: eaf_ad_sets ──────────────────────────────────────────────────────
-- Ad Sets individuales dentro de cada campaña (uno por variación de video)
create table public.eaf_ad_sets (
  id                      uuid default uuid_generate_v4() primary key,
  campaign_id             uuid references public.eaf_campaigns(id) on delete cascade not null,
  meta_adset_id           text unique,
  video_variant_id        uuid references public.video_variants(id) on delete set null,
  exclusion_audience_id   text,       -- ID de Custom Audience de Meta (3s o 10s)
  target_cold_interests   jsonb,      -- Segmentación de intereses del ICP
  status                  text default 'paused' not null,
  created_at              timestamp with time zone default timezone('utc', now()) not null
);

alter table public.eaf_ad_sets enable row level security;

create policy "eaf_ad_sets_owner" on public.eaf_ad_sets
  for all using (
    campaign_id in (
      select id from public.eaf_campaigns where user_id = auth.uid()
    )
  );

-- ─── Índices de performance ──────────────────────────────────────────────────
create index idx_master_videos_user_winner on public.master_videos(user_id, is_winner);
create index idx_video_variants_master on public.video_variants(master_video_id);
create index idx_eaf_campaigns_user_type on public.eaf_campaigns(user_id, system_type);
create index idx_eaf_ad_sets_campaign on public.eaf_ad_sets(campaign_id);
