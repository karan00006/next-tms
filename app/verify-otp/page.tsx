import { Suspense } from "react";
import { AuthCard } from "@/components/auth-card";
import { VerifyOtpForm } from "./verify-otp-form";

export default function VerifyOtpPage() {
  return (
    <AuthCard title="Verify OTP" subtitle="Confirm the code sent to your email.">
      <Suspense fallback={<p>Loading...</p>}>
        <VerifyOtpForm />
      </Suspense>
    </AuthCard>
  );
}
