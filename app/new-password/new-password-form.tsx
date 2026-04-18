"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FormMessage } from "@/components/form-message";

export function NewPasswordForm() {
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
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const response = await fetch("/api/auth/new-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not update password");
      setLoading(false);
      return;
    }

    setMessage("Password updated. Redirecting to login...");
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 800);
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <FormMessage message={message} error={error} />
      <label>New password</label>
      <input name="password" type="password" minLength={8} required />
      <label>Confirm password</label>
      <input name="confirmPassword" type="password" minLength={8} required />
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
