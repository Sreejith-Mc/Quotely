-- 0005: remember the "Show rate" toggle per quotation (used when re-opening to edit).
-- Run this once in the Supabase SQL Editor after 0004.

alter table quotations add column if not exists show_rate boolean not null default true;
