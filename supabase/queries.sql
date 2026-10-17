-- SQL kit for the Supabase project. Copy one block at a time into
-- Supabase dashboard > SQL Editor > New query and press Run.
-- These run with dashboard privileges, so they bypass the read-only rule that
-- applies to the public (publishable) key. Never put a secret key in the app.


-- 1) See the stores
select id, name, category, description, wallet from public.stores order by id;


-- 2) Add a store
-- category must be one of: 'ropa', 'muebles', 'ambos'. wallet is optional.
insert into public.stores (name, category, description, wallet)
values ('Nombre de la tienda', 'ropa', 'Una frase sobre la tienda.', null);


-- 3) Edit a store (change the id)
update public.stores
set name = 'Nuevo nombre', description = 'Nueva descripcion'
where id = 1;


-- 4) Delete a store (change the id)
delete from public.stores where id = 1;


-- 5) Remove the example stores only, keeping real ones
delete from public.stores where name like 'Tienda de ejemplo:%';


-- 6) Check that the public rules are still safe: this must list exactly one
-- policy for stores, a SELECT one, and no insert/update/delete policies.
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'stores';


-- 7) UNDO everything this kit created (drops the table and its data)
-- drop table if exists public.stores;
