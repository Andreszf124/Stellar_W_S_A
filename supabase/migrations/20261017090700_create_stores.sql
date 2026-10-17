-- Stores directory for the demo.
--
-- How to apply: Supabase dashboard > SQL Editor > New query > paste > Run.
-- It is safe to run twice.
--
-- Security: row level security is on and the only policy lets anyone READ.
-- There are no insert, update or delete policies, so nobody can change data
-- with the public (publishable) key. Edit rows from the dashboard instead.

create table if not exists public.stores (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null check (category in ('ropa', 'muebles', 'ambos')),
  description text not null default '',
  -- Stellar address (G...) of the store, optional
  wallet text,
  created_at timestamptz not null default now()
);

alter table public.stores enable row level security;

drop policy if exists "stores_public_read" on public.stores;
create policy "stores_public_read" on public.stores
  for select to anon, authenticated
  using (true);

grant select on public.stores to anon, authenticated;

-- Example rows, clearly labeled as examples. Only inserted when the table is empty.
insert into public.stores (name, category, description)
select * from (values
  ('Tienda de ejemplo: ropa', 'ropa', 'Camisetas, gorras y chaquetas. Datos de ejemplo para la demo.'),
  ('Tienda de ejemplo: muebles', 'muebles', 'Sillas, mesas y lámparas. Datos de ejemplo para la demo.'),
  ('Tienda de ejemplo: casa y estilo', 'ambos', 'Ropa y objetos para el hogar. Datos de ejemplo para la demo.')
) as v(name, category, description)
where not exists (select 1 from public.stores);
