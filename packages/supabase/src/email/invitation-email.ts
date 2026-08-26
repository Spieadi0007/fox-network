import type { Email } from "./postmark";

/**
 * The invitation email.
 *
 * Written as inline-styled HTML with a plain-text twin: mail clients strip
 * <style> blocks and ignore external CSS, and a technician opening this on a
 * phone is the common case. The palette matches the app's stone/orange.
 */

export type InvitationEmailInput = {
  to: string;
  /** The invitee's name, if the inviter supplied one. */
  name: string | null;
  organizationName: string;
  inviterName: string | null;
  role: "admin" | "manager" | "technician" | "viewer";
  acceptUrl: string;
  expiresAt: Date;
};

const ROLE_DESCRIPTIONS: Record<InvitationEmailInput["role"], string> = {
  admin: "an admin, with full access to settings, people and billing",
  manager: "a manager, able to raise work, assign it and approve requests",
  technician: "a technician, carrying out visits and filing reports from the field",
  viewer: "a viewer, with read-only access to work and reports",
};

export function buildInvitationEmail(input: InvitationEmailInput): Email {
  const { organizationName, inviterName, role, acceptUrl, name } = input;

  const greeting = name ? `Hi ${name},` : "Hi,";
  const inviter = inviterName ? `${inviterName} has invited you` : "You have been invited";
  const roleLine = ROLE_DESCRIPTIONS[role];
  const expires = input.expiresAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subject = `${inviterName ? `${inviterName} invited you` : "You have been invited"} to join ${organizationName} on FoxNetwork`;

  const text = [
    greeting,
    "",
    `${inviter} to join ${organizationName} on FoxNetwork as ${roleLine}.`,
    "",
    "Accept the invitation and set up your account here:",
    acceptUrl,
    "",
    `This link expires on ${expires}.`,
    "",
    "If you weren't expecting this, you can ignore this email — nothing happens until you accept.",
    "",
    "— FoxNetwork",
  ].join("\n");

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;margin:0;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border:1px solid #e7e5e4;border-radius:14px;">
        <tr>
          <td style="padding:32px 32px 8px 32px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#1c1917;letter-spacing:-0.02em;">
              Fox<span style="color:#f97316;">Network</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 0 32px;">
            <p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#44403c;">${escapeHtml(greeting)}</p>
            <p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#44403c;">
              ${escapeHtml(inviter)} to join <strong style="color:#1c1917;">${escapeHtml(organizationName)}</strong> on FoxNetwork as ${escapeHtml(roleLine)}.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 8px 32px;">
            <a href="${escapeAttr(acceptUrl)}"
               style="display:inline-block;background-color:#1c1917;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 26px;border-radius:999px;">
              Accept invitation
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 32px 32px;">
            <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#78716c;">
              This link expires on ${escapeHtml(expires)}.
            </p>
            <p style="margin:12px 0 0 0;font-size:13px;line-height:1.6;color:#78716c;">
              If you weren&rsquo;t expecting this you can ignore this email &mdash; nothing happens until you accept.
            </p>
            <p style="margin:20px 0 0 0;font-size:12px;line-height:1.6;color:#a8a29e;word-break:break-all;">
              Button not working? Paste this into your browser:<br />${escapeHtml(acceptUrl)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

  return { to: input.to, subject, html, text };
}

// Organisation and inviter names are user-supplied, so they cannot go into
// the markup raw.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
