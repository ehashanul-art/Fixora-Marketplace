export default function CartPage() {
  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Shopping Cart</h1>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-slate-600 mb-6">
            Start shopping to add items to your cart
          </p>
          <a
            href="/products"
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}
