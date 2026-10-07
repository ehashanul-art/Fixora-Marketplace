"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Search,
  User,
  Heart,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { signOut } from "@/features/auth/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!hasSupabasePublicEnv()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(Boolean(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    }
  };

  const accountHref = isLoggedIn ? "/account" : "/login";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="hidden md:block">
        <div className="container mx-auto px-4 md:px-6">
          <div className="py-4 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-slate-900">Fixora</div>
            </Link>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href={accountHref}
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:inline text-sm">
                  {isLoggedIn === null ? "Account" : isLoggedIn ? "Account" : "Login"}
                </span>
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
              >
                <Heart className="w-5 h-5" />
                <span className="hidden lg:inline text-sm">Wishlist</span>
              </Link>
              <Link
                href="/cart"
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden lg:inline text-sm">Cart</span>
              </Link>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden lg:inline text-sm">Logout</span>
                </button>
              )}
            </div>
          </div>

          <nav className="py-3 flex gap-6 border-t border-slate-200">
            <Link
              href="/products"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              All Products
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Categories
            </Link>
            <Link
              href="/seller"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Become a Seller
            </Link>
          </nav>
        </div>
      </div>

      <div className="md:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Fixora
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/cart">
              <ShoppingCart className="w-5 h-5 text-slate-700" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <div className="pb-3 border-b border-slate-200">
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <Link
                href="/products"
                className="block py-2 text-sm font-medium text-slate-700"
              >
                All Products
              </Link>
              <Link
                href="/categories"
                className="block py-2 text-sm font-medium text-slate-700"
              >
                Categories
              </Link>
              <Link
                href="/wishlist"
                className="block py-2 text-sm font-medium text-slate-700"
              >
                Wishlist
              </Link>
              <Link
                href={accountHref}
                className="block py-2 text-sm font-medium text-slate-700"
              >
                {isLoggedIn ? "Account" : "Login"}
              </Link>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="block w-full py-2 text-left text-sm font-medium text-slate-700"
                >
                  Logout
                </button>
              )}
              <Link
                href="/seller"
                className="block py-2 text-sm font-medium text-slate-700"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
