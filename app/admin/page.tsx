import { TopBar } from "@/components/top-bar";
import { requireAdmin } from "@/lib/guards";
import { pool, type DbAdminNote } from "@/lib/db";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const user = await requireAdmin();

  const [statsRows] = await pool.query(
    "SELECT (SELECT COUNT(*) FROM tasks) AS total_notes, (SELECT COUNT(*) FROM `user`) AS total_users, (SELECT COUNT(*) FROM `user` WHERE is_admin = 1) AS total_admins",
  );
  const typedStatsRows = statsRows as Array<{ total_notes: number; total_users: number; total_admins: number }>;

  const [noteRows] = await pool.query(
    "SELECT c.*, COALESCE(NULLIF(TRIM(s.name), ''), CONCAT('User ', c.user_id)) AS user_name FROM tasks c LEFT JOIN `user` s ON s.id = c.user_id ORDER BY c.created_at DESC",
  );

  return (
    <>
      <TopBar userName={user.name} isAdmin={user.isAdmin} />
      <AdminClient initialStats={typedStatsRows[0]} initialNotes={noteRows as DbAdminNote[]} />
    </>
  );
}
