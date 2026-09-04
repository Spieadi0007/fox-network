"use client";

import { useState } from "react";
import { Lightbulb, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FeatureTip {
  title: string;
  description: string;
  path: string;
}

export function getModuleTips(userRole?: string): FeatureTip[] {
  const tips: FeatureTip[] = [
    {
      title: "Search",
      description: "Quickly filter rows by typing a name.",
      path: "Type in the search bar at the top-left of the table",
    },
    {
      title: "Filters",
      description: "Add conditions to narrow down by any column.",
      path: 'Click the "Filters" button in the toolbar',
    },
    {
      title: "Saved Views",
      description:
        "Save your current filters, sorting, and columns as a reusable view.",
      path: 'Click "+ Save View" above the table, name it, and hit save',
    },
    {
      title: "Reorder Views",
      description: "Rearrange your saved view tabs in any order.",
      path: "Drag any view pill left or right to reposition it",
    },
    {
      title: "Duplicate a View",
      description:
        "Create a copy of an existing view to tweak independently.",
      path: 'Click "..." on a view pill, then "Duplicate"',
    },
    {
      title: "Export CSV",
      description: "Download the current filtered data as a spreadsheet.",
      path: 'Click the "Export" button in the toolbar',
    },
    {
      title: "Column Picker",
      description: "Show, hide, or reorder table columns.",
      path: 'Click the "Columns" button on the right of the toolbar',
    },
    {
      title: "Page Size",
      description: "Change how many rows are shown per page.",
      path: 'Use the "Rows" dropdown at the bottom-left of the table',
    },
  ];

  if (userRole === "admin" || userRole === "manager") {
    tips.push({
      title: "Bulk Actions",
      description:
        "Select multiple rows to change status or delete at once.",
      path: "Use the checkboxes on the left, then use the action buttons that appear",
    });
  }

  return tips;
}

export function FeatureTips({ userRole }: { userRole?: string }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const tips = getModuleTips(userRole);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700"
          aria-label="Feature tips"
        >
          <Lightbulb className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tips & Shortcuts</DialogTitle>
          <DialogDescription>
            Here&apos;s what you can do on this page
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          {tips.map((tip, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <div key={tip.title} className="rounded-lg border border-stone-200">
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50"
                >
                  {tip.title}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
                {isExpanded && (
                  <div className="border-t border-stone-100 px-3 pb-3 pt-2">
                    <p className="text-sm text-stone-600">{tip.description}</p>
                    <div className="mt-2 rounded-md bg-stone-50 px-3 py-2 text-xs text-stone-500">
                      &rarr; {tip.path}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
