import { MainLayout } from "@/components/layout/MainLayout";
import { ProductCard } from "@/components/product/ProductCard";

export default function Home() {
  return (
    <MainLayout>
      <div className="w-full">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome to Fixora
              </h1>
              <p className="text-lg md:text-xl text-slate-200 mb-8">
                Your modern marketplace for homes, offices, and commercial
                spaces. Discover premium electronics, appliances, furniture,
                and more.
              </p>
              <button className="bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition">
                Explore Products
              </button>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((product) => (
                <ProductCard
                  key={product}
                  id={product}
                  name={`Product ${product}`}
                  price={999 + product * 100}
                  image="/placeholder.jpg"
                  rating={4.5}
                  reviews={128}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-16 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                "Electronics",
                "Appliances",
                "Furniture",
                "Smart Home",
                "Lighting",
                "Tools",
                "Building Materials",
                "Office Equipment",
              ].map((category) => (
                <div
                  key={category}
                  className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition cursor-pointer"
                >
                  <div className="text-4xl mb-3">📦</div>
                  <h3 className="font-semibold text-slate-900">{category}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
