import { TopBar } from "@/components/top-bar";
import { requireAdmin } from "@/lib/guards";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const [{ data: users }, { data: tasks }] = await Promise.all([
    supabase.from("user").select("id, name, email, is_admin").order("id", { ascending: false }),
    supabase.from("tasks").select("user_id"),
  ]);

  const notesCountByUser = new Map<number, number>();
  (tasks || []).forEach((task) => {
    notesCountByUser.set(task.user_id, (notesCountByUser.get(task.user_id) || 0) + 1);
  });

  const rows = (users || []).map((row) => ({ ...row, notes_count: notesCountByUser.get(row.id) || 0 }));

  return (
    <>
      <TopBar userName={admin.name} isAdmin={admin.isAdmin} />
      <UsersClient
        users={rows as Array<{ id: number; name: string; email: string; is_admin: number; notes_count: number }>}
        currentUserId={admin.userId}
      />
    </>
  );
}
