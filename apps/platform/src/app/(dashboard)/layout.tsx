import { getAuthUser } from "@/lib/auth";
import { signOut } from "@fox/supabase/auth/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-stone-200 bg-stone-50">
        <div className="flex items-center gap-1.5 border-b border-stone-200 px-5 py-4">
          <img src="/fox-logo.png" alt="Fox" className="h-8 w-8" />
          <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
            Fox<span className="text-fox-orange">Network</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4">
          <a
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Dashboard
          </a>
        </nav>

        {/* User info */}
        <div className="border-t border-stone-200 px-4 py-3">
          <p className="truncate text-sm font-medium text-stone-900">
            {user?.email}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium capitalize text-stone-700">
              {user?.role}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="cursor-pointer text-xs text-stone-500 hover:text-stone-700"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
