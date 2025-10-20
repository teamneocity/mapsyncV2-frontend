// src/pages/Reports/ReportsPieCard.jsx
"use client";

import React, { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ChevronDown } from "lucide-react";

const COLORS = {
  A: "#3B82F6",
  B: "#34D399",
  C: "#C4B5FD",
  D: "#6B7280",
  RING: "#E5F0FF",
};

const TABS = ["Tapa Buraco", "Andamentos", "Atrasadas", "Finalizadas"];

const MOCK = {
  "Tapa Buraco": { A: 765.16, B: 163.45, C: 97.33, D: 37.59 },
  Andamentos: { A: 512.22, B: 201.1, C: 80.45, D: 22.7 },
  Atrasadas: { A: 120.0, B: 140.5, C: 60.0, D: 30.0 },
  Finalizadas: { A: 980.1, B: 220.3, C: 110.2, D: 40.8 },
};

export default function ReportsPieCard({
  title = "Resumo SLA",
  initialTab = "Tapa Buraco",
  selectOptions = ["Tapa-Buraco"],
  initialSelect = "Tapa-Buraco",
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedType] = useState(initialSelect);

  const entries = useMemo(() => {
    const obj = MOCK[activeTab] ?? MOCK["Tapa Buraco"];
    return ["A", "B", "C", "D"].map((k) => ({
      key: k,
      name: k,
      value: Number(obj[k]),
      color: COLORS[k],
    }));
  }, [activeTab]);

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: (p) => {
          const { name, value, percent } = p;
          return `${name}: ${value.toFixed(2)} (${percent}%)`;
        },
      },
      legend: { show: false },
      series: [
        // anel de fundo
        {
          type: "pie",
          radius: ["40%", "92%"],
          center: ["50%", "50%"],
          silent: true,
          animation: false,
          label: { show: false },
          data: [
            { value: 100, name: "ring", itemStyle: { color: COLORS.RING } },
          ],
          z: 0,
        },
        {
          type: "pie",
          radius: ["50%", "82%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderRadius: 8,
          },
          emphasis: { scale: true, scaleSize: 4 },
          data: entries.map((it) => ({
            value: it.value,
            name: it.name,
            itemStyle: { color: it.color },
          })),
          z: 1,
        },
      ],
    }),
    [entries]
  );

  return (
    <div className="w-full h-full p-5 flex flex-col min-h-0">
      {/* Título + Select */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-black">{title}</h2>

        <div className="relative">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
          >
            {selectedType}
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex items-center gap-8">
        {TABS.map((t) => {
          const active = t === activeTab;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-2 text-sm transition-colors ${
                active ? "text-gray-900 font-medium" : "text-gray-500"
              }`}
            >
              {t}
              <div
                className={`h-[2px] mt-2 rounded-full transition-all ${
                  active ? "bg-gray-900 w-full" : "bg-transparent w-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Conteúdo (gráfico + legendas) */}
      <div className="mt-4 grid grid-cols-12 gap-6 items-center flex-1 min-h-0">
        {/* Gráfico  */}
        <div className="col-span-12 md:col-span-5 h-[180px] md:h-full">
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        {/* Legendas */}
        <div className="col-span-12 md:col-span-7 hidden md:grid grid-cols-2 gap-x-10 gap-y-4">
          {entries.map((it) => (
            <div key={it.key} className="flex items-center gap-3">
              <span
                className="h-8 w-1.5 rounded-full"
                style={{ backgroundColor: it.color }}
              />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">{it.name}</span>
                <span className="text-xl lg:text-2xl font-semibold text-gray-900">
                  {it.value.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
