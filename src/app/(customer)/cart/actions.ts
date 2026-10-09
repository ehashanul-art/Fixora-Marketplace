"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { addToCart, clearCart, getCart, getCartCount, removeCartItem, updateCartItem } from "@/lib/marketplace/data";

const uuid = z.string().uuid();
const positiveInt = z.coerce.number().int().positive();

function errorMessage(error: unknown): string {
  return error instanceof z.ZodError
    ? error.issues[0]?.message ?? "Invalid input"
    : error instanceof Error
      ? error.message
      : "An unexpected error occurred";
}

async function runCartMutation<T>(mutation: () => Promise<T>): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await mutation();
    revalidatePath("/cart");
    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function addToCartAction(productId: string, quantity: number) {
  await requireAuthenticatedUser();

  const validated = { productId: uuid.parse(productId), quantity: positiveInt.parse(quantity) };

  return runCartMutation(async () => {
    return addToCart(validated.productId, validated.quantity);
  });
}

export async function updateCartItemAction(cartItemId: string, quantity: number) {
  await requireAuthenticatedUser();

  const validated = { cartItemId: uuid.parse(cartItemId), quantity: positiveInt.parse(quantity) };

  return runCartMutation(async () => {
    return updateCartItem(validated.cartItemId, validated.quantity);
  });
}

export async function removeCartItemAction(cartItemId: string) {
  await requireAuthenticatedUser();

  const validated = { cartItemId: uuid.parse(cartItemId) };

  return runCartMutation(async () => {
    await removeCartItem(validated.cartItemId);
  });
}

export async function clearCartAction() {
  await requireAuthenticatedUser();

  return runCartMutation(async () => {
    await clearCart();
  });
}

export async function getCartAction() {
  await requireAuthenticatedUser();

  return runCartMutation(async () => {
    return getCart();
  });
}

export async function getCartCountAction() {
  await requireAuthenticatedUser();

  return runCartMutation(async () => {
    return getCartCount();
  });
}