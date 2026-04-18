import { AuthCard } from "@/components/auth-card";
import { NewPasswordForm } from "./new-password-form";

export default function NewPasswordPage() {
  return (
    <AuthCard title="New Password" subtitle="Set a fresh secure password for your account.">
      <NewPasswordForm />
    </AuthCard>
  );
}
