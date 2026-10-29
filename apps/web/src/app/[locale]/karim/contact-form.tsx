"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, ChevronDown, Send } from "lucide-react";
import { submitContact, type ContactState } from "./actions";
import { cn } from "@/lib/cn";

const labelCls = "block text-sm font-medium text-stone-700";
// 16px text on the inputs: anything smaller makes iOS Safari zoom the page
// when a field takes focus, which on a one-screen page loses the visitor.
const inputCls =
  "mt-1.5 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-base text-stone-900 placeholder-stone-400 transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";
const errorInputCls = "border-red-300 focus:border-red-400 focus:ring-red-400";

function Submit() {
  const t = useTranslations("karim");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-stone-900 px-5 py-3 text-[15px] font-medium text-white transition-all hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? t("submitting") : t("submit")}
    </button>
  );
}

function Field({
  name,
  label,
  error,
  optional,
  type = "text",
  autoComplete,
  inputMode,
  defaultValue,
}: {
  name: string;
  label: string;
  error?: string;
  optional?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "tel" | "url";
  defaultValue?: string;
}) {
  const id = `contact-${name}`;
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
        autoComplete={autoComplete}
        inputMode={inputMode}
        defaultValue={defaultValue}
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

/**
 * The page's way back to us: someone met Karim, and leaves enough for him to
 * follow up. Closed by default so the page still opens as a short list of
 * buttons; it unfolds in place rather than navigating away.
 */
export function ContactForm() {
  const t = useTranslations("karim");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContact,
    { status: "idle" },
  );

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <p className="mt-3 text-[15px] font-semibold text-stone-900">
          {t("successTitle")}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-stone-500">
          {t("successBody")}
        </p>
      </div>
    );
  }

  const fe = state.fieldErrors ?? {};
  // React resets the form after every submit; feeding back what was sent
  // puts it straight back in the fields.
  const v = state.values ?? {};

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="contact-form"
        className="flex w-full items-center gap-4 p-4 text-left text-stone-900 transition-colors active:bg-stone-50"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-brand">
          <Send className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{t("leaveDetails")}</span>
          <span className="block truncate text-[13px] text-stone-500">
            {t("leaveDetailsHint")}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-stone-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <form
          id="contact-form"
          action={formAction}
          className="space-y-4 border-t border-stone-100 px-4 pb-5 pt-4"
        >
          <input type="hidden" name="locale" value={locale} />

          {state.status === "error" && state.message && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          <Field
            name="name"
            defaultValue={v.name}
            label={t("nameLabel")}
            autoComplete="name"
            error={fe.name}
          />
          <Field
            name="email"
            defaultValue={v.email}
            label={t("emailLabel")}
            type="email"
            inputMode="email"
            autoComplete="email"
            error={fe.email}
          />
          <Field
            name="phone"
            defaultValue={v.phone}
            label={t("phoneLabel")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            optional={t("optional")}
          />
          <Field
            name="website"
            defaultValue={v.website}
            label={t("websiteLabel")}
            inputMode="url"
            autoComplete="url"
            optional={t("optional")}
          />
          <div>
            <label htmlFor="contact-message" className={labelCls}>
              {t("messageLabel")}
              <span className="ml-1.5 font-normal text-stone-400">({t("optional")})</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={3}
              defaultValue={v.message}
              placeholder={t("messagePlaceholder")}
              className={cn(inputCls, "resize-y")}
            />
          </div>

          <Submit />
        </form>
      )}
    </div>
  );
}
