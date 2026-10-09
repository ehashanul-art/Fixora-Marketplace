"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearCartAction } from "@/app/(customer)/cart/actions";

export function ClearCartButton() {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  async function handleClear() {
    if (!confirm("Clear all items from your cart?")) return;
    setIsClearing(true);
    try {
      const result = await clearCartAction();
      if (result.success) {
        router.refresh();
      }
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClear}
      disabled={isClearing}
      className="text-sm font-medium text-slate-600 hover:text-red-600 transition disabled:opacity-50"
    >
      {isClearing ? "Clearing…" : "Clear Cart"}
    </button>
  );
}