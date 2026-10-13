-- 003 — students: one row per student per section (Ticket 04)
--
-- Run in Supabase -> SQL Editor -> New query -> paste -> Run.
-- Run 002-create-sections.sql first: this table points at sections.

-- 1. The table ------------------------------------------------------

create table if not exists students (
  id          uuid        primary key default gen_random_uuid(),
  -- Which section this student belongs to. Deleting a section deletes
  -- its students too.
  section_id  uuid        not null
                          references sections(id) on delete cascade,
  id_number   text        not null check (length(trim(id_number)) > 0),
  name        text        not null,
  -- Random code the student types to see their breakdown. Made by the
  -- app from letters and digits that can't be confused (no 0/O, 1/I/L).
  access_code text        not null,
  -- This student's values from the latest CSV, in the same order as
  -- the section's `columns`. scores[1] belongs to columns[1], and so on.
  scores      text[]      not null default '{}',
  updated_at  timestamptz not null default now(),
  -- The same ID number can't appear twice in one section.
  unique (section_id, id_number)
);

-- 2. Row Level Security --------------------------------------------
--
-- Only the teacher who owns the section may read, add, change or
-- delete its students. Each policy checks that the student's section
-- belongs to the signed-in teacher.
--
-- There are no policies for `anon` (signed-out visitors), so students
-- and strangers cannot read this table at all — not even their own
-- row. Students will see their breakdown through a separate lookup
-- (Ticket 05) that checks the ID number AND the access code.

alter table students enable row level security;

create policy "teachers can read students in their sections"
  on students for select
  to authenticated
  using (exists (
    select 1 from sections
    where sections.id = students.section_id
      and sections.teacher_id = (select auth.uid())
  ));

create policy "teachers can add students to their sections"
  on students for insert
  to authenticated
  with check (exists (
    select 1 from sections
    where sections.id = students.section_id
      and sections.teacher_id = (select auth.uid())
  ));

-- `with check` stops a student row being moved into another teacher's
-- section.
create policy "teachers can update students in their sections"
  on students for update
  to authenticated
  using (exists (
    select 1 from sections
    where sections.id = students.section_id
      and sections.teacher_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from sections
    where sections.id = students.section_id
      and sections.teacher_id = (select auth.uid())
  ));

create policy "teachers can delete students in their sections"
  on students for delete
  to authenticated
  using (exists (
    select 1 from sections
    where sections.id = students.section_id
      and sections.teacher_id = (select auth.uid())
  ));
