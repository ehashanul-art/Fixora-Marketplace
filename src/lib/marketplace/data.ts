import { requireRole } from "@/lib/auth/guards";
import { deleteManagedProductImage } from "@/lib/cloudinary";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Category,
  ProductFilters,
  ProductImage,
  ProductImageInput,
  InventoryWriteInput,
  ManageableProductFilters,
  ManageableProductsPage,
  AdminMarketplaceSummary,
  ManageableProduct,
  ProductInventoryState,
  ProductUpdateInput,
  ProductWriteInput,
  PublicProduct,
} from "@/lib/types/marketplace";

const PUBLIC_PRODUCT_SELECT = `
  id,
  category_id,
  name,
  slug,
  sku,
  short_description,
  description,
  sell_price,
  compare_at_price,
  brand,
  model,
  warranty_months,
  is_active,
  is_featured,
  created_at,
  updated_at,
  product_images (
    id,
    product_id,
    image_url,
    public_id,
    alt_text,
    sort_order,
    is_primary,
    created_at
  )
`;

const MANAGEABLE_PRODUCT_SELECT = `
  id, category_id, name, slug, sku, short_description, description,
  buy_price, sell_price, compare_at_price, brand, model, warranty_months,
  is_active, is_featured, created_at, updated_at,
  product_images (id, product_id, image_url, public_id, alt_text, sort_order, is_primary, created_at),
  inventory (quantity, reserved_quantity, low_stock_threshold, updated_at)
`;

function throwIfError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

function normalizeProduct(product: Omit<PublicProduct, "sell_price"> & { sell_price: string | number }) {
  return {
    ...product,
    sell_price: Number(product.sell_price),
    compare_at_price:
      product.compare_at_price === null ? null : Number(product.compare_at_price),
    product_images: (product.product_images ?? []).sort(
      (first, second) => first.sort_order - second.sort_order,
    ),
  } as PublicProduct;
}

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, parent_id, is_active, sort_order, created_at, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  throwIfError(error);
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, parent_id, is_active, sort_order, created_at, updated_at")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  throwIfError(error);
  return data as Category | null;
}

export async function getProducts(filters: ProductFilters = {}): Promise<PublicProduct[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("customer_safe_products")
    .select(PUBLIC_PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (filters.search?.trim()) {
    const search = filters.search.trim().replace(/[%(),]/g, " ");
    query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%,sku.ilike.%${search}%`);
  }

  if (filters.offset !== undefined || filters.limit !== undefined) {
    const from = Math.max(filters.offset ?? 0, 0);
    const to = from + Math.max(filters.limit ?? 24, 1) - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;
  throwIfError(error);
  return (data ?? []).map(normalizeProduct);
}

export async function getManageableProducts(
  filters: ManageableProductFilters,
): Promise<ManageableProductsPage> {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select(MANAGEABLE_PRODUCT_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(filters.offset, filters.offset + filters.limit - 1);

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.status === "active") {
    query = query.eq("is_active", true);
  } else if (filters.status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (filters.search?.trim()) {
    const search = filters.search.trim().replace(/[^\p{L}\p{N}\s._-]/gu, " ");
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`,
      );
    }
  }

  const { data, error, count } = await query;

  throwIfError(error);
  return {
    products: (data ?? []).map((product) => ({
      ...normalizeProduct(product),
      buy_price: Number(product.buy_price),
      inventory: Array.isArray(product.inventory) ? product.inventory[0] ?? null : product.inventory,
    })) as ManageableProduct[],
    total: count ?? 0,
  };
}

export async function getAdminMarketplaceSummary(): Promise<AdminMarketplaceSummary> {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const [products, activeProducts, categories] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select(
        "is_active, inventory(quantity, reserved_quantity, low_stock_threshold)",
        { count: "exact" },
      )
      .eq("is_active", true)
      .range(0, 499),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);

  throwIfError(products.error);
  throwIfError(activeProducts.error);
  throwIfError(categories.error);

  let lowStockProducts = 0;
  let outOfStockProducts = 0;
  const activeProductRows = [...(activeProducts.data ?? [])];
  let offset = activeProductRows.length;
  while (offset < (activeProducts.count ?? 0)) {
    const { data, error } = await supabase
      .from("products")
      .select("is_active, inventory(quantity, reserved_quantity, low_stock_threshold)")
      .eq("is_active", true)
      .range(offset, offset + 499);
    throwIfError(error);
    if (!data?.length) break;
    activeProductRows.push(...data);
    offset += data.length;
  }

  for (const product of activeProductRows) {
    const record = Array.isArray(product.inventory)
      ? product.inventory[0]
      : product.inventory;
    const available = record ? record.quantity - record.reserved_quantity : 0;
    if (available <= 0) {
      outOfStockProducts += 1;
    } else if (record && available <= record.low_stock_threshold) {
      lowStockProducts += 1;
    }
  }

  return {
    totalProducts: products.count ?? 0,
    activeProducts: activeProducts.count ?? 0,
    lowStockProducts,
    outOfStockProducts,
    categories: categories.count ?? 0,
  };
}

export async function getManageableCategories(): Promise<Category[]> {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, parent_id, is_active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  throwIfError(error);
  return (data ?? []) as Category[];
}

export async function createCategory(input: Omit<Category, "id" | "created_at" | "updated_at">) {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("categories").insert(input).select("id").single();
  throwIfError(error);
  return data as { id: string };
}

export async function updateCategory(categoryId: string, input: Partial<Omit<Category, "id" | "created_at" | "updated_at">>) {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("categories").update(input).eq("id", categoryId).select("id").single();
  throwIfError(error);
  return data as { id: string };
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customer_safe_products")
    .select(PUBLIC_PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  throwIfError(error);
  return data ? normalizeProduct(data) : null;
}

export function getFeaturedProducts(limit = 8) {
  return getProducts({ featuredOnly: true, limit });
}

export async function getProductsByCategory(categorySlug: string, filters: Omit<ProductFilters, "categoryId"> = {}) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return [];
  }

  return getProducts({ ...filters, categoryId: category.id });
}

export function searchProducts(search: string, filters: Omit<ProductFilters, "search"> = {}) {
  return getProducts({ ...filters, search });
}

export async function getProductInventory(productId: string): Promise<ProductInventoryState> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_product_stock_state", { product_id: productId });

  throwIfError(error);
  return { state: (data ?? "out_of_stock") as ProductInventoryState["state"] };
}

export async function createProduct(input: ProductWriteInput, images: ProductImageInput[] = [], inventory?: InventoryWriteInput) {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert(input)
    .select("id")
    .single();

  throwIfError(error);
  if (!product) {
    throw new Error("Product creation returned no product.");
  }

  if (images.length > 0) {
    const { error: imageError } = await supabase
      .from("product_images")
      .insert(images.map((image) => ({ ...image, product_id: product.id })));
    throwIfError(imageError);
  }

  if (inventory) {
    const { error: inventoryError } = await supabase
      .from("inventory")
      .insert({ product_id: product.id, ...inventory });
    throwIfError(inventoryError);
  }

  return product as { id: string };
}

export async function updateProduct(productId: string, input: ProductUpdateInput, inventory?: InventoryWriteInput) {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", productId)
    .select("id, slug, sku, name, is_active, is_featured, updated_at")
    .single();

  throwIfError(error);

  if (inventory) {
    const { error: inventoryError } = await supabase
      .from("inventory")
      .upsert({ product_id: productId, ...inventory }, { onConflict: "product_id" });
    throwIfError(inventoryError);
  }

  return data;
}

export async function deactivateProduct(productId: string) {
  return updateProduct(productId, { is_active: false });
}

export async function replaceProductImages(productId: string, images: ProductImageInput[]) {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  throwIfError(deleteError);

  if (images.length === 0) {
    return [] as ProductImage[];
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert(images.map((image) => ({ ...image, product_id: productId })))
    .select("id, product_id, image_url, public_id, alt_text, sort_order, is_primary, created_at");

  throwIfError(error);
  return (data ?? []) as ProductImage[];
}

export async function addProductImage(productId: string, image: ProductImageInput) {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const { data: existing, error: existingError } = await supabase
    .from("product_images").select("id").eq("product_id", productId).limit(1);
  throwIfError(existingError);
  const { data, error } = await supabase.from("product_images")
    .insert({ ...image, product_id: productId, is_primary: image.is_primary ?? (existing?.length ?? 0) === 0 })
    .select("id, product_id, image_url, public_id, alt_text, sort_order, is_primary, created_at").single();
  throwIfError(error);
  return data as ProductImage;
}

export async function setPrimaryProductImage(productId: string, imageId: string) {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const { data: target, error: targetError } = await supabase.from("product_images").select("id").eq("id", imageId).eq("product_id", productId).maybeSingle();
  throwIfError(targetError);
  if (!target) throw new Error("Product image not found.");
  const { error: clearError } = await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  throwIfError(clearError);
  const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId).eq("product_id", productId);
  throwIfError(error);
}

export async function moveProductImage(
  productId: string,
  imageId: string,
  direction: "up" | "down",
) {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const { data: images, error } = await supabase
    .from("product_images")
    .select("id, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  throwIfError(error);

  const currentIndex = images?.findIndex((image) => image.id === imageId) ?? -1;
  if (!images || currentIndex < 0) {
    throw new Error("Product image not found.");
  }
  const neighborIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (neighborIndex < 0 || neighborIndex >= images.length) {
    return;
  }

  const current = images[currentIndex];
  const neighbor = images[neighborIndex];
  const temporaryOrder = Math.max(...images.map((image) => image.sort_order), 0) + 1;
  const temporaryResult = await supabase
    .from("product_images")
    .update({ sort_order: temporaryOrder })
    .eq("id", current.id)
    .eq("product_id", productId);
  throwIfError(temporaryResult.error);

  const neighborResult = await supabase
    .from("product_images")
    .update({ sort_order: current.sort_order })
    .eq("id", neighbor.id)
    .eq("product_id", productId);
  throwIfError(neighborResult.error);

  const currentResult = await supabase
    .from("product_images")
    .update({ sort_order: neighbor.sort_order })
    .eq("id", current.id)
    .eq("product_id", productId);
  throwIfError(currentResult.error);
}

export async function removeProductImage(productId: string, imageId: string) {
  await requireRole(["admin", "seller"]);
  const supabase = await createSupabaseServerClient();
  const { data: image, error: imageError } = await supabase.from("product_images").select("is_primary, public_id").eq("id", imageId).eq("product_id", productId).maybeSingle();
  throwIfError(imageError);
  if (!image) throw new Error("Product image not found.");
  const { error } = await supabase.from("product_images").delete().eq("id", imageId).eq("product_id", productId);
  throwIfError(error);
  if (image.is_primary) {
    const { data: replacement, error: replacementError } = await supabase.from("product_images").select("id").eq("product_id", productId).order("sort_order", { ascending: true }).limit(1).maybeSingle();
    throwIfError(replacementError);
    if (replacement) {
      const { error: primaryError } = await supabase.from("product_images").update({ is_primary: true }).eq("id", replacement.id);
      throwIfError(primaryError);
    }
  }

  if (!image.public_id) {
    return { assetCleanup: false };
  }

  try {
    const assetDeleted = await deleteManagedProductImage(image.public_id);
    return { assetCleanup: assetDeleted };
  } catch {
    console.error("Cloudinary product image cleanup failed", { imageId });
    throw new Error("The image record was removed, but its Cloudinary asset could not be deleted.");
  }
}
