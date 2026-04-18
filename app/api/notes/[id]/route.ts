import { getCurrentUser } from "@/lib/auth";
import { badRequest, forbidden, ok, unauthorized } from "@/lib/api";
import { updateNoteSchema } from "@/lib/validation";
import { pool, type DbNote } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

async function getNote(id: number) {
  const [rows] = await pool.query("SELECT * FROM tasks WHERE ID = ? LIMIT 1", [id]);
  return (rows as DbNote[])[0] || null;
}

export async function GET(_: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const { id } = await params;
  const noteId = Number(id);
  if (!Number.isInteger(noteId) || noteId <= 0) {
    return badRequest("Invalid note id");
  }

  const note = await getNote(noteId);
  if (!note) {
    return badRequest("Note not found");
  }

  if (!user.isAdmin && note.user_id !== user.userId) {
    return forbidden();
  }

  return ok({ note });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const { id } = await params;
  const noteId = Number(id);
  if (!Number.isInteger(noteId) || noteId <= 0) {
    return badRequest("Invalid note id");
  }

  const note = await getNote(noteId);
  if (!note) {
    return badRequest("Note not found");
  }

  if (!user.isAdmin && note.user_id !== user.userId) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { task, description, status } = parsed.data;
  await pool.execute("UPDATE tasks SET task = ?, description = ?, status = ? WHERE ID = ?", [
    task,
    description,
    status,
    noteId,
  ]);

  return ok({ message: "Note updated" });
}

export async function DELETE(_: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const { id } = await params;
  const noteId = Number(id);
  if (!Number.isInteger(noteId) || noteId <= 0) {
    return badRequest("Invalid note id");
  }

  const note = await getNote(noteId);
  if (!note) {
    return badRequest("Note not found");
  }

  if (!user.isAdmin && note.user_id !== user.userId) {
    return forbidden();
  }

  await pool.execute("DELETE FROM tasks WHERE ID = ?", [noteId]);
  return ok({ message: "Note deleted" });
}
