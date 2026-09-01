import { requireRole } from "@/lib/auth/guards";

export default async function SellerDashboard() {
  await requireRole(["seller"]);

  const stats = [
    { label: "My Products", value: "45", icon: "📦" },
    { label: "Pending Orders", value: "12", icon: "📋" },
    { label: "Monthly Sales", value: "$8,234", icon: "💰" },
    { label: "Rating", value: "4.8/5", icon: "⭐" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-slate-900">
        Seller Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200 rounded-lg p-6"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-slate-600 text-sm font-medium">
              {stat.label}
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">
            Recent Orders
          </h2>
          <div className="text-slate-600 text-center py-8">
            No recent orders
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <button className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800">
              Add New Product
            </button>
            <button className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
