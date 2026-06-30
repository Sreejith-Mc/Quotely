-- 0010: profit / margin. Admin sets a margin %, profit is shown only on the
-- admin export (and only to admins, unless they enable it for employees).
-- Run this once in the Supabase SQL Editor after 0009.

create table if not exists profit_settings (
  id int primary key default 1 check (id = 1),
  margin_percent numeric not null default 0,
  employees_can_see boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into profit_settings (id) values (1) on conflict (id) do nothing;

alter table profit_settings enable row level security;

-- Only admins (or everyone, once enabled) can even read the margin/profit settings.
drop policy if exists "profit_select" on profit_settings;
create policy "profit_select" on profit_settings for select using (is_admin() or employees_can_see);
drop policy if exists "profit_admin_write" on profit_settings;
create policy "profit_admin_write" on profit_settings for update using (is_admin()) with check (is_admin());

-- Remember the margin used on each quotation (for re-exporting later).
alter table quotations add column if not exists margin_percent numeric not null default 0;
