import Anthropic from "@anthropic-ai/sdk";

// Turn an SOP's written procedure into the form a technician actually fills
// in on site — ordered sections, each holding typed steps.
//
// This is the half of SOP import that produces work rather than settings:
// completing the generated form IS the service report, so the steps have to
// carry enough structure to be answered and later rendered as a document.

const anthropic = new Anthropic();

/** What a technician does at a step, which decides the input we render. */
export const STEP_TYPES = [
  "pass_fail",
  "photo",
  "text",
  "number",
  "signature",
] as const;
export type StepType = (typeof STEP_TYPES)[number];

/** A part the SOP names for a step, pre-filled for the technician. */
export type SuggestedPart = {
  /** Manufacturer or catalogue reference, empty if the SOP gives none. */
  part_number: string;
  name: string;
  /** Zero when the SOP does not say how many. */
  quantity: number;
};

export type ProcedureStep = {
  label: string;
  type: StepType;
  /** Must be answered before the visit can be submitted. */
  required: boolean;
  /** Unit for `number` steps ("mV", "Nm"); empty otherwise. */
  units: string;
  /** Extra instruction from the SOP, shown under the label. */
  help: string;
  /** Verbatim SOP text this step came from. */
  evidence: string;

  /** This step consumes materials — show the parts picker. */
  captures_parts: boolean;
  suggested_parts: SuggestedPart[];

  /**
   * What a measurement should read. Null where the SOP gives no figure; an
   * SOP may state a ceiling without a target.
   */
  spec_target: number | null;
  spec_min: number | null;
  spec_max: number | null;

  /**
   * Empty when the step always applies. Otherwise the case it is scoped to
   * ("the panel is cracked") — steps sharing a phrase are gated together.
   */
  applies_when: string;
};

export type ProcedureSection = {
  title: string;
  steps: ProcedureStep[];
};

export type SopProcedure = {
  name: string;
  summary: string;
  sections: ProcedureSection[];
};

// ─── Response schema ─────────────────────────────────────────────────

const STEP_SCHEMA = {
  type: "object",
  properties: {
    label: {
      type: "string",
      description:
        "What the technician does, as a short imperative or a checkable statement. No section numbering.",
    },
    type: {
      type: "string",
      enum: STEP_TYPES,
      description:
        "pass_fail for a criterion that is met or not met; photo when the SOP asks for an image; number for a reading or measurement; signature when someone signs or declares; text for anything else written down.",
    },
    required: {
      type: "boolean",
      description:
        "true when the SOP says the technician must do this, false when it is conditional or optional.",
    },
    units: {
      type: "string",
      description:
        "Unit of measurement for a number step (e.g. mV, Nm, bar). Empty string for every other type.",
    },
    help: {
      type: "string",
      description:
        "One line of extra instruction from the SOP if it matters, otherwise an empty string.",
    },
    evidence: {
      type: "string",
      description: "The verbatim SOP sentence this step came from.",
    },
    captures_parts: {
      type: "boolean",
      description:
        "true only when carrying out this step consumes a material or component that has to be logged. Fitting a replacement assembly or a new gasket does; putting on gloves, taking a photograph, or filling in paperwork does not.",
    },
    suggested_parts: {
      type: "array",
      description:
        "Parts the SOP names for this step. Empty when captures_parts is false, or when the SOP requires a part without naming it.",
      items: {
        type: "object",
        properties: {
          part_number: {
            type: "string",
            description:
              "Manufacturer or catalogue reference if the SOP gives one, otherwise an empty string.",
          },
          name: { type: "string", description: "What the part is." },
          quantity: {
            type: "number",
            description:
              "How many the SOP specifies. 0 when it does not say.",
          },
        },
        required: ["part_number", "name", "quantity"],
        additionalProperties: false,
      },
    },
    spec_target: {
      type: ["number", "null"],
      description:
        "The figure a measurement should hit, if the SOP states one. Null otherwise, and always null for non-number steps.",
    },
    spec_min: {
      type: ["number", "null"],
      description:
        "Lowest acceptable value, if the SOP states a floor. Null otherwise.",
    },
    spec_max: {
      type: ["number", "null"],
      description:
        "Highest acceptable value, if the SOP states a ceiling — including phrases like 'do not exceed' or 'no more than'. Null otherwise.",
    },
    applies_when: {
      type: "string",
      description:
        "Empty string when the step always applies. Otherwise a short plain-language phrase naming the case it is scoped to, phrased so a technician can answer yes or no on arrival — 'the panel is cracked', 'vandalism is suspected'. Use the same wording for every step scoped to the same case so they can be asked once.",
    },
  },
  required: [
    "label",
    "type",
    "required",
    "units",
    "help",
    "evidence",
    "captures_parts",
    "suggested_parts",
    "spec_target",
    "spec_min",
    "spec_max",
    "applies_when",
  ],
  additionalProperties: false,
} as const;

const PROCEDURE_SCHEMA = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description:
        "Short name for the procedure, taken from the SOP's title or document code.",
    },
    summary: {
      type: "string",
      description: "One sentence on what this procedure covers.",
    },
    sections: {
      type: "array",
      description:
        "The procedure's sections in the order the technician works through them.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description:
              "Section heading, keeping the SOP's own numbering if it has any.",
          },
          steps: { type: "array", items: STEP_SCHEMA },
        },
        required: ["title", "steps"],
        additionalProperties: false,
      },
    },
  },
  required: ["name", "summary", "sections"],
  additionalProperties: false,
} as const;

// ─── Prompt ──────────────────────────────────────────────────────────

const PROMPT = `You are turning a Standard Operating Procedure into the form a field technician fills in on site.

Read the attached SOP and produce the sequence of things the technician must actually do and record. When they finish filling this in, the completed form becomes the service report — so every action the SOP requires evidence of needs a step, and nothing else does.

Work through the document in order and keep its own structure: if it has numbered sections, keep those as sections, in that order.

Choosing a step type:
- \`pass_fail\` — an acceptance criterion, verification, or check that either holds or does not.
- \`photo\` — the SOP asks for an image, a photograph, or visual evidence.
- \`number\` — a reading, measurement, torque, voltage, count, or duration. Put the unit in \`units\`.
- \`signature\` — a person signs, declares, or confirms by name: technician declarations, customer or site-representative sign-off. Use this even where the SOP also asks for their name and the date, since those are part of signing.
- \`text\` — anything else written down: a serial number read off the unit, an observation, a reason.

What to include and what to leave out:
- Include actions the technician performs or records, and anything the SOP wants evidenced.
- Leave out background, scope, revision history, definitions, and anything addressed to office staff rather than the person on site.
- Split a sentence covering several distinct checks into one step per check. A list of required photographs becomes one photo step per photograph, not a single step.
- Keep \`label\` short and plain. Strip the section numbering out of it — that lives in the section title.
- \`required\` is true when the SOP says must or shall, false when it says may, or where the step only applies in a case that may not arise.
- \`evidence\` must be the verbatim SOP sentence the step came from.

Three further judgements, each of which the technician's app depends on:

**Parts.** Set \`captures_parts\` only where carrying out the step actually consumes a component or material that ought to be logged against the job — a replacement assembly, a gasket, a set of screws. Wearing protective equipment, taking a photograph, tightening something already fitted, and completing paperwork all consume nothing. Where the SOP names the part, put it in \`suggested_parts\` with the quantity it specifies; where it requires a part without naming one, leave the list empty and let the technician say what they used.

**Specs.** When a measurement step has a figure the SOP expects, record it. A stated target goes in \`spec_target\`; a floor in \`spec_min\`; a ceiling in \`spec_max\`, including phrasing like "do not exceed" or "no more than". These stay null on every step that is not a measurement, and on measurements the SOP leaves open.

**Conditions.** Many steps only apply in a particular case. Put that case in \`applies_when\` as a short phrase a technician can answer yes or no to on arrival, and use identical wording across every step scoped to the same case, so the app can ask once and hide the whole set. Leave it empty for steps that always apply.`;

// ─── Entry point ─────────────────────────────────────────────────────

export class ProcedureExtractionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ProcedureExtractionError";
  }
}

/** Drop malformed entries and normalise fields the schema can't constrain. */
export function normaliseProcedure(raw: Partial<SopProcedure>): SopProcedure {
  const sections: ProcedureSection[] = [];

  for (const s of raw.sections ?? []) {
    const steps = (s?.steps ?? []).filter(
      (st): st is ProcedureStep =>
        !!st?.label?.trim() && STEP_TYPES.includes(st.type),
    );
    if (steps.length === 0) continue;

    sections.push({
      title: s.title?.trim() || "Steps",
      steps: steps.map((st) => {
        const isNumber = st.type === "number";
        const num = (v: unknown) =>
          typeof v === "number" && Number.isFinite(v) ? v : null;

        // Specs are meaningless off a measurement, and the DB rejects them
        // there — drop rather than let a whole import fail on one stray value.
        let min = isNumber ? num(st.spec_min) : null;
        let max = isNumber ? num(st.spec_max) : null;
        // An inverted range is a misread, not a spec worth keeping.
        if (min !== null && max !== null && min > max) {
          min = null;
          max = null;
        }

        const parts = (st.suggested_parts ?? [])
          .filter((p) => p?.name?.trim())
          .map((p) => ({
            part_number: (p.part_number ?? "").trim(),
            name: p.name.trim(),
            quantity:
              typeof p.quantity === "number" && p.quantity > 0
                ? p.quantity
                : 0,
          }));

        return {
          label: st.label.trim(),
          type: st.type,
          required: st.required ?? true,
          // Units only mean anything on a number step.
          units: isNumber ? (st.units ?? "").trim() : "",
          help: (st.help ?? "").trim(),
          evidence: (st.evidence ?? "").trim(),

          captures_parts: st.captures_parts ?? false,
          // Parts on a step that captures none would never be shown.
          suggested_parts: st.captures_parts ? parts : [],

          spec_target: isNumber ? num(st.spec_target) : null,
          spec_min: min,
          spec_max: max,

          applies_when: (st.applies_when ?? "").trim(),
        };
      }),
    });
  }

  return {
    name: raw.name?.trim() || "Procedure",
    summary: raw.summary?.trim() || "",
    sections,
  };
}

export function countSteps(p: SopProcedure): number {
  return p.sections.reduce((n, s) => n + s.steps.length, 0);
}

export async function extractSopProcedure(
  pdfBase64: string,
): Promise<SopProcedure> {
  // Streamed rather than a plain create(): at this max_tokens the SDK refuses
  // a non-streaming request outright, since the response could outlive the
  // 10-minute HTTP ceiling.
  const stream = anthropic.beta.messages.stream({
    model: "claude-opus-5",
    // A long SOP can yield 60+ steps, each with an evidence quote, on top of
    // thinking — which is on by default on Opus 5 and shares this budget.
    max_tokens: 32000,
    betas: ["structured-outputs-2025-12-15"],
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: PROCEDURE_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new ProcedureExtractionError(
      "The model declined to process this document.",
      422,
    );
  }
  if (message.stop_reason === "max_tokens") {
    throw new ProcedureExtractionError(
      "The procedure was cut off before it finished. The SOP may be too long.",
      502,
    );
  }

  const text = message.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new ProcedureExtractionError(
      "The model returned no readable output.",
      502,
    );
  }

  let parsed: Partial<SopProcedure>;
  try {
    parsed = JSON.parse(text.text);
  } catch {
    throw new ProcedureExtractionError(
      "The model returned output that was not valid JSON.",
      502,
    );
  }

  return normaliseProcedure(parsed);
}
