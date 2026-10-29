"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Mail, Phone } from "lucide-react";

/**
 * Write to the clipboard, falling back to a hidden textarea where the
 * Clipboard API isn't available — which includes any page not served over
 * HTTPS, such as a phone testing this over the local network.
 */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  }
}

/**
 * One line of Karim's card: tap the value to email or call, or copy it to
 * paste into a CRM or a message thread — often what someone wants while
 * still standing at the stand.
 */
export function ContactRow({
  kind,
  value,
}: {
  kind: "email" | "phone";
  value: string;
}) {
  const t = useTranslations("karim");
  const [copied, setCopied] = useState(false);
  const Icon = kind === "email" ? Mail : Phone;
  const href =
    kind === "email" ? `mailto:${value}` : `tel:${value.replace(/[^\d+]/g, "")}`;

  async function onCopy() {
    if (!(await copyText(value))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-stone-200/80 bg-stone-50 p-1.5 pl-3">
      <a
        href={href}
        className="flex min-w-0 flex-1 items-center gap-2.5 py-1.5 text-left text-[14px] font-medium text-stone-800 transition-colors active:text-brand"
      >
        <Icon className="h-4 w-4 shrink-0 text-brand" />
        <span className="truncate">{value}</span>
      </a>
      <button
        type="button"
        onClick={onCopy}
        aria-label={kind === "email" ? t("copyEmail") : t("copyPhone")}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 text-[12px] font-medium text-stone-600 ring-1 ring-stone-200 transition-colors active:bg-stone-100"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span aria-live="polite">{t("copied")}</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            {t("copy")}
          </>
        )}
      </button>
    </div>
  );
}
