import { redirect } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { getAuthUser } from "@/lib/auth";
import { ClientSidebar } from "./client-sidebar";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Identity comes from the headers middleware set, which already read it
  // to decide this request was allowed through. Asking Supabase again would
  // be two more round trips to Ireland for an answer we are holding.
  const user = await getAuthUser();
  if (!user?.organizationId) redirect("/client/signin");

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org } = await (supabase as any)
    .from("organizations")
    .select("name")
    .eq("id", user.organizationId)
    .single();

  return (
    <div className="flex min-h-screen bg-stone-50">
      <ClientSidebar
        email={user.email}
        orgName={(org?.name as string) ?? "Your company"}
      />
      <main className="min-w-0 flex-1 px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
