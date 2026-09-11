-- CMS Headset Update — Supabase schema
-- Run this once in the Supabase SQL editor for your project.

create extension if not exists pgcrypto;

create table if not exists visit_status (
  id uuid primary key default gen_random_uuid(),
  stop_id text not null unique,
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'done', 'flagged')),
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists campus_notes (
  id uuid primary key default gen_random_uuid(),
  stop_id text not null,
  author text,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists campus_notes_stop_id_idx on campus_notes (stop_id);

alter table visit_status enable row level security;
alter table campus_notes enable row level security;

-- This is an internal, short-lived event tool with no login system — every
-- team member connects with the same public "anon" key, so these policies
-- intentionally allow anyone with that key to read/write. Do not reuse this
-- schema for anything holding sensitive data.
create policy "anon can read visit_status" on visit_status for select using (true);
create policy "anon can insert visit_status" on visit_status for insert with check (true);
create policy "anon can update visit_status" on visit_status for update using (true);

create policy "anon can read campus_notes" on campus_notes for select using (true);
create policy "anon can insert campus_notes" on campus_notes for insert with check (true);

-- Enable realtime so status/notes updates appear on everyone's screen
-- without a manual refresh.
alter publication supabase_realtime add table visit_status;
alter publication supabase_realtime add table campus_notes;
