-- 0008: allow removing an employee without losing their quotations/history.
-- When a profile is deleted, null out the references (the staff/actor NAMES are stored
-- denormalised on each row, so they still display). Run after 0007.

alter table quotations drop constraint if exists quotations_sales_staff_id_fkey;
alter table quotations add constraint quotations_sales_staff_id_fkey
  foreign key (sales_staff_id) references profiles(id) on delete set null;

alter table quotation_audit drop constraint if exists quotation_audit_actor_id_fkey;
alter table quotation_audit add constraint quotation_audit_actor_id_fkey
  foreign key (actor_id) references profiles(id) on delete set null;
