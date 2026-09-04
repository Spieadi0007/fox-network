// Fail if the French and English catalogs have drifted apart.
//
// A missing key does not crash the build — next-intl falls back and the page
// renders with a raw key or the other language's string in it. That is
// exactly the kind of bug that ships unnoticed, because whoever added the
// copy was only looking at one locale.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const load = (l) =>
  JSON.parse(readFileSync(join(here, "..", "messages", `${l}.json`), "utf8"));

const keys = (o, p = "") =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`],
  );

const fr = keys(load("fr")).sort();
const en = keys(load("en")).sort();

const onlyFr = fr.filter((k) => !en.includes(k));
const onlyEn = en.filter((k) => !fr.includes(k));

if (onlyFr.length || onlyEn.length) {
  console.error("Message catalogs have diverged.\n");
  if (onlyFr.length)
    console.error(`Missing from en.json (${onlyFr.length}):\n  ${onlyFr.join("\n  ")}\n`);
  if (onlyEn.length)
    console.error(`Missing from fr.json (${onlyEn.length}):\n  ${onlyEn.join("\n  ")}\n`);
  process.exit(1);
}

console.log(`Message catalogs in sync — ${fr.length} keys in fr and en.`);
