// src/pages/PilotsDashboard/index.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import { ArrowLeft } from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { api } from "@/services/api";

import Airplane from "@/assets/icons/Airplane.svg?react";

function nameToInitials(full = "") {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const MOCK_NEIGHBORHOODS = {
  default: [
    { name: "Atalaia", value: 9 },
    { name: "Grageru", value: 7 },
    { name: "Santos Dumont", value: 5 },
    { name: "Suíssa", value: 4 },
    { name: "Centro", value: 8 },
  ],
  byPilot: {},
};

const DECALS = [
  {
    symbol: "rect",
    dashArrayX: [4, 2],
    dashArrayY: [2, 2],
    symbolSize: 1,
    rotation: 0,
    color: "rgba(0,0,0,0.12)",
  },
  {
    symbol: "circle",
    dashArrayX: [1, 0],
    dashArrayY: [2, 2],
    symbolSize: 0.9,
    color: "rgba(0,0,0,0.14)",
  },
  {
    symbol: "triangle",
    dashArrayX: [1, 0],
    dashArrayY: [2, 4],
    symbolSize: 1,
    rotation: Math.PI / 4,
    color: "rgba(0,0,0,0.12)",
  },
  {
    symbol: "diamond",
    dashArrayX: [1, 0],
    dashArrayY: [2, 3],
    symbolSize: 1,
    rotation: Math.PI / 6,
    color: "rgba(0,0,0,0.12)",
  },
  {
    symbol: "rect",
    dashArrayX: [8, 4],
    dashArrayY: [6, 0],
    symbolSize: 1,
    rotation: Math.PI / 3,
    color: "rgba(0,0,0,0.10)",
  },
  {
    symbol: "circle",
    dashArrayX: [2, 2],
    dashArrayY: [2, 2],
    symbolSize: 0.8,
    color: "rgba(0,0,0,0.12)",
  },
];

function adaptPilotTotals(raw) {
  const arr = Array.isArray(raw?.metrics)
    ? raw.metrics
    : Array.isArray(raw)
    ? raw
    : [];
  return arr.map((item) => {
    const id = item?.pilotId ?? item?.id ?? "";
    const name = item?.pilotName ?? item?.name ?? "Piloto";
    const count =
      item?.createdOccurrences?.total ??
      item?.createdOccurrences?.currentMonth ??
      item?.count ??
      0;

    const prev = item?.createdOccurrences?.lastMonth ?? null;
    const pct =
      prev == null
        ? null
        : prev === 0
        ? count > 0
          ? 100
          : 0
        : Math.round(((count - prev) / prev) * 100);
    const isNeg = pct != null && pct < 0;

    return { id, name, count, pct, isNeg };
  });
}

export default function PilotsDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPilotId = searchParams.get("pilotId");

  const [pilotTotals, setPilotTotals] = useState([]);

  const [selectedPilotId, setSelectedPilotId] = useState(
    initialPilotId || null
  );
  const [selectedPilotTotal, setSelectedPilotTotal] = useState(0);

  const [neighborhoodDist, setNeighborhoodDist] = useState([]);

  const [loadingRank, setLoadingRank] = useState(true);
  const [errRank, setErrRank] = useState(null);

  const COL_H = "calc(100vh - 200px)";

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoadingRank(true);
        setErrRank(null);
        const { data } = await api.get("/metrics/pilots/occurrences");
        if (ignore) return;

        const normalized = adaptPilotTotals(data);
        setPilotTotals(normalized);

        if (initialPilotId) {
          const found = normalized.find((i) => i.id === initialPilotId);
          const fallback = normalized[0];
          const chosen = found || fallback || null;
          setSelectedPilotId(chosen?.id || null);
          setSelectedPilotTotal(chosen?.count || 0);
        } else if (normalized.length) {
          const top = [...normalized].sort((a, b) => b.count - a.count)[0];
          setSelectedPilotId(top.id);
          setSelectedPilotTotal(top.count);
        }
      } catch (e) {
        setErrRank(e?.message || "Erro ao carregar ranking de pilotos");
      } finally {
        setLoadingRank(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [initialPilotId]);

  useEffect(() => {
    if (!selectedPilotId) {
      setNeighborhoodDist([]);
      setSelectedPilotTotal(0);
      return;
    }
    const byId = MOCK_NEIGHBORHOODS.byPilot[selectedPilotId];
    setNeighborhoodDist(
      byId && byId.length ? byId : MOCK_NEIGHBORHOODS.default
    );

    const p = pilotTotals.find((x) => x.id === selectedPilotId);
    setSelectedPilotTotal(p?.count ?? 0);
  }, [selectedPilotId, pilotTotals]);

  // Bar pilotos
  const barOptions = useMemo(() => {
    const sorted = [...pilotTotals].sort((a, b) => b.count - a.count);
    const yData = sorted.map((p) => nameToInitials(p.name));

    const maxValue = Math.max(...sorted.map((p) => p.count), 0);

    const seriesData = sorted.map((p) => {
      const isSelected = p.id === selectedPilotId;
      return {
        value: p.count,
        itemStyle: {
          color: isSelected ? "#001A80" : "#003DF6",
        },
        label: { show: true, position: "right", formatter: "{c}" },
      };
    });

    return {
      tooltip: { trigger: "item" },
      grid: { left: 8, right: 8, top: 24, bottom: 8, containLabel: true },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: {
          show: true,
          interval: (index, value) => value === Math.round(maxValue / 2),
          lineStyle: {
            color: "#E5E7EB",
            type: "solid",
          },
        },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: yData,
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: seriesData,
          animationDuration: 400,
        },
      ],
    };
  }, [pilotTotals, selectedPilotId]);

  // Pie pilotos
  const pieOptions = useMemo(() => {
    const seriesData = pilotTotals.map((p, idx) => ({
      name: p.name,
      value: p.count,
      itemStyle: { decal: DECALS[idx % DECALS.length] },
    }));

    return {
      tooltip: {
        trigger: "item",
        formatter: (p) => {
          const { name, value } = p;
          return `
            <div style="min-width:140px">
              <div><strong>${name}</strong></div>
              <div>Total: <strong>${value}</strong></div>
            </div>
          `;
        },
      },
      series: [
        {
          type: "pie",
          radius: ["20%", "90%"],
          center: ["50%", "52%"],
          roseType: "radius",
          itemStyle: { borderRadius: 8 },
          label: { show: false },
          labelLine: { show: false },
          data: seriesData,
        },
      ],
    };
  }, [pilotTotals]);

  const handleSelectPilot = (p) => {
    setSelectedPilotId(p.id);
    setSelectedPilotTotal(p.count);
  };

  const goBack = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] bg-[#EBEBEB] font-inter">
      <Sidebar />
      <TopHeader />

      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={goBack}
            className="p-2 rounded-full bg-white hover:bg-gray-100 shadow transition"
            aria-label="Voltar ao dashboard"
            title="Voltar ao dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard de Pilotos
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Coluna 1 */}
          <div className="col-span-12 xl:col-span-3">
            <div className="p-3 flex flex-col items-center justify-center h-auto xl:h-[calc(100vh-200px)]">
              <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center pr-1 overflow-visible xl:overflow-y-auto">
                {loadingRank && (
                  <div className="text-gray-500 text-sm">Carregando…</div>
                )}
                {errRank && (
                  <div className="text-red-600 text-sm">{String(errRank)}</div>
                )}
                {!loadingRank &&
                  !errRank &&
                  pilotTotals.map((p) => {
                    const isActive = p.id === selectedPilotId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPilot(p)}
                        className={`w-full rounded-2xl shadow p-5 flex flex-col transition mb-3 last:mb-0
                    overflow-hidden
                    sm:max-w-[420px] md:max-w-[480px] xl:max-w-[520px] min-h-[120px]
                    ${
                      isActive
                        ? "bg-gray-200 text-black border-2 border-gray-400"
                        : "bg-white hover:bg-gray-50 text-gray-800"
                    }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[18px] line-clamp-1">
                            {p.name}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <span className="text-3xl font-bold">{p.count}</span>

                          {p.pct != null && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                p.isNeg
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {p.isNeg ? "↓" : "↑"}
                              {Math.abs(p.pct)}%
                            </span>
                          )}
                        </div>

                        <div className="mt-4 border-t border-gray-200/50" />

                        <div className="mt-3 flex items-center justify-between gap-2 min-w-0">
                          <span className="text-sm text-left text-gray-600 flex-1 min-w-0 truncate">
                            Ocorrências
                          </span>
                          <span
                            className={`${
                              isActive ? "text-gray-200" : "text-gray-400"
                            } flex-none`}
                          >
                            →
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="col-span-12 md:col-span-6 xl:col-span-5">
            <div
              className="rounded-2xl bg-white shadow p-3 flex flex-col"
              style={{ height: COL_H }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Airplane className="w-5 h-5 text-gray-700" />
                <h3 className="text-base font-semibold">
                  Ocorrências dinâmica por piloto
                </h3>
              </div>

              <div className="flex-1 min-h-0">
                {!pilotTotals.length ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Sem dados
                  </div>
                ) : (
                  <ReactECharts
                    option={barOptions}
                    style={{ width: "100%", height: "100%" }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Coluna 3 */}
          <div className="col-span-12 md:col-span-6 xl:col-span-4">
            <div
              className="rounded-2xl bg-white shadow p-3 flex flex-col"
              style={{ height: COL_H }}
            >
              {/* título + pizza */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Airplane className="w-5 h-5 text-gray-700" />
                  <h3 className="text-base font-semibold">
                    Ocorrências por piloto
                  </h3>
                </div>

                <div className="flex-1 min-h-0">
                  {!pilotTotals.length ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Sem dados
                    </div>
                  ) : (
                    <ReactECharts
                      option={pieOptions}
                      style={{ width: "100%", height: "100%" }}
                    />
                  )}
                </div>
              </div>

              <div className="my-3 " />

              {/* título + total */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Airplane className="w-5 h-5 text-gray-700" />
                  <h3 className="text-base font-semibold">
                    Total de Ocorrências
                  </h3>
                </div>

                <div className="flex-1 min-h-0 flex items-center justify-center">
                  <p
                    className="font-extrabold leading-none"
                    style={{ fontSize: "150px", lineHeight: "1" }}
                  >
                    {selectedPilotTotal ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
