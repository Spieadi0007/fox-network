/**
 * Placeholder shown while a page's server render is in flight.
 *
 * Deliberately neutral. A `loading.tsx` covers every route nested under its
 * segment, so a skeleton shaped like one specific page — four stat tiles, say
 * — is wrong on the twenty-seven others and reads as a broken render rather
 * than a pending one. A heading, a line of text and a block of content is
 * true of all of them.
 */
export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>

      <div className="h-7 w-48 rounded bg-stone-200" />
      <div className="mt-2.5 h-4 w-72 rounded bg-stone-100" />

      <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 bg-stone-50/60 px-5 py-3.5">
          <div className="h-3.5 w-32 rounded bg-stone-200" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-stone-100 px-5 py-4 last:border-b-0"
          >
            <div className="h-4 flex-1 rounded bg-stone-100" />
            <div className="hidden h-4 w-28 rounded bg-stone-100 sm:block" />
            <div className="h-5 w-20 rounded-full bg-stone-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
