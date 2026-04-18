"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FormMessage } from "@/components/form-message";

export function ForgotPasswordForm() {
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
    const email = String(formData.get("email") || "").trim().toLowerCase();

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not send OTP");
      setLoading(false);
      return;
    }

    setMessage("If the email exists, OTP has been sent.");
    setTimeout(() => {
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    }, 900);
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <FormMessage message={message} error={error} />
      <label>Email</label>
      <input name="email" type="email" required placeholder="you@example.com" />
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send OTP"}
      </button>
      <div className="auth-links">
        <Link href="/login">Back to login</Link>
      </div>
    </form>
  );
}
