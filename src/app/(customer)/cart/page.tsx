import Link from "next/link";
import { getCartAction } from "./actions";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { ClearCartButton } from "@/components/cart/ClearCartButton";

export default async function CartPage() {
  const result = await getCartAction();

  if (!result.success) {
    return (
      <div className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Shopping Cart</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to load cart</h2>
            <p className="text-red-600 mb-6">{result.error}</p>
            <Link href="/cart" className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition">
              Try again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = result.data;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.sell_price * item.quantity, 0);

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 md:p-16 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-600 mb-6">Add products to your cart to continue shopping</p>
            <Link
              href="/products"
              className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <ClearCartButton />
              </div>
            </div>
            <div className="md:col-span-4">
              <CartSummary subtotal={subtotal} itemCount={itemCount} />
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}