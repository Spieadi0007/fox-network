export default function DashboardLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-7 w-40 rounded bg-stone-200" />
      <div className="mt-2 h-4 w-64 rounded bg-stone-100" />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="h-4 w-24 rounded bg-stone-100" />
                <div className="mt-4 h-8 w-16 rounded bg-stone-200" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-stone-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
