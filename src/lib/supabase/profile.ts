import { createSupabaseServerClient } from "./server";

export async function getCurrentProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { profile: null, error: userError ?? new Error("Not authenticated") };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, avatar_url, role, created_at, updated_at")
    .eq("id", user.id)
    .single();

  return { profile, error };
}
