"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FormMessage } from "@/components/form-message";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      adminCode: String(formData.get("adminCode") || ""),
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    setMessage("Account created. Redirecting to login...");
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 900);
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <FormMessage message={message} error={error} />
      <label>Full name</label>
      <input name="name" required placeholder="Your full name" />
      <label>Email</label>
      <input name="email" type="email" required placeholder="you@example.com" />
      <label>Password</label>
      <input name="password" type="password" required placeholder="At least 8 characters" minLength={8} />
      <label>Admin code (optional)</label>
      <input name="adminCode" type="password" placeholder="Required only for admin registration" />
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </button>
      <div className="auth-links">
        <Link href="/login">Already have an account?</Link>
      </div>
    </form>
  );
}
