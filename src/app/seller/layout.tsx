import { requireRole } from "@/lib/auth/guards";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function SellerLayout({ children }: { children: ReactNode }) {
  await requireRole(["seller"]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col">
        <div className="text-xl font-bold mb-8">Fixora Seller</div>
        <nav className="space-y-2 flex-1">
          <Link href="/seller" className="block px-4 py-2 rounded-lg bg-slate-800">
            Dashboard
          </Link>
          <Link href="#products" className="block px-4 py-2 rounded-lg hover:bg-slate-800">
            My Products
          </Link>
          <Link href="#orders" className="block px-4 py-2 rounded-lg hover:bg-slate-800">
            Orders
          </Link>
          <Link href="#analytics" className="block px-4 py-2 rounded-lg hover:bg-slate-800">
            Analytics
          </Link>
          <Link href="#settings" className="block px-4 py-2 rounded-lg hover:bg-slate-800">
            Settings
          </Link>
        </nav>
        <Link
          href="/login"
          className="w-full bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600 text-center block"
        >
          Exit Seller
        </Link>
      </div>

      <div className="flex-1">
        <div className="bg-white border-b border-slate-200 p-6 flex md:hidden justify-between items-center">
          <div className="text-lg font-bold">Fixora Seller</div>
          <button type="button">☰</button>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
