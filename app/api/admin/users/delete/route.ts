import { getCurrentUser } from "@/lib/auth";
import { badRequest, forbidden, ok, unauthorized } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { deleteUserSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }
  if (!user.isAdmin) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = deleteUserSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { targetUserId } = parsed.data;
  if (targetUserId === user.userId) {
    return badRequest("You cannot delete your own account");
  }

  const supabase = await getSupabaseServerClient();

  await supabase.from("tasks").delete().eq("user_id", targetUserId);
  await supabase.from("user").delete().eq("id", targetUserId);

  return ok({ message: "User deleted" });
}
