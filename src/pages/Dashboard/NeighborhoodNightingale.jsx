// src/components/NeighborhoodNightingale.jsx
import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "@/services/api";

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

export function NeighborhoodNightingale({ className = "" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function fetchStats() {
      try {
        setLoading(true);
        setErr(null);
        const { data } = await api.get("/occurrences/stats");
        if (ignore) return;

        const top6 = (data?.byNeighborhood ?? [])
          .sort((a, b) => b.current - a.current)
          .slice(0, 6)
          .map((n, idx) => ({
            name: n.neighborhood,
            value: n.current,
            previous: n.previous ?? 0,
            difference: n.difference ?? 0,
            itemStyle: { decal: DECALS[idx % DECALS.length] },
          }));
        setData(top6);
      } catch (e) {
        setErr(e?.message || "Erro ao carregar estatísticas");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    return () => {
      ignore = true;
    };
  }, []);

  const option = useMemo(() => {
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

    const maxLength = data.reduce(
      (acc, cur) => Math.max(acc, cur.name.length),
      0
    );
    const seriesData = data.map((d, idx) => ({
      ...d,
      itemStyle: { decal: DECALS[idx % DECALS.length] },
    }));

    const total = seriesData.reduce((sum, it) => sum + (it.value || 0), 0);

    return {
      title: {
        right:135,
        top: 20,
        text: "Total",
        subtext: String(total),
        textAlign: "left",
        textStyle: { fontSize: 14, fontWeight: 400, color: "#000000" },
        subtextStyle: {
          fontSize: 40,
          fontWeight: 700,
          color: "#111",
          lineHeight: 28,
        },
      },

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
          </div>
        `;
        },
      },

      legend: {
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
      },

      series: [
        {
          type: "pie",
          radius: [20, 120],
          center: ["32%", "50%"], // mantém espaço pra coluna direita
          roseType: "radius",
          itemStyle: { borderRadius: 6 },
          label: { show: false },
          labelLine: { show: false },
          data: seriesData,
        },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <div
        className={`h-[340px] flex items-center justify-center ${className}`}
      >
        Carregando…
      </div>
    );
  }

  if (err) {
    return (
      <div
        className={`h-[340px] flex items-center justify-center text-red-600 ${className}`}
      >
        {err}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={`h-[340px] flex items-center justify-center text-gray-500 ${className}`}
      >
        Sem dados para exibir
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: "100%", width: "100%" }}
      notMerge
      lazyUpdate
    />
  );
}
