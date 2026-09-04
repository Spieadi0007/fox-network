import Anthropic from "@anthropic-ai/sdk";
import { describeApiError } from "./anthropic-errors";
import {
  FIELD_GROUPS,
  FIELD_KEYS,
  FIELD_LABELS,
  TOGGLEABLE_MODULES,
  TOGGLEABLE_MODULE_KEYS,
  MODULE_BY_KEY,
} from "@fox/shared";

// Reads a client's SOP and decides, for one service type, which Field App
// fields technicians should see and which modules they should fill in.
//
// The whole vocabulary comes from @fox/shared — 21 field keys and 10
// toggleable modules — so this is constrained classification, not open
// generation. The keys are pinned into the response schema as enums, which
// means the model physically cannot invent a key the app doesn't have.

const anthropic = new Anthropic();

/** Marker used when the SOP says nothing either way about an item. */
export const NOT_MENTIONED = "Not mentioned in the SOP.";

export type Confidence = "high" | "low";

export type FieldVerdict = {
  key: string;
  visible: boolean;
  confidence: Confidence;
  /** Verbatim SOP quote, or NOT_MENTIONED. */
  evidence: string;
};

export type ModuleVerdict = {
  key: string;
  enabled: boolean;
  confidence: Confidence;
  evidence: string;
};

export type SopExtraction = {
  summary: string;
  fields: FieldVerdict[];
  modules: ModuleVerdict[];
};

// ─── Response schema ─────────────────────────────────────────────────
// Built from the catalog so it can never drift from the app's real keys.

const VERDICT_BASE = {
  confidence: {
    type: "string",
    enum: ["high", "low"],
    description:
      "high when the SOP addresses this item directly; low when you are inferring it or the SOP is silent.",
  },
  evidence: {
    type: "string",
    description: `A short verbatim quote from the SOP that justifies the decision, or exactly "${NOT_MENTIONED}" if the SOP does not address it.`,
  },
} as const;

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description:
        "One or two sentences on what this SOP covers and how well it maps onto a field-service visit.",
    },
    fields: {
      type: "array",
      description: `One entry for every one of the ${FIELD_KEYS.length} field keys.`,
      items: {
        type: "object",
        properties: {
          key: { type: "string", enum: FIELD_KEYS },
          visible: {
            type: "boolean",
            description:
              "true if a technician needs this information on screen to carry out the SOP.",
          },
          ...VERDICT_BASE,
        },
        required: ["key", "visible", "confidence", "evidence"],
        additionalProperties: false,
      },
    },
    modules: {
      type: "array",
      description: `One entry for every one of the ${TOGGLEABLE_MODULE_KEYS.length} module keys.`,
      items: {
        type: "object",
        properties: {
          key: { type: "string", enum: TOGGLEABLE_MODULE_KEYS },
          enabled: {
            type: "boolean",
            description:
              "true if the SOP requires the technician to record this during or after the visit.",
          },
          ...VERDICT_BASE,
        },
        required: ["key", "enabled", "confidence", "evidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "fields", "modules"],
  additionalProperties: false,
} as const;

// ─── Prompt ──────────────────────────────────────────────────────────

function buildPrompt(serviceTypeLabel: string): string {
  const fieldCatalog = FIELD_GROUPS.map((group) => {
    const rows = group.fields
      .map((f) => `  - ${f.key} — ${f.label}`)
      .join("\n");
    return `${group.label}:\n${rows}`;
  }).join("\n\n");

  const moduleCatalog = TOGGLEABLE_MODULES.map(
    (m) => `  - ${m.key} — ${m.label}: ${m.description}`,
  ).join("\n");

  return `You are configuring a field-service mobile app from a client's Standard Operating Procedure.

The attached SOP governs **${serviceTypeLabel}** visits. Read it and decide two things.

**1. Information Display.** Which of these fields does a technician need on screen to carry out this SOP? Mark \`visible: true\` only for information the procedure actually calls for — if the SOP tells the technician to phone ahead, the contact phone number is needed; if it never involves contacting anyone, it is not.

${fieldCatalog}

**2. Modules.** Which of these must the technician record during or after the visit?

${moduleCatalog}

Note that start and end time are always captured and are not yours to decide, so they are absent from that list.

Rules:

- Return an entry for every key in both lists. Do not omit any.
- Base decisions on what the SOP says, not on what a well-run service call usually involves. Silence is a real answer: if the SOP never mentions parts, \`parts_used\` is \`false\`, not \`true\` because most repairs use parts.
- \`evidence\` must be a short verbatim quote from the SOP. When the SOP is silent, use exactly "${NOT_MENTIONED}" and set \`confidence\` to "low".
- Use \`confidence: "high"\` only where the SOP is explicit. Anything you inferred is "low".`;
}

// ─── Normalisation ───────────────────────────────────────────────────

/**
 * Guarantee exactly one verdict per catalog key.
 *
 * The enum constraint stops the model inventing keys, but structured outputs
 * cannot enforce array length, so it can still omit or repeat one. Anything
 * missing is treated as "the SOP is silent" — which is a decision the review
 * step will show as low-confidence and leave unchecked by default.
 */
export function normaliseExtraction(
  raw: Partial<SopExtraction>,
): SopExtraction {
  const fieldByKey = new Map<string, FieldVerdict>();
  for (const f of raw.fields ?? []) {
    if (FIELD_LABELS[f.key] && !fieldByKey.has(f.key)) fieldByKey.set(f.key, f);
  }

  const moduleByKey = new Map<string, ModuleVerdict>();
  for (const m of raw.modules ?? []) {
    if (MODULE_BY_KEY[m.key] && !moduleByKey.has(m.key)) {
      moduleByKey.set(m.key, m);
    }
  }

  return {
    summary: raw.summary ?? "",
    fields: FIELD_KEYS.map(
      (key) =>
        fieldByKey.get(key) ?? {
          key,
          visible: false,
          confidence: "low" as const,
          evidence: NOT_MENTIONED,
        },
    ),
    modules: TOGGLEABLE_MODULE_KEYS.map(
      (key) =>
        moduleByKey.get(key) ?? {
          key,
          enabled: false,
          confidence: "low" as const,
          evidence: NOT_MENTIONED,
        },
    ),
  };
}

// ─── Entry point ─────────────────────────────────────────────────────

export class SopExtractionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "SopExtractionError";
  }
}

/** Re-raise API failures as something the manager can act on. */
async function callWithClearErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const known = describeApiError(e);
    if (known) throw new SopExtractionError(known.message, known.status);
    throw e;
  }
}

export async function extractSopConfig(
  pdfBase64: string,
  serviceTypeLabel: string,
): Promise<SopExtraction> {
  const message = await callWithClearErrors(() =>
    anthropic.beta.messages.create({
    model: "claude-opus-5",
    // Thinking is on by default on Opus 5 and counts against max_tokens, so
    // this needs headroom well past the ~4k the verdicts themselves take.
    max_tokens: 16000,
    betas: ["structured-outputs-2025-12-15"],
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: EXTRACTION_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: [
          // The document block goes before the text block.
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          { type: "text", text: buildPrompt(serviceTypeLabel) },
        ],
      },
    ],
    }),
  );

  if (message.stop_reason === "refusal") {
    throw new SopExtractionError(
      "The model declined to process this document.",
      422,
    );
  }
  if (message.stop_reason === "max_tokens") {
    throw new SopExtractionError(
      "The response was cut off before it finished. The SOP may be too long.",
      502,
    );
  }

  const text = message.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new SopExtractionError("The model returned no readable output.", 502);
  }

  // Structured outputs guarantee schema-valid JSON, so no fence-stripping.
  let parsed: Partial<SopExtraction>;
  try {
    parsed = JSON.parse(text.text);
  } catch {
    throw new SopExtractionError(
      "The model returned output that was not valid JSON.",
      502,
    );
  }

  return normaliseExtraction(parsed);
}
