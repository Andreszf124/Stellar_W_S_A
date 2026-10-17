-- ============================================================================
-- Productos, misiones y perfiles de negocio
--
-- Como aplicarlo: Supabase > SQL Editor > New query > pegar todo > Run.
-- Es idempotente: se puede correr varias veces.
--
-- SEGURIDAD (leer antes de usar): la app no tiene inicio de sesion, asi que
-- estas tablas permiten INSERTAR con la clave publica. Cualquiera podria crear
-- un producto, una mision o un perfil a nombre de otra direccion Stellar. Eso
-- esta bien para una demo en Testnet; para produccion hay que firmar cada
-- alta con la billetera y validarla en un servidor. No hay politicas de
-- update ni delete: lo ya creado solo se cambia desde el panel de Supabase.
-- ============================================================================

-- 1. Historia en las tiendas del directorio ----------------------------------
alter table public.stores add column if not exists story text;

-- 2. Perfiles que crean los propios negocios ---------------------------------
create table if not exists public.business_profiles (
  wallet text primary key check (wallet ~ '^G[A-Z2-7]{55}$'),
  name text not null check (char_length(name) between 2 and 60),
  category text not null check (category in ('ropa', 'muebles', 'ambos')),
  tagline text check (tagline is null or char_length(tagline) <= 120),
  story text check (story is null or char_length(story) <= 2000),
  city text check (city is null or char_length(city) <= 60),
  province text check (province is null or char_length(province) <= 60),
  instagram text check (instagram is null or char_length(instagram) <= 60),
  since_year int check (since_year is null or since_year between 1800 and 2100),
  created_at timestamptz not null default now()
);

-- 3. Productos propios de cada negocio ---------------------------------------
create table if not exists public.products (
  id bigint generated always as identity primary key,
  store_wallet text not null check (store_wallet ~ '^G[A-Z2-7]{55}$'),
  name text not null check (char_length(name) between 2 and 40),
  -- Diseno base de la app (clave de MODELS en catalog.ts): define como se dibuja
  model_key text not null check (char_length(model_key) between 1 and 30),
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  price_xlm numeric(12,2) not null check (price_xlm > 0 and price_xlm <= 100000),
  description text not null default '' check (char_length(description) <= 300),
  created_at timestamptz not null default now(),
  unique (store_wallet, name)
);

-- 4. Misiones: al cumplirlas se desbloquea un producto de ese negocio --------
create table if not exists public.missions (
  id bigint generated always as identity primary key,
  store_wallet text not null check (store_wallet ~ '^G[A-Z2-7]{55}$'),
  title text not null check (char_length(title) between 2 and 80),
  description text not null default '' check (char_length(description) <= 300),
  kind text not null check (kind in ('items_total', 'items_from_store', 'furniture', 'equipped')),
  target int not null check (target between 1 and 100),
  -- Nombre exacto del producto que se desbloquea
  reward_product text not null check (char_length(reward_product) between 2 and 40),
  created_at timestamptz not null default now()
);

-- 5. Permisos: lectura publica + alta publica (sin update ni delete) ---------
alter table public.business_profiles enable row level security;
alter table public.products enable row level security;
alter table public.missions enable row level security;

drop policy if exists "business_profiles_read" on public.business_profiles;
create policy "business_profiles_read" on public.business_profiles
  for select to anon, authenticated using (true);
drop policy if exists "business_profiles_insert" on public.business_profiles;
create policy "business_profiles_insert" on public.business_profiles
  for insert to anon, authenticated with check (true);

drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products
  for select to anon, authenticated using (true);
drop policy if exists "products_insert" on public.products;
create policy "products_insert" on public.products
  for insert to anon, authenticated with check (true);

drop policy if exists "missions_read" on public.missions;
create policy "missions_read" on public.missions
  for select to anon, authenticated using (true);
drop policy if exists "missions_insert" on public.missions;
create policy "missions_insert" on public.missions
  for insert to anon, authenticated with check (true);

grant select, insert on public.business_profiles to anon, authenticated;
grant select, insert on public.products to anon, authenticated;
grant select, insert on public.missions to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
