"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, FolderOpen } from "lucide-react";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/requests", label: "Requests", icon: ClipboardList },
  { href: "/client/library", label: "Library", icon: FolderOpen },
] as const;

export function ClientNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-6xl gap-1 px-6 sm:px-8">
      {SECTIONS.map(({ href, label, icon: Icon }) => {
        // /client/requests/new and /client/requests/<id> are still Requests.
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "border-fox-orange text-stone-900"
                : "border-transparent text-stone-500 hover:border-stone-200 hover:text-stone-800",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
