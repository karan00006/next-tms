"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FormMessage } from "@/components/form-message";

type Note = {
  ID: number;
  task: string;
  description: string;
  status: string;
  created_at: string;
  admin_message: string | null;
};

type NotesClientProps = {
  initialNotes: Note[];
  readonlyMode?: boolean;
};

export function NotesClient({ initialNotes, readonlyMode = false }: NotesClientProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refreshNotes() {
    const response = await fetch("/api/notes", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      setNotes(data.notes || []);
    }
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = event.currentTarget;

    const formData = new FormData(form);
    const payload = {
      task: String(formData.get("task") || ""),
      description: String(formData.get("description") || ""),
      status: String(formData.get("status") || ""),
    };

    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to create note");
      return;
    }

    form.reset();
    setMessage("Note saved");
    await refreshNotes();
  }

  async function deleteNote(id: number) {
    const confirmed = window.confirm("Delete this note?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to delete");
      return;
    }

    setMessage("Note deleted");
    setNotes((prev) => prev.filter((note) => note.ID !== id));
  }

  const statusChoices = ["Pending", "In Progress", "Completed", "Blocked"];

  return (
    <div className="page-shell">
      {!readonlyMode ? (
        <form onSubmit={onCreate} className="card note-form-grid">
          <div className="section-head">
            <h2>Create Note</h2>
            <p>Capture tasks with clear status and details.</p>
          </div>
          <FormMessage error={error} message={message} />
          <div className="note-field task-field">
            <label htmlFor="task">Task</label>
            <input id="task" name="task" placeholder="Task title" required maxLength={120} />
          </div>
          <div className="note-field status-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="Pending" required>
              {statusChoices.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="note-field description-field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" placeholder="Describe the task" rows={3} required maxLength={2000} />
          </div>
          <button type="submit" className="primary-button save-note-btn">
            Save Note
          </button>
        </form>
      ) : null}

      <section className="card">
        <h2>{readonlyMode ? "User Notes" : "Your Notes"}</h2>
        <div className="notes-grid">
          {notes.map((note) => (
            <article key={note.ID} className="note-card">
              <div className="note-head">
                <h3>{note.task}</h3>
                <span className="status-pill" data-status={note.status.trim().toLowerCase()}>
                  {note.status}
                </span>
              </div>
              <p>{note.description}</p>
              <div className="note-meta">
                <small>{new Date(note.created_at).toLocaleString()}</small>
              </div>
              {note.admin_message ? <div className="admin-msg">Admin: {note.admin_message}</div> : null}
              <div className="row-actions">
                <Link href={`/notes/${note.ID}`} className="ghost-button">
                  View
                </Link>
                {!readonlyMode ? (
                  <Link href={`/notes/${note.ID}/edit`} className="ghost-button">
                    Edit
                  </Link>
                ) : null}
                <button className="danger-button" type="button" onClick={() => deleteNote(note.ID)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {notes.length === 0 ? <p>No notes found.</p> : null}
        </div>
      </section>
    </div>
  );
}
