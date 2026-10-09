import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductBySlug, getProductInventory } from "@/lib/marketplace/data";
import { AddToCartSection } from "@/components/product/AddToCartSection";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) notFound();

  const stock = await getProductInventory(product.id);
  const images = product.product_images;
  const isOutOfStock = stock.state === "out_of_stock";
  const stockLabel = stock.state.replaceAll("_", " ");
  const stockClass = stock.state === "in_stock"
    ? "bg-emerald-100 text-emerald-700"
    : stock.state === "low_stock"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Link href="/products" className="mb-6 inline-block text-sm font-medium text-slate-700 hover:text-slate-900">
        ← Back to products
      </Link>
      <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
        <div>
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-slate-100">
            {images[0] ? <Image src={images[0].image_url} alt={images[0].alt_text ?? product.name} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" priority /> : <span className="text-6xl">📦</span>}
          </div>
          {images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-2">{images.map((image) => <div key={image.id} className="relative aspect-square overflow-hidden rounded-md"><Image src={image.image_url} alt={image.alt_text ?? product.name} fill sizes="(max-width: 767px) 25vw, 12vw" className="object-cover" /></div>)}</div>}
        </div>
        <div>
          {product.is_featured && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-600">Featured product</p>}
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{product.name}</h1>
          {(product.brand || product.model) && <p className="mt-3 text-sm text-slate-500">{[product.brand, product.model].filter(Boolean).join(" · ")}</p>}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-900">${product.sell_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${stockClass}`}>{stockLabel}</span>
          </div>
          {product.description && <p className="mt-6 text-base leading-7 text-slate-600">{product.description}</p>}
          {product.warranty_months !== null && <p className="mt-4 text-sm text-slate-600">Warranty: {product.warranty_months} months</p>}
          <AddToCartSection productId={product.id} isOutOfStock={isOutOfStock} />
        </div>
      </div>
    </div>
  );
}