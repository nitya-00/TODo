-- Run this once in Supabase: SQL Editor > New query > Run.
-- Supabase Auth stores the email and password safely. This table holds each
-- person's app data and is inaccessible to anyone else because of RLS.
create table if not exists public.app_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_states enable row level security;

create policy "Users can read only their own app state"
  on public.app_states for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create only their own app state"
  on public.app_states for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update only their own app state"
  on public.app_states for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
