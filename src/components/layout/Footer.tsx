import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Categories", href: "/categories" },
      { label: "Featured Products", href: "/products" },
      { label: "Your Wishlist", href: "/wishlist" },
      { label: "Your Cart", href: "/cart" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "mailto:support@fixora.in" },
      { label: "Contact Us", href: "mailto:support@fixora.in" },
      { label: "Call Support", href: "tel:18001234567" },
    ],
  },
  {
    title: "Sell on Fixora",
    links: [
      { label: "Start Selling", href: "/seller" },
      { label: "Seller Hub", href: "/seller" },
      { label: "Seller Account", href: "/login" },
    ],
  },
  {
    title: "Your Account",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
      { label: "My Account", href: "/account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                ⚡
              </span>
              <span className="text-2xl font-semibold tracking-tight text-white">
                fixora
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              A marketplace for the products that make homes, offices, and
              commercial spaces work better.
            </p>
            <div className="mt-5 space-y-3 text-sm text-slate-400">
              <a
                href="tel:18001234567"
                className="flex items-center gap-2 hover:text-white"
              >
                <Phone className="size-4 text-blue-400" />
                1800-123-4567
              </a>
              <a
                href="mailto:support@fixora.in"
                className="flex items-center gap-2 hover:text-white"
              >
                <Mail className="size-4 text-blue-400" />
                support@fixora.in
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-blue-400" />
                Bengaluru, India
              </p>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="font-semibold text-white">{column.title}</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {column.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-1 text-slate-400 transition hover:text-white"
                    >
                      {item.label}
                      <ArrowUpRight className="size-3 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Fixora Marketplace. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>Privacy</span>
            <span>Terms</span>
            <Link href="/products" className="hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
