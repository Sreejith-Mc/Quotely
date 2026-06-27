-- 0002: collaborative dashboard — audit log, shared quotation visibility/editing,
-- and a stats function so any signed-in user can read company-wide totals.
-- Run this once in the Supabase SQL Editor after 0001.

-- ============ AUDIT LOG ============
create table if not exists quotation_audit (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid references quotations(id) on delete cascade,
  quotation_number text not null default '',
  actor_id uuid references profiles(id),
  actor_name text not null default 'Someone',
  action text not null default '',
  created_at timestamptz not null default now()
);

alter table quotation_audit enable row level security;

drop policy if exists "audit_select_auth" on quotation_audit;
create policy "audit_select_auth" on quotation_audit for select using (auth.uid() is not null);

-- ============ SHARED VISIBILITY & EDITING ============
-- The dashboard is collaborative: any signed-in user can see and edit recent
-- quotations, and every edit is attributed in the audit log above.
drop policy if exists "quotations_select_own_or_admin" on quotations;
drop policy if exists "quotations_update_admin" on quotations;

drop policy if exists "quotations_select_auth" on quotations;
create policy "quotations_select_auth" on quotations for select using (auth.uid() is not null);

drop policy if exists "quotations_update_auth" on quotations;
create policy "quotations_update_auth" on quotations for update
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- ============ AUDIT TRIGGER ============
create or replace function log_quotation_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  who text;
  msg text;
begin
  select name into who from profiles where id = auth.uid();
  who := coalesce(nullif(who, ''), 'Someone');
  if new.status is distinct from old.status then
    msg := 'set status to ' || new.status;
  elsif new.customer_name is distinct from old.customer_name then
    msg := 'renamed customer to ' || new.customer_name;
  elsif new.grand_total is distinct from old.grand_total then
    msg := 'updated total to ' || round(new.grand_total)::text;
  else
    msg := 'edited the quotation';
  end if;
  insert into quotation_audit (quotation_id, quotation_number, actor_id, actor_name, action)
  values (new.id, new.number, auth.uid(), who, msg);
  return new;
end;
$$;

drop trigger if exists on_quotation_updated on quotations;
create trigger on_quotation_updated
  after update on quotations
  for each row execute function log_quotation_change();

-- ============ COMPANY-WIDE DASHBOARD STATS ============
-- security definer so employees can read the aggregate numbers without needing
-- a broad SELECT grant on the profiles table.
create or replace function dashboard_stats() returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'monthCount', (select count(*) from quotations where created_at >= date_trunc('month', now())),
    'monthValue', (select coalesce(sum(grand_total), 0) from quotations where created_at >= date_trunc('month', now())),
    'activeEmployees', (select count(*) from profiles where active),
    'totalEmployees', (select count(*) from profiles)
  );
$$;
