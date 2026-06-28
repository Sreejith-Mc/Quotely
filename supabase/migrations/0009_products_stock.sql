-- 0009: product catalog (uploaded from Excel) + stock that decrements on accepted quotes.
-- Run this once in the Supabase SQL Editor after 0008.

-- ============ PRODUCTS ============
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- the searchable item name; also the upsert key
  sku text,
  price numeric not null default 0,
  stock numeric not null default 0,
  updated_at timestamptz not null default now()
);

alter table products enable row level security;

-- Any signed-in user can search the catalogue; only admins can upload/change it.
drop policy if exists "products_select_auth" on products;
create policy "products_select_auth" on products for select using (auth.uid() is not null);
drop policy if exists "products_admin_write" on products;
create policy "products_admin_write" on products for all using (is_admin()) with check (is_admin());

-- ============ STOCK ON ACCEPT ============
alter table quotations add column if not exists stock_applied boolean not null default false;

-- Decrement stock when a quote becomes Accepted; restore it if it leaves Accepted.
-- security definer so the products update isn't blocked by the admin-only write policy.
create or replace function apply_quote_stock() returns trigger
language plpgsql security definer set search_path = public as $$
declare it jsonb;
begin
  if jsonb_typeof(new.items) <> 'array' then
    return new;
  end if;

  if new.status = 'Accepted' and coalesce(old.stock_applied, false) = false then
    for it in select value from jsonb_array_elements(new.items) loop
      if nullif(it->>'product_id', '') is not null then
        update products set stock = greatest(0, stock - coalesce((it->>'qty')::numeric, 0)), updated_at = now()
          where id = (it->>'product_id')::uuid;
      end if;
    end loop;
    new.stock_applied := true;
  elsif new.status <> 'Accepted' and coalesce(old.stock_applied, false) = true then
    for it in select value from jsonb_array_elements(new.items) loop
      if nullif(it->>'product_id', '') is not null then
        update products set stock = stock + coalesce((it->>'qty')::numeric, 0), updated_at = now()
          where id = (it->>'product_id')::uuid;
      end if;
    end loop;
    new.stock_applied := false;
  end if;
  return new;
end; $$;

drop trigger if exists on_quote_stock on quotations;
create trigger on_quote_stock before update on quotations
  for each row execute function apply_quote_stock();
