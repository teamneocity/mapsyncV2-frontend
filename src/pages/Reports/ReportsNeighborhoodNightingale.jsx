// src/pages/Reports/ReportsNeighborhoodNightingale.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "@/services/api";

const DECALS = [
  { symbol: "rect", dashArrayX: [4, 2], dashArrayY: [2, 2], symbolSize: 1, rotation: 0, color: "rgba(0,0,0,0.12)" },
  { symbol: "circle", dashArrayX: [1, 0], dashArrayY: [2, 2], symbolSize: 0.9, color: "rgba(0,0,0,0.14)" },
  { symbol: "triangle", dashArrayX: [1, 0], dashArrayY: [2, 4], symbolSize: 1, rotation: Math.PI / 4, color: "rgba(0,0,0,0.12)" },
  { symbol: "diamond", dashArrayX: [1, 0], dashArrayY: [2, 3], symbolSize: 1, rotation: Math.PI / 6, color: "rgba(0,0,0,0.12)" },
  { symbol: "rect", dashArrayX: [8, 4], dashArrayY: [6, 0], symbolSize: 1, rotation: Math.PI / 3, color: "rgba(0,0,0,0.10)" },
  { symbol: "circle", dashArrayX: [2, 2], dashArrayY: [2, 2], symbolSize: 0.8, color: "rgba(0,0,0,0.12)" },
];

export default function ReportsNeighborhoodNightingale({
  className = "",
  title = "Bairros com mais ocorrências",
  endpoint = "/occurrences/stats",
  limit = 6,
  // >> NOVO: controle fino de tamanho via Tailwind
  mobileHeight = "h-64",
  height = "md:h-72 xl:h-80", // você pode trocar por h-60, h-96, etc.
  // filtros (se já estiver usando no Reports, pode manter)
  sectorId,
  status,
  period,
  paramsExtra = {},
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0;
      setWidth(w);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchStats() {
      try {
        setLoading(true);
        setErr(null);

        const params = {
          ...(sectorId ? { sectorId } : {}),
          ...(status ? { status } : {}),
          ...(period ? { period } : {}),
          ...paramsExtra,
        };

        const { data } = await api.get(endpoint, { params });
        if (ignore) return;

        const topN = (data?.byNeighborhood ?? [])
          .sort((a, b) => b.current - a.current)
          .slice(0, limit)
          .map((n, idx) => ({
            name: n.neighborhood,
            value: n.current,
            previous: n.previous ?? 0,
            difference: n.difference ?? 0,
            itemStyle: { decal: DECALS[idx % DECALS.length] },
          }));

        setData(topN);
      } catch (e) {
        setErr(e?.message || "Erro ao carregar estatísticas");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
    return () => { ignore = true; };
  }, [endpoint, limit, sectorId, status, period, JSON.stringify(paramsExtra)]);

  const option = useMemo(() => {
    const seriesData = data.map((d, idx) => ({
      ...d,
      itemStyle: { decal: DECALS[idx % DECALS.length] },
    }));
    const total = seriesData.reduce((sum, it) => sum + (it.value || 0), 0);

    const isCompact = width > 0 && width < 520;
    const showLegend = !isCompact;
    const showTitleInside = !isCompact;

    const center = showLegend ? ["32%", "50%"] : ["50%", "50%"];

    // >> AJUSTE: radius adaptativo mais conservador pra espaços pequenos
    // pega a menor dimensão útil (aprox.) pra evitar cortes
    const approxH = 280; // base pra mobileHeight h-64 ≈ 16*16*4 = 256~280px úteis
    const base = Math.min(width || 300, approxH);
    const outer = showLegend ? 120 : Math.max(96, Math.min(140, Math.floor(base * 0.42)));

    const radius = showLegend ? [18, outer] : [22, outer];

    const maxLength = seriesData.reduce((acc, cur) => Math.max(acc, cur.name.length), 0);

    return {
      title: showTitleInside
        ? {
            right: 135,
            top: 20,
            text: "Total",
            subtext: String(total),
            textAlign: "left",
            textStyle: { fontSize: 14, fontWeight: 400, color: "#000" },
            subtextStyle: { fontSize: 40, fontWeight: 700, color: "#111", lineHeight: 28 },
          }
        : undefined,

      tooltip: {
        trigger: "item",
        formatter: (p) => {
          const { name, value, data } = p;
          const diff = data?.difference ?? 0;
          const prev = data?.previous ?? 0;
          const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
          return `
            <div style="min-width:180px">
              <div><strong>${name}</strong></div>
              <div>Ocorrências (atual): <strong>${value}</strong></div>
              <div>Período anterior: ${prev}</div>
              <div>Variação: ${sign}${Math.abs(diff)}</div>
            </div>`;
        },
      },

      legend: showLegend
        ? {
            orient: "vertical",
            right: 50,
            top: "center",
            textStyle: { color: "#444" },
            itemWidth: 12,
            itemHeight: 12,
            formatter: (name) => {
              const item = seriesData.find((d) => d.name === name);
              const value = item ? item.value : 0;
              return name.padEnd(maxLength + 2, " ") + value;
            },
          }
        : undefined,

      series: [
        {
          type: "pie",
          roseType: "radius",
          center,
          radius,
          itemStyle: { borderRadius: 6 },
          label: { show: false },
          labelLine: { show: false },
          data: seriesData,
        },
      ],
    };
  }, [data, width]);

  if (loading) {
    return (
      <div ref={containerRef} className={`flex items-center justify-center ${mobileHeight} ${height} ${className}`}>
        Carregando…
      </div>
    );
  }

  if (err) {
    return (
      <div ref={containerRef} className={`flex items-center justify-center text-red-600 ${mobileHeight} ${height} ${className}`}>
        {err}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div ref={containerRef} className={`flex items-center justify-center text-gray-500 ${mobileHeight} ${height} ${className}`}>
        Sem dados para exibir
      </div>
    );
  }

  return (
    <div className={`w-full bg-white rounded-2xl shadow p-4 md:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {/* wrapper com altura controlada por props, sem mudar nada no ECharts */}
      <div className={`w-full ${mobileHeight} ${height}`} ref={containerRef}>
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} notMerge lazyUpdate />
      </div>
    </div>
  );
}
