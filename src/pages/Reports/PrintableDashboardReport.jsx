"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { useSearchParams } from "react-router-dom";

// Cores por status
const STATUS_COLOR_MAP = {
  aguardando_execucao: {
    hex: "#F59E0B",
    text: "#92400E",
    bg: "bg-amber-100",
    ring: "ring-amber-200",
  },
  em_execucao: {
    hex: "#3B82F6",
    text: "#1E3A8A",
    bg: "bg-blue-100",
    ring: "ring-blue-200",
  },
  finalizada: {
    hex: "#10B981",
    text: "#065F46",
    bg: "bg-emerald-100",
    ring: "ring-emerald-200",
  },
};

const FALLBACK_COLORS = [
  {
    hex: "#F97316",
    text: "#7C2D12",
    bg: "bg-orange-100",
    ring: "ring-orange-200",
  },
  { hex: "#EF4444", text: "#7F1D1D", bg: "bg-red-100", ring: "ring-red-200" },
  {
    hex: "#8B5CF6",
    text: "#4C1D95",
    bg: "bg-violet-100",
    ring: "ring-violet-200",
  },
  {
    hex: "#94A3B8",
    text: "#0F172A",
    bg: "bg-slate-100",
    ring: "ring-slate-200",
  },
];

// Base URL do bucket
const BASE_MEDIA_URL = (
  import.meta.env.VITE_MEDIA_CDN ||
  import.meta.env.VITE_FILES_CDN ||
  import.meta.env.VITE_S3_BUCKET_URL ||
  "https://mapsync-media.s3.sa-east-1.amazonaws.com"
).replace(/\/$/, "");

// Helpers
function humanize(str = "") {
  return String(str)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function monthLabel() {
  const m = new Date().toLocaleString("pt-BR", { month: "long" });
  return `${m.replace(/^./, (c) =>
    c.toUpperCase()
  )} de ${new Date().getFullYear()}`;
}

function formatAddress(addr = {}) {
  const parts = [
    [addr.street, addr.number].filter(Boolean).join(", "),
    addr.neighborhoodName,
  ].filter(Boolean);
  return parts.join(" — ");
}

// Prioriza final depois inicial
function pickPhoto(photos = []) {
  if (!Array.isArray(photos) || photos.length === 0) return null;
  const norm = (v) =>
    String(v || "")
      .trim()
      .toUpperCase();

  const final = photos.find((p) => norm(p.stage) === "FINAL");
  const initial = photos.find((p) =>
    ["INICIAL", "INITIAL", "INICIO"].includes(norm(p.stage))
  );
  const chosen = final || initial || photos[0];

  if (!chosen?.url) return null;
  if (/^https?:\/\//i.test(chosen.url)) return chosen.url;
  return `${BASE_MEDIA_URL}/${String(chosen.url).replace(/^\/+/, "")}`;
}

// Quebra lista em blocos de 2
function chunk2(arr = []) {
  const out = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
}

function StatusBadge({ status }) {
  const map = STATUS_COLOR_MAP[status] || FALLBACK_COLORS[0];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12px] font-semibold ${map.bg} ring-1 ${map.ring}`}
      style={{ color: map.text }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <circle cx="5" cy="5" r="5" fill={map.hex} />
      </svg>
      {humanize(status)}
    </span>
  );
}

// imagem
function Photo({ src, alt }) {
  if (!src) {
    return (
      <div className="photo w-full aspect-[4/3] bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center text-xs text-neutral-500">
        Sem foto
      </div>
    );
  }
  return (
    <div className="photo w-full aspect-[4/3] rounded-lg overflow-hidden border border-neutral-200">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

// Gráfico de pizza
function PieSVG({ items, size = 260 }) {
  const total = Math.max(
    1,
    items.reduce((s, it) => s + (Number(it.value) || 0), 0)
  );
  const cx = size / 2,
    cy = size / 2,
    r = size / 2 - 2;
  let angle = -90;

  const toPath = (v) => {
    const slice = v / total,
      sweep = slice * 360,
      large = sweep > 180 ? 1 : 0;
    const start = (angle * Math.PI) / 180,
      end = ((angle + sweep) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start),
      y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),
      y2 = cy + r * Math.sin(end);
    angle += sweep;
    return { x1, y1, x2, y2, large };
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {items.map((it, i) => {
        const v = Number(it.value) || 0;
        if (v <= 0) return null;
        const { x1, y1, x2, y2, large } = toPath(v);
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={it.colorHex}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.35} fill="#fff" />
    </svg>
  );
}

// Página principal
export default function PrintableDashboardReport() {
  const [stats, setStats] = useState({ byNeighborhood: [], byStatus: [] });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // lê filtros da URL (vindos lá do ReportsOverview)
  const [params] = useSearchParams();
  const neighborhoodFilter = (params.get("neighborhood") || "").trim();
  const statusFilter = (params.get("status") || "").trim();

  // busca dados
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/service-orders/stats");
        if (!alive) return;

        setStats(data || { byNeighborhood: [], byStatus: [] });

        const flat = data.byNeighborhood.flatMap((n) =>
          (n.occurrences || []).map((o) => ({
            id: o.serviceOrderId,
            status: o.status,
            type: o.occurrenceType,
            createdAt: o.createdAt,
            address: o.address,
            photos: o.photos || [],
          }))
        );

        // ordena por bairro
        flat.sort((a, b) => {
          const an = (a.address?.neighborhoodName || "").localeCompare(
            b.address?.neighborhoodName || ""
          );
          if (an !== 0) return an;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setOrders(flat);
      } catch (err) {
        console.error("[PrintableDashboardReport] /service-orders/stats", err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // aplica filtros no front-end
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (neighborhoodFilter) {
      const nf = neighborhoodFilter.toLowerCase();
      list = list.filter(
        (o) => (o.address?.neighborhoodName || "").toLowerCase() === nf
      );
    }

    if (statusFilter) {
      list = list.filter((o) => o.status === statusFilter);
    }

    return list;
  }, [orders, neighborhoodFilter, statusFilter]);

  const statusItems = useMemo(() => {
    // agrupa por status com base nas ordens filtradas
    const map = new Map();

    filteredOrders.forEach((o) => {
      if (!o.status) return;
      map.set(o.status, (map.get(o.status) || 0) + 1);
    });

    let fb = 0;

    // se não houver ordens filtradas e stats.byStatus existir,
    // usa o agrupamento original.
    if (
      map.size === 0 &&
      filteredOrders.length === 0 &&
      stats.byStatus?.length
    ) {
      return stats.byStatus.map((s) => {
        const key = s.status;
        const color =
          STATUS_COLOR_MAP[key] ||
          FALLBACK_COLORS[fb++ % FALLBACK_COLORS.length];
        return { label: humanize(key), value: s.count, colorHex: color.hex };
      });
    }

    return Array.from(map.entries()).map(([key, count]) => {
      const color =
        STATUS_COLOR_MAP[key] || FALLBACK_COLORS[fb++ % FALLBACK_COLORS.length];
      return { label: humanize(key), value: count, colorHex: color.hex };
    });
  }, [filteredOrders, stats]);

  const totalStatus = statusItems.reduce((s, it) => s + it.value, 0);
  const now = new Date().toLocaleString("pt-BR");
  const period = monthLabel();

  // bairros distintos a partir das ordens filtradas
  const neighborhoodNames = useMemo(() => {
    const set = new Set();
    filteredOrders.forEach((o) => {
      const name = o.address?.neighborhoodName;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [filteredOrders]);

  // usa as ordens filtradas para montar as páginas de 2 em 2
  const sheets = useMemo(() => chunk2(filteredOrders), [filteredOrders]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Barra superior */}
      <div className="print:hidden sticky top-0 z-10 flex items-center gap-2 border-b border-neutral-200 bg-white/90 backdrop-blur px-4 py-3">
        <button
          onClick={() => window.history.back()}
          className="h-10 px-3 rounded-lg border border-neutral-300 bg-white text-gray-700 text-sm"
        >
          Voltar
        </button>
        <button
          onClick={() => window.print()}
          className="h-10 px-3 rounded-lg border border-neutral-300 bg-white text-gray-700 text-sm"
        >
          Imprimir
        </button>
      </div>

      {/* Conteúdo */}
      <main className="mx-auto max-w-[900px] px-6 py-6">
        {/* Cabeçalho */}
        <header className="relative mb-8 mt-10">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-800">
                Relatório fotográfico
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Relatório — Ordens de Serviço
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center text-sm text-gray-600 text-center">
            <p>Gerado em: {now}</p>
            <p>Período: {period}</p>
            <p>
              Bairros com ocorrência:{" "}
              <span className="font-semibold">{neighborhoodNames.length}</span>{" "}
              | Total : <span className="font-semibold">{totalStatus}</span>
            </p>
            {(neighborhoodFilter || statusFilter) && (
              <p className="mt-1 text-xs text-gray-500">
                Filtros aplicados:
                {neighborhoodFilter && (
                  <>
                    {" "}
                    Bairro ={" "}
                    <span className="font-semibold">{neighborhoodFilter}</span>
                  </>
                )}
                {neighborhoodFilter && statusFilter && " |"}
                {statusFilter && (
                  <>
                    {" "}
                    Status ={" "}
                    <span className="font-semibold">
                      {humanize(statusFilter)}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
        </header>

        {/* Resumo + Gráfico */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 border rounded-xl p-4">
            <h3 className="text-base font-semibold mb-3">Lista dos bairros:</h3>
            {neighborhoodNames.length ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {neighborhoodNames.map((name, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-800">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-[120px] flex items-center justify-center text-gray-400">
                Sem bairros no mês.
              </div>
            )}
          </div>

          <div className="lg:col-span-5 border rounded-xl p-4">
            <h3 className="text-base font-semibold">
              Total de ocorrências fiscalizadas: {totalStatus}
            </h3>
            <div className="mt-3 flex flex-col items-center">
              <PieSVG items={statusItems} />
              <div className="mt-4 w-full space-y-1 text-sm">
                {statusItems
                  .filter((i) => i.value > 0)
                  .map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        className="shrink-0"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="15"
                          height="15"
                          rx="3"
                          fill={it.colorHex}
                          stroke="rgba(0,0,0,0.15)"
                        />
                      </svg>
                      <span className="font-medium text-gray-800">
                        {it.label}
                      </span>
                      <span className="text-gray-500">— {it.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ocorrências (2 por página) */}
        <section className="mt-10">
          {loading ? (
            <div className="h-[180px] flex items-center justify-center text-gray-400">
              Carregando ocorrências…
            </div>
          ) : sheets.length === 0 ? (
            <div className="h-[120px] flex items-center justify-center text-gray-400">
              Nenhuma ocorrência neste mês com os filtros aplicados.
            </div>
          ) : (
            <div className="space-y-10">
              {sheets.map((pair, sheetIdx) => (
                <div key={sheetIdx} className="sheet space-y-6">
                  {pair.map((so) => {
                    const photoUrl = pickPhoto(so.photos);
                    const addr = so.address || {};
                    return (
                      <article
                        key={so.id}
                        className="card rounded-xl border border-neutral-200 p-4"
                        style={{ breakInside: "avoid" }}
                      >
                        <Photo src={photoUrl} alt={`OS ${so.id}`} />

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm text-gray-700">
                            <div className="font-semibold text-gray-900">
                              {humanize(so.type) || "Tipo não informado"}
                            </div>
                            <div className="mt-0.5">
                              {formatAddress(addr) || "Endereço não informado"}
                            </div>
                          </div>
                          <StatusBadge status={so.status} />
                        </div>
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* CSS de impressão */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          .print\\:hidden { display: none !important; }
          .sheet { page-break-after: always; break-after: page; }
          .sheet:last-child { page-break-after: auto; }
          .card { break-inside: avoid; page-break-inside: avoid; }
          .photo { height: 95mm !important; max-height: 95mm !important; }
          .photo img { width: 100%; height: 100%; object-fit: cover; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  );
}
