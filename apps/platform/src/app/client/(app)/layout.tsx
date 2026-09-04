import { redirect } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { ClientSidebar } from "./client-sidebar";

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

  return (
    <div className="flex min-h-screen bg-stone-50">
      <ClientSidebar
        email={user.email ?? ""}
        orgName={(org?.name as string) ?? "Your company"}
      />
      <main className="min-w-0 flex-1 px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
