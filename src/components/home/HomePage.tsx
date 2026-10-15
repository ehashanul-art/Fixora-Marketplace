import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { DealHighlights } from "@/components/home/DealHighlights";
import type {
  Category,
  PublicProduct,
  StockState,
} from "@/lib/types/marketplace";

interface HomePageProps {
  products: PublicProduct[];
  categories: Category[];
  stockByProduct: ReadonlyMap<string, { state: StockState }>;
}

const categoryIcons: Record<string, string> = {
  "air conditioner": "❄️",
  television: "📺",
  refrigerator: "🧊",
  electronics: "💻",
  appliance: "🫙",
  cctv: "📷",
  security: "📷",
  "smart home": "🏠",
  electrical: "⚡",
  lighting: "💡",
  furniture: "🪑",
  office: "🖨️",
  tool: "🔧",
  building: "🧱",
  spare: "⚙️",
};

function getCategoryIcon(name: string) {
  const matched = Object.entries(categoryIcons).find(([keyword]) =>
    name.toLowerCase().includes(keyword),
  );
  return matched?.[1] ?? "✨";
}

function formatSavings(product: PublicProduct) {
  if (
    product.compare_at_price === null ||
    product.compare_at_price <= product.sell_price
  ) {
    return null;
  }

  return Math.round(
    (1 - product.sell_price / product.compare_at_price) * 100,
  );
}

export function HomePage({
  products,
  categories,
  stockByProduct,
}: HomePageProps) {
  const featuredProducts = products.filter((product) => product.is_featured);
  const dealProducts = products
    .filter((product) => (formatSavings(product) ?? 0) > 0)
    .slice(0, 8);
  const productShelf = featuredProducts.length > 0 ? featuredProducts : products;
  const brands = Array.from(
    new Set(
      products
        .map((product) => product.brand?.trim())
        .filter((brand): brand is string => Boolean(brand)),
    ),
  ).slice(0, 6);

  return (
    <div className="bg-[#f5f6fa] pb-16">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:space-y-10 lg:px-8">
        <HeroCarousel />

        <DealHighlights products={products} stockByProduct={stockByProduct} />

        <section
          aria-label="Marketplace benefits"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[
            {
              title: "Free Delivery",
              description: "On orders above ₹999",
              Icon: Truck,
              tone: "text-blue-700 bg-blue-50",
            },
            {
              title: "Genuine Products",
              description: "Shop from verified sellers",
              Icon: ShieldCheck,
              tone: "text-emerald-700 bg-emerald-50",
            },
            {
              title: "30-Day Returns",
              description: "A simple, hassle-free process",
              Icon: RotateCcw,
              tone: "text-violet-700 bg-violet-50",
            },
            {
              title: "Customer Support",
              description: "We're here to help",
              Icon: Headphones,
              tone: "text-orange-700 bg-orange-50",
            },
          ].map(({ title, description, Icon, tone }) => (
            <div
              key={title}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
            >
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-full ${tone}`}
              >
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold text-slate-900">{title}</span>
                <span className="mt-0.5 block text-sm text-slate-500">
                  {description}
                </span>
              </span>
            </div>
          ))}
        </section>

        <section aria-labelledby="shop-categories">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
                Find your next essential
              </p>
              <h2
                id="shop-categories"
                className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl"
              >
                Shop by Category
              </h2>
            </div>
            <Link
              href="/categories"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              All Categories <ArrowRight className="size-4" />
            </Link>
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
              {categories.slice(0, 14).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="group flex min-h-40 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <span className="relative flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-3xl transition group-hover:bg-blue-100">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      getCategoryIcon(category.name)
                    )}
                  </span>
                  <span className="mt-3 line-clamp-2 text-sm font-medium text-slate-800 group-hover:text-blue-700">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-600">
              Categories will appear here when they are added.
            </div>
          )}
        </section>

        {dealProducts.length > 0 && (
          <ProductShelf
            title="Flash Deals"
            subtitle="Save on selected products"
            products={dealProducts}
            stockByProduct={stockByProduct}
            accent="orange"
          />
        )}

        <section
          aria-label="Shop by need"
          className="grid gap-4 md:grid-cols-3"
        >
          {[
            {
              title: "Office Setup",
              description: "Everything you need to create a better workspace.",
              image:
                "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=500&fit=crop&auto=format",
              alt: "Ergonomic chair in a contemporary office",
            },
            {
              title: "Smart Home",
              description: "Bring lighting, security, and comfort together.",
              image:
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop&auto=format",
              alt: "Smart home lighting",
            },
            {
              title: "Tools for Every Job",
              description: "Find dependable tools for your next project.",
              image:
                "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=500&fit=crop&auto=format",
              alt: "Hand tools arranged for a home project",
            },
          ].map((promotion) => (
            <Link
              key={promotion.title}
              href="/products"
              className="group relative min-h-52 overflow-hidden rounded-3xl bg-slate-900"
            >
              <Image
                src={promotion.image}
                alt={promotion.alt}
                fill
                sizes="(max-width: 767px) 100vw, 33vw"
                className="object-cover opacity-55 transition duration-500 group-hover:scale-105 group-hover:opacity-65"
              />
              <span className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
              <span className="relative flex min-h-52 max-w-sm flex-col items-start justify-end p-6 text-white">
                <span className="text-xl font-semibold">{promotion.title}</span>
                <span className="mt-2 text-sm text-white/80">
                  {promotion.description}
                </span>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Shop now <ArrowRight className="size-4" />
                </span>
              </span>
            </Link>
          ))}
        </section>

        {productShelf.length > 0 ? (
          <ProductShelf
            title={featuredProducts.length > 0 ? "Featured Products" : "Explore Products"}
            subtitle="Thoughtful picks for your home and workspace"
            products={productShelf.slice(0, 8)}
            stockByProduct={stockByProduct}
          />
        ) : (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Products are coming soon
            </h2>
            <p className="mt-2 text-slate-600">
              Check back when products have been added to the marketplace.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Browse products <ArrowRight className="size-4" />
            </Link>
          </section>
        )}

        <section className="rounded-3xl border border-slate-100 bg-white px-5 py-7 shadow-sm sm:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
                Quality you can discover
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Top Brand Stores
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              All brands <ArrowRight className="size-4" />
            </Link>
          </div>
          {brands.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {brands.map((brand) => (
                <Link
                  key={brand}
                  href={`/products?q=${encodeURIComponent(brand)}`}
                  className="flex min-h-20 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 px-4 text-center font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                >
                  {brand}
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              Brand stores will appear when products are available.
            </p>
          )}
        </section>

        <section className="relative isolate overflow-hidden rounded-3xl bg-blue-700 px-6 py-10 text-white sm:px-10 md:flex md:items-center md:justify-between md:gap-8">
          <div className="absolute -right-16 -top-24 -z-10 size-80 rounded-full border-[48px] border-white/10" />
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-100">
              Fixora Marketplace
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Make every space work better.
            </h2>
            <p className="mt-3 max-w-xl text-blue-100">
              Explore reliable products for homes, offices, and commercial
              spaces—all in one place.
            </p>
          </div>
          <div className="mt-6 flex shrink-0 flex-wrap gap-3 md:mt-0">
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-semibold text-blue-800 hover:bg-blue-50"
            >
              Start shopping <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/seller"
              className="inline-flex min-h-12 items-center rounded-full border border-white/50 px-5 font-semibold text-white hover:bg-white/10"
            >
              Sell on Fixora
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProductShelf({
  title,
  subtitle,
  products,
  stockByProduct,
  accent = "blue",
}: {
  title: string;
  subtitle: string;
  products: PublicProduct[];
  stockByProduct: ReadonlyMap<string, { state: StockState }>;
  accent?: "blue" | "orange";
}) {
  return (
    <section aria-label={title}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p
            className={`text-sm font-semibold uppercase tracking-[0.16em] ${
              accent === "orange" ? "text-orange-700" : "text-blue-700"
            }`}
          >
            {subtitle}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            stockState={stockByProduct.get(product.id)?.state ?? "out_of_stock"}
          />
        ))}
      </div>
    </section>
  );
}
