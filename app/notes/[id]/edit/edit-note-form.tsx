"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FormMessage } from "@/components/form-message";

type EditNoteFormProps = {
  id: number;
  task: string;
  description: string;
  status: string;
};

export function EditNoteForm({ id, task, description, status }: EditNoteFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      task: String(formData.get("task") || ""),
      description: String(formData.get("description") || ""),
      status: String(formData.get("status") || ""),
    };

    const response = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Update failed");
      setLoading(false);
      return;
    }

    router.push(`/notes/${id}`);
    router.refresh();
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h1>Edit Note</h1>
      <FormMessage error={error} />
      <label>Task</label>
      <input name="task" defaultValue={task} required maxLength={120} />
      <label>Description</label>
      <textarea name="description" defaultValue={description} required rows={6} maxLength={2000} />
      <label>Status</label>
      <input name="status" defaultValue={status} required maxLength={50} />
      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
