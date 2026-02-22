import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocations } from "@fox/supabase/actions/locations";
import { getProjects } from "@fox/supabase/actions/projects";
import { getActions } from "@fox/supabase/actions/actions";
import { getAssets } from "@fox/supabase/actions/assets";
import Link from "next/link";
import { MapPin, FolderKanban, Zap, Package } from "lucide-react";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/dashboard");

  const [
    { data: locations },
    { data: projects },
    { data: actions },
    { data: assets },
  ] = await Promise.all([
    getLocations(user.organizationId),
    getProjects(user.organizationId),
    getActions(user.organizationId),
    getAssets(user.organizationId),
  ]);

  const activeProjects = projects?.filter((p: Record<string, string>) => p.status === "active") ?? [];
  const pendingActions = actions?.filter((a: Record<string, string>) => a.status === "pending" || a.status === "scheduled") ?? [];

  const cards = [
    {
      label: "Total Locations",
      count: locations?.length ?? 0,
      href: "/dashboard/locations",
      icon: MapPin,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Projects",
      count: activeProjects.length,
      href: "/dashboard/projects",
      icon: FolderKanban,
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
    {
      label: "Pending Actions",
      count: pendingActions.length,
      href: "/dashboard/actions",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Total Assets",
      count: assets?.length ?? 0,
      href: "/dashboard/assets",
      icon: Package,
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-stone-400">
        Welcome back{user.email ? `, ${user.email}` : ""}.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:border-stone-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-stone-400">{card.label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">
                    {card.count.toLocaleString()}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
