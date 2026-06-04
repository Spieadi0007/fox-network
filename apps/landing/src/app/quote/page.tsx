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
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

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
        Get a quote
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        Tell us about your network and we&apos;ll send you tailored pricing.
      </p>

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
          <input
            id="networkSize"
            name="networkSize"
            type="number"
            min="1"
            required
            className={inputCls}
            placeholder="e.g. 250"
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
