-- 0006: remember the "Show warranty" toggle per quotation (used when re-opening to edit).
-- Per-item warranty text is stored inside the existing items JSON, so no column needed for it.
-- Run this once in the Supabase SQL Editor after 0005.

alter table quotations add column if not exists show_warranty boolean not null default false;
