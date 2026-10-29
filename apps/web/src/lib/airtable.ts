/**
 * Writes leads into Airtable, where sales works the pipeline.
 *
 * Two forms feed one table, told apart by the Source column:
 *   - the quote form, which saves to Supabase first and copies here;
 *   - Karim's Web Summit page, where Airtable is the only destination.
 *
 * Without the env vars nothing is sent, so local dev and preview deployments
 * don't need an Airtable base.
 *
 * Plain fetch against the REST API — one POST doesn't justify the SDK.
 */

export type QuoteRecord = {
  company: string;
  name: string;
  email: string;
  phone: string | null;
  networkType: string | null;
  sites: string;
  region: string | null;
  message: string | null;
  locale: string;
};

export type ContactRecord = {
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  message: string | null;
  locale: string;
};

type Fields = Record<string, string | string[] | undefined>;

function config() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) return null;
  return {
    token,
    baseId,
    leads: process.env.AIRTABLE_QUOTES_TABLE ?? "Website leads",
    companies: process.env.AIRTABLE_COMPANIES_TABLE ?? "Companies",
  };
}

type Config = NonNullable<ReturnType<typeof config>>;

async function airtable(
  cfg: Config,
  table: string,
  init?: { method: "POST"; body: unknown },
  query = "",
) {
  const res = await fetch(
    `https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(table)}${query}`,
    {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: init ? JSON.stringify(init.body) : undefined,
    },
  );
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{ records: { id: string }[] }>;
}

/**
 * The Companies record a lead should link to: the existing one with the same
 * name (ignoring case and spacing), or a new one. Matching first keeps a
 * company that sends three quotes as one row in Companies, not three.
 */
async function findOrCreateCompany(cfg: Config, name: string): Promise<string> {
  const escaped = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const formula = `LOWER(TRIM({Company Name}))=LOWER(TRIM("${escaped}"))`;
  const found = await airtable(
    cfg,
    cfg.companies,
    undefined,
    `?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`,
  );
  if (found.records[0]) return found.records[0].id;

  const created = await airtable(cfg, cfg.companies, {
    method: "POST",
    body: { records: [{ fields: { "Company Name": name } }] },
  });
  return created.records[0].id;
}

/** True once the record is in Airtable; failures are logged, never thrown. */
async function createLead(fields: Fields, company?: string): Promise<boolean> {
  const cfg = config();
  if (!cfg) {
    console.error("Airtable is not configured; lead not sent.");
    return false;
  }

  // A failed company link shouldn't cost us the lead: send it unlinked and
  // let whoever triages the table link it by hand.
  let companies: string[] | undefined;
  if (company) {
    try {
      companies = [await findOrCreateCompany(cfg, company)];
    } catch (err) {
      console.error("Airtable company link failed:", err);
    }
  }

  try {
    await airtable(cfg, cfg.leads, {
      method: "POST",
      body: {
        records: [
          {
            fields: {
              ...fields,
              Companies: companies,
              "Submitted at": new Date().toISOString(),
            },
          },
        ],
        // typecast lets Airtable add new single-select options (a region or
        // network type it hasn't seen) instead of rejecting the record.
        typecast: true,
      },
    });
    return true;
  } catch (err) {
    console.error("Airtable lead failed:", err);
    return false;
  }
}

// Column names must match the Airtable table exactly; see .env.example.

export async function sendQuoteToAirtable(quote: QuoteRecord): Promise<void> {
  await createLead(
    {
      Source: "Quote form",
      Company: quote.company,
      Name: quote.name,
      Email: quote.email,
      Phone: quote.phone ?? undefined,
      "Network type": quote.networkType ?? undefined,
      Sites: quote.sites || undefined,
      Region: quote.region ?? undefined,
      Message: quote.message ?? undefined,
      Language: quote.locale,
    },
    quote.company,
  );
}

export async function sendContactToAirtable(
  contact: ContactRecord,
): Promise<boolean> {
  return createLead({
    Source: "Web Summit (Karim page)",
    Name: contact.name,
    Email: contact.email,
    Phone: contact.phone ?? undefined,
    Website: contact.website ?? undefined,
    Message: contact.message ?? undefined,
    Language: contact.locale,
  });
}
