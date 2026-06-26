-- 0003: per-employee privacy. Employees may only see and edit the quotations they
-- created (and the history of those); admins keep full visibility. Enforced in the
-- database via RLS so it holds regardless of the UI.
-- Run this once in the Supabase SQL Editor after 0002.

-- ---- Quotations: own-or-admin for both read and edit ----
drop policy if exists "quotations_select_auth" on quotations;
drop policy if exists "quotations_update_auth" on quotations;
drop policy if exists "quotations_select_own_or_admin" on quotations;
drop policy if exists "quotations_update_own_or_admin" on quotations;

create policy "quotations_select_own_or_admin" on quotations for select
  using (sales_staff_id = auth.uid() or is_admin());

create policy "quotations_update_own_or_admin" on quotations for update
  using (sales_staff_id = auth.uid() or is_admin())
  with check (sales_staff_id = auth.uid() or is_admin());

-- ---- Audit log: an employee sees history only for their own quotations ----
drop policy if exists "audit_select_auth" on quotation_audit;
drop policy if exists "audit_select_own_or_admin" on quotation_audit;

create policy "audit_select_own_or_admin" on quotation_audit for select
  using (
    is_admin()
    or exists (
      select 1 from quotations q
      where q.id = quotation_audit.quotation_id and q.sales_staff_id = auth.uid()
    )
  );
