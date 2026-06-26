-- Quotely schema: profiles/roles, singleton settings tables, quotations, RLS, storage.
-- Run this once in the Supabase SQL Editor (or via `supabase db push`) on a fresh project.

create extension if not exists pgcrypto;

-- ============ PROFILES (extends auth.users) ============
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text default '',
  avatar_url text,
  role text not null default 'employee' check (role in ('employee', 'manager', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and active);
$$;

alter table profiles enable row level security;

create policy "profiles_select_own_or_admin" on profiles for select
  using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id);
create policy "profiles_admin_all" on profiles for all
  using (is_admin()) with check (is_admin());

-- ============ SINGLETON SETTINGS TABLES ============
-- Public read (the quote header/letterhead must render before any login); admin-only write.

create table if not exists company_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'Your Company',
  address text not null default '',
  phone text default '',
  email text default '',
  website text default '',
  gst text default '',
  logo_url text,
  seal_name text default '',
  seal_url text,
  updated_at timestamptz not null default now()
);
insert into company_settings (id) values (1) on conflict (id) do nothing;

create table if not exists tax_settings (
  id int primary key default 1 check (id = 1),
  cgst numeric not null default 9,
  sgst numeric not null default 9,
  updated_at timestamptz not null default now()
);
insert into tax_settings (id) values (1) on conflict (id) do nothing;

create table if not exists numbering_settings (
  id int primary key default 1 check (id = 1),
  prefix text not null default 'QT-',
  next_number int not null default 1,
  pad int not null default 6,
  updated_at timestamptz not null default now()
);
insert into numbering_settings (id) values (1) on conflict (id) do nothing;

create table if not exists terms_settings (
  id int primary key default 1 check (id = 1),
  content text not null default 'This quotation is valid for 30 days from the date of issue.',
  updated_at timestamptz not null default now()
);
insert into terms_settings (id) values (1) on conflict (id) do nothing;

create table if not exists template_settings (
  id int primary key default 1 check (id = 1),
  selected text not null default 'emerald' check (selected in ('emerald', 'helvetica', 'classic')),
  updated_at timestamptz not null default now()
);
insert into template_settings (id) values (1) on conflict (id) do nothing;

alter table company_settings enable row level security;
alter table tax_settings enable row level security;
alter table numbering_settings enable row level security;
alter table terms_settings enable row level security;
alter table template_settings enable row level security;

create policy "company_public_read" on company_settings for select using (true);
create policy "company_admin_write" on company_settings for update using (is_admin()) with check (is_admin());

create policy "tax_public_read" on tax_settings for select using (true);
create policy "tax_admin_write" on tax_settings for update using (is_admin()) with check (is_admin());

create policy "numbering_public_read" on numbering_settings for select using (true);
create policy "numbering_admin_write" on numbering_settings for update using (is_admin()) with check (is_admin());

create policy "terms_public_read" on terms_settings for select using (true);
create policy "terms_admin_write" on terms_settings for update using (is_admin()) with check (is_admin());

create policy "template_public_read" on template_settings for select using (true);
create policy "template_admin_write" on template_settings for update using (is_admin()) with check (is_admin());

-- Atomic "give me the next quote number" — used only when an employee actually
-- generates (saves) a quotation, so numbers never duplicate under concurrent use.
create or replace function next_quote_number() returns text
language plpgsql security definer as $$
declare
  n int;
  p text;
  pad int;
  result text;
begin
  update numbering_settings set next_number = next_number + 1, updated_at = now()
    where id = 1
    returning next_number - 1, prefix, numbering_settings.pad into n, p, pad;
  result := p || lpad(n::text, pad, '0');
  return result;
end;
$$;

-- ============ QUOTATIONS ============
create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  date date not null default current_date,
  sales_staff_id uuid references profiles(id),
  sales_staff_name text not null default 'Not Assigned',
  customer_name text not null default '',
  customer_company text default '',
  customer_address text default '',
  customer_phone text default '',
  customer_email text default '',
  items jsonb not null default '[]',
  manual_gst boolean not null default false,
  show_amount boolean not null default true,
  subtotal numeric not null default 0,
  cgst_total numeric not null default 0,
  sgst_total numeric not null default 0,
  grand_total numeric not null default 0,
  status text not null default 'Draft' check (status in ('Draft', 'Sent', 'Accepted')),
  created_at timestamptz not null default now()
);

alter table quotations enable row level security;

create policy "quotations_select_own_or_admin" on quotations for select
  using (sales_staff_id = auth.uid() or is_admin());
create policy "quotations_insert_own" on quotations for insert
  with check (sales_staff_id = auth.uid());
create policy "quotations_update_admin" on quotations for update
  using (is_admin()) with check (is_admin());
create policy "quotations_delete_admin" on quotations for delete
  using (is_admin());

-- ============ STORAGE (logo / seal / avatars) ============
insert into storage.buckets (id, name, public) values ('branding', 'branding', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;

create policy "branding_public_read" on storage.objects for select using (bucket_id = 'branding');
create policy "branding_admin_write" on storage.objects for insert with check (bucket_id = 'branding' and is_admin());
create policy "branding_admin_update" on storage.objects for update using (bucket_id = 'branding' and is_admin());
create policy "branding_admin_delete" on storage.objects for delete using (bucket_id = 'branding' and is_admin());

create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_owner_write" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);
create policy "avatars_owner_update" on storage.objects for update using (bucket_id = 'avatars' and auth.uid() is not null);

-- ============ AUTO-CREATE PROFILE ON SIGN-UP ============
-- Admin-invited employees are created via the service-role API route (api/invite-employee.js),
-- which inserts the profiles row itself. This trigger is a fallback for any user created
-- through Supabase Auth directly (e.g. the first admin you create by hand).
create or replace function handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into profiles (id, name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email,
          coalesce(new.raw_user_meta_data->>'role', 'employee'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
