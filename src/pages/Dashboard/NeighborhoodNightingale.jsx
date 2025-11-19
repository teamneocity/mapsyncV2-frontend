// src/components/NeighborhoodNightingale.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
} from "recharts";
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
    color: "rgba(0,0,0,0.1)",
  },
  {
    symbol: "circle",
    dashArrayX: [2, 2],
    dashArrayY: [2, 2],
    symbolSize: 0.8,
    color: "rgba(0,0,0,0.12)",
  },
];

// Cores
const COLORS = [
  "#cbe0fcff",
  "#eaf7a2ff",
  "#fec7c7ff",
  "#f4aaf0ff",
  "#af9df6ff",
  "#fce39eff",
];

export function NeighborhoodNightingale({ className = "" }) {
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

  // Busca os dados
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
            decal: DECALS[idx % DECALS.length],
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

  // total para mostrar no centro
  const total = useMemo(
    () => data.reduce((sum, it) => sum + (it.value || 0), 0),
    [data]
  );

  const isCompact = width > 0 && width < 520;

  if (loading) {
    return (
      <div
        ref={containerRef}
        className={`h-full min-h-64 flex items-center justify-center ${className}`}
      >
        Carregando…
      </div>
    );
  }

  if (err) {
    return (
      <div
        ref={containerRef}
        className={`h-full min-h-64 flex items-center justify-center text-red-600 ${className}`}
      >
        {err}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`h-full min-h-64 flex items-center justify-center text-gray-500 ${className}`}
      >
        Sem dados para exibir
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <div
        className={`flex h-full w-full ${
          isCompact ? "flex-col items-center" : "flex-row items-center"
        } gap-4`}
      >
        {/* Gráfico */}
        <div className="flex-1 h-full min-h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  const diff = item.difference ?? 0;
                  const prev = item.previous ?? 0;
                  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";

                  return (
                    <div className="rounded-md border bg-white px-3 py-2 text-xs shadow-md">
                      <div className="font-medium">{item.name}</div>
                      <div className="mt-1 space-y-0.5">
                        <div>
                          Ocorrências (atual):{" "}
                          <span className="font-semibold">{item.value}</span>
                        </div>
                        <div>Período anterior: {prev}</div>
                        <div>
                          Variação: {sign}
                          {Math.abs(diff)}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="55%" 
                outerRadius="88%"
                paddingAngle={0} 
                strokeWidth={0}
                isAnimationActive
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}

                {/* tetxo no meio */}
                <Label
                  content={({ viewBox }) => {
                    if (
                      !viewBox ||
                      typeof viewBox.cx !== "number" ||
                      typeof viewBox.cy !== "number"
                    ) {
                      return null;
                    }
                    const { cx, cy } = viewBox;
                    return (
                      <g>
                        <text
                          x={cx}
                          y={cy - 8}
                          textAnchor="middle"
                          className="fill-gray-500 text-xs"
                        >
                          Total
                        </text>
                        <text
                          x={cx}
                          y={cy + 12}
                          textAnchor="middle"
                          className="fill-gray-900 text-2xl font-bold"
                        >
                          {total}
                        </text>
                      </g>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legendas  */}
        {!isCompact && (
          <div className="flex flex-col justify-center w-44 pl-2">
            <ul className="space-y-1.5 text-xs">
              {data.map((item, index) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-medium tabular-nums">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
