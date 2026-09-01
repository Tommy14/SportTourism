import type { CSSProperties } from "react";

export const DEFAULT_IMAGE_POSITION = "50% 50%";

export type ImagePositionPreset = {
  label: string;
  value: string;
};

export const PRESET_POSITIONS: ImagePositionPreset[] = [
  { label: "Center", value: "50% 50%" },
  { label: "Top", value: "50% 0%" },
  { label: "Bottom", value: "50% 100%" },
  { label: "Left", value: "0% 50%" },
  { label: "Right", value: "100% 50%" }
];

const POSITION_PATTERN = /^(\d{1,3}(?:\.\d+)?%|center|top|bottom|left|right)\s+(\d{1,3}(?:\.\d+)?%|center|top|bottom|left|right)$/i;

export function parseImagePosition(value: string | null | undefined): string {
  if (!value || !value.trim()) return DEFAULT_IMAGE_POSITION;
  const trimmed = value.trim();
  if (POSITION_PATTERN.test(trimmed)) return trimmed;
  return DEFAULT_IMAGE_POSITION;
}

export function imagePositionStyle(value: string | null | undefined): CSSProperties {
  return { objectPosition: parseImagePosition(value) };
}

export function formatFocalPoint(xPercent: number, yPercent: number): string {
  const x = Math.min(100, Math.max(0, Math.round(xPercent)));
  const y = Math.min(100, Math.max(0, Math.round(yPercent)));
  return `${x}% ${y}%`;
}

export function parseFocalPoint(value: string | null | undefined): { x: number; y: number } {
  const position = parseImagePosition(value);
  const [xRaw, yRaw] = position.split(/\s+/);
  const x = parsePercent(xRaw, 50);
  const y = parsePercent(yRaw, 50);
  return { x, y };
}

function parsePercent(token: string, fallback: number): number {
  if (!token) return fallback;
  if (token.endsWith("%")) {
    const parsed = Number.parseFloat(token.slice(0, -1));
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : fallback;
  }
  const keywordMap: Record<string, number> = {
    left: 0,
    top: 0,
    center: 50,
    right: 100,
    bottom: 100
  };
  return keywordMap[token.toLowerCase()] ?? fallback;
}
