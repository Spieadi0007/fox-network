import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { POSTHOG_ASSETS_HOST, POSTHOG_HOST } from "./src/lib/posthog";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Analytics go through our own domain (see src/instrumentation-client.ts).
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `${POSTHOG_ASSETS_HOST}/static/:path*` },
      { source: "/ingest/:path*", destination: `${POSTHOG_HOST}/:path*` },
    ];
  },
  // PostHog's API paths end in a slash; redirecting them would drop events.
  skipTrailingSlashRedirect: true,
};

export default withNextIntl(nextConfig);
