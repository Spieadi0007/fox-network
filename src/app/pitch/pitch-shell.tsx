"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion } from "framer-motion";
import { PitchThemeContext, type PitchTheme } from "./pitch-theme";

const labels = [
  "Cover",
  "Macro Shift",
  "Pain Points",
  "Orchestration",
  "Interfaces",
  "AI Validation",
  "Linear Trap",
  "Engagement",
  "Roadmap",
  "Improvement",
  "Let's Talk",
];

export function PitchShell({ children }: { children: React.ReactNode[] }) {
  const [current, setCurrent] = useState(0);
  const [theme, setTheme] = useState<PitchTheme>("dark");
  const [printing, setPrinting] = useState(false);
  const transitioning = useRef(false);
  const total = children.length;

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= total || idx === current || transitioning.current) return;
      transitioning.current = true;
      setCurrent(idx);
      setTimeout(() => {
        transitioning.current = false;
      }, 700);
    },
    [current, total],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Print / PDF export
  const handlePrint = useCallback(() => {
    setPrinting(true);
    // Wait for all slides to render, then trigger print
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  // Restore normal view after printing
  useEffect(() => {
    const restore = () => setPrinting(false);
    window.addEventListener("afterprint", restore);
    return () => window.removeEventListener("afterprint", restore);
  }, []);

  // Mouse wheel (desktop only — let mobile scroll within slides)
  useEffect(() => {
    if (printing) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 20) return;
      if (e.deltaY > 0) next();
      else prev();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [next, prev, printing]);

  // Arrow keys + Page Up/Down
  useEffect(() => {
    if (printing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      }
      if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        goTo(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo, total, printing]);

  // Touch swipe disabled — mobile users scroll within slides and use buttons to navigate

  // Print mode — render all slides stacked with animations forced visible
  if (printing) {
    return (
      <PitchThemeContext.Provider value={{ theme: "dark", toggle }}>
        <style>{`
          .pitch-print-slides * {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
            transition: none !important;
          }
          .pitch-print-slides path,
          .pitch-print-slides circle,
          .pitch-print-slides line,
          .pitch-print-slides rect {
            stroke-dasharray: none !important;
            stroke-dashoffset: 0 !important;
          }
          /* Hide decorative bg elements */
          .pitch-print-slides .pointer-events-none {
            display: none !important;
          }
          .pitch-print-slides svg.pointer-events-none {
            display: block !important;
          }
          /* Force grids horizontal */
          .pitch-print-slides .grid {
            grid-template-columns: repeat(auto-fit, minmax(0, 1fr)) !important;
          }
          /* Force flex-col to row */
          .pitch-print-slides .flex-col {
            flex-direction: row !important;
          }
          /* Show hidden-at-breakpoint elements */
          .pitch-print-slides .hidden {
            display: block !important;
          }
        `}</style>
        <div
          data-pitch-theme="dark"
          className="pitch-print-slides"
          style={{ background: "#111110", color: "#fff" }}
        >
          {children.map((child, i) => (
            <div
              key={i}
              className="pitch-slide"
              style={{
                width: "1280px",
                height: "720px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#111110",
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </PitchThemeContext.Provider>
    );
  }

  return (
    <PitchThemeContext.Provider value={{ theme, toggle }}>
      <div
        data-pitch-theme={theme}
        className="relative h-screen w-screen overflow-hidden bg-[var(--p-bg)] text-[var(--p-text)] transition-colors duration-500"
      >
        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            className="h-full w-full overflow-y-auto pb-20 lg:pb-0"
          >
            {children[current]}
          </motion.div>
        </AnimatePresence>

        {/* Desktop: Top-left controls */}
        <div className="fixed left-5 top-5 z-50 hidden items-center gap-2 lg:flex pitch-no-print">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--p-border)] bg-[var(--p-surface)] backdrop-blur-sm transition-all hover:bg-[var(--p-surface-hover)]"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* PDF download */}
          <button
            onClick={handlePrint}
            className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--p-border)] bg-[var(--p-surface)] px-3 backdrop-blur-sm transition-all hover:bg-[var(--p-surface-hover)]"
            aria-label="Download as PDF"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="text-[11px] font-medium">PDF</span>
          </button>
        </div>

        {/* Dot nav — right side */}
        <nav className="fixed right-5 top-1/2 z-50 -translate-y-1/2 flex-col items-center gap-2.5 hidden lg:flex pitch-no-print">
          {labels.map((label, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group relative flex items-center justify-center p-1"
              aria-label={label}
            >
              {/* Tooltip */}
              <span className="pointer-events-none absolute right-8 whitespace-nowrap rounded-lg bg-[var(--p-surface-2)] px-3 py-1.5 text-[11px] font-medium text-[var(--p-text-medium)] opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:right-7">
                {label}
              </span>

              <span
                className={cn(
                  "block rounded-full transition-all duration-300",
                  i === current
                    ? "h-3 w-3 bg-fox-orange shadow-lg shadow-fox-orange/40"
                    : i < current
                      ? "h-2 w-2 bg-fox-orange/40 group-hover:bg-fox-orange/70"
                      : "h-2 w-2 bg-[var(--p-text-ghost)] group-hover:bg-[var(--p-text-subtle)]",
                )}
              />
            </button>
          ))}
        </nav>

        {/* Bottom bar — slide counter */}
        <div className="fixed bottom-5 right-6 z-50 hidden lg:block pitch-no-print">
          <span className="font-mono text-[11px] text-[var(--p-text-faint)]">
            {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Mobile bottom bar */}
        <div className="fixed bottom-5 left-5 right-5 z-50 flex items-center justify-between lg:hidden pitch-no-print">
          {/* Left: theme toggle + slide counter */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--p-border-2)] bg-[var(--p-surface-2)] text-[var(--p-text-muted)] backdrop-blur-sm"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <span className="font-mono text-[11px] text-[var(--p-text-faint)]">
              {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          {/* Right: prev/next */}
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={current === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--p-border-2)] bg-[var(--p-surface-2)] text-[var(--p-text-muted)] backdrop-blur-sm transition-colors disabled:opacity-30"
              aria-label="Previous slide"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 15l-6-6-6 6" /></svg>
            </button>
            <button
              onClick={next}
              disabled={current === total - 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--p-border-2)] bg-[var(--p-surface-2)] text-[var(--p-text-muted)] backdrop-blur-sm transition-colors disabled:opacity-30"
              aria-label="Next slide"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </PitchThemeContext.Provider>
  );
}
