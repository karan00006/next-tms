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

    const payload = {
      name,
      email,
      password: hashedPassword,
      is_admin: isAdmin,
    };

    let { error } = await supabase.from("user").insert(payload);
    const tableError = error as { code?: string } | null;
    if (tableError?.code === "42P01") {
      const fallbackPayload = {
        ...payload,
        isAdmin,
      };
      const fallbackResult = await supabase.from("students").insert(fallbackPayload);
      error = fallbackResult.error;
    }

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
