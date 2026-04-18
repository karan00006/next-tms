import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { badRequest, ok, serverError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid input");
    }

    const { name, email, password, adminCode } = parsed.data;
    const configuredAdminCode = process.env.ADMIN_REGISTRATION_CODE || "";
    const isAdmin = configuredAdminCode && adminCode === configuredAdminCode ? 1 : 0;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO `user` (name, email, password, is_admin) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, isAdmin],
    );

    return ok({ message: "Account created successfully" }, 201);
  } catch (error: unknown) {
    const mysqlError = error as { code?: string };
    if (mysqlError.code === "ER_DUP_ENTRY") {
      return badRequest("This email is already registered");
    }
    return serverError();
  }
}
