"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FormMessage } from "@/components/form-message";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    };

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    router.push("/notes");
    router.refresh();
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <FormMessage error={error} />
      <label>Email</label>
      <input name="email" type="email" required placeholder="you@example.com" />
      <label>Password</label>
      <input name="password" type="password" required placeholder="Enter password" />
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <div className="auth-links">
        <Link href="/register">Create account</Link>
        <Link href="/forgot-password">Forgot password?</Link>
      </div>
    </form>
  );
}
