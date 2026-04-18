"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { FormMessage } from "@/components/form-message";

export function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);

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
    const otp = String(formData.get("otp") || "").trim();

    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "OTP verification failed");
      setLoading(false);
      return;
    }

    setMessage("OTP verified. Redirecting...");
    setTimeout(() => {
      router.push("/new-password");
      router.refresh();
    }, 700);
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <FormMessage message={message} error={error} />
      <label>Email</label>
      <input name="email" type="email" defaultValue={initialEmail} required placeholder="you@example.com" />
      <label>OTP code</label>
      <input name="otp" type="text" required placeholder="6-digit code" pattern="[0-9]{4,6}" />
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </form>
  );
}
