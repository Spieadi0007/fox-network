/** Abbreviate city to first 3 chars uppercase, fallback "XXX" */
export function cityAbbrev(city: string | null): string {
  if (!city || city.trim().length === 0) return "XXX";
  return city.trim().slice(0, 3).toUpperCase();
}

/** Build location prefix: "{CLIENT}-{COUNTRY}-{CITY}" */
export function locationPrefix(client: string, country: string, city: string | null): string {
  return `${client.toUpperCase()}-${country.toUpperCase()}-${cityAbbrev(city)}`;
}

/** Build project prefix: "{LOCATION_CODE}-{PROJECT_TYPE}" */
export function projectPrefix(locationCode: string, projectType: string): string {
  return `${locationCode}-${projectType.toUpperCase()}`;
}

/** Build action prefix: "{PROJECT_CODE}-{ACTION_TYPE}" */
export function actionPrefix(projectCode: string, actionType: string): string {
  return `${projectCode}-${actionType.toUpperCase()}`;
}

/**
 * Query next sequence for a given prefix from a table.
 * Finds existing codes matching `{prefix}-NNN`, extracts max sequence, returns `{prefix}-{next}`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function nextCode(
  supabase: any,
  table: "locations" | "projects" | "actions",
  orgId: string,
  prefix: string,
): Promise<string> {
  const { data } = await supabase
    .from(table)
    .select("code")
    .eq("organization_id", orgId)
    .like("code", `${prefix}-%`);

  let max = 0;
  if (data && data.length > 0) {
    for (const row of data) {
      const code: string = row.code;
      const suffix = code.slice(prefix.length + 1);
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > max) max = num;
    }
  }

  const seq = String(max + 1).padStart(3, "0");
  return `${prefix}-${seq}`;
}
