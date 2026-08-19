import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}) {
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
  return createSupabaseBrowserClient().auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return createSupabaseBrowserClient().auth.signOut();
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  return createSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
    redirectTo,
  });
}

export function subscribeToAuthChanges(
  callback: Parameters<
    ReturnType<typeof createSupabaseBrowserClient>["auth"]["onAuthStateChange"]
  >[0],
) {
  return createSupabaseBrowserClient().auth.onAuthStateChange(callback);
}
