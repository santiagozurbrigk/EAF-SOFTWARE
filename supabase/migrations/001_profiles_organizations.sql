-- ====================================================
-- EAF — Migración 001: Auth, Perfiles y Multi-tenancy
-- Ejecutar en: Supabase SQL Editor
-- ====================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- Enums de dominio
create type user_role as enum ('member', 'super_admin');
create type account_status as enum ('pending_activation', 'active', 'suspended');

-- ─── Tabla: profiles ─────────────────────────────────────────────────────────
-- Espeja auth.users de Supabase Auth. Se crea automáticamente via trigger.
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null unique,
  full_name   text,
  role        user_role default 'member'::user_role not null,
  created_at  timestamp with time zone default timezone('utc', now()) not null
);

alter table public.profiles enable row level security;

-- Trigger: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Tabla: organizations ────────────────────────────────────────────────────
create table public.organizations (
  id                  uuid default uuid_generate_v4() primary key,
  name                text not null,
  owner_id            uuid references public.profiles(id) on delete cascade not null,
  status              account_status default 'pending_activation'::account_status not null,
  -- Tokens OAuth/API (almacenados encriptados via pgsodium en producción)
  meta_oauth_token    text,
  meta_business_id    text,
  ghl_access_token    text,
  ghl_refresh_token   text,
  ghl_location_id     text,
  created_at          timestamp with time zone default timezone('utc', now()) not null
);

alter table public.organizations enable row level security;

-- ─── Tabla: organization_members ─────────────────────────────────────────────
create table public.organization_members (
  id               uuid default uuid_generate_v4() primary key,
  organization_id  uuid references public.organizations(id) on delete cascade not null,
  profile_id       uuid references public.profiles(id) on delete cascade not null,
  joined_at        timestamp with time zone default timezone('utc', now()) not null,
  unique(organization_id, profile_id)
);

alter table public.organization_members enable row level security;

-- ─── Políticas RLS ───────────────────────────────────────────────────────────

-- Helper: verificar si el usuario actual es super_admin
create or replace function public.is_super_admin()
returns boolean
language sql stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- profiles: el usuario lee y edita su propio perfil; super_admin lee todos
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.is_super_admin());

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- organizations: miembros y owner leen la suya; super_admin lee todas
create policy "organizations_select" on public.organizations
  for select using (
    owner_id = auth.uid()
    or id in (
      select organization_id from public.organization_members
      where profile_id = auth.uid()
    )
    or public.is_super_admin()
  );

create policy "organizations_insert" on public.organizations
  for insert with check (owner_id = auth.uid());

create policy "organizations_update" on public.organizations
  for update using (owner_id = auth.uid() or public.is_super_admin());

-- organization_members: miembros leen su membresía
create policy "members_select" on public.organization_members
  for select using (
    profile_id = auth.uid() or public.is_super_admin()
  );

create policy "members_insert" on public.organization_members
  for insert with check (
    -- Solo el owner de la org puede agregar miembros
    organization_id in (
      select id from public.organizations where owner_id = auth.uid()
    )
  );
