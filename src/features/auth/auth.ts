import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

function ensureSupabaseAuthEnabled() {
  if (!hasSupabasePublicEnv()) {
    throw new Error(
      "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}) {
  ensureSupabaseAuthEnabled();
  const supabase = createSupabaseBrowserClient();

  return supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        phone: input.phone,
      },
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  ensureSupabaseAuthEnabled();
  return createSupabaseBrowserClient().auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  ensureSupabaseAuthEnabled();
  return createSupabaseBrowserClient().auth.signOut();
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  ensureSupabaseAuthEnabled();
  return createSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
    redirectTo,
  });
}

export function subscribeToAuthChanges(
  callback: Parameters<
    ReturnType<typeof createSupabaseBrowserClient>["auth"]["onAuthStateChange"]
  >[0],
) {
  ensureSupabaseAuthEnabled();
  return createSupabaseBrowserClient().auth.onAuthStateChange(callback);
}
