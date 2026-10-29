import posthog from "posthog-js";
import { POSTHOG_HOST } from "@/lib/posthog";

/**
 * PostHog, started once in the browser before the page hydrates.
 *
 * Cookieless on purpose: `persistence: "memory"` keeps nothing on the
 * visitor's device, so there is nothing to ask consent for under the
 * ePrivacy rules the CNIL enforces, and no banner. The price is that a
 * visitor who comes back tomorrow counts as new — fine for counting visits,
 * which is what this is for.
 *
 * Events go to /ingest on our own domain and are forwarded to PostHog by the
 * rewrite in next.config.ts, so ad blockers that block posthog.com don't
 * silently drop a large share of visits.
 *
 * Without NEXT_PUBLIC_POSTHOG_KEY nothing starts, so local dev and previews
 * don't pollute the numbers unless someone sets it on purpose.
 */
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: "/ingest",
    ui_host: POSTHOG_HOST.replace(".i.posthog.com", ".posthog.com"),
    persistence: "memory",
    // Every route change counts, not just full loads: the site navigates
    // client-side between pages and locales.
    capture_pageview: "history_change",
    capture_pageleave: true,
    person_profiles: "identified_only",
  });
}
