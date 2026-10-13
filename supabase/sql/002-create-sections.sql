-- 002 — sections: one row per class section (Ticket 02)
--
-- Run in Supabase -> SQL Editor -> New query -> paste -> Run.

-- 1. The table ------------------------------------------------------

create table if not exists sections (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  -- The teacher who owns this section. Filled in automatically with the
  -- signed-in teacher's id when a section is added.
  teacher_id  uuid        not null default auth.uid()
                          references auth.users(id) on delete cascade,
  name        text        not null check (length(trim(name)) > 0),
  -- The breakdown item headings from the latest CSV, in order.
  columns     text[]      not null default '{}',
  -- When the latest CSV was uploaded. Empty until the first upload.
  uploaded_at timestamptz
);

create index if not exists sections_teacher_id_idx on sections (teacher_id);

-- 2. Row Level Security --------------------------------------------
--
-- Only the teacher who owns a section may read, add, change or delete
-- it. There are no policies for `anon` (signed-out visitors), so
-- students and strangers cannot touch this table at all.

alter table sections enable row level security;

create policy "teachers can read their own sections"
  on sections for select
  to authenticated
  using ((select auth.uid()) = teacher_id);

create policy "teachers can add their own sections"
  on sections for insert
  to authenticated
  with check ((select auth.uid()) = teacher_id);

create policy "teachers can update their own sections"
  on sections for update
  to authenticated
  using ((select auth.uid()) = teacher_id)
  with check ((select auth.uid()) = teacher_id);

create policy "teachers can delete their own sections"
  on sections for delete
  to authenticated
  using ((select auth.uid()) = teacher_id);
