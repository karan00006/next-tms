"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { FormMessage } from "@/components/form-message";

type Note = {
  ID: number;
  task: string;
  description: string;
  status: string;
  created_at: string;
  admin_message: string | null;
  user_id: number;
  user_name?: string | null;
};

type Stats = {
  total_notes: number;
  total_users: number;
  total_admins: number;
};

type AdminClientProps = {
  initialNotes: Note[];
  initialStats: Stats;
};

export function AdminClient({ initialNotes, initialStats }: AdminClientProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [stats, setStats] = useState(initialStats);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [commentFilter, setCommentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const statusOptions = useMemo(
    () => Array.from(new Set(notes.map((note) => note.status).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [notes],
  );

  const filteredNotes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const parsedUserId = Number(userIdFilter);
    const shouldFilterByUser = userIdFilter.trim() !== "" && Number.isInteger(parsedUserId) && parsedUserId > 0;

    const filtered = notes.filter((note) => {
      const matchesSearch =
        query === "" ||
        note.task.toLowerCase().includes(query) ||
        note.description.toLowerCase().includes(query) ||
        (note.admin_message || "").toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || note.status === statusFilter;
      const matchesUser = !shouldFilterByUser || note.user_id === parsedUserId;
      const hasComment = Boolean(note.admin_message && note.admin_message.trim() !== "");
      const matchesComment =
        commentFilter === "all" || (commentFilter === "with-comment" ? hasComment : !hasComment);

      return matchesSearch && matchesStatus && matchesUser && matchesComment;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "user-asc":
          return a.user_id - b.user_id;
        case "user-desc":
          return b.user_id - a.user_id;
        case "status":
          return a.status.localeCompare(b.status);
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [notes, searchTerm, statusFilter, userIdFilter, commentFilter, sortBy]);

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setUserIdFilter("");
    setCommentFilter("all");
    setSortBy("newest");
  }

  async function refreshData() {
    const [statsRes, notesRes] = await Promise.all([
      fetch("/api/admin/stats", { cache: "no-store" }),
      fetch("/api/notes", { cache: "no-store" }),
    ]);

    const statsData = await statsRes.json();
    const notesData = await notesRes.json();

    if (statsRes.ok) {
      setStats(statsData.stats);
    }
    if (notesRes.ok) {
      setNotes(notesData.notes || []);
    }
  }

  async function deleteNote(id: number) {
    const confirmed = window.confirm("Delete this note?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Delete failed");
      return;
    }

    setMessage("Note deleted");
    await refreshData();
  }

  async function addComment(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const message = String(formData.get("message") || "").trim();

    const response = await fetch("/api/admin/note-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, message }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Comment failed");
      return;
    }

    setMessage("Comment saved");
    await refreshData();
  }

  return (
    <main className="page-shell">
      <section className="stats-grid">
        <article className="card stat-card">
          <h4>Total Notes</h4>
          <p>{stats.total_notes}</p>
        </article>
        <article className="card stat-card">
          <h4>Total Users</h4>
          <p>{stats.total_users}</p>
        </article>
        <article className="card stat-card">
          <h4>Admin Accounts</h4>
          <p>{stats.total_admins}</p>
        </article>
      </section>

      <section className="card">
        <div className="row-actions">
          <h2>All Notes</h2>
          <Link href="/admin/users" className="primary-button">
            Manage Users
          </Link>
        </div>
        <div className="admin-filters">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search task, description, or comment"
            aria-label="Search notes"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            value={userIdFilter}
            onChange={(event) => setUserIdFilter(event.target.value)}
            placeholder="User ID"
            inputMode="numeric"
            aria-label="Filter by user id"
          />
          <select
            value={commentFilter}
            onChange={(event) => setCommentFilter(event.target.value)}
            aria-label="Filter by comment"
          >
            <option value="all">All comments</option>
            <option value="with-comment">With comment</option>
            <option value="without-comment">Without comment</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort by">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="user-asc">User ID ascending</option>
            <option value="user-desc">User ID descending</option>
            <option value="status">Status (A-Z)</option>
          </select>
          <button type="button" className="ghost-button" onClick={resetFilters}>
            Clear Filters
          </button>
        </div>
        <p className="filter-meta">
          Showing {filteredNotes.length} of {notes.length} notes
        </p>
        <FormMessage error={error} message={message} />
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <article key={note.ID} className="note-card">
              <div className="note-head">
                <h3>{note.task}</h3>
                <span className="status-pill" data-status={note.status.trim().toLowerCase()}>
                  {note.status}
                </span>
              </div>
              <p>{note.description}</p>
              <div className="note-meta">
                <small>
                  User: {note.user_name?.trim() || "Unknown"} (ID: {note.user_id})
                </small>
                <small>{new Date(note.created_at).toLocaleString()}</small>
              </div>
              {note.admin_message ? <div className="admin-msg">Admin: {note.admin_message}</div> : null}
              <form className="stack" onSubmit={(e) => addComment(e, note.ID)}>
                <input name="message" placeholder="Add admin comment" maxLength={500} required />
                <div className="row-actions">
                  <Link href={`/notes/${note.ID}`} className="ghost-button">
                    View
                  </Link>
                  <button className="primary-button" type="submit">
                    Save Comment
                  </button>
                  <button className="danger-button" type="button" onClick={() => deleteNote(note.ID)}>
                    Delete
                  </button>
                </div>
              </form>
            </article>
          ))}
          {filteredNotes.length === 0 ? <p>No notes matched your filters.</p> : null}
        </div>
      </section>
    </main>
  );
}
