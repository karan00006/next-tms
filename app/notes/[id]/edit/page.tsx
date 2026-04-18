import { notFound } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { requireUser } from "@/lib/guards";
import { pool, type DbNote } from "@/lib/db";
import { EditNoteForm } from "./edit-note-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditNotePage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;
  const noteId = Number(id);

  if (!Number.isInteger(noteId) || noteId <= 0) {
    notFound();
  }

  const [rows] = await pool.query("SELECT * FROM crud_app WHERE ID = ? LIMIT 1", [noteId]);
  const note = (rows as DbNote[])[0];
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
