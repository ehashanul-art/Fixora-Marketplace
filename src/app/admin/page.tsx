import { requireRole } from "@/lib/auth/guards";

export default async function AdminDashboard() {
  await requireRole(["admin"]);

  const stats = [
    { label: "Total Products", value: "1,234", icon: "📦" },
    { label: "Total Orders", value: "567", icon: "📋" },
    { label: "Total Revenue", value: "$45,678", icon: "💰" },
    { label: "Active Users", value: "892", icon: "👥" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Dashboard</h1>

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

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-900">
          Recent Activity
        </h2>
        <div className="text-slate-600 text-center py-8">
          No recent activity
        </div>
      </div>
    </div>
  );
}
