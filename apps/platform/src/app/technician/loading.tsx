export default function TechnicianLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="h-6 w-32 rounded bg-stone-200" />
      <div className="mt-1.5 h-4 w-48 rounded bg-stone-100" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded-full bg-stone-100" />
              <div className="h-4 w-16 rounded-full bg-stone-100" />
            </div>
            <div className="mt-3 h-4 w-40 rounded bg-stone-200" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded bg-stone-100" />
              <div className="h-3 w-3/4 rounded bg-stone-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
