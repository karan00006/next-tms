"use client";

import Link from "next/link";
import { FormMessage } from "@/components/form-message";
import { useState } from "react";

type UserRow = {
  id: number;
  name: string;
  email: string;
  is_admin: number;
  notes_count: number;
};

type UsersClientProps = {
  users: UserRow[];
  currentUserId: number;
};

export function UsersClient({ users: initialUsers, currentUserId }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refreshUsers() {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      setUsers(data.users || []);
    }
  }

  async function toggleRole(targetUserId: number) {
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/users/toggle-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Role toggle failed");
      return;
    }

    setMessage(data.message || "Role updated");
    await refreshUsers();
  }

  async function deleteUser(targetUserId: number) {
    const confirmed = window.confirm("Delete user and all notes?");
    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    const response = await fetch("/api/admin/users/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Delete failed");
      return;
    }

    setMessage(data.message || "User deleted");
    await refreshUsers();
  }

  return (
    <main className="page-shell">
      <section className="card">
        <div className="row-actions">
          <h1>User Management</h1>
          <Link href="/admin" className="ghost-button">
            Back to Admin
          </Link>
        </div>
        <FormMessage error={error} message={message} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Tasks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="ID">{user.id}</td>
                  <td data-label="Name">{user.name}</td>
                  <td data-label="Email" className="cell-break">{user.email}</td>
                  <td data-label="Role">{user.is_admin ? "Admin" : "User"}</td>
                  <td data-label="Tasks">{user.notes_count}</td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => toggleRole(user.id)}
                        disabled={user.id === currentUserId}
                      >
                        Toggle Role
                      </button>
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => deleteUser(user.id)}
                        disabled={user.id === currentUserId}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
