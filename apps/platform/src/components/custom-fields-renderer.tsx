"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomFieldDefinition } from "@fox/supabase";

const fi = "h-12 rounded-xl border-stone-200 px-4 text-sm placeholder:text-stone-400 shadow-none";
const ft = "data-[size=default]:h-12 rounded-xl border-stone-200 px-4 w-full text-sm shadow-none";
const fa = "rounded-xl border-stone-200 px-4 py-3 text-sm placeholder:text-stone-400 min-h-[80px] shadow-none";

export function CustomFieldsRenderer({
  definitions,
  values,
}: {
  definitions: CustomFieldDefinition[];
  values: Record<string, unknown>;
}) {
  if (definitions.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-5">
      {definitions.map((def) => {
        const val = values[def.field_name] ?? "";
        const name = `cf_${def.field_name}`;

        switch (def.field_type) {
          case "text":
          case "url":
          case "email":
            return (
              <Input
                key={def.id}
                className={fi}
                placeholder={def.field_label}
                name={name}
                type={def.field_type === "url" ? "url" : def.field_type === "email" ? "email" : "text"}
                required={def.required}
                defaultValue={val as string}
              />
            );

          case "number":
            return (
              <Input
                key={def.id}
                className={fi}
                placeholder={def.field_label}
                name={name}
                type="number"
                step="any"
                required={def.required}
                defaultValue={val as string}
              />
            );

          case "date":
            return (
              <Input
                key={def.id}
                className={fi}
                placeholder={def.field_label}
                name={name}
                type="date"
                required={def.required}
                defaultValue={val as string}
              />
            );

          case "textarea":
            return (
              <div key={def.id} className="col-span-2">
                <Textarea
                  className={`${fa} w-full`}
                  placeholder={def.field_label}
                  name={name}
                  required={def.required}
                  defaultValue={val as string}
                />
              </div>
            );

          case "boolean":
            return (
              <label key={def.id} className="flex items-center gap-3 h-12 px-4 rounded-xl border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  name={name}
                  value="true"
                  defaultChecked={val === true || val === "true"}
                  className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                <span className="text-sm text-stone-600">{def.field_label}</span>
              </label>
            );

          case "select":
            return (
              <Select key={def.id} name={name} defaultValue={(val as string) || ""} required={def.required}>
                <SelectTrigger className={ft}>
                  <SelectValue placeholder={def.field_label} />
                </SelectTrigger>
                <SelectContent>
                  {(def.options ?? []).map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

export function CustomFieldsDisplay({
  definitions,
  values,
}: {
  definitions: CustomFieldDefinition[];
  values: Record<string, unknown>;
}) {
  if (definitions.length === 0) return null;

  const fieldsWithValues = definitions.filter(
    (def) => values[def.field_name] !== undefined && values[def.field_name] !== null && values[def.field_name] !== ""
  );

  if (fieldsWithValues.length === 0) return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-4">Custom Fields</h3>
      <div className="grid grid-cols-2 gap-4">
        {fieldsWithValues.map((def) => {
          const val = values[def.field_name];
          let display: string;

          if (def.field_type === "boolean") {
            display = val === true || val === "true" ? "Yes" : "No";
          } else if (def.field_type === "date" && typeof val === "string") {
            display = new Date(val).toLocaleDateString();
          } else if (def.field_type === "number" && typeof val === "number") {
            display = val.toLocaleString();
          } else {
            display = String(val);
          }

          return (
            <div key={def.id}>
              <h4 className="text-sm font-medium text-stone-500">{def.field_label}</h4>
              <p className="mt-1 text-stone-900 break-words">
                {def.field_type === "url" ? (
                  <a href={display} target="_blank" rel="noopener noreferrer" className="text-fox-orange hover:underline">
                    {display}
                  </a>
                ) : (
                  display
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Extract custom field values from FormData (fields prefixed with cf_) */
export function extractCustomFields(
  formData: FormData,
  definitions: CustomFieldDefinition[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const def of definitions) {
    const key = `cf_${def.field_name}`;

    if (def.field_type === "boolean") {
      result[def.field_name] = formData.get(key) === "true";
    } else if (def.field_type === "number") {
      const raw = formData.get(key) as string;
      result[def.field_name] = raw ? Number(raw) : null;
    } else {
      const raw = formData.get(key) as string;
      result[def.field_name] = raw || null;
    }
  }

  return result;
}
