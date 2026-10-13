import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { addSection, signOut } from "./actions";

const errorMessages: Record<string, string> = {
  name: "Type a section name first.",
  save: "Could not add the section. Please try again.",
};

export default async function MySections({
  searchParams,
}: PageProps<"/teacher">) {
  const { error: formError } = await searchParams;
  const supabase = await createClient();

  // Signed-out visitors are sent to the sign-in page.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/teacher/sign-in");

  // No filter by teacher needed here: Row Level Security only returns
  // the sections this teacher owns.
  const { data: sections, error } = await supabase
    .from("sections")
    .select("id, name, uploaded_at")
    .order("name");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">My sections</h1>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add a section</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addSection} className="flex flex-col gap-2">
            <Label htmlFor="name">Section name</Label>
            <div className="flex gap-2">
              <Input id="name" name="name" placeholder="e.g. BSIT 2-A" required />
              <Button type="submit">Add</Button>
            </div>
            {typeof formError === "string" && errorMessages[formError] && (
              <p className="text-sm text-destructive">
                {errorMessages[formError]}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">
              Could not load sections: {error.message}
            </p>
          ) : sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sections yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link
                    href={`/teacher/sections/${section.id}`}
                    className="flex items-center justify-between gap-4 py-3 hover:underline"
                  >
                    <span className="font-medium">{section.name}</span>
                    <span className="text-right text-sm text-muted-foreground">
                      0 students ·{" "}
                      {section.uploaded_at
                        ? `Uploaded ${formatDate(section.uploaded_at)}`
                        : "Not uploaded yet"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

// Vercel's servers run on UTC, so the time zone is set to the
// Philippines explicitly.
function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
  });
}
