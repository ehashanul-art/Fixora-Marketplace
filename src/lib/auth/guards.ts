import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { getCurrentProfile } from "@/lib/supabase/profile";

export async function requireAuthenticatedUser() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const { profile, error } = await getCurrentProfile();

  if (error || !profile) {
    redirect("/login");
  }

  return profile;
}

export async function requireRole(allowedRoles: Array<"customer" | "seller" | "admin">) {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const profile = await requireAuthenticatedUser();

  if (!profile) {
    redirect("/login");
  }

  if (!allowedRoles.includes(profile.role)) {
    if (profile.role === "admin") {
      redirect("/admin");
    }

    if (profile.role === "seller") {
      redirect("/seller");
    }

    redirect("/account");
  }

  return profile;
}
