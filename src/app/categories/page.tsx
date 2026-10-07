import Image from "next/image";
import Link from "next/link";

import { MainLayout } from "@/components/layout/MainLayout";
import { getActiveCategories } from "@/lib/marketplace/data";

export default async function CategoriesPage() {
  let categories;

  try {
    categories = await getActiveCategories();
  } catch {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center md:px-6">
          <h1 className="text-2xl font-bold text-slate-900">Categories are unavailable</h1>
          <p className="mt-2 text-slate-600">We could not load categories right now.</p>
          <Link href="/categories" className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Try again</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Categories</h1>
          <p className="mb-8 mt-2 text-slate-600">Explore active products by category.</p>
          {categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-6 py-16 text-center">
              <h2 className="text-xl font-semibold text-slate-900">No categories available</h2>
              <p className="mt-2 text-slate-600">Check back soon for new marketplace collections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`} className="group rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-400 hover:shadow-lg">
                  <div className="relative mb-4 flex h-32 items-center justify-center overflow-hidden rounded-md bg-slate-100">
                    {category.image_url ? <Image src={category.image_url} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition group-hover:scale-105" /> : <span className="text-4xl">📦</span>}
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">{category.name}</h2>
                  {category.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{category.description}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
