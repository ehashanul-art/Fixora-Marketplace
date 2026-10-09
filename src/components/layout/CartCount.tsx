"use server";

import { getCartCountAction } from "@/app/(customer)/cart/actions";
import { Header } from "./Header";

export async function CartCount() {
  const result = await getCartCountAction();
  const count = result.success ? result.data : 0;
  return <Header cartCount={count} />;
}