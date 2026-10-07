import Link from "next/link";

import { ProductCard } from "@/components/product/ProductCard";
import { MainLayout } from "@/components/layout/MainLayout";
import { getActiveCategories, getProductInventory, getProducts, getProductsByCategory, searchProducts } from "@/lib/marketplace/data";

type ProductsPageProps = { searchParams: Promise<{ q?: string; search?: string; category?: string }> };

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = (params.q ?? params.search)?.trim() ?? "";
  let categories;
  let products;
  let stockByProduct: Map<string, { state: "in_stock" | "low_stock" | "out_of_stock" }>;
  try {
    [categories, products] = await Promise.all([getActiveCategories(), params.category ? getProductsByCategory(params.category, { search: query || undefined }) : query ? searchProducts(query) : getProducts()]);
    stockByProduct = new Map(await Promise.all(products.map(async (product) => [product.id, await getProductInventory(product.id)] as const)));
  } catch {
    return <MainLayout><div className="container mx-auto px-4 py-16 text-center md:px-6"><h1 className="text-2xl font-bold text-slate-900">Products are unavailable</h1><p className="mt-2 text-slate-600">We could not load the marketplace right now.</p><Link href="/products" className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Try again</Link></div></MainLayout>;
  }
  return <MainLayout><div className="w-full"><div className="container mx-auto px-4 py-8 md:px-6"><div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Fixora marketplace</p><h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Products</h1><p className="mt-2 text-slate-600">Find practical products for home, office, and commercial spaces.</p></div><form className="flex w-full max-w-md gap-2" action="/products"><input name="q" defaultValue={query} placeholder="Search name, brand, model, or SKU" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm" />{params.category && <input type="hidden" name="category" value={params.category} />}<button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Search</button></form></div><nav aria-label="Product categories" className="mb-8 flex gap-2 overflow-x-auto pb-2"><Link href={`/products${query ? `?q=${encodeURIComponent(query)}` : ""}`} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${!params.category ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"}`}>All products</Link>{categories.map((category) => <Link key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}${query ? `&q=${encodeURIComponent(query)}` : ""}`} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${params.category === category.slug ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"}`}>{category.name}</Link>)}</nav>{products.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 px-6 py-16 text-center"><h2 className="text-xl font-semibold text-slate-900">No products found</h2><p className="mt-2 text-slate-600">Try another search or browse all products.</p></div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">{products.map((product) => <ProductCard key={product.id} product={product} stockState={stockByProduct.get(product.id)?.state ?? "out_of_stock"} />)}</div>}</div></div></MainLayout>;
}
