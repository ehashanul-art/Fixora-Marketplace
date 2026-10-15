import { MainLayout } from "@/components/layout/MainLayout";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import type { ReactNode } from "react";

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  await requireAuthenticatedUser();
  return <MainLayout showCartCount>{children}</MainLayout>;
}
