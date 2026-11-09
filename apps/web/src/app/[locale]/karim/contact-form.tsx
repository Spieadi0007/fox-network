"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, ChevronRight, Send, X } from "lucide-react";
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
 * follow up. The card sits in the list of buttons like the others; tapping it
 * opens the form in a popup (a sheet from the bottom on a phone, a centred
 * card on a wider screen) so the page itself never grows or jumps.
 *
 * A native <dialog> opened with showModal() gives the backdrop, focus kept
 * inside, and Escape to close without any of that being hand-rolled.
 */
export function ContactForm() {
  const t = useTranslations("karim");
  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContact,
    { status: "idle" },
  );
  const sent = state.status === "success";

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  // Keep the page behind the popup from scrolling while it is open.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const unlock = () => document.documentElement.classList.remove("overflow-hidden");
    const observer = new MutationObserver(() => {
      if (dialog.open) document.documentElement.classList.add("overflow-hidden");
      else unlock();
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    return () => {
      observer.disconnect();
      unlock();
    };
  }, []);

  const fe = state.fieldErrors ?? {};
  // React resets the form after every submit; feeding back what was sent
  // puts it straight back in the fields.
  const v = state.values ?? {};

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 text-left text-stone-900 transition-colors active:bg-stone-50"
      >
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            sent ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-brand",
          )}
        >
          {sent ? <CheckCircle2 className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{t("leaveDetails")}</span>
          <span className="block truncate text-[13px] text-stone-500">
            {sent ? t("successTitle") : t("leaveDetailsHint")}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="contact-title"
        // A click that lands on the dialog element itself is on the backdrop.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className={cn(
          "m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-white p-0 text-stone-900 shadow-2xl",
          "backdrop:bg-stone-950/50 backdrop:backdrop-blur-[2px]",
          "sm:m-auto sm:max-w-md sm:rounded-3xl",
        )}
      >
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-stone-100 bg-white px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="contact-title" className="text-[17px] font-semibold">
              {t("leaveDetails")}
            </h2>
            <p className="text-[13px] text-stone-500">{t("leaveDetailsHint")}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <div className="px-5 pb-8 pt-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="mt-3 text-[15px] font-semibold">{t("successTitle")}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-stone-500">
              {t("successBody")}
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 w-full rounded-full bg-stone-900 px-5 py-3 text-[15px] font-medium text-white transition-all hover:bg-stone-800"
            >
              {t("done")}
            </button>
          </div>
        ) : (
          <form
            action={formAction}
            noValidate
            className="space-y-4 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4"
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
      </dialog>
    </>
  );
}
