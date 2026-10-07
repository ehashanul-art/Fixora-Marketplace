import Link from "next/link";
import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth/guards";

const navigation = [
  { href: "/admin#overview", label: "Overview" },
  { href: "/admin#categories", label: "Categories" },
  { href: "/admin#products", label: "Products & inventory" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(["admin", "seller"]);

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 px-5 py-7 text-white md:flex">
        <Link href="/admin#overview" className="text-xl font-bold tracking-tight">
          Fixora <span className="text-slate-400">Workspace</span>
        </Link>
        <p className="mt-1 text-xs text-slate-400">Marketplace operations</p>
        <nav aria-label="Admin navigation" className="mt-10 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-800 pt-5">
          <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white">
            View storefront
          </Link>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Admins and sellers are trusted internal Fixora staff.
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin#overview" className="font-bold text-slate-950">Fixora Workspace</Link>
            <Link href="/" className="text-sm font-medium text-slate-600">Storefront</Link>
          </div>
          <nav aria-label="Admin navigation" className="mt-3 flex gap-2 overflow-x-auto">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
