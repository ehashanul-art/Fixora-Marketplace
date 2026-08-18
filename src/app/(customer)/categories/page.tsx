export default function CategoriesPage() {
  const categories = [
    { id: 1, name: "Electronics", count: 245, icon: "📱" },
    { id: 2, name: "Appliances", count: 189, icon: "🍳" },
    { id: 3, name: "Furniture", count: 342, icon: "🪑" },
    { id: 4, name: "Smart Home", count: 156, icon: "🏠" },
    { id: 5, name: "Lighting", count: 213, icon: "💡" },
    { id: 6, name: "Tools", count: 178, icon: "🔧" },
    { id: 7, name: "Building Materials", count: 267, icon: "🧱" },
    { id: 8, name: "Office Equipment", count: 134, icon: "💼" },
    { id: 9, name: "CCTV & Security", count: 98, icon: "📹" },
    { id: 10, name: "Electrical", count: 201, icon: "⚡" },
  ];

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Categories</h1>
        <p className="text-slate-600 mb-8">
          Explore products by category
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {category.name}
              </h3>
              <p className="text-slate-600">
                {category.count} products
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
