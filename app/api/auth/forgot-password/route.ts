import bcrypt from "bcryptjs";
import { pool, type DbUser } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";
import { badRequest, ok } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { email } = parsed.data;
  const [rows] = await pool.query("SELECT * FROM students WHERE email = ? LIMIT 1", [email]);
  const users = rows as DbUser[];
  const user = users[0];

  // Keep response generic to prevent account enumeration.
  if (!user) {
    return ok({ message: "If the email exists, an OTP has been sent." });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  await pool.execute(
    "UPDATE students SET otp = ?, attemtps = 0, expiry = ? WHERE email = ?",
    [hashedOtp, expiry, email],
  );

  await sendOtpEmail(email, otp);

  return ok({ message: "If the email exists, an OTP has been sent." });
}
