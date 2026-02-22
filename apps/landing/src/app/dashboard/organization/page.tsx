import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrganization } from "@fox/supabase/actions/organizations";
import { OrganizationSettings } from "./organization-settings";

export default async function OrganizationPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/dashboard");
  if (user.role !== "admin") redirect("/dashboard");

  const { data: org } = await getOrganization(user.organizationId);
  if (!org) redirect("/dashboard");

  return (
    <div className="p-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
        Organization
      </h1>
      <p className="text-sm text-stone-400 mt-1">
        Manage your organization&apos;s profile and branding.
      </p>
      <div className="mt-6">
        <OrganizationSettings org={org} />
      </div>
    </div>
  );
}
