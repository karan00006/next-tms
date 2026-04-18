import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <main className="landing-shell">
      <div className="hero-blur" />
      <section className="landing-card">
        <p className="kicker">Next.js Migration</p>
        <h1>Notes Vault</h1>
        <p>
          Modernized from PHP with stronger auth, role-safe APIs, and an upgraded dark workspace UI.
        </p>
        <div className="row-actions">
          {user ? (
            <Link href={user.isAdmin ? "/admin" : "/notes"} className="primary-button">
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="primary-button">
                Sign In
              </Link>
              <Link href="/register" className="ghost-button">
                Create Account
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
