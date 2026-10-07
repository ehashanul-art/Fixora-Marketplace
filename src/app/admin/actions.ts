"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/guards";
import { addProductImage, createCategory, createProduct, deactivateProduct, moveProductImage, removeProductImage, setPrimaryProductImage, updateCategory, updateProduct } from "@/lib/marketplace/data";

const slug = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");
const requiredText = z.string().trim().min(1);
const number = (minimum = 0) => z.coerce.number().finite().min(minimum);
const integer = (minimum = 0) => z.coerce.number().int().min(minimum);

function nullable(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function refreshMarketplace() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/categories");
  revalidatePath("/admin");
}

function errorMessage(error: unknown) {
  return error instanceof z.ZodError
    ? error.issues[0]?.message ?? "Unable to save changes."
    : error instanceof Error
      ? error.message
      : "Unable to save changes.";
}

async function runAdminMutation(successMessage: string, mutation: () => Promise<void>) {
  let failureMessage: string | null = null;

  try {
    await mutation();
    refreshMarketplace();
  } catch (error) {
    failureMessage = errorMessage(error);
  }

  if (failureMessage) {
    redirect(`/admin?error=${encodeURIComponent(failureMessage)}`);
  }

  redirect(`/admin?success=${encodeURIComponent(successMessage)}`);
}

export async function createCategoryAction(formData: FormData) {
  await requireRole(["admin", "seller"]);
  await runAdminMutation("Category created", async () => {
    const values = z.object({ name: requiredText, slug, sort_order: number(), parent_id: z.string(), is_active: z.boolean() }).parse({
      name: formData.get("name"), slug: formData.get("slug"), sort_order: formData.get("sort_order"), parent_id: String(formData.get("parent_id") ?? ""), is_active: formData.get("is_active") === "on",
    });
    await createCategory({ ...values, parent_id: values.parent_id || null, description: nullable(formData.get("description")), image_url: nullable(formData.get("image_url")) });
  });
}

export async function updateCategoryAction(formData: FormData) {
  await requireRole(["admin", "seller"]);
  await runAdminMutation("Category updated", async () => {
    const values = z.object({ id: z.string().uuid(), name: requiredText, slug, sort_order: number(), parent_id: z.string(), is_active: z.boolean() }).parse({
      id: formData.get("id"), name: formData.get("name"), slug: formData.get("slug"), sort_order: formData.get("sort_order"), parent_id: String(formData.get("parent_id") ?? ""), is_active: formData.get("is_active") === "on",
    });
    const { id, parent_id, ...input } = values;
    await updateCategory(id, { ...input, parent_id: parent_id || null, description: nullable(formData.get("description")), image_url: nullable(formData.get("image_url")) });
  });
}

function productInput(formData: FormData) {
  const schema = z.object({
    category_id: z.string().uuid(),
    name: requiredText,
    slug,
    sku: requiredText.max(120),
    buy_price: number(),
    sell_price: number(),
    compare_at_price: z.string(),
    warranty_months: z.string(),
    quantity: integer(),
    reserved_quantity: integer(),
    low_stock_threshold: integer(),
  }).refine((values) => values.reserved_quantity <= values.quantity, {
    message: "Reserved quantity cannot exceed total quantity.",
    path: ["reserved_quantity"],
  });
  const values = schema.parse({
    category_id: formData.get("category_id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    buy_price: formData.get("buy_price"),
    sell_price: formData.get("sell_price"),
    compare_at_price: String(formData.get("compare_at_price") ?? ""),
    warranty_months: String(formData.get("warranty_months") ?? ""),
    quantity: formData.get("quantity"),
    reserved_quantity: String(formData.get("reserved_quantity") ?? "0"),
    low_stock_threshold: formData.get("low_stock_threshold"),
  });
  return {
    values,
    input: {
      category_id: values.category_id,
      name: values.name,
      slug: values.slug,
      sku: values.sku,
      buy_price: values.buy_price,
      sell_price: values.sell_price,
      compare_at_price: values.compare_at_price ? number().parse(values.compare_at_price) : null,
      warranty_months: values.warranty_months ? integer().parse(values.warranty_months) : null,
      brand: nullable(formData.get("brand")),
      model: nullable(formData.get("model")),
      short_description: nullable(formData.get("short_description")),
      description: nullable(formData.get("description")),
      is_featured: formData.get("is_featured") === "on",
      is_active: formData.get("is_active") === "on",
    },
  };
}

export async function createProductAction(formData: FormData) {
  await requireRole(["admin", "seller"]);
  await runAdminMutation("Product created", async () => {
    const { values, input } = productInput(formData);
    const product = await createProduct(input, [], {
      quantity: values.quantity,
      reserved_quantity: values.reserved_quantity,
      low_stock_threshold: values.low_stock_threshold,
    });
    const imageUrl = nullable(formData.get("image_url"));
    if (imageUrl) await addProductImage(product.id, { image_url: imageUrl, alt_text: input.name, is_primary: true });
  });
}

export async function updateProductAction(formData: FormData) {
  await requireRole(["admin", "seller"]);
  await runAdminMutation("Product updated", async () => {
    const id = z.string().uuid().parse(formData.get("id"));
    const { values, input } = productInput(formData);
    await updateProduct(id, input, {
      quantity: values.quantity,
      reserved_quantity: values.reserved_quantity,
      low_stock_threshold: values.low_stock_threshold,
    });
  });
}

export async function deactivateProductAction(formData: FormData) {
  await requireRole(["admin", "seller"]);
  await runAdminMutation("Product deactivated", async () => {
    await deactivateProduct(z.string().uuid().parse(formData.get("id")));
  });
}

export async function addProductImageAction(productId: string, image: { image_url: string; public_id: string; alt_text?: string }) {
  await requireRole(["admin", "seller"]);
  const validId = z.string().uuid().parse(productId);
  const url = z.string().url().parse(image.image_url);
  await addProductImage(validId, { image_url: url, public_id: image.public_id, alt_text: image.alt_text || null });
  refreshMarketplace();
}

export async function updateCategoryImageAction(categoryId: string, imageUrl: string) {
  await requireRole(["admin", "seller"]);
  const validUrl = imageUrl ? z.string().url().parse(imageUrl) : null;
  await updateCategory(z.string().uuid().parse(categoryId), { image_url: validUrl });
  refreshMarketplace();
}

export async function setPrimaryProductImageAction(productId: string, imageId: string) {
  await requireRole(["admin", "seller"]);
  await setPrimaryProductImage(z.string().uuid().parse(productId), z.string().uuid().parse(imageId));
  refreshMarketplace();
}

export async function moveProductImageAction(
  productId: string,
  imageId: string,
  direction: "up" | "down",
) {
  await requireRole(["admin", "seller"]);
  await moveProductImage(
    z.string().uuid().parse(productId),
    z.string().uuid().parse(imageId),
    z.enum(["up", "down"]).parse(direction),
  );
  refreshMarketplace();
}

export async function removeProductImageAction(productId: string, imageId: string) {
  await requireRole(["admin", "seller"]);
  const result = await removeProductImage(z.string().uuid().parse(productId), z.string().uuid().parse(imageId));
  refreshMarketplace();
  return result;
}
