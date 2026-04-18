import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/auth";
import { pool, type DbUser } from "@/lib/db";
import { badRequest } from "@/lib/api";
import { verifyOtpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { email, otp } = parsed.data;
  const [rows] = await pool.query("SELECT * FROM students WHERE email = ? LIMIT 1", [email]);
  const users = rows as DbUser[];
  const user = users[0];

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
    await pool.execute("UPDATE students SET attemtps = attemtps + 1 WHERE email = ?", [email]);
    return badRequest("Invalid OTP");
  }

  await pool.execute("UPDATE students SET attemtps = 0 WHERE email = ?", [email]);

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
