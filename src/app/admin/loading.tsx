export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-8 px-4 py-8" aria-label="Loading marketplace workspace">
      <div className="h-10 w-72 rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-28 rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-72 rounded-xl border border-slate-200 bg-white" />
      <div className="h-96 rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
