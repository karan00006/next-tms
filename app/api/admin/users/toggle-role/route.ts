import { getCurrentUser } from "@/lib/auth";
import { badRequest, forbidden, ok, unauthorized } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { toggleRoleSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }
  if (!user.isAdmin) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = toggleRoleSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { targetUserId } = parsed.data;
  if (targetUserId === user.userId) {
    return badRequest("You cannot change your own admin role");
  }

  const supabase = await getSupabaseServerClient();

  const { data: rows } = await supabase.from("user").select("is_admin").eq("id", targetUserId).limit(1);
  const target = rows?.[0];
  if (!target) {
    return badRequest("User not found");
  }

  const newRole = target.is_admin ? 0 : 1;
  await supabase.from("user").update({ is_admin: newRole }).eq("id", targetUserId);

  return ok({ message: newRole ? "User promoted to admin" : "Admin demoted to user" });
}
