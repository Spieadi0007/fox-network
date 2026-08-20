"use client";

import { Printer } from "lucide-react";

// The browser's own print dialog doubles as "save as PDF", which covers the
// send-it-to-the-client case without pulling in a PDF library.
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-50"
    >
      <Printer className="h-3.5 w-3.5" />
      Print / PDF
    </button>
  );
}
