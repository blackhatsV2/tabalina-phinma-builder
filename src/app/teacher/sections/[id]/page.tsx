import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SectionPage({
  params,
}: PageProps<"/teacher/sections/[id]">) {
  const { id } = await params;
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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <Link
        href="/teacher"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← My sections
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{section.name}</h1>
    </main>
  );
}
