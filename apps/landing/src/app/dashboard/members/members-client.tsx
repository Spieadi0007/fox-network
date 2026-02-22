"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, UserPlus, Shield, ShieldCheck, Wrench, Eye, X } from "lucide-react";
import {
  inviteMember,
  updateMemberRole,
  removeMember,
  revokeInvitation,
} from "@fox/supabase/actions/members";

type Member = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  avatar_url: string | null;
  created_at: string;
};

type Invitation = {
  id: string;
  email: string;
  name: string | null;
  role: AppRole;
  status: string;
  created_at: string;
};

type AppRole = "admin" | "manager" | "technician" | "viewer";

const ROLES: { value: AppRole; label: string; icon: typeof Shield }[] = [
  { value: "admin", label: "Admin", icon: Shield },
  { value: "manager", label: "Manager", icon: ShieldCheck },
  { value: "technician", label: "Technician", icon: Wrench },
  { value: "viewer", label: "Viewer", icon: Eye },
];

const roleBadgeClasses: Record<AppRole, string> = {
  admin: "bg-stone-900 text-white",
  manager: "bg-blue-100 text-blue-700",
  technician: "bg-amber-100 text-amber-700",
  viewer: "bg-stone-100 text-stone-600",
};

function getInitial(name: string | null, email: string) {
  return (name?.[0] ?? email[0]).toUpperCase();
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function MembersClient({
  members,
  invitations,
  currentUserId,
  userRole,
  orgId,
}: {
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
  userRole: string;
  orgId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("viewer");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const isAdmin = userRole === "admin";
  const canInvite = userRole === "admin" || userRole === "manager";

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviteError(null);
    startTransition(async () => {
      const { error } = await inviteMember(
        orgId,
        currentUserId,
        inviteEmail.trim().toLowerCase(),
        inviteName.trim() || null,
        inviteRole
      );
      if (error) {
        setInviteError(error.message);
      } else {
        setInviteOpen(false);
        setInviteEmail("");
        setInviteName("");
        setInviteRole("viewer");
        router.refresh();
      }
    });
  }

  function handleRoleChange(memberId: string, role: AppRole) {
    setError(null);
    startTransition(async () => {
      const { error } = await updateMemberRole(currentUserId, memberId, orgId, role);
      if (error) {
        setError(error.message);
      } else {
        router.refresh();
      }
    });
  }

  function handleRemove() {
    if (!memberToRemove) return;
    setError(null);
    startTransition(async () => {
      const { error } = await removeMember(currentUserId, memberToRemove.id, orgId);
      if (error) {
        setError(error.message);
      } else {
        setRemoveDialogOpen(false);
        setMemberToRemove(null);
        router.refresh();
      }
    });
  }

  function handleRevoke(invitationId: string) {
    startTransition(async () => {
      await revokeInvitation(invitationId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Members"
        description="Manage your team members and invitations."
        action={
          canInvite ? (
            <Button
              onClick={() => setInviteOpen(true)}
              className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800"
            >
              <UserPlus className="mr-1.5 h-4 w-4" />
              Invite Member
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {members.length > 0 ? (
        <>
          {/* Active Members Table */}
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
                    Member
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
                    Joined
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-400">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {members.map((member) => {
                  const isCurrentUser = member.id === currentUserId;
                  return (
                    <tr key={member.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-600">
                            {getInitial(member.name, member.email)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-stone-900">
                              {member.name ?? "Unnamed"}
                              {isCurrentUser && (
                                <span className="ml-1.5 text-xs font-normal text-stone-400">(you)</span>
                              )}
                            </p>
                            <p className="truncate text-xs text-stone-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`${roleBadgeClasses[member.role]} border-0 text-[11px] font-medium capitalize`}
                        >
                          {member.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-400">
                        {timeAgo(member.created_at)}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          {!isCurrentUser ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-xs" className="text-stone-400 hover:text-stone-600">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>Change role</DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    {ROLES.map((r) => {
                                      const Icon = r.icon;
                                      return (
                                        <DropdownMenuItem
                                          key={r.value}
                                          disabled={member.role === r.value}
                                          onClick={() => handleRoleChange(member.id, r.value)}
                                        >
                                          <Icon className="h-3.5 w-3.5" />
                                          {r.label}
                                        </DropdownMenuItem>
                                      );
                                    })}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => {
                                    setMemberToRemove(member);
                                    setRemoveDialogOpen(true);
                                  }}
                                >
                                  Remove member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-stone-300">&mdash;</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-stone-700">
                Pending Invitations ({invitations.length})
              </h3>
              <div className="overflow-hidden rounded-xl border border-dashed border-stone-200 bg-white">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50/50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
                        Invited
                      </th>
                      {isAdmin && (
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-400">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {invitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-stone-900">
                              {inv.email}
                            </p>
                            {inv.name && (
                              <p className="truncate text-xs text-stone-400">{inv.name}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`${roleBadgeClasses[inv.role]} border-0 text-[11px] font-medium capitalize`}
                          >
                            {inv.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-400">
                          {timeAgo(inv.created_at)}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-stone-400 hover:text-red-600"
                              disabled={isPending}
                              onClick={() => handleRevoke(inv.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                              Revoke
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No members yet"
          description="Invite your first team member to get started."
          action={
            canInvite ? (
              <Button
                onClick={() => setInviteOpen(true)}
                className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800"
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Invite Member
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
                <UserPlus className="h-5 w-5 text-stone-600" />
              </div>
              <div>
                <DialogTitle className="font-[family-name:var(--font-heading)]">
                  Invite member
                </DialogTitle>
                <DialogDescription>
                  They&apos;ll auto-join your org when they sign up.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {inviteError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {inviteError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="name@example.com"
                className="h-12 rounded-xl border-stone-200 px-4 text-sm placeholder:text-stone-400 shadow-none"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-name">Name (optional)</Label>
              <Input
                id="invite-name"
                placeholder="John Doe"
                className="h-12 rounded-xl border-stone-200 px-4 text-sm placeholder:text-stone-400 shadow-none"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                <SelectTrigger className="data-[size=default]:h-12 rounded-xl border-stone-200 px-4 w-full text-sm shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setInviteOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={isPending || !inviteEmail.trim()}
              className="rounded-xl bg-stone-900 text-white hover:bg-stone-800"
            >
              {isPending ? "Inviting..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="font-[family-name:var(--font-heading)]">
                  Remove member
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove{" "}
                  <span className="font-medium text-stone-900">
                    {memberToRemove?.name ?? memberToRemove?.email}
                  </span>
                  ? They will lose access to all resources.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setRemoveDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleRemove}
              disabled={isPending}
            >
              {isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
