import { getAuthUser } from "@/lib/auth";
import { getOrganization } from "@fox/supabase/actions/organizations";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  let org: { name: string; logo_url: string | null } | null = null;
  if (user?.organizationId) {
    const { data } = await getOrganization(user.organizationId);
    org = data;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={{ email: user?.email ?? "", role: user?.role ?? "viewer" }}
        org={org ? { name: org.name, logoUrl: org.logo_url } : null}
      />
      <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
    </div>
  );
}
