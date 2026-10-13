# 02 — Connected to Supabase: teacher sign-in

**What to build:** Justine signs in with email and password on the live
site and lands on an empty "My sections" page. The `sections` table
exists with Row Level Security on, so only the owning teacher can read,
add, change or delete their sections.

**Blocked by:** 01

**Status:** todo

- [ ] Supabase URL and publishable key are set locally AND in Vercel
- [x] `sections` table created from a numbered SQL file, with RLS on and
      owner-only policies
- [ ] Justine's account is created in the Supabase dashboard, and public
      sign-up is switched off
- [ ] Teacher sign-in page: correct email and password open "My
      sections"; a wrong password is refused
- [ ] "My sections" reads from the `sections` table and shows "No
      sections yet" when empty
- [ ] Signed-out visitors cannot open "My sections"
- [ ] Justine can sign out
- [ ] Works on the live URL
