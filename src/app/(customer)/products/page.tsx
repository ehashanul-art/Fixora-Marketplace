import { ProductCard } from "@/components/product/ProductCard";

export default function ProductsPage() {
  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">All Products</h1>
        <p className="text-slate-600 mb-8">
          Browse our complete collection of products for your home and office
        </p>

        {/* Filters Placeholder */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
            All Categories
          </button>
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
            Price
          </button>
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
            Rating
          </button>
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">
            Newest
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCard
              key={i}
              id={i + 1}
              name={`Product ${i + 1}`}
              price={999 + i * 100}
              image="/placeholder.jpg"
              rating={4.5}
              reviews={128}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
