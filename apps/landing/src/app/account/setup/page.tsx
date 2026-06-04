import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { signOut } from "@fox/supabase/auth/actions";
import { GridBackground } from "@/components/marketing/grid-background";
import { Building2, UserRound, ArrowRight } from "lucide-react";

export default async function AccountSetupPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("account_type, role, organization_id")
    .eq("id", user.id)
    .single();

  // Already set up — send them to their real home.
  if (profile?.organization_id) {
    if (profile.account_type === "client") redirect("/client/dashboard");
    if (profile.role === "technician") redirect("/technician");
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <GridBackground />

      <div className="relative z-10 w-full max-w-lg">
        <Link href="/" className="mb-8 flex items-center justify-center gap-1.5">
          <img src="/fox-logo.png" alt="Fox" className="h-8 w-8" />
          <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
            Fox<span className="text-fox-orange">Network</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
            One last step
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            You&apos;re signed in as{" "}
            <span className="font-medium text-stone-700">{user.email}</span>, but
            your account isn&apos;t linked to an organization yet. Pick how
            you&apos;d like to continue.
          </p>

          <div className="mt-6 space-y-3">
            {/* Finish company setup */}
            <Link
              href="/signup?step=company-2"
              className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-fox-orange/40 hover:bg-fox-orange/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-fox-orange/10">
                <Building2 className="h-5 w-5 text-fox-orange" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-stone-900">
                  Finish setting up my company
                </p>
                <p className="text-xs text-stone-500">
                  Create your organization and open your dashboard.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-stone-300 transition-colors group-hover:text-fox-orange" />
            </Link>

            {/* Become a client */}
            <Link
              href="/client/signup"
              className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-stone-300 hover:bg-stone-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100">
                <UserRound className="h-5 w-5 text-stone-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-stone-900">
                  I&apos;m here to book maintenance
                </p>
                <p className="text-xs text-stone-500">
                  Set up a client account to request interventions.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-stone-300 transition-colors group-hover:text-stone-500" />
            </Link>
          </div>

          <div className="mt-6 border-t border-stone-100 pt-4 text-center">
            <form action={signOut}>
              <button
                type="submit"
                className="text-xs font-medium text-stone-400 transition-colors hover:text-stone-700"
              >
                Not you? Sign out
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          Stuck? Email{" "}
          <a
            href="mailto:contact@foxnetwork.io"
            className="font-medium text-stone-500 hover:text-stone-700"
          >
            contact@foxnetwork.io
          </a>
        </p>
      </div>
    </div>
  );
}
