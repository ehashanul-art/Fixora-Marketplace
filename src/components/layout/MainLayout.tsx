import type { ReactNode } from "react";
import { CartCount } from "./CartCount";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  showCartCount?: boolean;
}

export function MainLayout({
  children,
  showCartCount = false,
}: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showCartCount ? <CartCount /> : <Header />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
