import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getResetPayload } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { badRequest, unauthorized } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const resetPayload = await getResetPayload();
  if (!resetPayload?.email) {
    return unauthorized("Reset session expired. Verify OTP again.");
  }

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { password } = parsed.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const supabase = await getSupabaseServerClient();

  await supabase
    .from("user")
    .update({ password: hashedPassword, otp: null, expiry: null, attemtps: 0 })
    .eq("email", resetPayload.email);

  const response = NextResponse.json({ message: "Password updated" });
  response.cookies.set({
    name: "reset_token",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
