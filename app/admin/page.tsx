import { TopBar } from "@/components/top-bar";
import { requireAdmin } from "@/lib/guards";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type DbAdminNote } from "@/lib/types";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const user = await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const [{ count: totalNotes }, { count: totalUsers }, { count: totalAdmins }] = await Promise.all([
    supabase.from("tasks").select("ID", { count: "exact", head: true }),
    supabase.from("user").select("id", { count: "exact", head: true }),
    supabase.from("user").select("id", { count: "exact", head: true }).eq("is_admin", 1),
  ]);

  const { data: noteRows } = await supabase
    .from("tasks")
    .select("ID, task, description, status, created_at, user_id, admin_message")
    .order("created_at", { ascending: false });

  const userIds = Array.from(new Set((noteRows || []).map((note) => note.user_id))).filter(
    (id) => Number.isInteger(id) && id > 0,
  );
  const { data: users } = userIds.length > 0 ? await supabase.from("user").select("id, name").in("id", userIds) : { data: [] };
  const nameById = new Map<number, string>();
  (users || []).forEach((row) => nameById.set(row.id, row.name?.trim() || `User ${row.id}`));

  const notes = (noteRows || []).map((note) => ({
    ...note,
    user_name: nameById.get(note.user_id) || `User ${note.user_id}`,
  })) as DbAdminNote[];

  return (
    <>
      <TopBar userName={user.name} isAdmin={user.isAdmin} />
      <AdminClient
        initialStats={{
          total_notes: totalNotes || 0,
          total_users: totalUsers || 0,
          total_admins: totalAdmins || 0,
        }}
        initialNotes={notes}
      />
    </>
  );
}
