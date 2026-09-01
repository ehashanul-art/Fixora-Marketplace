import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, hasSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient | undefined;

export function createSupabaseBrowserClient() {
  if (!hasSupabasePublicEnv()) {
    throw new Error(
      "Missing Supabase public environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabasePublicEnv();
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
