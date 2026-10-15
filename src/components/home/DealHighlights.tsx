import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import type { PublicProduct, StockState } from "@/lib/types/marketplace";
import { formatMarketplacePrice } from "@/lib/marketplace/format";

interface DealHighlightsProps {
  products: PublicProduct[];
  stockByProduct: ReadonlyMap<string, { state: StockState }>;
}

function productImage(product: PublicProduct) {
  return (
    product.product_images.find((image) => image.is_primary) ??
    product.product_images[0]
  );
}

export function DealHighlights({
  products,
  stockByProduct,
}: DealHighlightsProps) {
  const deals = products.filter(
    (product) =>
      product.compare_at_price !== null &&
      product.compare_at_price > product.sell_price,
  );
  const highlights = (deals.length > 0 ? deals : products).slice(0, 3);

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-orange-900">
            <Zap className="size-5 text-orange-600" />
            {deals.length > 0 ? "Flash Deals" : "Featured Pick"}
          </h2>
          {deals.length > 0 && (
            <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold tabular-nums text-white">
              Limited time
            </span>
          )}
        </div>
        {highlights[0] ? (
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <Link
              href={`/products/${highlights[0].slug}`}
              className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white sm:size-28"
            >
              {productImage(highlights[0]) ? (
                <Image
                  src={productImage(highlights[0])!.image_url}
                  alt={productImage(highlights[0])!.alt_text ?? highlights[0].name}
                  fill
                  sizes="112px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-4xl">📦</span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${highlights[0].slug}`}
                className="line-clamp-2 font-medium text-slate-900 hover:text-blue-700"
              >
                {highlights[0].name}
              </Link>
              <p className="mt-2 text-2xl font-bold text-orange-800">
                {formatMarketplacePrice(highlights[0].sell_price)}
              </p>
              {highlights[0].compare_at_price !== null &&
                highlights[0].compare_at_price > highlights[0].sell_price && (
                  <p className="mt-1 text-sm text-slate-500">
                    <span className="line-through">
                      {formatMarketplacePrice(highlights[0].compare_at_price)}
                    </span>{" "}
                    <span className="font-semibold text-orange-700">
                      {Math.round(
                        (1 -
                          highlights[0].sell_price /
                            highlights[0].compare_at_price) *
                          100,
                      )}
                      % off
                    </span>
                  </p>
                )}
              <Link
                href={`/products/${highlights[0].slug}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-800 hover:text-orange-950"
              >
                Grab deal <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-dashed border-orange-300 p-5 text-sm text-orange-950/70">
            Products and deals will appear here when they are available.
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-emerald-950">New This Week</h2>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        {highlights.length > 0 ? (
          <div className="mt-4 divide-y divide-emerald-200/70">
            {highlights.slice(0, 2).map((product) => {
              const image = productImage(product);
              const stock = stockByProduct.get(product.id)?.state;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-white">
                    {image ? (
                      <Image
                        src={image.image_url}
                        alt={image.alt_text ?? product.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xl">📦</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-sm font-medium text-slate-800">
                      {product.name}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-emerald-800">
                      {formatMarketplacePrice(product.sell_price)}
                      {stock === "out_of_stock" && (
                        <span className="ml-2 font-normal text-slate-500">
                          Out of stock
                        </span>
                      )}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-slate-400" />
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-dashed border-emerald-300 p-5 text-sm text-emerald-950/70">
            Recently added products will appear here.
          </p>
        )}
      </div>
    </section>
  );
}
