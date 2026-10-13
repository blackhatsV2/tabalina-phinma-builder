"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { newAccessCode } from "@/lib/access-code";
import { parseCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";

export async function uploadCsv(sectionId: string, formData: FormData) {
  const page = `/teacher/sections/${sectionId}`;
  const fail: (error: string) => never = (error) =>
    redirect(`${page}?error=${error}`);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) fail("no-file");

  // 1. Read and check the whole file BEFORE changing anything, so a bad
  //    file leaves the section exactly as it was.
  const rows = parseCsv(await file.text());
  if (rows.length < 2) fail("empty");

  const headings = rows[0].map((heading) => heading.trim());
  const idColumn = headings.findIndex((h) => h.toLowerCase() === "id number");
  const nameColumn = headings.findIndex((h) => h.toLowerCase() === "name");
  if (idColumn === -1 && nameColumn === -1) fail("missing-both");
  if (idColumn === -1) fail("missing-id");
  if (nameColumn === -1) fail("missing-name");

  // Every other column is a breakdown item, kept in the CSV's order.
  const itemColumns = headings
    .map((_, index) => index)
    .filter((index) => index !== idColumn && index !== nameColumn);
  const columns = itemColumns.map((index) => headings[index]);

  const students = rows.slice(1).map((row) => ({
    id_number: (row[idColumn] ?? "").trim(),
    name: (row[nameColumn] ?? "").trim(),
    scores: itemColumns.map((index) => (row[index] ?? "").trim()),
  }));
  if (students.some((student) => !student.id_number)) fail("blank-id");
  const idNumbers = new Set(students.map((student) => student.id_number));
  if (idNumbers.size !== students.length) fail("duplicate-id");

  // 2. Save. RLS makes every query below fail for anyone who isn't the
  //    teacher who owns this section.
  const supabase = await createClient();

  const { data: existing, error: readError } = await supabase
    .from("students")
    .select("id, id_number, access_code")
    .eq("section_id", sectionId);
  if (readError) fail("save");

  // Students already in the section keep their access code; new ID
  // numbers get a new one.
  const codes = new Map(
    existing.map((student) => [student.id_number, student.access_code]),
  );
  const now = new Date().toISOString();
  const { error: saveError } = await supabase.from("students").upsert(
    students.map((student) => ({
      ...student,
      section_id: sectionId,
      access_code: codes.get(student.id_number) ?? newAccessCode(),
      updated_at: now,
    })),
    { onConflict: "section_id,id_number" },
  );
  if (saveError) fail("save");

  // Students missing from the new CSV are removed.
  const removed = existing
    .filter((student) => !idNumbers.has(student.id_number))
    .map((student) => student.id);
  if (removed.length > 0) {
    const { error } = await supabase.from("students").delete().in("id", removed);
    if (error) fail("save");
  }

  const { error: sectionError } = await supabase
    .from("sections")
    .update({ columns, uploaded_at: now })
    .eq("id", sectionId);
  if (sectionError) fail("save");

  revalidatePath("/teacher");
  revalidatePath(page);
  redirect(`${page}?uploaded=${students.length}`);
}
