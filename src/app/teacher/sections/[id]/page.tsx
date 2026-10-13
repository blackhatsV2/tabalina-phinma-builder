import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { uploadCsv } from "./actions";

// The upload sends back a short code; the full message lives here.
const errorMessages: Record<string, string> = {
  "no-file": "Choose a CSV file first.",
  empty: "That file has no students in it.",
  "missing-both":
    'The CSV has no "ID Number" column and no "Name" column. Nothing was changed.',
  "missing-id": 'The CSV has no "ID Number" column. Nothing was changed.',
  "missing-name": 'The CSV has no "Name" column. Nothing was changed.',
  "blank-id": "A row in the CSV has no ID Number. Nothing was changed.",
  "duplicate-id":
    "The same ID Number appears twice in the CSV. Nothing was changed.",
  save: "Could not save the upload. Please try again.",
};

export default async function SectionPage({
  params,
  searchParams,
}: PageProps<"/teacher/sections/[id]">) {
  const { id } = await params;
  const { error: uploadError, uploaded } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/teacher/sign-in");

  // RLS returns nothing if this section belongs to another teacher, so
  // they get the same "not found" page as a section that doesn't exist.
  const { data: section } = await supabase
    .from("sections")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();
  if (!section) notFound();

  const { data: students } = await supabase
    .from("students")
    .select("id, id_number, name, access_code")
    .eq("section_id", id)
    .order("name");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <Link
        href="/teacher"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← My sections
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{section.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload this week&apos;s CSV</CardTitle>
        </CardHeader>
        <CardContent>
          {/* bind() fills in the section id, so the form only sends the file. */}
          <form
            action={uploadCsv.bind(null, section.id)}
            className="flex flex-col gap-2"
          >
            <Label htmlFor="file">
              In Google Sheets: File → Download → Comma-separated values (.csv)
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="file"
                name="file"
                type="file"
                accept=".csv,text/csv"
                required
              />
              <Button type="submit">Upload</Button>
            </div>
            {typeof uploadError === "string" && errorMessages[uploadError] && (
              <p className="text-sm text-destructive">
                {errorMessages[uploadError]}
              </p>
            )}
            {typeof uploaded === "string" && (
              <p className="text-sm text-muted-foreground">
                Uploaded {uploaded} students.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          {!students || students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students yet. Upload a CSV to add them.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 font-medium">ID number</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 font-medium">Access code</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-border">
                      <td className="py-2 pr-4">{student.id_number}</td>
                      <td className="py-2 pr-4">{student.name}</td>
                      <td className="py-2 font-mono tracking-wider">
                        {student.access_code}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
