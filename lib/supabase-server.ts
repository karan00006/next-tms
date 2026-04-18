import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}