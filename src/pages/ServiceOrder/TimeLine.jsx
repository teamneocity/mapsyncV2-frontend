import { format } from "date-fns";
import { Clock } from "lucide-react";

export function Timeline({ timeline }) {
  return (
    <div className="relative mt-4 pl-6">
      <ul className="space-y-6 relative z-10">
        {timeline.map((step, index) => {
          const hasNextDate = timeline[index + 1]?.date;

          return (
            <li key={index} className="relative flex items-start gap-3">
              {/* Bolinha e linha condicional */}
              <div className="absolute -left-6 top-1 flex flex-col items-center z-10">
                <div className="w-4 h-4 bg-[#33C083] rounded-full border border-white" />
                {hasNextDate && (
                  <div className="h-8 border-l-2 border-dotted border-green-300" />
                )}
              </div>

              {/* Texto */}
              <div className="ml-1 text-sm text-gray-700">
                <div className="text-xs font-semibold capitalize">
                  {step.label}
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <Clock className="inline-block h-3 w-3" />
                  {step.date
                    ? format(new Date(step.date), "dd/MM/yy, HH:mm")
                    : "—"}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
