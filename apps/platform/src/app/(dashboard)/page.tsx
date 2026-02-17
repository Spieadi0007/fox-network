import { getAuthUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getAuthUser();

  return (
    <div className="p-8">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-stone-900">
        Dashboard
      </h1>
      <p className="mt-2 text-stone-500">
        Welcome back{user?.email ? `, ${user.email}` : ""}.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-sm font-medium text-stone-500">Work Orders</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">—</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-sm font-medium text-stone-500">Assets</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">—</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-sm font-medium text-stone-500">Team Members</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">—</p>
        </div>
      </div>
    </div>
  );
}
