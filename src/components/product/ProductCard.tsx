"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { PublicProduct, StockState } from "@/lib/types/marketplace";

interface ProductCardProps {
  product: PublicProduct;
  stockState: StockState;
}

export function ProductCard({
  product,
  stockState,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const primaryImage = product.product_images.find((image) => image.is_primary) ?? product.product_images[0];
  const stockLabel = stockState.replaceAll("_", " ");
  const stockClass = stockState === "in_stock"
    ? "bg-emerald-100 text-emerald-700"
    : stockState === "low_stock"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition group">
      <Link href={`/products/${product.slug}`}>
        <div
          className="relative w-full aspect-square bg-slate-100 overflow-hidden"
          data-image-source={primaryImage?.image_url ?? "placeholder"}
        >
          {primaryImage ? (
            <Image
              src={primaryImage.image_url}
              alt={primaryImage.alt_text ?? product.name}
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
              className="object-cover transition group-hover:scale-105"
            />
          ) : <div className="flex h-full w-full items-center justify-center text-4xl">📦</div>}
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          {product.is_featured && <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">Featured</span>}
          <span className={`ml-auto rounded-full px-2 py-1 text-xs font-semibold capitalize ${stockClass}`}>{stockLabel}</span>
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-slate-700">
            {product.name}
          </h3>
        </Link>

        {(product.brand || product.model) && <p className="mt-2 text-xs text-slate-500">{[product.brand, product.model].filter(Boolean).join(" · ")}</p>}

        <div className="mb-4">
          <span className="text-lg font-bold text-slate-900">
            ${product.sell_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
            />
            <span className="text-sm hidden sm:inline">
              {isWishlisted ? "Wishlisted" : "Wishlist"}
            </span>
          </button>
          <button disabled={stockState === "out_of_stock"} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-50">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
