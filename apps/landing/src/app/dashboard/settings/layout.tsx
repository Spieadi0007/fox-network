"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlidersHorizontal, ListChecks, LayoutTemplate } from "lucide-react";

const settingsNav = [
  { href: "/dashboard/settings/custom-fields", label: "Custom Fields", icon: SlidersHorizontal },
  { href: "/dashboard/settings/field-options", label: "Field Options", icon: ListChecks },
  { href: "/dashboard/settings/workflows", label: "Action Templates", icon: LayoutTemplate },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div>
      <div className="border-b border-stone-200 px-8 pt-6">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          Settings
        </h1>
        <nav className="flex gap-1 mt-4 -mb-px">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  active
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
