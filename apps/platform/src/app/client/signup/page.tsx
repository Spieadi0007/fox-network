"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GridBackground } from "@/components/grid-background";
import {
  signUpClient,
  signInWithOAuthClient,
  completeClientSetup,
} from "@fox/supabase/auth/actions";
import { GoogleIcon } from "@/components/google-icon";
import { SubmitButton } from "@/components/ui/submit-button";

const inputCls =
  "mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange";

function Wordmark() {
  return (
    <Link href="/" className="group mb-8 flex items-center justify-center gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/fox-logo.png"
        alt="Fox"
        className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-4deg]"
      />
      <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
        Fox<span className="text-fox-orange">Network</span>
      </span>
    </Link>
  );
}

function SignUpForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");
  const step = searchParams.get("step");

  // Back from Google. The account exists, but it has no organisation: OAuth
  // hands over a name and an email and nothing else, so the one thing the
  // password form collects up front has to be asked here instead. Anyone who
  // already has an organisation never sees this — middleware sends them
  // straight to their dashboard.
  if (step === "company") {
    return (
      <div className="relative z-10 w-full max-w-md">
        <Wordmark />

        <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
            One last thing
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            What should we call your workspace? You can change it later in
            settings.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form action={completeClientSetup} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-stone-700"
              >
                Company name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                autoFocus
                className={inputCls}
                placeholder="Acme Locker Networks"
              />
            </div>
            <SubmitButton
              pendingLabel="Setting up…"
              className="w-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Finish setup
            </SubmitButton>
          </form>
        </div>
      </div>
    );
  }

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
          Create your client account
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Set up access, then book your first intervention in minutes.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form action={signUpClient} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-stone-700"
            >
              Company name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="Acme Locker Networks"
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700"
            >
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700"
            >
              Work email
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
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="At least 8 characters"
            />
          </div>
          <SubmitButton
            pendingLabel="Creating account…"
            className="w-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Create account
          </SubmitButton>
        </form>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 px-2 text-stone-400">or</span>
          </div>
        </div>

        <form
          action={() => signInWithOAuthClient("google")}
          className="mt-6"
        >
          <SubmitButton className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-stone-200/80 bg-white px-5 py-3 text-sm font-medium text-stone-700 shadow-sm shadow-stone-200/20 transition-all duration-200 hover:border-stone-300 hover:bg-stone-50">
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </SubmitButton>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link
          href="/client/signin"
          className="font-medium text-fox-orange transition-colors hover:text-fox-orange/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ClientSignUpPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <GridBackground />
      <Suspense>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
