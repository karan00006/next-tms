import { getCurrentUser } from "@/lib/auth";
import { forbidden, ok, unauthorized } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }
  if (!user.isAdmin) {
    return forbidden();
  }

  const supabase = await getSupabaseServerClient();
  const [{ data: users }, { data: tasks }] = await Promise.all([
    supabase.from("user").select("id, name, email, is_admin").order("id", { ascending: false }),
    supabase.from("tasks").select("user_id"),
  ]);

  const notesCountByUser = new Map<number, number>();
  (tasks || []).forEach((task) => {
    notesCountByUser.set(task.user_id, (notesCountByUser.get(task.user_id) || 0) + 1);
  });

  const rows = (users || []).map((row) => ({
    ...row,
    notes_count: notesCountByUser.get(row.id) || 0,
  }));

  return ok({ users: rows });
}
