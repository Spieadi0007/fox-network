"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  FolderOpen,
  FileText,
  Wrench,
  Receipt,
} from "lucide-react";
import { signOut } from "@fox/supabase/auth/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/requests", label: "Requests", icon: ClipboardList },
  {
    href: "/client/library/sops",
    label: "Library",
    icon: FolderOpen,
    // Library is a section, not a page: the two children are the real
    // destinations, and either of them lights the parent.
    activePrefix: "/client/library",
    children: [
      { href: "/client/library/sops", label: "SOPs", icon: FileText },
      { href: "/client/library/spare-parts", label: "Spare parts", icon: Wrench },
    ],
  },
  { href: "/client/invoices", label: "Invoices", icon: Receipt },
] as const;

export function ClientSidebar({
  email,
  orgName,
}: {
  email: string;
  orgName: string;
}) {
  const pathname = usePathname();

  function isActive(href: string, prefix?: string) {
    const base = prefix ?? href;
    return pathname === base || pathname.startsWith(`${base}/`);
  }

  const initial = (orgName || "O")[0].toUpperCase();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-portal-border bg-portal-sunken">
      <div className="flex items-center gap-3 border-b border-portal-border px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-portal-text text-sm font-extrabold text-white">
          {initial}
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-portal-text">
          {orgName}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(
            item.href,
            (item as { activePrefix?: string }).activePrefix,
          );
          const children = (item as { children?: readonly { href: string; label: string; icon: typeof Icon }[] }).children;

          return (
            <div key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-portal-border bg-portal-surface text-portal-text shadow-[0_1px_4px_rgba(32,31,28,0.05)]"
                    : "border-transparent text-portal-dim hover:bg-portal-surface/60 hover:text-portal-text",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>

              {/* Sub-items only while you are in that section — an always-open
                  tree makes a three-item sidebar feel like a filing cabinet. */}
              {children && active && (
                <div className="mt-1 ml-5 space-y-0.5 border-l border-portal-border pl-3">
                  {children.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        aria-current={childActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors",
                          childActive
                            ? "font-bold text-portal-text"
                            : "text-portal-dim hover:text-portal-text",
                        )}
                      >
                        <ChildIcon className="h-3.5 w-3.5" />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-portal-border px-4 py-3">
        <p className="truncate text-sm font-semibold text-portal-text">{email}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full border border-portal-accent-border bg-portal-accent-bg px-2 py-0.5 text-[11px] font-bold text-portal-accent">
            Client
          </span>
          <form action={signOut}>
            <SubmitButton className="cursor-pointer text-xs font-medium text-portal-dim hover:text-portal-text">
              Sign out
            </SubmitButton>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-portal-border-soft px-4 py-2.5">
        <img src="/fox-logo.png" alt="Fox" className="h-4 w-4" />
        <span className="font-[family-name:var(--font-heading)] text-[11px] font-semibold tracking-[-0.02em] text-portal-muted">
          Fox<span className="text-fox-orange/60">Network</span>
        </span>
      </div>
    </aside>
  );
}
