import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next 16 renamed the middleware convention to `proxy`; next-intl's handler
// is just a request function, so it slots straight in.
//
// This is the only proxy the app has. apps/web serves nobody who is signed
// in, which is why the locale routing stays uncomplicated here and would not
// have inside the app that also guards /dashboard.
export default createMiddleware(routing);

export const config = {
  // Everything except Next internals, the API surface, and files with an
  // extension (the logo, og images, robots.txt).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
