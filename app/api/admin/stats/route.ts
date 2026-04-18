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
    "SELECT (SELECT COUNT(*) FROM tasks) AS total_notes, (SELECT COUNT(*) FROM `user`) AS total_users, (SELECT COUNT(*) FROM `user` WHERE is_admin = 1) AS total_admins",
  );

  return ok({ stats: (rows as Array<Record<string, number>>)[0] });
}
