import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { signOut } from "@fox/supabase/auth/actions";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/client/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  if (!profile?.organization_id) redirect("/client/signin");

  const { data: org } = await db
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .single();
  const orgName = (org?.name as string) ?? "Your company";

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <Link href="/client/dashboard" className="flex items-center gap-2">
            <img src="/fox-logo.png" alt="Fox" className="h-7 w-7" />
            <span className="font-[family-name:var(--font-heading)] text-[15px] font-bold tracking-[-0.03em] text-stone-900">
              Fox<span className="text-fox-orange">Network</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-stone-500">{orgName}</p>
              <p className="text-[11px] text-stone-400">{user.email}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-medium text-stone-600 transition-all hover:border-stone-300 hover:bg-stone-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-8">{children}</main>
    </div>
  );
}
