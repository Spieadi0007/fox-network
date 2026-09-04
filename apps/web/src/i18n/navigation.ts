import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware replacements for next/link and the navigation hooks. Importing
// these instead of the next/* originals is what keeps the active locale on a
// URL when a visitor moves around the site.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
