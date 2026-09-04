"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { submitQuote, type QuoteState } from "./actions";
import { cn } from "@/lib/cn";

const NETWORK_TYPES = ["lockers", "atms", "ev", "other"] as const;

const labelCls = "block text-sm font-medium text-stone-700";
const inputCls =
  "mt-1.5 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const errorInputCls = "border-red-300 focus:border-red-400 focus:ring-red-400";

function Submit() {
  const t = useTranslations("quote");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? t("submitting") : t("submit")}
    </button>
  );
}

function Field({
  name,
  label,
  placeholder,
  error,
  optional,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder?: string;
  error?: string;
  optional?: string;
  type?: string;
}) {
  const id = `quote-${name}`;
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
        {optional && (
          <span className="ml-1.5 font-normal text-stone-400">({optional})</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputCls, error && errorInputCls)}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function QuoteForm({ waitlist }: { waitlist: boolean }) {
  const t = useTranslations("quote");
  const tn = useTranslations("networks");
  const locale = useLocale();
  const [state, formAction] = useActionState<QuoteState, FormData>(
    submitQuote,
    { status: "idle" },
  );

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 text-center shadow-xl shadow-stone-200/40 backdrop-blur-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          {t("successTitle")}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
          {t("successBody")}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:brightness-90"
        >
          {t("successBack")}
        </Link>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
      <span className="font-mono text-xs font-medium uppercase tracking-widest text-brand">
        {t("eyebrow")}
      </span>
      <h1 className="mt-3 text-balance font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
        {waitlist ? t("waitlistTitle") : t("title")}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        {waitlist ? t("waitlistSubtitle") : t("subtitle")}
      </p>

      {state.status === "error" && state.message && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <Field
          name="company"
          label={t("companyLabel")}
          placeholder={t("companyPlaceholder")}
          error={fe.company}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="name"
            label={t("nameLabel")}
            placeholder={t("namePlaceholder")}
            error={fe.name}
          />
          <Field
            name="email"
            type="email"
            label={t("emailLabel")}
            placeholder={t("emailPlaceholder")}
            error={fe.email}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="phone"
            type="tel"
            label={t("phoneLabel")}
            optional={t("phoneOptional")}
            placeholder={t("phonePlaceholder")}
          />
          <div>
            <label htmlFor="quote-networkType" className={labelCls}>
              {t("networkLabel")}
            </label>
            <select
              id="quote-networkType"
              name="networkType"
              defaultValue=""
              className={inputCls}
            >
              <option value="" disabled>
                {t("networkPlaceholder")}
              </option>
              {NETWORK_TYPES.map((id) => (
                <option key={id} value={id}>
                  {id === "other" ? t("networkOther") : tn(`items.${id}.name`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="sites"
            label={t("sitesLabel")}
            placeholder={t("sitesPlaceholder")}
          />
          <Field
            name="region"
            label={t("regionLabel")}
            placeholder={t("regionPlaceholder")}
          />
        </div>

        <div>
          <label htmlFor="quote-message" className={labelCls}>
            {t("messageLabel")}
          </label>
          <textarea
            id="quote-message"
            name="message"
            rows={4}
            placeholder={t("messagePlaceholder")}
            className={cn(inputCls, "resize-y")}
          />
        </div>

        <div className="pt-2">
          <Submit />
        </div>
      </form>
    </div>
  );
}
