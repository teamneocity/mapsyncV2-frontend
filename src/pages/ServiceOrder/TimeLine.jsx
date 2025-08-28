import { format } from "date-fns";
import { Clock } from "lucide-react";

import Start from "@/assets/timeline/Start.svg?react";
import During from "@/assets/timeline/During.svg?react";
import End from "@/assets/timeline/End.svg?react";

export function Timeline({ timeline }) {
  return (
    <div className="relative mt-4 pl-6 z-0">
      <ul className="space-y-6">
        {timeline.map((step, index) => {
          let Icon;
          if (index === 0) Icon = Start;
          else if (index === timeline.length - 1) Icon = End;
          else Icon = During;

          const showLine = index < timeline.length - 1;

          return (
            <li key={index} className="relative flex items-start gap-3">
              {/* Ícone + linha vertical */}
              <div className="absolute -left-6 top-1 flex flex-col items-center z-10">
                <Icon className="w-6 h-6" />
                {showLine && (
                  <div className="h-8 border-l-2 border-dotted border-[#33C083]" />
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
