import { TopBar } from "@/components/top-bar";
import { requireUser } from "@/lib/guards";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type DbNote } from "@/lib/types";
import { NotesClient } from "./notes-client";

export default async function NotesPage() {
  const user = await requireUser();
  const supabase = await getSupabaseServerClient();

  const { data: rows } = await supabase
    .from("tasks")
    .select("ID, task, description, status, created_at, user_id, admin_message")
    .eq("user_id", user.userId)
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar userName={user.name} isAdmin={user.isAdmin} />
      <NotesClient initialNotes={(rows || []) as DbNote[]} />
    </>
  );
}
