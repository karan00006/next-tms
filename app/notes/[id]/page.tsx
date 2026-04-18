import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { requireUser } from "@/lib/guards";
import { pool, type DbNote } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function NoteDetailPage({ params }: Props) {
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
        <article className="card note-view">
          <h1>{note.task}</h1>
          <div className="status-pill">{note.status}</div>
          <p>{note.description}</p>
          <small>Created at {new Date(note.created_at).toLocaleString()}</small>
          {note.admin_message ? <div className="admin-msg">Admin: {note.admin_message}</div> : null}
          <div className="row-actions">
            <Link href={user.isAdmin ? "/admin" : "/notes"} className="ghost-button">
              Back
            </Link>
            {!user.isAdmin ? (
              <Link href={`/notes/${note.ID}/edit`} className="primary-button">
                Edit
              </Link>
            ) : null}
          </div>
        </article>
      </main>
    </>
  );
}
