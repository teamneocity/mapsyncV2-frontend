import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "@/services/api";

function computePercentsIntWithMinPx(items, availableWidthPx, minLabelPx) {
  const totalCount = items.reduce((s, it) => s + (it.count || 0), 0);
  if (!totalCount) return items.map(() => 0);

  const minPctFromPx = Math.max(
    0,
    Math.min(100, (minLabelPx / Math.max(1, availableWidthPx)) * 100)
  );

  const positivesIdx = items
    .map((it, i) => ((it.count || 0) > 0 ? i : -1))
    .filter((i) => i !== -1);

  if (positivesIdx.length === 0) return items.map(() => 0);

  const rawPerc = items.map((it) => ((it.count || 0) / totalCount) * 100);

  const base = new Array(items.length).fill(0);
  let required = 0;
  for (const i of positivesIdx) {
    base[i] = minPctFromPx;
    required += minPctFromPx;
  }

  if (required >= 100) {
    const n = positivesIdx.length;
    const floor = Math.floor(100 / n);
    let rest = 100 - floor * n;
    const out = items.map(() => 0);
    for (const i of positivesIdx) out[i] = floor;
    for (let k = 0; k < rest; k++) out[positivesIdx[k % n]] += 1;
    return out;
  }

  const remaining = 100 - required;

  const weights = positivesIdx.map((i) =>
    Math.max(0, rawPerc[i] - minPctFromPx)
  );
  const weightSum = weights.reduce((s, v) => s + v, 0);

  const fracs = items.map(() => 0);
  if (weightSum > 0) {
    positivesIdx.forEach((i, k) => {
      fracs[i] = (weights[k] / weightSum) * remaining;
    });
  } else {
    positivesIdx.forEach((i) => {
      fracs[i] = remaining / positivesIdx.length;
    });
  }

  const floats = items.map((_, i) => base[i] + fracs[i]);
  const floors = floats.map((v) => Math.floor(v));
  let diff = 100 - floors.reduce((s, v) => s + v, 0);

  const remainder = floats.map((v, i) => ({ i, frac: v - Math.floor(v) }));
  remainder.sort((a, b) => b.frac - a.frac);

  for (let k = 0; k < diff; k++) floors[remainder[k % remainder.length].i] += 1;

  for (const i of positivesIdx) {
    if (floors[i] === 0) floors[i] = 1;
  }

  let sum = floors.reduce((s, v) => s + v, 0);
  while (sum > 100) {
    let j = floors.findIndex((v, idx) => v > 1 && positivesIdx.includes(idx));
    if (j === -1) j = floors.findIndex((v) => v > 0);
    if (j === -1) break;
    floors[j] -= 1;
    sum -= 1;
  }

  return floors;
}

export function TutorialCard({ labelColors }) {
  const [statusRows, setStatusRows] = useState(null);

  const statusLabels = {
    encaminhada_externa: "Externa",
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
    recusada: "Recusada",
  };

  const STATUS_FILL = {
    encaminhada_externa: "#cfcfcfff",
    em_analise: "#D0E4FC",
    emergencial: "#FFE8E8",
    aprovada: "#F6FFC6",
    os_gerada: "#f0ddee",
    aguardando_execucao: "#EBD4EA",
    em_execucao: "#FFF1CB",
    finalizada: "#C9F2E9",
    pendente: "#E8F7FF",
    aceita: "#FFF4D6",
    verificada: "#DDF2EE",
    rejeitada: "#ffc7c7ff",
    recusada: "#ffc7c7ff",
  };
  const STATUS_TEXT = {
    encaminhada_externa: "#5f5d5dff",
    em_analise: "#1678F2",
    emergencial: "#FF2222",
    aprovada: "#79811C",
    os_gerada: "#733B73",
    aguardando_execucao: "#5D2A61",
    em_execucao: "#845B00",
    finalizada: "#1C7551",
    pendente: "#33CFFF",
    aceita: "#986F00",
    verificada: "#40C4AA",
    rejeitada: "#9D0000",
    recusada: "#9D0000",
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
    const t = setTimeout(() => inst.resize(), 120);
    return () => clearTimeout(t);
  }, [w, h]);

  const FONT_PX = 32;
  const MIN_LABEL_PX = 60;

  const hasData =
    Array.isArray(statusRows) && statusRows.some((r) => (r.count || 0) > 0);

  // 🌟 AQUI: separei percentuais de layout (parts) e percentuais reais (displayPercents)
  const {
    parts,
    labels,
    palette,
    labelPalette,
    legendNames,
    counts,
    displayPercents,
  } = useMemo(() => {
    if (!Array.isArray(statusRows) || statusRows.length === 0) {
      return {
        parts: [],
        labels: [],
        palette: [],
        labelPalette: [],
        legendNames: [],
        counts: [],
        displayPercents: [],
      };
    }

    const ordered = [...statusRows].sort((a, b) => b.count - a.count);

    const availableWidthPx = Math.max(1, w - 16);

    // usado só para LARGURA (continua igual ao seu cálculo original)
    const percents = computePercentsIntWithMinPx(
      ordered,
      availableWidthPx,
      MIN_LABEL_PX
    );

    // percentual REAL (baseado nos counts)
    const totalCount = ordered.reduce((sum, it) => sum + (it.count || 0), 0);
    const realPercents =
      totalCount > 0
        ? ordered.map((it) =>
            Math.round(((it.count || 0) / totalCount) * 100)
          )
        : ordered.map(() => 0);

    const lbls = realPercents.map((p) => (p > 0 ? `${p}%` : ""));

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

    const pal = ordered.map(
      (it, i) => STATUS_FILL[it.status] ?? baseColors[i % baseColors.length]
    );

    const labelBase =
      Array.isArray(labelColors) && labelColors.length
        ? labelColors
        : ordered.map(
            (it, i) =>
              STATUS_TEXT[it.status] ??
              baseLabelColorsDefault[i % baseLabelColorsDefault.length]
          );

    const labelPal =
      Array.isArray(labelColors) && labelColors.length
        ? ordered.map((_, i) => labelColors[i % labelColors.length])
        : labelBase;

    return {
      parts: percents, // layout
      labels: lbls, // texto pronto, se quiser usar
      displayPercents: realPercents, // percentual REAL
      palette: pal,
      labelPalette: labelPal,
      legendNames: ordered.map((it) => statusLabels[it.status] || it.status),
      counts: ordered.map((it) => it.count),
    };
  }, [statusRows, labelColors, w]);

  // séries: largura usa parts, texto usa displayPercents
  const series = parts.map((p, idx) => ({
    name: legendNames[idx],
    type: "bar",
    stack: "total",
    data: [p], // continua usando o percentual "fake" pra largura
    barWidth: "100%",
    zlevel: 10,
    label: {
      show: p > 0,
      position: "inside",
      align: "center",
      verticalAlign: "middle",
      distance: 0,
      formatter: `${displayPercents?.[idx] ?? 0}%`, // 👈 percentual REAL
      color: labelPalette[idx],
      fontSize: FONT_PX,
      fontWeight: 700,
      textShadowColor: "rgba(0,0,0,0.12)",
      textShadowBlur: 1,
    },
    labelLayout: { hideOverlap: false },
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
    emphasis: { disabled: true },
  }));

  const option = {
    animation: true,
    animationDuration: 800,
    animationEasing: "cubicOut",
    animationDurationUpdate: 600,
    animationEasingUpdate: "cubicOut",
    xAxis: { type: "value", min: 0, max: 100, show: false },
    yAxis: { type: "category", data: [""], show: false },
    grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
    tooltip: {
      show: true,
      trigger: "item",
      confine: true,
      appendToBody: true,
      formatter: (params) => {
        const idx = params.seriesIndex;
        const name = legendNames?.[idx] ?? "";
        const percent = displayPercents?.[idx] ?? 0; // 👈 percentual REAL
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

  const hasLegend = hasData && Array.isArray(parts) && parts.length > 0;

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

      {hasLegend && (
        <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 min-w-0">
          {parts.map((_, idx) => (
            <div
              key={`${legendNames[idx]}-${idx}`}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: palette[idx] }}
                aria-hidden
              />
              <span className="capitalize">{legendNames[idx]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
