import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic();

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname;
  } catch {
    return null;
  }
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
}

export async function POST(request: Request) {
  try {
    const { name, website } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { description: "", industry: "", logoUrl: "" },
        { status: 200 }
      );
    }

    const domain = website ? extractDomain(website) : null;
    const logoUrl = domain
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
      : "";

    // Try to fetch website content
    let siteText = "";
    if (domain) {
      try {
        const url = `https://${domain}`;
        const res = await fetch(url, {
          signal: AbortSignal.timeout(5000),
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; FoxNetwork/1.0)",
          },
        });
        if (res.ok) {
          const html = await res.text();
          siteText = stripHtmlToText(html);
        }
      } catch {
        // Website fetch failed — continue without it
      }
    }

    // Call Claude for description + industry
    let description = "";
    let industry = "";

    if (siteText || name) {
      try {
        const prompt = siteText
          ? `Given this website content for the company "${name}":\n\n${siteText}\n\nReturn a JSON object with:\n- "description": a concise 1-2 sentence description of what the company does\n- "industry": a single word or short phrase for the industry (e.g. "Manufacturing", "Healthcare", "Technology")\n\nRespond ONLY with valid JSON, no markdown.`
          : `For a company named "${name}", return a JSON object with:\n- "description": a concise 1-2 sentence description of what the company does. If you recognize the company, describe it. If not, write a brief generic placeholder like "A company specializing in [industry/services]."\n- "industry": a single word or short phrase for the industry (e.g. "Manufacturing", "Healthcare", "Technology"). Best guess based on the name.\n\nRespond ONLY with valid JSON, no markdown.`;

        const message = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 256,
          messages: [{ role: "user", content: prompt }],
        });

        let text =
          message.content[0].type === "text" ? message.content[0].text : "";
        // Strip markdown code fences if present
        text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        const parsed = JSON.parse(text);
        description = parsed.description || "";
        industry = parsed.industry || "";
      } catch (e) {
        console.error("[company-lookup] Claude API error:", e);
      }
    }

    return NextResponse.json({ description, industry, logoUrl });
  } catch {
    return NextResponse.json(
      { description: "", industry: "", logoUrl: "" },
      { status: 200 }
    );
  }
}
