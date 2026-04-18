import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createAuthToken } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type DbUser } from "@/lib/types";
import { loginSchema } from "@/lib/validation";
import { badRequest, unauthorized } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { email, password } = parsed.data;
  const supabase = await getSupabaseServerClient();
  const { data: users } = await supabase.from("user").select("*").eq("email", email).limit(1);
  const user = ((users as DbUser[] | null) || [])[0];

  if (!user) {
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
}
