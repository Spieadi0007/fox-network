// Turning an Anthropic API failure into something a manager can act on.
//
// Every one of these used to surface as "Could not read the SOP", which is
// true and useless: an expired card, a missing environment variable and a
// genuinely unreadable PDF all looked identical, and only the last one is
// the manager's problem to solve.
//
// Deliberately shape-based rather than `instanceof Anthropic.APIError`. A
// monorepo can resolve more than one copy of the SDK, and the copy that
// throws inside a bundled server route need not be the copy this module
// imported — in which case `instanceof` is quietly false and every failure
// falls back to the generic message again.

export type ApiFailure = { message: string; status: number };

type MaybeApiError = {
  status?: unknown;
  message?: unknown;
  error?: { error?: { message?: unknown } };
};

export function describeApiError(e: unknown): ApiFailure | null {
  if (!e || typeof e !== "object") return null;

  const err = e as MaybeApiError;
  const status = typeof err.status === "number" ? err.status : 0;
  // The SDK nests the API's own message inside the response envelope; its
  // top-level `message` is that envelope stringified, so either can match.
  const detail = `${err.error?.error?.message ?? ""} ${err.message ?? ""}`;

  // Not an HTTP failure from the API at all.
  if (status === 0) return null;

  if (/credit balance is too low|insufficient.*credit/i.test(detail)) {
    return {
      message:
        "The Anthropic account has run out of credit, so the SOP could not be read. Top it up in the Anthropic console and try again — nothing has been saved.",
      status: 502,
    };
  }

  if (status === 401 || /invalid x-api-key|authentication_error/i.test(detail)) {
    return {
      message:
        "The Anthropic API key is missing or invalid, so the SOP could not be read. Check ANTHROPIC_API_KEY in the deployment settings.",
      status: 502,
    };
  }

  if (status === 429) {
    return {
      message:
        "The Anthropic API is rate limiting us. Wait a minute and try again — nothing has been saved.",
      status: 503,
    };
  }

  if (status >= 500) {
    return {
      message:
        "The Anthropic API is temporarily unavailable. Try again shortly — nothing has been saved.",
      status: 503,
    };
  }

  // A 400 we do not recognise is usually our own request being wrong, which
  // is not something the manager can fix — let it fall through.
  return null;
}
