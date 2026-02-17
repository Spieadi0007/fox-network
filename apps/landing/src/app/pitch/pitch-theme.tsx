"use client";

import { createContext, useContext } from "react";

export type PitchTheme = "dark" | "light";

interface PitchThemeContextValue {
  theme: PitchTheme;
  toggle: () => void;
}

export const PitchThemeContext = createContext<PitchThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function usePitchTheme() {
  return useContext(PitchThemeContext);
}

/** Returns theme-aware color values for SVG elements */
export function usePitchColors() {
  const { theme } = usePitchTheme();
  const dark = theme === "dark";

  return {
    // SVG panel/card backgrounds
    panel: dark ? "rgba(10,15,25,0.9)" : "rgba(255,255,255,0.95)",
    panel2: dark ? "rgba(15,18,25,0.9)" : "rgba(250,250,249,0.95)",
    panelSolid: dark ? "rgba(15,18,25,0.95)" : "rgba(248,248,247,0.98)",
    screen: dark ? "rgba(15,20,30,1)" : "rgba(248,248,247,1)",
    uiBg: dark ? "rgba(25,30,42,1)" : "rgba(232,232,230,1)",
    uiBg2: dark ? "rgba(30,35,48,1)" : "rgba(238,238,236,1)",
    uiElement: dark ? "rgba(20,24,35,1)" : "rgba(228,228,226,1)",

    // SVG text
    text: dark ? "white" : "#1c1917",
    textMuted: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
    textDim: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
    textDimmer: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
    textFaint: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
    textWatermark: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",

    // SVG strokes
    stroke: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
    strokeLight: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    strokeFaint: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",

    // SVG subtle fills
    subtle: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    subtleFaint: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",

    // Grid
    gridLine: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
    gridLineBold: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)",

    // Cobe globe
    globeDark: dark ? 1 : 0,
    globeBase: (dark ? [0.15, 0.18, 0.25] : [0.92, 0.91, 0.9]) as [number, number, number],
    globeGlow: (dark ? [0.08, 0.12, 0.2] : [0.96, 0.96, 0.95]) as [number, number, number],
    globeBrightness: dark ? 4 : 6,
  };
}
