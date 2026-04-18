import { getCurrentUser } from "@/lib/auth";
import { badRequest, forbidden, ok, unauthorized } from "@/lib/api";
import { pool } from "@/lib/db";
import { toggleRoleSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }
  if (!user.isAdmin) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = toggleRoleSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { targetUserId } = parsed.data;
  if (targetUserId === user.userId) {
    return badRequest("You cannot change your own admin role");
  }

  const [rows] = await pool.query("SELECT is_admin FROM students WHERE id = ? LIMIT 1", [targetUserId]);
  const target = (rows as Array<{ is_admin: number }>)[0];
  if (!target) {
    return badRequest("User not found");
  }

  const newRole = target.is_admin ? 0 : 1;
  await pool.execute("UPDATE students SET is_admin = ? WHERE id = ?", [newRole, targetUserId]);

  return ok({ message: newRole ? "User promoted to admin" : "Admin demoted to user" });
}
