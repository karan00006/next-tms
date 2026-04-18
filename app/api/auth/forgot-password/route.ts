import bcrypt from "bcryptjs";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type DbUser } from "@/lib/types";
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
  const supabase = await getSupabaseServerClient();
  const { data: users } = await supabase.from("user").select("*").eq("email", email).limit(1);
  const user = ((users as DbUser[] | null) || [])[0];

  // Keep response generic to prevent account enumeration.
  if (!user) {
    return ok({ message: "If the email exists, an OTP has been sent." });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  await supabase.from("user").update({ otp: hashedOtp, attemtps: 0, expiry }).eq("email", email);

  await sendOtpEmail(email, otp);

  return ok({ message: "If the email exists, an OTP has been sent." });
}
