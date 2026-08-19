"use client";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">
          Sign In to Fixora
        </h1>
        <p className="text-slate-600 mb-6">
          Access your account and manage your orders
        </p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-slate-900 font-semibold">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
