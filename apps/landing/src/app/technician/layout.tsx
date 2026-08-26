import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { signOut } from "@fox/supabase/auth/actions";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("name, role, organization_id")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "technician") redirect("/dashboard");

  const firstName = (profile?.name as string)?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Mobile-first: constrain to a phone-ish column */}
      <div className="mx-auto min-h-screen max-w-md bg-stone-50 shadow-xl">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-5 py-3.5">
            <Link href="/technician" className="flex items-center gap-2">
              <img src="/fox-logo.png" alt="Fox" className="h-6 w-6" />
              <span className="font-[family-name:var(--font-heading)] text-sm font-bold tracking-[-0.03em] text-stone-900">
                Fox<span className="text-fox-orange">Field</span>
              </span>
            </Link>
            <form action={signOut}>
              <SubmitButton
                className="text-xs font-medium text-stone-400 transition-colors hover:text-stone-700"
              >
                Sign out
              </SubmitButton>
            </form>
          </div>
        </header>

        <main className="px-5 pb-16 pt-5" data-first-name={firstName}>
          {children}
        </main>
      </div>
    </div>
  );
}
