-- 0012: let a staff member opt to show their phone number (next to their name) on the
-- quotations they create. The choice is stored per-quotation at creation time so old
-- quotes keep showing whatever was chosen then.
-- Run this once in the Supabase SQL Editor after 0011.

alter table profiles add column if not exists show_phone_on_quote boolean not null default false;
alter table quotations add column if not exists sales_staff_phone text;
