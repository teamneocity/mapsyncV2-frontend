// src/pages/PilotsDashboard/index.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { api } from "@/services/api";

import Airplane from "@/assets/icons/Airplane.svg?react";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
  Sector,
  Label,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

const chartConfig = {
  occurrences: {
    label: "Ocorrências",
    color: "var(--chart-1)",
  },
};

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

  const barChartData = useMemo(() => {
    if (!pilotTotals.length) return [];
    const sorted = [...pilotTotals].sort((a, b) => b.count - a.count);

    return sorted.map((p) => ({
      pilotId: p.id,
      label: nameToInitials(p.name),
      occurrences: p.count,
      isSelected: p.id === selectedPilotId,
    }));
  }, [pilotTotals, selectedPilotId]);

  // cores do gráfico de pizza
  const PIE_COLORS = ["#003DF6", "#4B84FF", "#00A3FF", "#0094C6", "#006C8E"];

  const pieChartData = useMemo(() => {
    if (!pilotTotals.length) return [];
    const sorted = [...pilotTotals].sort((a, b) => b.count - a.count);

    return sorted.map((p, idx) => ({
      pilotId: p.id,
      name: p.name,
      occurrences: p.count,
      fill: PIE_COLORS[idx % PIE_COLORS.length],
    }));
  }, [pilotTotals]);

  const activePieIndex = useMemo(() => {
    if (!pieChartData.length) return 0;
    const idx = pieChartData.findIndex(
      (item) => item.pilotId === selectedPilotId
    );
    return idx === -1 ? 0 : idx;
  }, [pieChartData, selectedPilotId]);

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
          {/* cards dos pilotos */}
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

          {/* Gráfico de barra */}
          <div className="col-span-12 md:col-span-6 xl:col-span-5">
            <div className="rounded-2xl bg-white shadow p-3 flex flex-col h-auto min-h-[320px] md:min-h-[360px] xl:h-[calc(100vh-200px)]">
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
                  <ChartContainer
                    config={chartConfig}
                    className="w-full h-full"
                  >
                    <BarChart
                      accessibilityLayer
                      data={barChartData}
                      layout="vertical"
                      margin={{
                        left: -20,
                      }}
                    >
                      <XAxis type="number" dataKey="occurrences" hide />
                      <YAxis
                        dataKey="label"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar
                        dataKey="occurrences"
                        radius={5}
                        onClick={(_, index) => {
                          const item = barChartData[index];
                          if (item) {
                            setSelectedPilotId(item.pilotId);
                            setSelectedPilotTotal(item.occurrences);
                          }
                        }}
                      >
                        {barChartData.map((entry) => (
                          <Cell
                            key={entry.pilotId}
                            fill={entry.isSelected ? "#001A80" : "#003DF6"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </div>
            </div>
          </div>

          {/* Gráfico de pizza + total */}
          <div className="col-span-12 md:col-span-6 xl:col-span-4">
            <div className="rounded-2xl bg-white shadow p-3 flex flex-col h-auto min-h-[320px] md:min-h-[360px] xl:h-[calc(100vh-200px)]">
              {/* bloco do gráfico de pizza */}
              <div className="flex-1 min-h-[180px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Airplane className="w-5 h-5 text-gray-700" />
                  <h3 className="text-base font-semibold">
                    Ocorrências por piloto
                  </h3>
                </div>

                <div className="flex-1 min-h-0 flex items-center justify-center">
                  {!pilotTotals.length || !pieChartData.length ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Sem dados
                    </div>
                  ) : (
                    <ChartContainer
                      config={chartConfig}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={pieChartData}
                          dataKey="occurrences"
                          nameKey="name"
                          innerRadius={60}
                          strokeWidth={5}
                          activeIndex={activePieIndex}
                          activeShape={(props) => {
                            const outerRadius = props.outerRadius || 0;
                            return (
                              <g>
                                <Sector
                                  {...props}
                                  outerRadius={outerRadius + 10}
                                />
                                <Sector
                                  {...props}
                                  outerRadius={outerRadius + 25}
                                  innerRadius={outerRadius + 12}
                                />
                              </g>
                            );
                          }}
                          onClick={(_, index) => {
                            const item = pieChartData[index];
                            if (item) {
                              setSelectedPilotId(item.pilotId);
                              setSelectedPilotTotal(item.occurrences);
                            }
                          }}
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (
                                !viewBox ||
                                !("cx" in viewBox) ||
                                !("cy" in viewBox) ||
                                !pieChartData[activePieIndex]
                              ) {
                                return null;
                              }

                              const { cx, cy } = viewBox;
                              const active = pieChartData[activePieIndex];

                              return (
                                <text
                                  x={cx}
                                  y={cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={cx}
                                    y={cy}
                                    className="fill-foreground text-3xl font-bold"
                                  >
                                    {active.occurrences.toLocaleString("pt-BR")}
                                  </tspan>
                                  <tspan
                                    x={cx}
                                    y={(cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    {nameToInitials(active.name)}
                                  </tspan>
                                </text>
                              );
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  )}
                </div>
              </div>

              <div className="my-2" />

              {/* total */}
              <div className="flex-1 min-h-[140px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Airplane className="w-5 h-5 text-gray-700" />
                  <h3 className="text-base font-semibold">
                    Total de Ocorrências
                  </h3>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <p className="font-extrabold leading-none text-4xl md:text-5xl lg:text-6xl">
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
