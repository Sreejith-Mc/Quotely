-- 0007: separate accent colour from the font template.
-- The font lives in template_settings.selected; the colour is now its own column.
-- Run this once in the Supabase SQL Editor after 0006.

alter table template_settings add column if not exists accent text not null default '#22673a';
