/**
 * Minimal Postmark transport.
 *
 * Postmark's send endpoint is a single JSON POST, so this talks to it with
 * fetch rather than pulling in the SDK — one less dependency to keep current,
 * and the error shape is the only part we care about.
 *
 * Sending must never take down the thing that triggered it: an invitation
 * whose email failed is still a valid invitation, so callers get a result
 * object rather than an exception.
 */

const POSTMARK_ENDPOINT = "https://api.postmarkapp.com/email";

export type SendResult =
  | { sent: true }
  | { sent: false; reason: string; skipped?: boolean };

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Postmark groups broadcast and transactional mail into separate streams. */
  messageStream?: string;
};

export async function sendEmail(email: Email): Promise<SendResult> {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  const from = process.env.POSTMARK_FROM_EMAIL;

  // Not configured is a normal state in local development and on a preview
  // deploy. Say so plainly and let the caller carry on.
  if (!token || !from) {
    const missing = [
      !token && "POSTMARK_SERVER_TOKEN",
      !from && "POSTMARK_FROM_EMAIL",
    ]
      .filter(Boolean)
      .join(" and ");
    return { sent: false, skipped: true, reason: `${missing} is not set` };
  }

  try {
    const response = await fetch(POSTMARK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Postmark-Server-Token": token,
      },
      body: JSON.stringify({
        From: from,
        To: email.to,
        Subject: email.subject,
        HtmlBody: email.html,
        TextBody: email.text,
        MessageStream: email.messageStream ?? "outbound",
      }),
    });

    if (response.ok) return { sent: true };

    // Postmark returns 4xx with {ErrorCode, Message}. The codes worth naming
    // are the ones a developer can act on; everything else passes through.
    const body = (await response.json().catch(() => null)) as
      | { ErrorCode?: number; Message?: string }
      | null;

    return { sent: false, reason: describePostmarkError(response.status, body) };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { sent: false, reason: `Could not reach Postmark: ${message}` };
  }
}

function describePostmarkError(
  status: number,
  body: { ErrorCode?: number; Message?: string } | null,
): string {
  const detail = body?.Message ?? `HTTP ${status}`;

  switch (body?.ErrorCode) {
    case 10:
      return `Postmark rejected the server token. Check POSTMARK_SERVER_TOKEN is the Server API token from the server's API Tokens tab, not the Account token or the server ID. (${detail})`;
    case 300:
      return `Postmark rejected the message. Usually the recipient address is malformed. (${detail})`;
    case 400:
      return `Postmark has not approved ${process.env.POSTMARK_FROM_EMAIL} as a sender. Verify the address, or the foxnetwork.io domain, under Sender Signatures. (${detail})`;
    case 405:
      return `Postmark has this account on approval hold — new accounts can only send to addresses on the same domain until approved. (${detail})`;
    case 406:
      return `The recipient is on Postmark's suppression list, so it will not deliver to them. (${detail})`;
    default:
      return `Postmark returned an error: ${detail}`;
  }
}
