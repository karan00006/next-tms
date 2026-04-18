import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.isAdmin ? "/admin" : "/notes");
  }

  return (
    <AuthCard title="Welcome Back" subtitle="Secure sign-in to your notes workspace.">
      <LoginForm />
    </AuthCard>
  );
}
