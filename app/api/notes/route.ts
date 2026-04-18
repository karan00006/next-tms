import { getCurrentUser } from "@/lib/auth";
import { badRequest, ok, unauthorized } from "@/lib/api";
import { createNoteSchema } from "@/lib/validation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type DbAdminNote, type DbNote } from "@/lib/types";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const supabase = await getSupabaseServerClient();

  const { searchParams } = new URL(request.url);
  const targetUserId = Number(searchParams.get("userId"));

  if (user.isAdmin && Number.isInteger(targetUserId) && targetUserId > 0) {
    const { data: noteRows } = await supabase
      .from("tasks")
      .select("ID, task, description, status, created_at, user_id, admin_message")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    const { data: userRows } = await supabase.from("user").select("id, name").eq("id", targetUserId).limit(1);
    const userName = userRows?.[0]?.name?.trim() || `User ${targetUserId}`;
    const notes = (noteRows || []).map((note) => ({ ...note, user_name: userName })) as DbAdminNote[];
    return ok({ notes });
  }

  if (user.isAdmin) {
    const { data: noteRows } = await supabase
      .from("tasks")
      .select("ID, task, description, status, created_at, user_id, admin_message")
      .order("created_at", { ascending: false });

    const userIds = Array.from(new Set((noteRows || []).map((note) => note.user_id))).filter(
      (id) => Number.isInteger(id) && id > 0,
    );

    const nameById = new Map<number, string>();
    if (userIds.length > 0) {
      const { data: userRows } = await supabase.from("user").select("id, name").in("id", userIds);
      (userRows || []).forEach((row) => nameById.set(row.id, row.name?.trim() || `User ${row.id}`));
    }

    const notes = (noteRows || []).map((note) => ({
      ...note,
      user_name: nameById.get(note.user_id) || `User ${note.user_id}`,
    })) as DbAdminNote[];

    return ok({ notes });
  }

  const { data: rows } = await supabase
    .from("tasks")
    .select("ID, task, description, status, created_at, user_id, admin_message")
    .eq("user_id", user.userId)
    .order("created_at", { ascending: false });

  return ok({ notes: (rows || []) as DbNote[] });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const supabase = await getSupabaseServerClient();

  const body = await request.json();
  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { task, description, status } = parsed.data;
  await supabase.from("tasks").insert({ task, description, status, user_id: user.userId });

  return ok({ message: "Note created" }, 201);
}
