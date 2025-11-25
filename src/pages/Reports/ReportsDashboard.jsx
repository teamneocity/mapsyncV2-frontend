// src/pages/Reports/ReportsDashboard.jsx
"use client";

import React from "react";
import ReportsSLAChart from "./ReportsSLAChart";

export default function ReportsDashboard({
  dayCount,
  weekCount,
  monthCount,
  totalCount,
  loading,
  onOpenPhotoModal,
  onOpenBuilder,
}) {
  const cards = [
    {
      key: "day",
      title: "Ocorrências de hoje",
      value: dayCount,
    },
    {
      key: "week",
      title: "Ocorrências na semana",
      value: weekCount,
    },
    {
      key: "month",
      title: "Ocorrências no mês",
      value: monthCount,
    },
    {
      key: "total",
      title: "Total de ocorrências",
      value: totalCount,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.key}
            className="relative h-[170px] rounded-xl border shadow-sm overflow-hidden flex items-center justify-center transition-all bg-[#F6F8FA] text-[#787891]"
          >
            <span className="text-[96px] font-semibold leading-none">
              {loading ? "..." : card.value}
            </span>
            <div className="absolute left-4 bottom-3 text-[14px] tracking-wide">
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico Sla */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <div className="h-full rounded-xl bg-white shadow-sm border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-800">
              Futura lista de relatórios gerados 
            </p>
          </div>
        </div>

        <div className="xl:col-span-7">
          <div className="h-full rounded-xl border border-gray-100 bg-white shadow-sm p-4">
            <ReportsSLAChart />
          </div>
        </div>
      </div>

      {/* Gerar relatórios */}
      <div className="mt-2 flex flex-wrap gap-3 h-[55px]">
        <button
          type="button"
          onClick={onOpenPhotoModal}
          className="inline-flex  items-center rounded-lg border border-gray-200 bg-white p-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Gerar relatório fotográfico
        </button>

        <button
          type="button"
          onClick={onOpenBuilder}
          className="inline-flex  items-center rounded-lg border border-gray-200 bg-white p-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Gerar relatório customizado
        </button>
      </div>
    </div>
  );
}
