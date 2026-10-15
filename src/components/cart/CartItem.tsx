"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { updateCartItemAction, removeCartItemAction } from "@/app/(customer)/cart/actions";
import { formatMarketplacePrice } from "@/lib/marketplace/format";
import type { CartItemWithProduct } from "@/lib/types/marketplace";

interface CartItemProps {
  item: CartItemWithProduct;
}

export function CartItem({ item }: CartItemProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState("");
  const product = item.product;
  const primaryImage = product.product_images.find((img) => img.is_primary) ?? product.product_images[0];
  const lineTotal = product.sell_price * quantity;

  async function handleQuantityChange(newQuantity: number) {
    if (newQuantity < 1 || newQuantity === quantity || isUpdating) return;
    setIsUpdating(true);
    setError("");
    try {
      const result = await updateCartItemAction(item.id, newQuantity);
      if (!result.success) {
        setError(result.error);
        setQuantity(item.quantity);
      } else {
        setQuantity(newQuantity);
        router.refresh();
      }
    } catch {
      setError("Failed to update quantity");
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRemove() {
    if (!confirm("Remove this item from your cart?")) return;
    setIsRemoving(true);
    setError("");
    try {
      const result = await removeCartItemAction(item.id);
      if (!result.success) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch {
      setError("Failed to remove item");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="md:flex">
        <div className="relative w-full md:w-24 aspect-square bg-slate-100 shrink-0">
          {primaryImage ? (
            <Image
              src={primaryImage.image_url}
              alt={primaryImage.alt_text ?? product.name}
              fill
              sizes="(max-width: 767px) 100px, (max-width: 1023px) 96px, 120px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">📦</div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link href={`/products/${product.slug}`} className="font-semibold text-slate-900 hover:text-slate-700 line-clamp-1">
                {product.name}
              </Link>
              {(product.brand || product.model) && (
                <p className="mt-1 text-sm text-slate-500">{[product.brand, product.model].filter(Boolean).join(" · ")}</p>
              )}
              {product.sku && <p className="mt-1 text-xs text-slate-400">SKU: {product.sku}</p>}
              <p className="mt-2 text-lg font-bold text-slate-900">{formatMarketplacePrice(product.sell_price)}</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-slate-400 hover:text-red-600 transition disabled:opacity-50 shrink-0"
              aria-label={`Remove ${product.name}`}
            >
              {isRemoving ? <Loader2 className="size-5 animate-spin" /> : <Trash2 className="size-5" />}
            </button>
          </div>

          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 border border-slate-300 rounded-lg">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdating}
                className="px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-lg transition"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="px-4 text-center font-medium text-slate-900 min-w-[3rem]">{quantity}</span>
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isUpdating}
                className="px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-lg transition"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">Line total</p>
              <p className="font-bold text-slate-900">{formatMarketplacePrice(lineTotal)}</p>
              {!product.is_active && (
                <p className="mt-1 text-xs text-red-600">Product no longer available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}