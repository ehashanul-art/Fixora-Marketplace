import Link from "next/link";
import { Boxes, Layers3, PackageCheck, PackageX, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { CategoryImageUploader } from "@/components/admin/CategoryImageUploader";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ProductImageManager } from "@/components/admin/ProductImageManager";
import {
  getActiveCategories,
  getAdminMarketplaceSummary,
  getManageableCategories,
  getManageableProducts,
} from "@/lib/marketplace/data";
import {
  createCategoryAction,
  createProductAction,
  deactivateProductAction,
  updateCategoryAction,
  updateProductAction,
} from "./actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const pageSize = 20;

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Boxes;
  tone: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <span className={`rounded-lg p-2 ${tone}`}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
    </article>
  );
}

export default async function AdminMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    success?: string;
    q?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const status =
    params.status === "active" || params.status === "inactive" ? params.status : "all";
  const pageValue = Number(params.page ?? 1);
  const currentPage = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const [{ error, success }, categories, activeCategories, summary, initialProductPage] =
    await Promise.all([
      Promise.resolve(params),
      getManageableCategories(),
      getActiveCategories(),
      getAdminMarketplaceSummary(),
      getManageableProducts({
        search,
        categoryId: params.category,
        status,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      }),
    ]);
  let productPage = initialProductPage;
  let pageCount = Math.max(1, Math.ceil(productPage.total / pageSize));
  if (currentPage > pageCount) {
    productPage = await getManageableProducts({
      search,
      categoryId: params.category,
      status,
      limit: pageSize,
      offset: (pageCount - 1) * pageSize,
    });
    pageCount = Math.max(1, Math.ceil(productPage.total / pageSize));
  }
  const resolvedPage = Math.min(currentPage, pageCount);
  const previousHref = new URLSearchParams({
    ...(search ? { q: search } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(status !== "all" ? { status } : {}),
    page: String(Math.max(1, resolvedPage - 1)),
  });
  const nextHref = new URLSearchParams({
    ...(search ? { q: search } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(status !== "all" ? { status } : {}),
    page: String(Math.min(pageCount, resolvedPage + 1)),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <header id="overview" className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Fixora marketplace
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Marketplace workspace
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Manage catalog content, pricing, stock, and product imagery.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          View storefront
        </Link>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {success}
        </p>
      )}

      <section aria-label="Marketplace summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Total products" value={summary.totalProducts} icon={Boxes} tone="bg-slate-100 text-slate-700" />
        <SummaryCard label="Active products" value={summary.activeProducts} icon={PackageCheck} tone="bg-emerald-50 text-emerald-700" />
        <SummaryCard label="Low stock" value={summary.lowStockProducts} icon={TriangleAlert} tone="bg-amber-50 text-amber-700" />
        <SummaryCard label="Out of stock" value={summary.outOfStockProducts} icon={PackageX} tone="bg-red-50 text-red-700" />
        <SummaryCard label="Categories" value={summary.categories} icon={Layers3} tone="bg-blue-50 text-blue-700" />
      </section>

      <section id="categories" className="scroll-mt-6 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
          <p className="mt-1 text-sm text-slate-600">
            Active categories are visible in the storefront. Category image assets are not automatically deleted.
          </p>
        </div>

        <form
          action={createCategoryAction}
          className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4"
        >
          <h3 className="text-lg font-semibold text-slate-900 md:col-span-2 xl:col-span-4">
            Add a category
          </h3>
          <Field label="Name">
            <input required name="name" autoComplete="off" className={inputClass} />
          </Field>
          <Field label="Slug">
            <input required name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={inputClass} />
          </Field>
          <Field label="Sort order">
            <input name="sort_order" type="number" min="0" defaultValue="0" className={inputClass} />
          </Field>
          <Field label="Parent category">
            <select name="parent_id" defaultValue="" className={inputClass}>
              <option value="">No parent</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Image URL (optional)">
            <input name="image_url" type="url" className={inputClass} />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <textarea name="description" rows={2} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
            <input name="is_active" type="checkbox" defaultChecked className="size-4 rounded border-slate-300" />
            Published
          </label>
          <div className="md:col-span-2 xl:col-span-4">
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Create category
            </button>
          </div>
        </form>

        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No categories yet. Add one above to organize marketplace products.
          </p>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <article key={category.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <form action={updateCategoryAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <input type="hidden" name="id" value={category.id} />
                  <Field label="Name">
                    <input required name="name" defaultValue={category.name} className={inputClass} />
                  </Field>
                  <Field label="Slug">
                    <input required name="slug" defaultValue={category.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={inputClass} />
                  </Field>
                  <Field label="Sort order">
                    <input name="sort_order" type="number" min="0" defaultValue={category.sort_order} className={inputClass} />
                  </Field>
                  <Field label="Parent category">
                    <select name="parent_id" defaultValue={category.parent_id ?? ""} className={inputClass}>
                      <option value="">No parent</option>
                      {categories.filter((parent) => parent.id !== category.id).map((parent) => (
                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Image URL">
                    <input name="image_url" type="url" defaultValue={category.image_url ?? ""} className={inputClass} />
                  </Field>
                  <Field label="Description" className="md:col-span-2">
                    <textarea name="description" rows={2} defaultValue={category.description ?? ""} className={inputClass} />
                  </Field>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
                    <input name="is_active" type="checkbox" defaultChecked={category.is_active} className="size-4 rounded border-slate-300" />
                    Published
                  </label>
                  <div className="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-4">
                    <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Save category
                    </button>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${category.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </form>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <CategoryImageUploader categoryId={category.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="products" className="scroll-mt-6 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Products and inventory</h2>
          <p className="mt-1 text-sm text-slate-600">
            Costs and exact stock are shown only to authorized Fixora staff.
          </p>
        </div>

        <form
          action={createProductAction}
          className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4"
        >
          <h3 className="text-lg font-semibold text-slate-900 md:col-span-2 xl:col-span-4">
            Add a product
          </h3>
          <Field label="Name"><input required name="name" className={inputClass} /></Field>
          <Field label="Slug"><input required name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={inputClass} /></Field>
          <Field label="SKU"><input required name="sku" className={inputClass} /></Field>
          <Field label="Category">
            <select required name="category_id" defaultValue="" className={inputClass}>
              <option value="" disabled>Select a category</option>
              {activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
          <Field label="Brand"><input name="brand" className={inputClass} /></Field>
          <Field label="Model"><input name="model" className={inputClass} /></Field>
          <Field label="Buy price"><input required name="buy_price" type="number" min="0" step="0.01" className={inputClass} /></Field>
          <Field label="Sell price"><input required name="sell_price" type="number" min="0" step="0.01" className={inputClass} /></Field>
          <Field label="Compare-at price"><input name="compare_at_price" type="number" min="0" step="0.01" className={inputClass} /></Field>
          <Field label="Warranty (months)"><input name="warranty_months" type="number" min="0" step="1" className={inputClass} /></Field>
          <Field label="Quantity"><input required name="quantity" type="number" min="0" step="1" defaultValue="0" className={inputClass} /></Field>
          <Field label="Reserved quantity"><input required name="reserved_quantity" type="number" min="0" step="1" defaultValue="0" className={inputClass} /></Field>
          <Field label="Low-stock threshold"><input required name="low_stock_threshold" type="number" min="0" step="1" defaultValue="5" className={inputClass} /></Field>
          <Field label="Short description" className="md:col-span-2">
            <input name="short_description" className={inputClass} />
          </Field>
          <Field label="Primary image URL (optional)">
            <input name="image_url" type="url" className={inputClass} />
          </Field>
          <Field label="Description" className="md:col-span-2 xl:col-span-4">
            <textarea name="description" rows={3} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input name="is_featured" type="checkbox" className="size-4 rounded border-slate-300" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input name="is_active" type="checkbox" defaultChecked className="size-4 rounded border-slate-300" />
            Published
          </label>
          <div className="md:col-span-2 xl:col-span-4">
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Create product
            </button>
          </div>
        </form>

        <form
          action="/admin"
          method="get"
          className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4"
          aria-label="Filter products"
        >
          <Field label="Search products">
            <input name="q" type="search" defaultValue={search} placeholder="Name, SKU, brand, model" className={inputClass} />
          </Field>
          <Field label="Category">
            <select name="category" defaultValue={params.category ?? ""} className={inputClass}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={status} className={inputClass}>
              <option value="all">All products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <div className="flex items-end gap-2">
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Apply filters
            </button>
            <Link href="/admin#products" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Reset
            </Link>
          </div>
        </form>

        <div id="inventory" className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            {productPage.total === 0
              ? "No products match these filters."
              : `Showing ${(resolvedPage - 1) * pageSize + 1}–${Math.min(resolvedPage * pageSize, productPage.total)} of ${productPage.total} products`}
          </p>
          <p className="text-xs text-slate-500">Stock state is calculated from quantity minus reserved quantity.</p>
        </div>

        {productPage.products.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No matching products. Adjust the filters or add a product above.
          </p>
        ) : (
          <div className="space-y-5">
            {productPage.products.map((product) => {
              const inventory = product.inventory;
              const quantity = inventory?.quantity ?? 0;
              const reserved = inventory?.reserved_quantity ?? 0;
              const threshold = inventory?.low_stock_threshold ?? 5;
              const available = Math.max(0, quantity - reserved);
              const stockLabel =
                available <= 0 ? "Out of stock" : available <= threshold ? "Low stock" : "In stock";
              const stockTone =
                available <= 0
                  ? "bg-red-50 text-red-700"
                  : available <= threshold
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700";

              return (
                <article key={product.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">SKU: {product.sku}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockTone}`}>{stockLabel}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {product.is_active ? "Published" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <form action={updateProductAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <input type="hidden" name="id" value={product.id} />
                    <Field label="Name"><input required name="name" defaultValue={product.name} className={inputClass} /></Field>
                    <Field label="Slug"><input required name="slug" defaultValue={product.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={inputClass} /></Field>
                    <Field label="SKU"><input required name="sku" defaultValue={product.sku} className={inputClass} /></Field>
                    <Field label="Category">
                      <select required name="category_id" defaultValue={product.category_id} className={inputClass}>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Brand"><input name="brand" defaultValue={product.brand ?? ""} className={inputClass} /></Field>
                    <Field label="Model"><input name="model" defaultValue={product.model ?? ""} className={inputClass} /></Field>
                    <Field label="Buy price"><input required name="buy_price" type="number" min="0" step="0.01" defaultValue={product.buy_price} className={inputClass} /></Field>
                    <Field label="Sell price"><input required name="sell_price" type="number" min="0" step="0.01" defaultValue={product.sell_price} className={inputClass} /></Field>
                    <Field label="Compare-at price"><input name="compare_at_price" type="number" min="0" step="0.01" defaultValue={product.compare_at_price ?? ""} className={inputClass} /></Field>
                    <Field label="Warranty (months)"><input name="warranty_months" type="number" min="0" step="1" defaultValue={product.warranty_months ?? ""} className={inputClass} /></Field>
                    <Field label="Quantity"><input required name="quantity" type="number" min="0" step="1" defaultValue={quantity} className={inputClass} /></Field>
                    <Field label="Reserved quantity"><input required name="reserved_quantity" type="number" min="0" step="1" defaultValue={reserved} className={inputClass} /></Field>
                    <Field label="Low-stock threshold"><input required name="low_stock_threshold" type="number" min="0" step="1" defaultValue={threshold} className={inputClass} /></Field>
                    <Field label="Short description" className="md:col-span-2">
                      <input name="short_description" defaultValue={product.short_description ?? ""} className={inputClass} />
                    </Field>
                    <Field label="Description" className="md:col-span-2 xl:col-span-4">
                      <textarea name="description" rows={3} defaultValue={product.description ?? ""} className={inputClass} />
                    </Field>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input name="is_featured" type="checkbox" defaultChecked={product.is_featured} className="size-4 rounded border-slate-300" />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input name="is_active" type="checkbox" defaultChecked={product.is_active} className="size-4 rounded border-slate-300" />
                      Published
                    </label>
                    <p className="self-center text-sm text-slate-600">
                      Available: <strong>{available}</strong> / {quantity}
                    </p>
                    <div className="flex items-center">
                      <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Save product
                      </button>
                    </div>
                  </form>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <h4 className="mb-3 text-sm font-bold text-slate-900">Product images</h4>
                    <ProductImageManager productId={product.id} images={product.product_images} />
                  </div>

                  {product.is_active && (
                    <form action={deactivateProductAction} className="mt-4 border-t border-slate-100 pt-4">
                      <input type="hidden" name="id" value={product.id} />
                      <ConfirmSubmitButton />
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {pageCount > 1 && (
          <nav aria-label="Product pages" className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
            {resolvedPage > 1 ? (
              <Link href={`/admin?${previousHref.toString()}#products`} className="text-sm font-semibold text-slate-700 hover:text-slate-950">
                Previous
              </Link>
            ) : <span className="text-sm text-slate-400">Previous</span>}
            <span className="text-sm text-slate-600">Page {resolvedPage} of {pageCount}</span>
            {resolvedPage < pageCount ? (
              <Link href={`/admin?${nextHref.toString()}#products`} className="text-sm font-semibold text-slate-700 hover:text-slate-950">
                Next
              </Link>
            ) : <span className="text-sm text-slate-400">Next</span>}
          </nav>
        )}
      </section>
    </div>
  );
}
