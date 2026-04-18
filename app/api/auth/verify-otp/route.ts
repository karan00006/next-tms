import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type DbUser } from "@/lib/types";
import { badRequest } from "@/lib/api";
import { verifyOtpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { email, otp } = parsed.data;
  const supabase = await getSupabaseServerClient();
  const { data: users } = await supabase.from("user").select("*").eq("email", email).limit(1);
  const user = ((users as DbUser[] | null) || [])[0];

  if (!user || !user.otp || !user.expiry) {
    return badRequest("Invalid OTP");
  }

  const attempts = user.attemtps || 0;
  if (attempts >= 5) {
    return badRequest("Too many attempts. Request a new OTP.");
  }

  if (new Date(user.expiry).getTime() < Date.now()) {
    return badRequest("OTP expired. Request a new OTP.");
  }

  const isOtpValid = await bcrypt.compare(otp, user.otp);
  if (!isOtpValid) {
    await supabase.from("user").update({ attemtps: attempts + 1 }).eq("email", email);
    return badRequest("Invalid OTP");
  }

  await supabase.from("user").update({ attemtps: 0 }).eq("email", email);

  const resetToken = await createResetToken({ email });
  const response = NextResponse.json({ message: "OTP verified" });
  response.cookies.set({
    name: "reset_token",
    value: resetToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
