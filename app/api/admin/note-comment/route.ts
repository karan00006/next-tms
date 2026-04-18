import { getCurrentUser } from "@/lib/auth";
import { badRequest, forbidden, ok, unauthorized } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { addCommentSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return unauthorized();
  }
  if (!user.isAdmin) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = addCommentSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message || "Invalid input");
  }

  const { id, message } = parsed.data;
  const supabase = await getSupabaseServerClient();
  await supabase.from("tasks").update({ admin_message: message }).eq("ID", id);

  return ok({ message: "Comment saved" });
}
