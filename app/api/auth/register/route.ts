import bcrypt from "bcryptjs";
import { getSupabaseServerClient } from "@/lib/supabase-server";
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
    const supabase = await getSupabaseServerClient();

    const { error } = await supabase.from("user").insert({
      name,
      email,
      password: hashedPassword,
      is_admin: isAdmin,
    });

    if (error) {
      const postgresError = error as { code?: string };
      if (postgresError.code === "23505") {
        return badRequest("This email is already registered");
      }
      return serverError();
    }

    return ok({ message: "Account created successfully" }, 201);
  } catch (error: unknown) {
    const postgresError = error as { code?: string };
    if (postgresError.code === "23505") {
      return badRequest("This email is already registered");
    }
    return serverError();
  }
}
