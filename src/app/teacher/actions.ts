"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/teacher/sign-in?error=1");
  }

  redirect("/teacher");
}

export async function addSection(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/teacher?error=name");

  // teacher_id is filled in by the database with the signed-in
  // teacher's id, and RLS refuses the insert for anyone signed out.
  const supabase = await createClient();
  const { error } = await supabase.from("sections").insert({ name });
  if (error) redirect("/teacher?error=save");

  revalidatePath("/teacher");
  redirect("/teacher");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/teacher/sign-in");
}
