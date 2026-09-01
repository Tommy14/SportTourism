"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  DEFAULT_IMAGE_POSITION,
  PRESET_POSITIONS,
  formatFocalPoint,
  parseFocalPoint,
  parseImagePosition
} from "@/lib/image-position";

type ImageFitPickerProps = {
  imageUrl: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  aspectRatio?: string;
  compact?: boolean;
};

export function ImageFitPicker({
  imageUrl,
  value,
  onChange,
  aspectRatio = "4/3",
  compact = false
}: ImageFitPickerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const position = parseImagePosition(value);
  const focal = parseFocalPoint(value);

  const setFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      onChange(formatFocalPoint(x, y));
    },
    [onChange]
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setFromPointer(event.clientX, event.clientY);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const isDefault = !value || value.trim() === "" || value === DEFAULT_IMAGE_POSITION;

  return (
    <div className={compact ? "space-y-2" : "mt-4 space-y-3 border-t border-white/8 pt-4"}>
      {!compact && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Image fit</p>
          <p className="mt-1 text-xs text-white/35">Click or drag to choose what stays visible in the crop.</p>
        </div>
      )}

      <div
        ref={frameRef}
        className={[
          "relative w-full cursor-crosshair overflow-hidden rounded-xl border border-white/10 bg-black/30",
          dragging ? "ring-1 ring-accent/40" : ""
        ].join(" ")}
        style={{ aspectRatio }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Crop preview"
          className="h-full w-full select-none object-cover"
          style={{ objectPosition: position }}
          draggable={false}
        />
        <div
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-lg"
          style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESET_POSITIONS.map((preset) => {
          const active = position === preset.value;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(preset.value === DEFAULT_IMAGE_POSITION ? null : preset.value)}
              className={[
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                active
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-accent/30 hover:text-white"
              ].join(" ")}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          type="button"
          disabled={isDefault}
          onClick={() => onChange(null)}
          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/50 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export function getPickerAspectRatio(type: string, row: Record<string, string | number | null>): string {
  if (type === "topicTile" && row.groupKey === "where-play") return "2/1";
  if (type === "topicTile") return "4/3";
  if (type === "section") return "16/9";
  if (type === "package") return "16/10";
  if (type === "testimonial") return "1/1";
  if (type === "gallery") return "4/3";
  return "4/3";
}
