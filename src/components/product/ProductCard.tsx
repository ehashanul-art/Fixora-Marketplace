"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicProduct, StockState } from "@/lib/types/marketplace";
import { formatMarketplacePrice } from "@/lib/marketplace/format";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
  product: PublicProduct;
  stockState: StockState;
}

export function ProductCard({
  product,
  stockState,
}: ProductCardProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const primaryImage = product.product_images.find((image) => image.is_primary) ?? product.product_images[0];
  const stockLabel = stockState.replaceAll("_", " ");
  const stockClass = stockState === "in_stock"
    ? "bg-emerald-100 text-emerald-700"
    : stockState === "low_stock"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600";
  const isOutOfStock = stockState === "out_of_stock";
  const discount =
    product.compare_at_price !== null &&
    product.compare_at_price > product.sell_price
      ? Math.round((1 - product.sell_price / product.compare_at_price) * 100)
      : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg">
      <div className="relative">
        <Link href={`/products/${product.slug}`}>
          <div
            className="relative aspect-square w-full overflow-hidden bg-slate-50"
            data-image-source={primaryImage?.image_url ?? "placeholder"}
          >
            {primaryImage ? (
              <Image
                src={primaryImage.image_url}
                alt={primaryImage.alt_text ?? product.name}
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                className="object-contain p-4 transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl">
                📦
              </div>
            )}
            {discount !== null && (
              <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
                {discount}% off
              </span>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm transition hover:text-rose-600"
        >
          <Heart
            className={`size-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          {product.brand ? (
            <span className="truncate text-xs font-medium text-slate-500">
              {product.brand}
            </span>
          ) : (
            <span />
          )}
          <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${stockClass}`}>
            {stockLabel}
          </span>
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900 hover:text-blue-700">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3">
          <span className="text-lg font-bold text-slate-950">
            {formatMarketplacePrice(product.sell_price)}
          </span>
          {discount !== null && product.compare_at_price !== null && (
            <span className="ml-2 text-sm text-slate-400 line-through">
              {formatMarketplacePrice(product.compare_at_price)}
            </span>
          )}
        </div>

        <AddToCartButton
          productId={product.id}
          disabled={isOutOfStock}
          onSuccess={() => router.refresh()}
          className="mt-4 [&>button]:w-full"
        />
      </div>
    </article>
  );
}
