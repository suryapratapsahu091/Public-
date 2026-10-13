import type React from "react";
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Geist (SIL Open Font License) is bundled in public/fonts so rendering never needs the network.
export const FONT = "Geist";
export const MONO = "Geist Mono";

loadFont({ family: FONT, url: staticFile("fonts/Geist-Variable.woff2"), weight: "100 900" });
loadFont({ family: MONO, url: staticFile("fonts/GeistMono-Variable.woff2"), weight: "100 900" });

export const COLORS = {
  primary: "#2563EB",
  deep: "#1D4ED8",
  electric: "#3B82F6",
  sky: "#60A5FA",
  pale: "#DBEAFE",
  white: "#FFFFFF",
  alt: "#F8FBFF",
  text: "#0F172A",
  textSecondary: "#475569",
  // Derived neutrals used inside the UI mockups.
  line: "#E2E8F0",
  faint: "#F1F5F9",
  muted: "#94A3B8",
  success: "#16A34A",
} as const;

export const SHADOWS = {
  card: "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -8px rgba(29,78,216,0.16), 0 40px 80px -24px rgba(15,23,42,0.14)",
  soft: "0 1px 2px rgba(15,23,42,0.05), 0 18px 40px -16px rgba(37,99,235,0.22)",
  float: "0 2px 4px rgba(15,23,42,0.04), 0 30px 60px -20px rgba(29,78,216,0.28), 0 60px 120px -40px rgba(15,23,42,0.18)",
  glow: "0 0 24px rgba(59,130,246,0.55), 0 0 64px rgba(96,165,250,0.35)",
} as const;

export const GLASS: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(255,255,255,0.92), rgba(248,251,255,0.78))",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: SHADOWS.card,
};

// 1920x1080 title-safe area (5% horizontal, 5% vertical).
export const SAFE = { x: 96, y: 54 } as const;

export const TYPE = {
  display: { fontFamily: FONT, fontWeight: 650, letterSpacing: "-0.035em", color: COLORS.text },
  support: { fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.01em", color: COLORS.textSecondary },
  label: { fontFamily: FONT, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase" as const, color: COLORS.primary },
} as const;
