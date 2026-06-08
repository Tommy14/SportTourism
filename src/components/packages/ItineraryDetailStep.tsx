import type { PackageItinerary } from "@/types/package-itinerary";
import type { PackageShowcaseItem } from "@/components/sections/PackageShowcase";

type ItineraryDetailStepProps = {
  pkg: PackageShowcaseItem;
  itinerary: PackageItinerary | null;
  onCustomize: () => void;
};

export function ItineraryDetailStep({ pkg, itinerary, onCustomize }: ItineraryDetailStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-accent">{pkg.duration}</p>
        <p className="mt-2 text-sm text-white/70">{pkg.inclusions}</p>
      </div>

      {itinerary ? (
        <>
          <p className="text-sm text-white/75">
            <span className="font-semibold text-white">Inclusions summary:</span> {itinerary.summary}
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                <tr>
                  <th className="w-20 whitespace-nowrap px-3 py-2">Day</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">Activity</th>
                </tr>
              </thead>
              <tbody>
                {itinerary.days.map((day) => (
                  <tr key={day.day} className="border-t border-white/10">
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-accent">Day {day.day}</td>
                    <td className="px-3 py-2 text-white/85">{day.location}</td>
                    <td className="px-3 py-2 text-white/75">{day.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          Itinerary coming soon. Contact us for a custom plan.
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
