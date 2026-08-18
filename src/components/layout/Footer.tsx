import Link from "next/link";
import { Globe, Share2, Mail, Users } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Fixora</h3>
            <p className="text-sm text-slate-400">
              Your modern marketplace for homes, offices, and commercial spaces.
              Quality products, competitive prices, and reliable service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-white transition">
                  Become a Seller
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-400">
            © 2024 Fixora Marketplace. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-4 mt-6 md:mt-0">
            <a
              href="#"
              className="text-slate-400 hover:text-white transition"
              aria-label="Website"
            >
              <Globe className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition"
              aria-label="Community"
            >
              <Users className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
