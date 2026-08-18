"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  rating,
  reviews,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition group">
      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-slate-200 group-hover:to-slate-300 transition">
            <span className="text-4xl">📦</span>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Name */}
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-slate-700">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2 mb-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.floor(rating)
                    ? "text-yellow-400"
                    : "text-slate-300"
                }
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-slate-600">
            {rating} ({reviews})
          </span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-lg font-bold text-slate-900">
            ${price.toLocaleString()}
          </span>
        </div>

        {/* Actions */}
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
          <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
