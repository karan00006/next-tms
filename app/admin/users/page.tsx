import { TopBar } from "@/components/top-bar";
import { requireAdmin } from "@/lib/guards";
import { pool } from "@/lib/db";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const [rows] = await pool.query(
    "SELECT s.id, s.name, s.email, s.is_admin, COUNT(c.ID) AS notes_count FROM `user` s LEFT JOIN tasks c ON c.user_id = s.id GROUP BY s.id, s.name, s.email, s.is_admin ORDER BY s.id DESC",
  );

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
