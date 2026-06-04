import Link from "next/link";
import { Suspense } from "react";
import { GridBackground } from "@/components/marketing/grid-background";
import { submitQuote } from "@fox/supabase/auth/actions";
import { CheckCircle2, ArrowLeft } from "lucide-react";

const labelCls = "block text-sm font-medium text-stone-700";
const inputCls =
  "mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange";

async function QuoteInner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; intent?: string }>;
}) {
  const { error, success, intent } = await searchParams;
  const isWaitlist = intent === "waitlist";
  const title = isWaitlist ? "Join the waitlist" : "Get a quote";
  const subtitle = isWaitlist
    ? "We're expanding beyond Île-de-France. Tell us about your network and we'll reach out as soon as we cover your area."
    : "Tell us about your network and we'll send you tailored pricing.";

  if (success) {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 text-center shadow-xl shadow-stone-200/40 backdrop-blur-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          Thanks — we&apos;re on it
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          We&apos;ll review your network and email you a tailored quote shortly.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-fox-orange hover:text-fox-orange/80"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-stone-500">{subtitle}</p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={submitQuote} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelCls}>
            Your name
          </label>
          <input id="name" name="name" type="text" required className={inputCls} placeholder="Jane Doe" />
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>
            Work email
          </label>
          <input id="email" name="email" type="email" required className={inputCls} placeholder="jane@company.com" />
        </div>
        <div>
          <label htmlFor="companyName" className={labelCls}>
            Company name
          </label>
          <input id="companyName" name="companyName" type="text" required className={inputCls} placeholder="Acme Networks" />
        </div>
        <div>
          <label htmlFor="networkSize" className={labelCls}>
            Network size{" "}
            <span className="font-normal text-stone-400">
              (number of assets to manage)
            </span>
          </label>
          <select
            id="networkSize"
            name="networkSize"
            required
            defaultValue=""
            className={inputCls}
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="10">Up to 10</option>
            <option value="50">Up to 50</option>
            <option value="100">Up to 100</option>
            <option value="500">Up to 500</option>
            <option value="1000+">1000+</option>
          </select>
        </div>
        <div>
          <label htmlFor="notes" className={labelCls}>
            What are you hoping we can help with?{" "}
            <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className={inputCls}
            placeholder="e.g. preventive maintenance across our locker network, faster response on outages…"
          />
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
        >
          Request quote
        </button>
      </form>
    </div>
  );
}

export default function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <GridBackground />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Suspense>
          <QuoteInner searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
