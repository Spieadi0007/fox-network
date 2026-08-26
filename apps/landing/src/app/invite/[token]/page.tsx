import type { Metadata } from "next";
import Link from "next/link";
import { GridBackground } from "@/components/marketing/grid-background";
import { SubmitButton } from "@/components/ui/submit-button";
import { getInvitation, acceptInvitation } from "@fox/supabase/auth/actions";

export const metadata: Metadata = {
  title: "Accept your invitation — FoxNetwork",
  robots: { index: false, follow: false },
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  technician: "Technician",
  viewer: "Viewer",
};

// Reached from an emailed link by someone who has no account yet, so this
// route sits outside the middleware matcher and does its own checking.
export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const invitation = await getInvitation(token);

  if (!invitation) {
    return (
      <Shell>
        <Dead
          title="This link isn't valid"
          body="The invitation may have been withdrawn, or the link may have been copied incompletely. Ask whoever invited you to send a new one."
        />
      </Shell>
    );
  }

  if (invitation.status === "revoked") {
    return (
      <Shell>
        <Dead
          title="This invitation was withdrawn"
          body={`${invitation.organizationName} has revoked this invitation. Get in touch with them if you think that's a mistake.`}
        />
      </Shell>
    );
  }

  if (invitation.status === "accepted") {
    return (
      <Shell>
        <Dead
          title="You've already accepted this"
          body="Your account is set up — sign in to get to work."
          action={{ href: "/signin", label: "Sign in" }}
        />
      </Shell>
    );
  }

  if (invitation.isExpired) {
    return (
      <Shell>
        <Dead
          title="This invitation has expired"
          body={`Invitations are good for 14 days. Ask ${invitation.organizationName} to send you a fresh one.`}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          Join {invitation.organizationName}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          You&rsquo;ve been invited as a{" "}
          <span className="font-medium text-stone-900">
            {ROLE_LABELS[invitation.role] ?? invitation.role}
          </span>
          . Set a password and you&rsquo;re in.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={acceptInvitation} className="mt-6 space-y-4">
          <input type="hidden" name="token" value={token} />

          {/* Shown, but not editable: the account is created for the address
              the invitation was sent to, and nothing else. */}
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Email
            </label>
            <p className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-500">
              {invitation.email}
            </p>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700"
            >
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={invitation.name ?? ""}
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="Alex Fletcher"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700"
            >
              Choose a password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
              placeholder="At least 8 characters"
            />
          </div>

          <SubmitButton
            pendingLabel="Setting up…"
            className="w-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Accept invitation
          </SubmitButton>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have a FoxNetwork account?{" "}
        <Link
          href="/signin"
          className="font-medium text-fox-orange transition-colors hover:text-fox-orange/80"
        >
          Sign in
        </Link>{" "}
        and you&rsquo;ll be added automatically.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <GridBackground />
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="group mb-8 flex items-center justify-center gap-1.5"
        >
          <img
            src="/fox-logo.png"
            alt="Fox"
            className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-4deg]"
          />
          <span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em] text-stone-900">
            Fox<span className="text-fox-orange">Network</span>
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}

/** An invitation that cannot be accepted, and why. */
function Dead({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 text-center shadow-xl shadow-stone-200/40 backdrop-blur-xl">
      <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-stone-900">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-stone-500">{body}</p>
      <Link
        href={action?.href ?? "/"}
        className="mt-6 inline-block rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
      >
        {action?.label ?? "Back to FoxNetwork"}
      </Link>
    </div>
  );
}
