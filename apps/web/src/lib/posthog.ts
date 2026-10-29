/**
 * PostHog's ingestion host for the project's region. EU by default: the
 * visitors are mostly French, and EU hosting keeps their data in the EU.
 * Set NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com for a US project.
 */
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

/** Where PostHog serves its scripts: eu.i.posthog.com → eu-assets.i.posthog.com. */
export const POSTHOG_ASSETS_HOST = POSTHOG_HOST.replace(
  /^https:\/\/(\w+)\.i\.posthog\.com/,
  "https://$1-assets.i.posthog.com",
);
