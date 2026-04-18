import { AuthCard } from "@/components/auth-card";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset Password" subtitle="Get a one-time code and reset securely.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
