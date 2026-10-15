"use client";

import { ArrowRight } from "lucide-react";
import { formatMarketplacePrice } from "@/lib/marketplace/format";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 sticky top-24">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Subtotal</dt>
          <dd className="font-medium text-slate-900">{formatMarketplacePrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Items</dt>
          <dd className="font-medium text-slate-900">{itemCount}</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-3">
          <dt className="text-base font-semibold text-slate-900">Total</dt>
          <dd className="text-base font-bold text-slate-900">{formatMarketplacePrice(subtotal)}</dd>
        </div>
      </dl>
      <div className="mt-6 space-y-3">
        <button
          type="button"
          disabled
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Proceed to Checkout
          <ArrowRight className="size-4" />
        </button>
        <p className="text-center text-xs text-slate-500">Checkout coming soon</p>
      </div>
    </div>
  );
}