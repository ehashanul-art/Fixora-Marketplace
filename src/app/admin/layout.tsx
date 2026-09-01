import { requireRole } from "@/lib/auth/guards";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(["admin"]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col">
        <div className="text-xl font-bold mb-8">Fixora Admin</div>
        <nav className="space-y-2 flex-1">
          <Link href="/admin" className="block px-4 py-2 rounded-lg bg-slate-800">
            Dashboard
          </Link>
          <Link href="#products" className="block px-4 py-2 rounded-lg hover:bg-slate-800">
            Products
          </Link>
          <Link href="#categories" className="block px-4 py-2 rounded-lg hover:bg-slate-800">
            Categories
          </Link>
          <Link href="#orders" className="block px-4 py-2 rounded-lg hover:bg-slate-800">
            Orders
          </Link>
          <Link href="#users" className="block px-4 py-2 rounded-lg hover:bg-slate-800">
            Users
          </Link>
        </nav>
        <Link
          href="/login"
          className="w-full bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600 text-center block"
        >
          Exit Admin
        </Link>
      </div>

      <div className="flex-1">
        <div className="bg-white border-b border-slate-200 p-6 flex md:hidden justify-between items-center">
          <div className="text-lg font-bold">Fixora Admin</div>
          <button type="button">☰</button>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
