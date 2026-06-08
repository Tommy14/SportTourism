import type { PackageItinerary } from "@/types/package-itinerary";
import type { PackageShowcaseItem } from "@/components/sections/PackageShowcase";

type ItineraryDetailStepProps = {
  pkg: PackageShowcaseItem;
  itinerary: PackageItinerary | null;
  onCustomize: () => void;
};

export function ItineraryDetailStep({ pkg, itinerary, onCustomize }: ItineraryDetailStepProps) {
  const inclusions = pkg.inclusions
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">

      {/* Duration + inclusions chips */}
      <div>
        <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          {pkg.duration}
        </span>
        <div className="mt-3 flex flex-wrap gap-2">
          {inclusions.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
            >
              <span className="text-accent text-[10px]">✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Itinerary days */}
      {itinerary ? (
        <>
          <div className="space-y-2">
            {itinerary.days.map((day, i) => (
              <div
                key={day.day}
                className="flex gap-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                {/* Day number */}
                <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-accent/10 py-1 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/70">Day</span>
                  <span className="text-lg font-extrabold leading-none text-accent">{day.day}</span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                    {day.location}
                  </p>
                  <p className="mt-0.5 text-sm text-white/85 leading-snug">{day.activity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary — moved to end */}
          <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent/70 mb-1">Tour Summary</p>
            <p className="text-sm text-white/75 leading-relaxed">{itinerary.summary}</p>
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          Itinerary coming soon — contact us for a custom plan.
        </p>
      )}

      <button
        type="button"
        className="pill-button w-full sm:w-auto"
        disabled={!itinerary}
        onClick={onCustomize}
      >
        Customize your tour
      </button>
    </div>
  );
}
