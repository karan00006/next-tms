import { getCurrentUser } from "@/lib/auth";
import { badRequest, ok, unauthorized } from "@/lib/api";
import { createNoteSchema } from "@/lib/validation";
import { pool, type DbAdminNote, type DbNote } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const targetUserId = Number(searchParams.get("userId"));

  if (user.isAdmin && Number.isInteger(targetUserId) && targetUserId > 0) {
    const [rows] = await pool.query(
      "SELECT c.*, COALESCE(NULLIF(TRIM(s.name), ''), CONCAT('User ', c.user_id)) AS user_name FROM crud_app c LEFT JOIN students s ON s.id = c.user_id WHERE c.user_id = ? ORDER BY c.created_at DESC",
      [targetUserId],
    );
    return ok({ notes: rows as DbAdminNote[] });
  }

  if (user.isAdmin) {
    const [rows] = await pool.query(
      "SELECT c.*, COALESCE(NULLIF(TRIM(s.name), ''), CONCAT('User ', c.user_id)) AS user_name FROM crud_app c LEFT JOIN students s ON s.id = c.user_id ORDER BY c.created_at DESC",
    );
    return ok({ notes: rows as DbAdminNote[] });
  }

  const [rows] = await pool.query("SELECT * FROM crud_app WHERE user_id = ? ORDER BY created_at DESC", [user.userId]);
  return ok({ notes: rows as DbNote[] });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { task, description, status } = parsed.data;
  await pool.execute(
    "INSERT INTO crud_app (task, description, status, user_id) VALUES (?, ?, ?, ?)",
    [task, description, status, user.userId],
  );

  return ok({ message: "Note created" }, 201);
}
