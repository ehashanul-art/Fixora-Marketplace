import Link from "next/link";

import { ProductCard } from "@/components/product/ProductCard";
import { getActiveCategories, getFeaturedProducts, getProductInventory } from "@/lib/marketplace/data";

export default async function Home() {
  let products = [];
  let categories = [];
  try {
    [products, categories] = await Promise.all([getFeaturedProducts(8), getActiveCategories()]);
  } catch {
    return <div className="container mx-auto px-4 py-16 text-center md:px-6"><h1 className="text-2xl font-bold text-slate-900">Marketplace unavailable</h1><p className="mt-2 text-slate-600">We could not load Fixora right now.</p><Link href="/" className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Try again</Link></div>;
  }
  const inventory = await Promise.all(products.map(async (product) => [product.id, await getProductInventory(product.id)] as const));
  const stockByProduct = new Map(inventory);

  return (
    <div className="w-full">
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-16 text-white md:py-24">
        <div className="container mx-auto px-4 md:px-6"><div className="max-w-2xl"><h1 className="mb-4 text-4xl font-bold md:text-5xl">Welcome to Fixora</h1><p className="mb-8 text-lg text-slate-200 md:text-xl">Your marketplace for homes, offices, and commercial spaces.</p><Link href="/products" className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-100">Explore products</Link></div></div>
      </section>
      <section className="py-12 md:py-16"><div className="container mx-auto px-4 md:px-6"><h2 className="mb-8 text-3xl font-bold">Featured Products</h2>{products.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">Featured products are coming soon.</p> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">{products.map((product) => <ProductCard key={product.id} product={product} stockState={stockByProduct.get(product.id)?.state ?? "out_of_stock"} />)}</div>}</div></section>
      <section className="bg-slate-50 py-12 md:py-16"><div className="container mx-auto px-4 md:px-6"><h2 className="mb-8 text-3xl font-bold">Shop by Category</h2>{categories.length === 0 ? <p className="text-slate-600">Categories are coming soon.</p> : <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{categories.map((category) => <Link key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`} className="rounded-lg bg-white p-6 text-center font-semibold text-slate-900 shadow-sm transition hover:shadow-lg">{category.name}</Link>)}</div>}</div></section>
    </div>
  );
}
