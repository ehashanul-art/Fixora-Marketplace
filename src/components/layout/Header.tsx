"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  Heart,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  Zap,
} from "lucide-react";
import { signOut } from "@/features/auth/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

interface HeaderProps {
  cartCount?: number;
}

const navigationLinks = [
  { label: "All Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Become a Seller", href: "/seller" },
];

export function Header({ cartCount = 0 }: HeaderProps) {
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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="bg-blue-700 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        <Link href="/products" className="hover:underline">
          🎉 Welcome to Fixora — your marketplace for home, office &amp;
          commercial products. <span className="font-semibold">Shop now →</span>
        </Link>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-blue-700 text-white">
            <Zap className="size-5 fill-current" />
          </span>
          <span className="hidden text-2xl font-semibold tracking-tight text-slate-900 sm:inline">
            fixora
          </span>
        </Link>

        <button
          type="button"
          className="hidden shrink-0 items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-left hover:border-blue-300 xl:flex"
          aria-label="Delivery location: Bengaluru 560001"
        >
          <MapPin className="size-5 text-blue-700" />
          <span>
            <span className="block text-[11px] leading-tight text-slate-500">
              Deliver to
            </span>
            <span className="block whitespace-nowrap text-sm font-medium leading-tight text-slate-800">
              Bengaluru 560001
            </span>
          </span>
          <ChevronDown className="size-4 text-slate-500" />
        </button>

        <form
          action="/products"
          role="search"
          className="flex min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-slate-50 p-1 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
        >
          <Search className="ml-2 size-5 shrink-0 text-slate-400" />
          <input
            name="q"
            type="search"
            placeholder="Search products, brands, categories..."
            aria-label="Search products, brands, and categories"
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="hidden min-h-10 shrink-0 items-center rounded-full bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 sm:inline-flex"
          >
            Search
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/wishlist"
            className="hidden size-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 sm:flex"
            aria-label="Wishlist"
          >
            <Heart className="size-5" />
          </Link>
          <Link
            href="/cart"
            className="relative flex size-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <Link
            href={accountHref}
            className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
            aria-label={isLoggedIn ? "Account" : "Log in"}
          >
            <User className="size-5" />
          </Link>
          <Link
            href={accountHref}
            className="relative hidden size-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 lg:flex"
            aria-label="Notifications and account"
          >
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-500" />
          </Link>
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden size-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 lg:flex"
              aria-label="Log out"
            >
              <LogOut className="size-5" />
            </button>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="Main navigation"
          className="border-t border-slate-100 bg-white px-4 py-3 shadow-lg sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigationLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800"
            >
              Wishlist
            </Link>
            <Link
              href={accountHref}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800"
            >
              {isLoggedIn ? "Account" : "Login"}
            </Link>
            {isLoggedIn && (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
