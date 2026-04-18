import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createAuthToken } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-server";
import { type DbUser } from "@/lib/types";
import { loginSchema } from "@/lib/validation";
import { badRequest, serverError, unauthorized } from "@/lib/api";

function loginErrorMessage(code?: string) {
  if (code === "42501") {
    return "Database policy blocked login query. Configure RLS policies or set SUPABASE_SERVICE_ROLE_KEY in Vercel.";
  }
  if (code === "42P01") {
    return "User table not found. Create public.user or public.students in Supabase.";
  }
  return "Internal server error";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid input");
    }

    const { email, password } = parsed.data;
    const supabase = getSupabaseAdminClient();
    const queryByEmail = async (table: "user" | "students") => {
      return supabase.from(table).select("*").eq("email", email).limit(1);
    };

    let { data: users, error } = await queryByEmail("user");
    const initialError = error as { code?: string } | null;
    if (initialError?.code === "42P01") {
      const fallbackResult = await queryByEmail("students");
      users = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      return serverError(loginErrorMessage((error as { code?: string }).code));
    }

    const rawUser = ((users as Array<DbUser & { isAdmin?: number }> | null) || [])[0];
    const user = rawUser
      ? {
          ...rawUser,
          is_admin: Number(rawUser.is_admin ?? rawUser.isAdmin ?? 0),
          password: String(rawUser.password || ""),
        }
      : null;

    if (!user || !user.password) {
      return unauthorized("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return unauthorized("Invalid email or password");
    }

    const token = await createAuthToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      isAdmin: Boolean(user.is_admin),
    });

    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error: unknown) {
    const postgresError = error as { code?: string; message?: string };
    if (postgresError.message?.includes("Supabase environment variables are missing")) {
      return serverError("Supabase env is missing in Vercel. Set URL and key variables.");
    }
    return serverError(loginErrorMessage(postgresError.code));
  }
}
