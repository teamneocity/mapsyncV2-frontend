// src/pages/PilotMap/StatBox.jsx
import { TrendingUp } from "lucide-react";

export function StatBox({ title, value, percentage, icon: Icon }) {
  return (
    <div className="w-full bg-white rounded-xl border shadow px-4 pt-4 pb-2 flex flex-col justify-between h-full">


      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="p-2 rounded-md border border-gray-200">
          <Icon className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <p className="text-3xl font-bold text-[#4B4B62]">{value}</p>
        <span className="text-xs font-semibold text-white bg-[#5D5FEF] px-2 py-[2px] rounded-full">
          {percentage > 0 ? "+" : ""}
          {percentage}%
        </span>
      </div>

      <div className="border-t border-gray-200 mt-3 pt-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1 text-[#5D5FEF]">
          <TrendingUp className="w-3 h-3" />
          <span className="font-semibold">
            {percentage > 0 ? "+" : ""}
            {percentage}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Do mês passado</span>
          <span className="text-black">&rarr;</span>
        </div>
      </div>
    </div>
  );
}
