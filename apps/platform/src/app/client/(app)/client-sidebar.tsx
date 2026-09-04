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
    <aside className="flex w-64 shrink-0 flex-col border-r border-stone-200 bg-stone-50">
      <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-900 font-[family-name:var(--font-heading)] text-sm font-bold text-white">
          {initial}
        </div>
        <p className="min-w-0 flex-1 truncate font-[family-name:var(--font-heading)] text-sm font-bold tracking-[-0.02em] text-stone-900">
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
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-stone-200/70 text-stone-900"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>

              {/* Sub-items only while you are in that section — an always-open
                  tree makes a three-item sidebar feel like a filing cabinet. */}
              {children && active && (
                <div className="mt-1 space-y-0.5 border-l border-stone-200 pl-3 ml-5">
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
                            ? "font-medium text-stone-900"
                            : "text-stone-500 hover:text-stone-900",
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

      <div className="border-t border-stone-200 px-4 py-3">
        <p className="truncate text-sm font-medium text-stone-900">{email}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700">
            Client
          </span>
          <form action={signOut}>
            <SubmitButton className="cursor-pointer text-xs text-stone-500 hover:text-stone-700">
              Sign out
            </SubmitButton>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-stone-100 px-4 py-2.5">
        <img src="/fox-logo.png" alt="Fox" className="h-4 w-4" />
        <span className="font-[family-name:var(--font-heading)] text-[11px] font-semibold tracking-[-0.02em] text-stone-400">
          Fox<span className="text-fox-orange/60">Network</span>
        </span>
      </div>
    </aside>
  );
}
