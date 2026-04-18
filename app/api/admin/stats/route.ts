import { getCurrentUser } from "@/lib/auth";
import { forbidden, ok, unauthorized } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }
  if (!user.isAdmin) {
    return forbidden();
  }

  const supabase = await getSupabaseServerClient();
  const [{ count: totalNotes }, { count: totalUsers }, { count: totalAdmins }] = await Promise.all([
    supabase.from("tasks").select("ID", { count: "exact", head: true }),
    supabase.from("user").select("id", { count: "exact", head: true }),
    supabase.from("user").select("id", { count: "exact", head: true }).eq("is_admin", 1),
  ]);

  return ok({
    stats: {
      total_notes: totalNotes || 0,
      total_users: totalUsers || 0,
      total_admins: totalAdmins || 0,
    },
  });
}
