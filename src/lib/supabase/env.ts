const requiredPublicEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export function getSupabasePublicEnv() {
  if (!requiredPublicEnv.url || !requiredPublicEnv.anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return requiredPublicEnv as {
    url: string;
    anonKey: string;
  };
}
