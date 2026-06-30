-- 0011: round-off. A flat +/- adjustment to a quotation's grand total (e.g. +2 turns
-- 998 → 1000). show_round_off decides whether the round-off line appears on the quote;
-- round_off is always applied to the total when non-zero.
-- Run this once in the Supabase SQL Editor after 0010.

alter table quotations add column if not exists round_off numeric not null default 0;
alter table quotations add column if not exists show_round_off boolean not null default false;
