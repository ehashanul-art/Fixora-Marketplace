"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { ShoppingCart, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { addToCartAction } from "@/app/(customer)/cart/actions";

interface AddToCartButtonProps {
  productId: string;
  initialQuantity?: number;
  disabled?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export function AddToCartButton({
  productId,
  initialQuantity = 1,
  disabled = false,
  className = "",
  onSuccess,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || disabled) return;
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await addToCartAction(productId, initialQuantity);
      if (result.success) {
        setMessage({ type: "success", text: "Added to cart" });
        router.refresh();
        onSuccess?.();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to add to cart" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <button
        type="submit"
        disabled={isLoading || disabled}
        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Adding…</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">Add to cart</span>
          </>
        )}
      </button>

      {message && (
        <p
          role={message.type === "success" ? "status" : "alert"}
          className={`mt-2 text-sm flex items-center gap-1.5 ${
            message.type === "success"
              ? "text-emerald-700"
              : "text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {message.text}
        </p>
      )}
    </form>
  );
}