import { FIELD_LABELS, FIELD_GROUP_BY_KEY, MODULE_BY_KEY } from "@fox/shared";
import type { ConfiguredField } from "@fox/shared";
import type { SopExtraction } from "./sop-extraction";

// Turning an extraction into a reviewable set of changes, and turning the
// manager's accept/reject decisions back into a config.
//
// Kept out of the dialog component so it can be tested directly — this is the
// code that decides what happens to a live Field App configuration.

export const NOT_MENTIONED = "Not mentioned in the SOP.";

export type Change = {
  kind: "field" | "module";
  key: string;
  label: string;
  /** true = this change switches the setting on. */
  turningOn: boolean;
  confidence: "high" | "low";
  evidence: string;
};

export function changeId(c: Pick<Change, "kind" | "key">): string {
  return `${c.kind}:${c.key}`;
}

/**
 * Compare the proposal against what's configured now.
 *
 * Only genuine differences become changes; anything the SOP agrees with is
 * counted and otherwise left alone.
 */
export function diffExtraction(
  extraction: SopExtraction,
  currentDetailFields: ConfiguredField[],
  currentModules: Record<string, boolean>,
): { changes: Change[]; unchangedCount: number } {
  const visibleNow = new Set(currentDetailFields.map((f) => f.key));
  const changes: Change[] = [];
  let unchangedCount = 0;

  for (const v of extraction.fields) {
    if (v.visible === visibleNow.has(v.key)) {
      unchangedCount++;
      continue;
    }
    changes.push({
      kind: "field",
      key: v.key,
      label: FIELD_LABELS[v.key] ?? v.key,
      turningOn: v.visible,
      confidence: v.confidence,
      evidence: v.evidence,
    });
  }

  for (const v of extraction.modules) {
    if (v.enabled === (currentModules[v.key] ?? false)) {
      unchangedCount++;
      continue;
    }
    changes.push({
      kind: "module",
      key: v.key,
      label: MODULE_BY_KEY[v.key]?.label ?? v.key,
      turningOn: v.enabled,
      confidence: v.confidence,
      evidence: v.evidence,
    });
  }

  return { changes, unchangedCount };
}

/**
 * Which changes start ticked in the review list.
 *
 * Confident changes are pre-accepted; anything the model was unsure about
 * costs the manager a deliberate click. Getting this backwards would let a
 * shaky inference through on a distracted click-through.
 */
export function defaultAccepted(changes: Change[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const c of changes) out[changeId(c)] = c.confidence === "high";
  return out;
}

export type AppliedConfig = {
  detailFields: ConfiguredField[];
  enabledModules: Record<string, boolean>;
  /** What was accepted, for the audit trail. */
  appliedFields: { key: string; visible: boolean }[];
  appliedModules: { key: string; enabled: boolean }[];
};

/**
 * Fold the accepted changes into the current config.
 *
 * Rejected changes are left exactly as they were — an import never touches a
 * setting the manager didn't tick.
 */
export function applyChanges(
  changes: Change[],
  accepted: Record<string, boolean>,
  currentDetailFields: ConfiguredField[],
  currentModules: Record<string, boolean>,
): AppliedConfig {
  const fields = new Map(currentDetailFields.map((f) => [f.key, f]));
  const enabledModules = { ...currentModules };
  const appliedFields: { key: string; visible: boolean }[] = [];
  const appliedModules: { key: string; enabled: boolean }[] = [];

  for (const c of changes) {
    if (!accepted[changeId(c)]) continue;

    if (c.kind === "field") {
      if (c.turningOn) {
        fields.set(c.key, { key: c.key, group: FIELD_GROUP_BY_KEY[c.key] });
      } else {
        fields.delete(c.key);
      }
      appliedFields.push({ key: c.key, visible: c.turningOn });
    } else {
      enabledModules[c.key] = c.turningOn;
      appliedModules.push({ key: c.key, enabled: c.turningOn });
    }
  }

  return {
    detailFields: [...fields.values()],
    enabledModules,
    appliedFields,
    appliedModules,
  };
}
