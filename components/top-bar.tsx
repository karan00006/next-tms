"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type TopBarProps = {
  userName: string;
  isAdmin: boolean;
};

export function TopBar({ userName, isAdmin }: TopBarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="topbar">
      <div className="brand">Notes Vault</div>
      <nav className="nav-links">
        <Link href="/notes">My Notes</Link>
        {isAdmin ? <Link href="/admin">Admin</Link> : null}
        {isAdmin ? <Link href="/admin/users">Users</Link> : null}
      </nav>
      <div className="right-actions">
        <span className="user-pill">{userName}</span>
        <button type="button" className="ghost-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
