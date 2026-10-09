import type { ReactNode } from "react";
import { CartCount } from "./CartCount";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <CartCount />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
