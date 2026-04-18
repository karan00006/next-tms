import { notFound } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { requireUser } from "@/lib/guards";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type DbNote } from "@/lib/types";
import { EditNoteForm } from "./edit-note-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditNotePage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;
  const noteId = Number(id);

  if (!Number.isInteger(noteId) || noteId <= 0) {
    notFound();
  }

  const supabase = await getSupabaseServerClient();
  const { data: rows } = await supabase
    .from("tasks")
    .select("ID, task, description, status, created_at, user_id, admin_message")
    .eq("ID", noteId)
    .limit(1);
  const note = ((rows as DbNote[] | null) || [])[0];
  if (!note) {
    notFound();
  }

  if (!user.isAdmin && note.user_id !== user.userId) {
    notFound();
  }

  return (
    <>
      <TopBar userName={user.name} isAdmin={user.isAdmin} />
      <main className="page-shell">
        <EditNoteForm id={note.ID} task={note.task} description={note.description} status={note.status} />
      </main>
    </>
  );
}
