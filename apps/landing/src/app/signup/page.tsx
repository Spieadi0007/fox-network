"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import { Building2, Wrench, CheckCircle2, ArrowLeft, Search, Loader2 } from "lucide-react";
import { GridBackground } from "@/components/ui/grid-background";
import {
  signUpCompany,
  submitPartnerRequest,
  signInWithOAuthCompany,
  completeCompanySetup,
} from "@fox/supabase/auth/actions";

type Step = "select" | "company-1" | "company-2" | "partner" | "partner-success";

interface PersonalInfo {
  name: string;
  email: string;
  password: string;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={`h-2.5 w-2.5 rounded-full ${
          current >= 1 ? "bg-fox-orange" : "bg-stone-200"
        }`}
      />
      <div
        className={`h-0.5 w-8 ${
          current >= 2 ? "bg-fox-orange" : "bg-stone-200"
        }`}
      />
      <div
        className={`h-2.5 w-2.5 rounded-full ${
          current >= 2 ? "bg-fox-orange" : "bg-stone-200"
        }`}
      />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-700"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

// --- Step: Select account type ---

function SelectView({ onSelect }: { onSelect: (type: "company" | "partner") => void }) {
  return (
    <div className="relative z-10 w-full max-w-2xl">
      <Link href="/" className="group mb-8 flex items-center justify-center gap-1.5">
        <img src="/fox-logo.png" alt="Fox" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-4deg]" />
        <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
          Fox<span className="text-fox-orange">Network</span>
        </span>
      </Link>

      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          How will you use FoxNetwork?
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Choose the option that best describes you.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("company")}
          className="group cursor-pointer rounded-2xl border border-stone-200/80 bg-white/80 p-8 text-left shadow-xl shadow-stone-200/40 backdrop-blur-xl transition-all duration-200 hover:border-fox-orange/40 hover:shadow-fox-orange/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 transition-colors group-hover:bg-fox-orange/10">
            <Building2 className="h-6 w-6 text-stone-600 transition-colors group-hover:text-fox-orange" />
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-bold text-stone-900">
            Company
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            I manage assets, facilities, or a maintenance team.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelect("partner")}
          className="group cursor-pointer rounded-2xl border border-stone-200/80 bg-white/80 p-8 text-left shadow-xl shadow-stone-200/40 backdrop-blur-xl transition-all duration-200 hover:border-fox-orange/40 hover:shadow-fox-orange/10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 transition-colors group-hover:bg-fox-orange/10">
            <Wrench className="h-6 w-6 text-stone-600 transition-colors group-hover:text-fox-orange" />
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-bold text-stone-900">
            Partner
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            I&apos;m a technician or contractor looking for work.
          </p>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-fox-orange transition-colors hover:text-fox-orange/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// --- Step: Company Step 1 (personal info — client-side only) ---

function CompanyStep1({
  onBack,
  onContinue,
  defaultValues,
}: {
  onBack: () => void;
  onContinue: (info: PersonalInfo) => void;
  defaultValues: PersonalInfo;
}) {
  return (
    <div className="relative z-10 w-full max-w-md">
      <Link href="/" className="group mb-8 flex items-center justify-center gap-1.5">
        <img src="/fox-logo.png" alt="Fox" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-4deg]" />
        <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
          Fox<span className="text-fox-orange">Network</span>
        </span>
      </Link>

      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />
          <StepIndicator current={1} />
        </div>

        <h1 className="mt-6 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Personal details for your company account.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            onContinue({
              name: fd.get("name") as string,
              email: fd.get("email") as string,
              password: fd.get("password") as string,
            });
          }}
          className="mt-6 space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={defaultValues.name}
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={defaultValues.email}
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              defaultValue={defaultValues.password}
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Continue
          </button>
        </form>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 px-2 text-stone-400">or</span>
          </div>
        </div>

        <div className="mt-6">
          <form action={() => signInWithOAuthCompany("google")}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-stone-200/80 bg-white px-5 py-3 text-sm font-medium text-stone-700 shadow-sm shadow-stone-200/20 transition-all duration-200 hover:border-stone-300 hover:bg-stone-50"
            >
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </button>
          </form>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-fox-orange transition-colors hover:text-fox-orange/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// --- Step: Company Step 2 (company details) ---

function CompanyStep2({
  onBack,
  error,
  personalInfo,
  isOAuth,
}: {
  onBack: () => void;
  error: string | null;
  personalInfo: PersonalInfo | null;
  isOAuth: boolean;
}) {
  const formAction = isOAuth ? completeCompanySetup : signUpCompany;

  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [isLooking, setIsLooking] = useState(false);
  const [looked, setLooked] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  async function handleLookup() {
    if (!companyName.trim()) return;
    setIsLooking(true);
    setLogoError(false);

    try {
      const res = await fetch("/api/company-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName.trim(), website: website.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.description) setDescription(data.description);
        if (data.industry) setIndustry(data.industry);
        if (data.logoUrl) setLogoUrl(data.logoUrl);
      }
    } catch {
      // Lookup failed — user fills manually
    } finally {
      setIsLooking(false);
      setLooked(true);
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      <Link href="/" className="group mb-8 flex items-center justify-center gap-1.5">
        <img src="/fox-logo.png" alt="Fox" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-4deg]" />
        <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
          Fox<span className="text-fox-orange">Network</span>
        </span>
      </Link>

      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />
          <StepIndicator current={2} />
        </div>

        <h1 className="mt-6 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          Tell us about your company
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Enter your company details and we&apos;ll fill in the rest.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Phase 1: Name + Website + Lookup */}
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-stone-700">
              Company name
            </label>
            <input
              id="companyName"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-stone-700">
              Website URL{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="https://acme.com"
            />
          </div>
          <button
            type="button"
            onClick={handleLookup}
            disabled={isLooking || !companyName.trim()}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-stone-200/80 bg-white px-5 py-3 text-sm font-medium text-stone-700 shadow-sm shadow-stone-200/20 transition-all duration-200 hover:border-fox-orange/40 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLooking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Looking up company...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Look up company
              </>
            )}
          </button>
        </div>

        {/* Phase 2: Preview + Editable fields */}
        {looked && (
          <form ref={formRef} action={formAction} className="mt-6 space-y-4">
            {/* Hidden fields for personal info (email signup) */}
            {!isOAuth && personalInfo && (
              <>
                <input type="hidden" name="name" value={personalInfo.name} />
                <input type="hidden" name="email" value={personalInfo.email} />
                <input type="hidden" name="password" value={personalInfo.password} />
              </>
            )}
            <input type="hidden" name="companyName" value={companyName} />
            <input type="hidden" name="website" value={website} />
            <input type="hidden" name="logoUrl" value={logoUrl} />

            {/* Company preview card */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <div className="flex items-center gap-3">
                {logoUrl && !logoError ? (
                  <img
                    src={logoUrl}
                    alt={`${companyName} logo`}
                    className="h-10 w-10 rounded-lg"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-200">
                    <Building2 className="h-5 w-5 text-stone-500" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-[family-name:var(--font-heading)] text-sm font-bold text-stone-900">
                    {companyName}
                  </p>
                  {website && (
                    <p className="truncate text-xs text-stone-400">{website}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-stone-700">
                Description{" "}
                <span className="font-normal text-stone-400">(editable)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
                placeholder="What does your company do?"
              />
            </div>

            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-stone-700">
                Company size
              </label>
              <select
                id="companySize"
                name="companySize"
                required
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              >
                <option value="" disabled>
                  Select size
                </option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-stone-700">
                Industry{" "}
                <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                id="industry"
                name="industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
                placeholder="e.g. Manufacturing, Healthcare"
              />
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Complete setup
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// --- Step: Partner form ---

function PartnerForm({
  onBack,
  error,
}: {
  onBack: () => void;
  error: string | null;
}) {
  return (
    <div className="relative z-10 w-full max-w-md">
      <Link href="/" className="group mb-8 flex items-center justify-center gap-1.5">
        <img src="/fox-logo.png" alt="Fox" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-4deg]" />
        <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
          Fox<span className="text-fox-orange">Network</span>
        </span>
      </Link>

      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
        <BackButton onClick={onBack} />

        <h1 className="mt-6 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          Join our partner network
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Tell us about yourself and we&apos;ll be in touch when opportunities match your skills.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={submitPartnerRequest} className="mt-6 space-y-4">
          <div>
            <label htmlFor="partner-name" className="block text-sm font-medium text-stone-700">
              Full name
            </label>
            <input
              id="partner-name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="partner-email" className="block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="partner-email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label htmlFor="partner-phone" className="block text-sm font-medium text-stone-700">
              Phone{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="partner-phone"
              name="phone"
              type="tel"
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label htmlFor="partner-trade" className="block text-sm font-medium text-stone-700">
              Trade / specialty
            </label>
            <input
              id="partner-trade"
              name="trade"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="e.g. HVAC, Electrical, Plumbing"
            />
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Submit application
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-fox-orange transition-colors hover:text-fox-orange/80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// --- Step: Partner success ---

function PartnerSuccess() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <Link href="/" className="group mb-8 flex items-center justify-center gap-1.5">
        <img src="/fox-logo.png" alt="Fox" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-4deg]" />
        <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
          Fox<span className="text-fox-orange">Network</span>
        </span>
      </Link>

      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
            Application submitted
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Thanks for your interest! We&apos;ll review your application and be in touch when
            opportunities match your skills.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Main orchestrator ---

function SignUpFlow() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step") as Step | null;
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  // Personal info collected in step 1 (client-side only)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
    password: "",
  });

  // Whether user arrived at step 2 via OAuth (already authenticated)
  const [isOAuth, setIsOAuth] = useState(false);

  const [step, setStep] = useState<Step>(() => {
    if (success === "partner_submitted") return "partner-success";
    // OAuth returning to company-2
    if (stepParam === "company-2") return "company-2";
    if (stepParam === "company-1") return "company-1";
    if (stepParam === "partner") return "partner";
    return "select";
  });

  // Sync step from URL changes (e.g. OAuth redirect back with ?step=company-2)
  useEffect(() => {
    if (success === "partner_submitted") {
      setStep("partner-success");
      return;
    }
    if (stepParam === "company-2") {
      setIsOAuth(true);
      setStep("company-2");
    } else if (stepParam === "company-1") {
      setStep("company-1");
    } else if (stepParam === "partner") {
      setStep("partner");
    }
  }, [stepParam, success]);

  // Show email confirmation for company signup
  if (success && success !== "partner_submitted") {
    return (
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="group mb-8 flex items-center justify-center gap-1.5">
          <img src="/fox-logo.png" alt="Fox" className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-4deg]" />
          <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
            Fox<span className="text-fox-orange">Network</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <h1 className="mt-5 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-stone-500">{success}</p>
            <Link
              href="/signin"
              className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  switch (step) {
    case "select":
      return (
        <SelectView
          onSelect={(type) =>
            setStep(type === "company" ? "company-1" : "partner")
          }
        />
      );
    case "company-1":
      return (
        <CompanyStep1
          onBack={() => setStep("select")}
          onContinue={(info) => {
            setPersonalInfo(info);
            setIsOAuth(false);
            setStep("company-2");
          }}
          defaultValues={personalInfo}
        />
      );
    case "company-2":
      return (
        <CompanyStep2
          onBack={() => isOAuth ? setStep("select") : setStep("company-1")}
          error={error}
          personalInfo={personalInfo}
          isOAuth={isOAuth}
        />
      );
    case "partner":
      return (
        <PartnerForm
          onBack={() => setStep("select")}
          error={error}
        />
      );
    case "partner-success":
      return <PartnerSuccess />;
  }
}

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <GridBackground />
      <Suspense>
        <SignUpFlow />
      </Suspense>
    </div>
  );
}
