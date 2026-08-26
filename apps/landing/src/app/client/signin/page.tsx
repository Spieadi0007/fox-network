"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GridBackground } from "@/components/marketing/grid-background";
import { signInClient } from "@fox/supabase/auth/actions";
import { SubmitButton } from "@/components/ui/submit-button";

function SignInForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="relative z-10 w-full max-w-md">
      <Link
        href="/"
        className="group mb-8 flex items-center justify-center gap-1.5"
      >
        <img
          src="/fox-logo.png"
          alt="Fox"
          className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-4deg]"
        />
        <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
          Fox<span className="text-fox-orange">Network</span>
        </span>
      </Link>

      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          Sign in to FoxNetwork
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Welcome back. Continue to your client dashboard.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={signInClient} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="••••••••"
            />
          </div>
          <SubmitButton
            pendingLabel="Signing in…"
            className="w-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Sign in
          </SubmitButton>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        No account yet?{" "}
        <Link
          href="/client/signup"
          className="font-medium text-fox-orange transition-colors hover:text-fox-orange/80"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function ClientSignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <GridBackground />
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
