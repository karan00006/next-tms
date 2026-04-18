import { TopBar } from "@/components/top-bar";
import { requireUser } from "@/lib/guards";
import { pool, type DbNote } from "@/lib/db";
import { NotesClient } from "./notes-client";

export default async function NotesPage() {
  const user = await requireUser();

  const [rows] = await pool.query("SELECT * FROM crud_app WHERE user_id = ? ORDER BY created_at DESC", [
    user.userId,
  ]);

  return (
    <>
      <TopBar userName={user.name} isAdmin={user.isAdmin} />
      <NotesClient initialNotes={rows as DbNote[]} />
    </>
  );
}
