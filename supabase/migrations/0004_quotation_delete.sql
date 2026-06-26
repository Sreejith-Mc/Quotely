-- 0004: allow employees to delete their own quotations; admins can delete any.
-- Run this once in the Supabase SQL Editor after 0003.

drop policy if exists "quotations_delete_admin" on quotations;
drop policy if exists "quotations_delete_own_or_admin" on quotations;

create policy "quotations_delete_own_or_admin" on quotations for delete
  using (sales_staff_id = auth.uid() or is_admin());
