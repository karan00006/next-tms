import { getCurrentUser } from "@/lib/auth";
import { badRequest, forbidden, ok, unauthorized } from "@/lib/api";
import { pool } from "@/lib/db";
import { deleteUserSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }
  if (!user.isAdmin) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = deleteUserSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { targetUserId } = parsed.data;
  if (targetUserId === user.userId) {
    return badRequest("You cannot delete your own account");
  }

  await pool.execute("DELETE FROM crud_app WHERE user_id = ?", [targetUserId]);
  await pool.execute("DELETE FROM students WHERE id = ?", [targetUserId]);

  return ok({ message: "User deleted" });
}
