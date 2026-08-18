import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center justify-center min-h-screen px-4">
        {children}
      </div>
    </div>
  );
}
