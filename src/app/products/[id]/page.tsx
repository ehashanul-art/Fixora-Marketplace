import Link from "next/link";
import { notFound } from "next/navigation";

const productCatalog = {
  1: {
    id: 1,
    name: "Premium Smart TV",
    price: 899,
    description: "4K UHD LED display with smart streaming and voice control.",
  },
  2: {
    id: 2,
    name: "Noise-Cancelling Headphones",
    price: 249,
    description: "Wireless comfort for work, travel, and focused listening.",
  },
  3: {
    id: 3,
    name: "Compact Refrigerator",
    price: 620,
    description: "Energy-efficient cooling for modern apartments and offices.",
  },
  4: {
    id: 4,
    name: "Minimal Desk Lamp",
    price: 89,
    description: "Modern lighting with soft, adjustable brightness for every workspace.",
  },
  5: {
    id: 5,
    name: "Air Purifier Pro",
    price: 399,
    description: "High-efficiency filtration for cleaner air at home and work.",
  },
  6: {
    id: 6,
    name: "Home Security Camera",
    price: 179,
    description: "Smart monitoring for homes, entrances, and retail spaces.",
  },
  7: {
    id: 7,
    name: "Cordless Drill Kit",
    price: 299,
    description: "Reliable power and precision for DIY, repair, and installation work.",
  },
  8: {
    id: 8,
    name: "Ergonomic Office Chair",
    price: 329,
    description: "Comfort-first seating designed for daily productivity and posture support.",
  },
} as const;

export function generateStaticParams() {
  return Object.keys(productCatalog).map((id) => ({ id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  const product = productCatalog[productId as keyof typeof productCatalog];

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Link href="/products" className="mb-6 inline-block text-sm font-medium text-slate-700 hover:text-slate-900">
        ← Back to products
      </Link>

      <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
        <div className="flex min-h-[320px] items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-6xl">
          📦
        </div>

        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
            Fixora Product
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-900">
              ${product.price.toLocaleString()}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              In stock
            </span>
          </div>

          <p className="mt-6 text-base text-slate-600">{product.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Add to cart
            </button>
            <button className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
              Save to wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
