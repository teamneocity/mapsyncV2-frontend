import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "@/services/api";

function countsToPercentsInt(items) {
  const total = items.reduce((s, it) => s + (it.count || 0), 0);
  if (!total) return items.map(() => 0); // sem total => tudo 0 (sem mock)
  const withFracs = items.map((it) => {
    const raw = (it.count / total) * 100;
    return { ...it, raw, floor: Math.floor(raw), frac: raw - Math.floor(raw) };
  });
  let sumFloors = withFracs.reduce((s, it) => s + it.floor, 0);
  let diff = 100 - sumFloors;
  const sorted = [...withFracs].sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < diff; i++) sorted[i % sorted.length].floor += 1;
  const mapBack = new Map(sorted.map((it) => [it.status, it.floor]));
  return items.map((it) => mapBack.get(it.status));
}

export function TutorialCard({ labelColors }) {
  const [statusRows, setStatusRows] = useState(null);

  const statusLabels = {
    em_analise: "Em análise",
    emergencial: "Emergencial",
    aprovada: "Aprovada",
    os_gerada: "O.S. gerada",
    aguardando_execucao: "Agendada",
    em_execucao: "Andamento",
    finalizada: "Finalizada",
    pendente: "Pendente",
    aceita: "Aceita",
    verificada: "Verificada",
    rejeitada: "Rejeitada",
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data } = await api.get("/occurrences/stats");
        if (ignore) return;
        setStatusRows(Array.isArray(data?.byStatus) ? data.byStatus : []);
      } catch (e) {
        console.warn("[TutorialCard] erro /occurrences/stats", e);
        setStatusRows([]);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const wrapRef = useRef(null);
  const chartRef = useRef(null);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setW(cr.width);
        setH(cr.height);
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const inst = chartRef.current?.getEchartsInstance?.();
    if (!inst) return;
    const t = setTimeout(() => inst.resize(), 120); // pequeno debounce
    return () => clearTimeout(t);
  }, [w, h]);

  const labelFont = w < 380 ? 12 : w < 520 ? 16 : w < 760 ? 24 : 32;
  const minLabelPercent = w < 520 ? 10 : 5;

  const hasData =
    Array.isArray(statusRows) && statusRows.some((r) => (r.count || 0) > 0);

  const { parts, labels, palette, labelPalette, legendNames, counts } =
    useMemo(() => {
      const baseColors = [
        "#E8F2FF",
        "#F6FFC6",
        "#FFE8E8",
        "#EBD4EA",
        "#E9E4FC",
        "#FFF1CB",
        "#FFE8DC",
        "#C9F2E9",
        "#EDEDED",
      ];

      const baseLabelColorsDefault = [
        "#4593F5",
        "#79811C",
        "#96132C",
        "#5D2A61",
        "#4F26F0",
        "#845B00",
        "#824F24",
        "#1C7551",
        "#5F5F5F",
      ];

      if (!Array.isArray(statusRows) || statusRows.length === 0) {
        return {
          parts: [],
          labels: [],
          palette: [],
          labelPalette: [],
          legendNames: [],
          counts: [],
        };
      }

      const ordered = [...statusRows].sort((a, b) => b.count - a.count);
      const percents = countsToPercentsInt(ordered);

      const lbls = percents.map((p) => (p >= minLabelPercent ? `${p}%` : ""));
      const pal =
        ordered.length <= baseColors.length
          ? baseColors.slice(0, ordered.length)
          : Array.from(
              { length: ordered.length },
              (_, i) => baseColors[i % baseColors.length]
            );

      const labelBase =
        Array.isArray(labelColors) && labelColors.length
          ? labelColors
          : baseLabelColorsDefault;

      const labelPal =
        ordered.length <= labelBase.length
          ? labelBase.slice(0, ordered.length)
          : Array.from(
              { length: ordered.length },
              (_, i) => labelBase[i % labelBase.length]
            );

      return {
        parts: percents,
        labels: lbls,
        palette: pal,
        labelPalette: labelPal,
        legendNames: ordered.map((it) => statusLabels[it.status] || it.status),
        counts: ordered.map((it) => it.count),
      };
    }, [statusRows, minLabelPercent, labelColors]);

  const series = parts.map((v, idx) => ({
    name: legendNames[idx],
    type: "bar",
    stack: "total",
    data: [v],
    barWidth: "100%",
    label: {
      show: Boolean(labels[idx]),
      position: "inside",
      formatter: labels[idx],
      color: labelPalette[idx],
      fontSize: labelFont,
      fontWeight: 600,
    },
    itemStyle: {
      color: palette[idx],
      borderRadius:
        idx === 0
          ? [12, 0, 0, 12]
          : idx === parts.length - 1
          ? [0, 12, 12, 0]
          : 0,
    },
    silent: false,
  }));

  const option = {
    animation: true,
    animationDuration: 800,
    animationEasing: "cubicOut",
    animationDurationUpdate: 600,
    animationEasingUpdate: "cubicOut",
    xAxis: { type: "value", min: 0, max: 100, show: false },
    yAxis: { type: "category", data: [""], show: false },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    tooltip: {
      show: true,
      trigger: "item",
      confine: true,
      appendToBody: true,
      formatter: (params) => {
        const idx = params.seriesIndex;
        const name = legendNames?.[idx] ?? "";
        const percent = parts?.[idx] ?? 0;
        const count = counts?.[idx];
        const marker = params.marker || "•";
        return count != null
          ? `${marker} <b>${name}</b><br/>${percent}% (${count})`
          : `${marker} <b>${name}</b><br/>${percent}%`;
      },
    },
    series,
  };

  const mesRefLabel = useMemo(() => {
    const now = new Date();
    const mes = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(now);
    return `${mes} `;
  }, []);

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <span
        className="
          absolute -top-6 right-7
          text-[11px] sm:text-xs text-black
          px-2 py-1 rounded-md
          select-none pointer-events-none whitespace-nowrap
        "
      >
        Referente ao mês de {mesRefLabel}
      </span>

      <div className="w-full min-w-0 p-2 bg-white rounded-2xl shadow-md">
        <div className="h-[260px] min-w-0 flex items-center justify-center">
          {statusRows === null ? (
            <span className="text-gray-500 text-sm">Carregando…</span>
          ) : !hasData ? (
            <span className="text-gray-500 text-sm">Sem dados disponíveis</span>
          ) : (
            <ReactECharts
              ref={chartRef}
              option={option}
              style={{ width: "100%", height: "100%" }}
              notMerge
              lazyUpdate={true}
              opts={{ renderer: w < 520 ? "svg" : "canvas" }}
            />
          )}
        </div>
      </div>

      {hasData && legendNames?.length > 0 && (
        <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 min-w-0">
          {legendNames.map((name, idx) => (
            <div
              key={`${name}-${idx}`}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: palette[idx] }}
                aria-hidden
              />
              <span className="capitalize">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
