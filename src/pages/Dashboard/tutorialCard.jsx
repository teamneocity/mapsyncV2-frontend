import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "@/services/api";

function countsToPercentsInt(items) {
  const total = items.reduce((s, it) => s + (it.count || 0), 0);
  if (!total) return null;

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

export function TutorialCard() {
  // --- dados da API
  const [statusRows, setStatusRows] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data } = await api.get("/occurrences/stats");
        if (ignore) return;
        setStatusRows(Array.isArray(data?.byStatus) ? data.byStatus : []);
      } catch (e) {
        console.warn("[TutorialCard] erro /occurrences/stats", e);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const wrapRef = useRef(null);
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

  const labelFont = w < 380 ? 12 : w < 520 ? 16 : w < 760 ? 24 : 32;

  const minLabelPercent = w < 520 ? 10 : 5;

  const { parts, labels, palette, legendNames, counts } = useMemo(() => {
    const baseColors = [
      "#1677FF",
      "#3C8CFA",
      "#6AA6F7",
      "#9EC2FA",
      "#C7DBFC",
      "#E6F0FF",
    ];

    if (!statusRows || statusRows.length === 0) {
      return {
        parts: [25, 25, 18, 14, 10, 8, 3],
        labels: ["25%", "25%", "18%", "14%", "10%", "8%", "3%"],
        palette: baseColors,
        legendNames: ["A", "B", "C", "D", "E", "F", "G"],
        counts: [25, 25, 18, 14, 10, 8, 3], // mock
      };
    }

    const ordered = [...statusRows].sort((a, b) => b.count - a.count);
    const percents = countsToPercentsInt(ordered) ?? [100];

    const lbls = percents.map((p) => (p >= minLabelPercent ? `${p}%` : "")); 
    const pal =
      ordered.length <= baseColors.length
        ? baseColors.slice(0, ordered.length)
        : Array.from(
            { length: ordered.length },
            (_, i) => baseColors[i % baseColors.length]
          );

    return {
      parts: percents,
      labels: lbls,
      palette: pal,
      legendNames: ordered.map((it) => it.status),
      counts: ordered.map((it) => it.count),
    };
  }, [statusRows, minLabelPercent]);

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
      color: "#fff",
      fontSize: labelFont,
      fontWeight: 200,
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

  return (
  <div ref={wrapRef}>
    <div className="w-full p-2 bg-white rounded-2xl shadow-md ">
      {/* Wrapper que define a altura exata do gráfico em cada breakpoint */}
      <div className="h-[260px]">
        <ReactECharts
          option={option}
          style={{ width: "100%", height: "100%" }}
          notMerge
          lazyUpdate
          opts={{ renderer: w < 520 ? "svg" : "canvas" }}
        />
      </div>
    </div>

    <div className="flex flex-wrap gap-3 sm:gap-4 mt-3">
      {legendNames?.map((name, idx) => (
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
  </div>
);

}
