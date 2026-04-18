import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.isAdmin ? "/admin" : "/notes");
  }

  return (
    <AuthCard title="Create Account" subtitle="Start your upgraded secure notes dashboard.">
      <RegisterForm />
    </AuthCard>
  );
}
