import { Building2, Users } from "lucide-react";
import type { ClientAccountGroup } from "@fox/supabase/actions/staff-clients";

function initials(name: string | null, email: string) {
  return (name?.[0] ?? email[0]).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Read-only on purpose. These people belong to a client organisation, not to
 * ours — changing someone else's role or removing them is not something to
 * offer as a side effect of looking at a list.
 */
export function ClientAccounts({ groups }: { groups: ClientAccountGroup[] }) {
  const total = groups.reduce((sum, g) => sum + g.members.length, 0);

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-baseline justify-between gap-4 border-t border-stone-200 pt-6">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-stone-900">
            Client accounts
          </h2>
          <p className="mt-1 text-sm text-stone-400">
            Everyone signed in on the client side, across every company.
            Visible to FoxNetwork staff only.
          </p>
        </div>
        {total > 0 && (
          <span className="shrink-0 text-xs text-stone-400">
            {total} {total === 1 ? "person" : "people"} ·{" "}
            {groups.length} {groups.length === 1 ? "company" : "companies"}
          </span>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
          <Users className="mx-auto h-7 w-7 text-stone-300" />
          <p className="mt-3 text-sm font-medium text-stone-700">
            No client accounts yet
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Companies that sign up on the client side appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.organizationId}
              className="overflow-x-auto rounded-xl border border-stone-200 bg-white"
            >
              <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/50 px-4 py-3">
                <Building2 className="h-4 w-4 text-stone-400" />
                <p className="text-sm font-semibold text-stone-900">
                  {group.organizationName}
                </p>
                <span className="text-xs text-stone-400">
                  {group.members.length}
                </span>
              </div>

              <table className="w-full min-w-[520px]">
                <tbody className="divide-y divide-stone-100">
                  {group.members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-600">
                            {initials(member.name, member.email)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-stone-900">
                              {member.name ?? "—"}
                            </p>
                            <p className="truncate text-xs text-stone-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium capitalize text-stone-600">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-stone-400">
                        Joined {formatDate(member.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
