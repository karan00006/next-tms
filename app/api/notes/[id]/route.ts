import { getCurrentUser } from "@/lib/auth";
import { badRequest, forbidden, ok, unauthorized } from "@/lib/api";
import { updateNoteSchema } from "@/lib/validation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type DbNote } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

async function getNote(id: number) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("tasks")
    .select("ID, task, description, status, created_at, user_id, admin_message")
    .eq("ID", id)
    .limit(1);
  return ((data as DbNote[] | null) || [])[0] || null;
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
  const supabase = await getSupabaseServerClient();
  await supabase.from("tasks").update({ task, description, status }).eq("ID", noteId);

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

  const supabase = await getSupabaseServerClient();
  await supabase.from("tasks").delete().eq("ID", noteId);
  return ok({ message: "Note deleted" });
}
