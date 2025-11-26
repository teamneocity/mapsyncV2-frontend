// src/pages/Reports/ReportsDashboard.jsx
"use client";

import React, { useState } from "react";
import ReportsSLAChart from "./ReportsSLAChart";

export default function ReportsDashboard({
  dayCount,
  weekCount,
  monthCount,
  totalCount,
  loading,
  onOpenPhotoModal,
  onOpenBuilder,
  // janelas
  onChangeDayAnchor,
  onChangeWeekAnchor,
  onChangeMonthAnchor,
  // controle de período geral
  selectedPeriod,
  onChangePeriod,
}) {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedWeekKey, setSelectedWeekKey] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

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

  function renderWindowSelector(cardKey) {
    if (cardKey === "day") {
      return (
        <div
          className="absolute right-3 top-3 flex flex-col gap-1 rounded-xl bg-gray-200 p-1 shadow-sm border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[11px] text-slate-600 font-medium">
            Escolha o dia
          </p>
          <input
            type="date"
            value={selectedDay}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedDay(v);
              onChangePeriod?.("day");
              onChangeDayAnchor?.(v);
            }}
            className="h-[32px] bg-white text-[11px] text-slate-600 rounded-lg px-2 focus:outline-none cursor-pointer"
          />
        </div>
      );
    }

    if (cardKey === "week") {
      return (
        <div
          className="absolute right-3 top-3 flex flex-col gap-1 rounded-xl bg-gray-200 p-1 shadow-sm border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[11px] text-slate-600 font-medium">
            Intervalo da semana
          </p>

          <select
            value={selectedWeekKey}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedWeekKey(v);
              onChangePeriod?.("week");
              onChangeWeekAnchor?.(v === "" ? "" : v);
            }}
            className="h-[32px] bg-white text-[11px] text-slate-600 rounded-lg px-2 focus:outline-none cursor-pointer"
          >
            <option value="">Selecione</option>
            <option value="0">Semana atual</option>
            <option value="7">Semana de 7 dias atrás</option>
            <option value="14">Semana de 14 dias atrás</option>
          </select>
        </div>
      );
    }

    if (cardKey === "month") {
      return (
        <div
          className="absolute right-3 top-3 flex flex-col gap-1 rounded-xl bg-gray-200 p-1 shadow-sm border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[11px] text-slate-600 font-medium">
            Escolha o mês
          </p>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              const v = e.target.value; 
              setSelectedMonth(v);

              onChangePeriod?.("month");

              if (!v) {
                onChangeMonthAnchor?.("");
                return;
              }

              const [yyyy, mm] = v.split("-");
              onChangeMonthAnchor?.(`${yyyy}-${mm}-01`);
            }}
            className="h-[32px] w-[80px] bg-white text-[11px] text-slate-600 rounded-lg px-2 focus:outline-none cursor-pointer"
          />
        </div>
      );
    }

    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const isTotal = card.key === "total" || index === 3;

          if (isTotal) {
            // 4º card (total) continua centralizado, sem seletor nem seleção
            return (
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
            );
          }

          const isActive = card.key === selectedPeriod;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onChangePeriod?.(card.key)}
              className={[
                "relative h-[170px] rounded-xl border shadow-sm overflow-hidden flex items-center justify-start px-4 transition-all bg-[#F6F8FA] text-[#787891]",
                isActive
                  ? "ring-2 ring-indigo-300"
                  : "hover:ring-1 hover:ring-neutral-300",
              ].join(" ")}
            >
              {/* número grande */}
              <span className="text-[80px] font-semibold leading-none">
                {loading ? "..." : card.value}
              </span>

              {/* label */}
              <div className="absolute left-4 bottom-3 text-[14px] tracking-wide">
                {card.title}
              </div>

              {/* seletor (dia / semana / mês) */}
              {renderWindowSelector(card.key)}
            </button>
          );
        })}
      </div>

      {/* Gráfico SLA */}
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
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Gerar relatório fotográfico
        </button>

        <button
          type="button"
          onClick={onOpenBuilder}
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Gerar relatório customizado
        </button>
      </div>
    </div>
  );
}
