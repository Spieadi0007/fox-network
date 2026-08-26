"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@fox/supabase/auth/actions";
import {
  LayoutDashboard,
  MapPin,
  FolderKanban,
  Zap,
  Package,
  Users,
  Settings,
  Inbox,
  ChevronRight,
} from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/requests", label: "Requests", icon: Inbox },
  { href: "/dashboard/locations", label: "Locations", icon: MapPin },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/actions", label: "Actions", icon: Zap },
  { href: "/dashboard/assets", label: "Assets", icon: Package },
  { href: "/dashboard/members", label: "Members", icon: Users },
  { href: "/dashboard/settings/custom-fields", label: "Settings", icon: Settings, activePrefix: "/dashboard/settings" },
];

export function Sidebar({
  user,
  org,
}: {
  user: { email: string; role: string };
  org: { name: string; logoUrl: string | null } | null;
}) {
  const pathname = usePathname();

  function isActive(href: string, activePrefix?: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(activePrefix ?? href);
  }

  const orgInitial = (org?.name ?? "O")[0].toUpperCase();

  return (
    <aside className="flex w-64 flex-col border-r border-stone-200 bg-stone-50">
      {/* Organization branding */}
      <Link
        href="/dashboard/organization"
        className="flex items-center gap-3 border-b border-stone-200 px-5 py-4 group hover:bg-stone-100/50 transition-colors"
      >
        {org?.logoUrl ? (
          <img
            src={org.logoUrl}
            alt={org.name}
            className="h-9 w-9 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white font-[family-name:var(--font-heading)] text-sm font-bold">
            {orgInitial}
          </div>
        )}
        <p className="truncate font-[family-name:var(--font-heading)] text-sm font-bold tracking-[-0.02em] text-stone-900 min-w-0 flex-1">
          {org?.name ?? "Organization"}
        </p>
        <ChevronRight className="h-4 w-4 text-stone-300 shrink-0 group-hover:text-stone-500 transition-colors" />
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, (item as { activePrefix?: string }).activePrefix);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-stone-200/70 text-stone-900"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-stone-200 px-4 py-3">
        <p className="truncate text-sm font-medium text-stone-900">
          {user.email}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium capitalize text-stone-700">
            {user.role}
          </span>
          <form action={signOut}>
            <SubmitButton
              className="cursor-pointer text-xs text-stone-500 hover:text-stone-700"
            >
              Sign out
            </SubmitButton>
          </form>
        </div>
      </div>

      {/* Fox branding */}
      <div className="flex items-center justify-center gap-1.5 border-t border-stone-100 px-4 py-2.5">
        <img src="/fox-logo.png" alt="Fox" className="h-4 w-4" />
        <span className="font-[family-name:var(--font-heading)] text-[11px] font-semibold tracking-[-0.02em] text-stone-400">
          Fox<span className="text-fox-orange/60">Network</span>
        </span>
      </div>
    </aside>
  );
}
