"use client";

import { useRouter } from "next/navigation";
import { AddToCartButton } from "@/components/product/AddToCartButton";

interface AddToCartSectionProps {
  productId: string;
  isOutOfStock: boolean;
}

export function AddToCartSection({ productId, isOutOfStock }: AddToCartSectionProps) {
  const router = useRouter();

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <AddToCartButton
        productId={productId}
        disabled={isOutOfStock}
        className="flex-1 min-w-[200px]"
        onSuccess={() => router.refresh()}
      />
      <button className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
        Save to wishlist
      </button>
    </div>
  );
}