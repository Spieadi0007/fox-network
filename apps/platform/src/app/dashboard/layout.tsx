import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getOrganization } from "@fox/supabase/actions/organizations";
import { createServerClient } from "@fox/supabase/client/server";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user || !user.organizationId) {
    redirect("/signin");
  }

  let org: { name: string; logo_url: string | null } | null = null;
  const { data } = await getOrganization(user.organizationId);
  org = data;

  // Not in the middleware headers, so it costs one read. Only the sidebar
  // uses it — every invoice route checks fox_staff for itself.
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("fox_staff")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={{ email: user.email, role: user.role }}
        org={org ? { name: org.name, logoUrl: org.logo_url } : null}
        foxStaff={!!profile?.fox_staff}
      />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
