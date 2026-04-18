import { getCurrentUser } from "@/lib/auth";
import { forbidden, ok, unauthorized } from "@/lib/api";
import { pool } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }
  if (!user.isAdmin) {
    return forbidden();
  }

  const [rows] = await pool.query(
    "SELECT s.id, s.name, s.email, s.is_admin, COUNT(c.ID) AS notes_count FROM `user` s LEFT JOIN tasks c ON c.user_id = s.id GROUP BY s.id, s.name, s.email, s.is_admin ORDER BY s.id DESC",
  );

  return ok({ users: rows });
}
