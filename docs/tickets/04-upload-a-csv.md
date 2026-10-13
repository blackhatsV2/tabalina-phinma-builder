# 04 — Upload a CSV

**What to build:** on a section page, Justine uploads a CSV downloaded
from Google Sheets. Every student in it is saved with their scores and
a new access code, and the section page lists them.

**Blocked by:** 03

**Status:** todo

- [x] `students` table created from a numbered SQL file, with RLS on and
      policies so only the teacher who owns the section can read, add,
      change or delete its students
- [ ] Justine can choose a CSV file and upload it
- [ ] The CSV must have `ID Number` and `Name` columns; if either is
      missing, nothing changes and the message says which one
- [ ] Every other column is saved as a breakdown item, in the CSV's order
- [ ] Quoted values with commas (e.g. "Dela Cruz, Juan") are read
      correctly
- [ ] Each student gets a random, easy-to-read access code (no 0/O or
      1/I look-alikes)
- [ ] The section page lists every student: ID number, name, access code
- [ ] "My sections" now shows the student count and last upload date
- [ ] Tested with made-up data only
- [ ] Works on the live URL
