import { requireAuthenticatedUser } from "@/lib/auth/guards";

export default async function AccountPage() {
  const profile = await requireAuthenticatedUser();

  if (!profile) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-900 text-white font-medium">
                  Profile
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700">
                  Orders
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700">
                  Addresses
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700">
                  Wishlist
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700">
                  Settings
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">
                Profile Information
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.full_name ?? ""}
                      disabled
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profile.role}
                      disabled
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-600 capitalize"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.id}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone ?? ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-600"
                  />
                </div>

                <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
