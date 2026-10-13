import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function MySections() {
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
            <ul className="flex flex-col gap-2">
              {sections.map((section) => (
                <li key={section.id} className="text-sm font-medium">
                  {section.name}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
