"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { useSearchParams } from "react-router-dom";

const BASE_MEDIA_URL = (
  import.meta.env.VITE_MEDIA_CDN ||
  import.meta.env.VITE_FILES_CDN ||
  import.meta.env.VITE_S3_BUCKET_URL ||
  "https://mapsync-media.s3.sa-east-1.amazonaws.com"
).replace(/\/$/, "");

const STATUS_LABELS = {
  em_analise: "Sob análise",
  aprovada: "Aprovada",
  em_execucao: "Em execução",
  finalizada: "Finalizada",
  atrasada: "Atrasada",
  emergencial: "Emergencial",
};

function humanizeStatus(s) {
  if (!s) return "Todos os status";
  return (
    STATUS_LABELS[s] ||
    String(s || "")
      .replace(/_/g, " ")
      .replace(/^./, (c) => c.toUpperCase())
  );
}

function monthLabel() {
  const d = new Date();
  const m = d.toLocaleString("pt-BR", { month: "long" });
  return `${m.replace(/^./, (c) => c.toUpperCase())} de ${d.getFullYear()}`;
}

function resolveMediaUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${BASE_MEDIA_URL}/${String(u).replace(/^\/+/, "")}`;
}

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
  return resolveMediaUrl(chosen?.url);
}

function chunk2(arr = []) {
  const out = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
}

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

export default function SectorStatusCoverageReport({ onClose }) {
  const [params, setParams] = useSearchParams();
  const sectorId = params.get("sectorId");
  const sectorName = params.get("sectorName") || "Setor";
  const [selectedStatus, setSelectedStatus] = useState(
    params.get("status") || ""
  ); // pode ser vazio

  const initialPeriod = (() => {
    const p = params.get("period");
    return p === "day" || p === "week" || p === "month" ? p : "month";
  })();
  const [period, setPeriod] = useState(initialPeriod);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = params.get("period");
    if (p === "day" || p === "week" || p === "month") setPeriod(p);
    setSelectedStatus(params.get("status") || "");
  }, [params]);

  // carregar dados (sem status quando vazio)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const query = { sectorId };
        if (selectedStatus) query.status = selectedStatus;

        const { data } = await api.get("/reports/neighborhood-coverage", {
          params: query,
        });

        if (!alive) return;
        setData(data?.data || null);
      } catch (err) {
        console.error(
          "[SectorStatusCoverageReport] /reports/neighborhood-coverage",
          err
        );
        if (!alive) return;
        setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [sectorId, selectedStatus]);

  // remove status
  function handleClearStatus() {
    const next = new URLSearchParams(params);
    next.delete("status");
    setParams(next);
    setSelectedStatus("");
  }

  const now = new Date().toLocaleString("pt-BR");
  const periodLabel =
    period === "day" ? "Hoje" : period === "week" ? "Esta semana" : "Este mês";

  const neighborhoodNames = useMemo(() => {
    const byWin = data?.neighborhoodNamesByWindow?.[period];
    if (Array.isArray(byWin) && byWin.length) return byWin;
    return data?.neighborhoodNames || [];
  }, [data, period]);

  const occurrences = useMemo(() => {
    const list = data?.occurrencesByWindow?.[period] || [];
    const sorted = [...list].sort((a, b) => {
      const an = String(
        a?.address?.neighborhoodName || a?.neighborhoodName || ""
      ).localeCompare(
        String(b?.address?.neighborhoodName || b?.neighborhoodName || "")
      );
      if (an !== 0) return an;
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });
    return sorted;
  }, [data, period]);

  const totalOccurrences = data?.totalOccurrences ?? 0;
  const occurrencesCountThisWindow =
    data?.occurrencesCountByWindow?.[period] ?? occurrences.length;

  const pages = useMemo(() => chunk2(occurrences), [occurrences]);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* barra superior */}
      <div className="print:hidden sticky top-0 z-10 flex items-center gap-2 border-b border-neutral-200 bg-white/90 backdrop-blur px-4 py-3">
        <button
          onClick={() => (onClose ? onClose() : window.history.back())}
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

        <div className="ml-auto flex items-center gap-2">
          {["day", "week", "month"].map((k) => (
            <button
              key={k}
              onClick={() => {
                setPeriod(k);
                const next = new URLSearchParams(params);
                next.set("period", k);
                setParams(next);
              }}
              className={[
                "h-9 px-3 rounded-md text-sm border",
                period === k
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50",
              ].join(" ")}
            >
              {k === "day" ? "Dia" : k === "week" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>
      </div>

      {/* conteúdo */}
      <main className="mx-auto max-w-[900px] px-6 py-6">
        {/* cabeçalho */}
        <header className="relative mb-8 mt-10">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                Relatório de Ocorrências
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Status:{" "}
                <span className="font-semibold">
                  {humanizeStatus(selectedStatus)}
                </span>{" "}
                — Setor: <span className="font-semibold">{sectorName}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center text-sm text-gray-600 text-center">
            <p>Gerado em: {now}</p>
            <p>Período do documento: {monthLabel()}</p>
            <p>
              Total de ocorrências (geral):{" "}
              <span className="font-semibold">{totalOccurrences}</span> | No
              período selecionado ({periodLabel}):{" "}
              <span className="font-semibold">
                {occurrencesCountThisWindow}
              </span>
            </p>
          </div>
        </header>

        {/* bairros + resumo */}
        <section className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold mb-3">
                Bairros com ocorrência ({periodLabel}):
              </h3>
            </div>

            {loading ? (
              <div className="h-[120px] flex items-center justify-center text-gray-400">
                Carregando…
              </div>
            ) : neighborhoodNames.length ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {neighborhoodNames.map((name, i) => (
                  <li
                    key={`${name}-${i}`}
                    className="flex items-center gap-2 text-gray-800"
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-[120px] flex items-center justify-center text-gray-400">
                Sem bairros para este período.
              </div>
            )}
          </div>

          <div className="lg:col-span-5 border rounded-xl p-4">
            <h3 className="text-base font-semibold">
              Total (geral) de ocorrências: {totalOccurrences}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              No período selecionado ({periodLabel}):{" "}
              {occurrencesCountThisWindow}
            </p>
          </div>
        </section>

        {/* ocorrências  */}
        <section className="mt-10 break-before-page">
          {loading ? (
            <div className="h-[180px] flex items-center justify-center text-gray-400">
              Carregando ocorrências…
            </div>
          ) : pages.length === 0 ? (
            <div className="h-[120px] flex items-center justify-center text-gray-400">
              Nenhuma ocorrência no período selecionado.
            </div>
          ) : (
            <div className="space-y-10">
              {pages.map((pair, idx) => (
                <div key={idx} className="sheet space-y-6">
                  {pair.map((o) => {
                    const photoUrl = pickPhoto(o.photos);
                    const addr = o.address || {};
                    const addrText = [
                      [addr.street, addr.number].filter(Boolean).join(", "),
                      addr.neighborhoodName || o.neighborhoodName,
                    ]
                      .filter(Boolean)
                      .join(" — ");

                    return (
                      <article
                        key={o.id}
                        className="card rounded-xl border border-neutral-200 p-4"
                        style={{ breakInside: "avoid" }}
                      >
                        <Photo src={photoUrl} alt={`Ocorrência ${o.id}`} />

                        <div className="mt-3 text-sm text-gray-700 flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {String(
                                o.occurrenceType ||
                                  o.type ||
                                  "Tipo não informado"
                              )
                                .toLowerCase()
                                .replace(/_/g, " ")
                                .replace(/^./, (c) => c.toUpperCase())}
                            </div>
                            <div className="mt-0.5">
                              {addrText || "Endereço não informado"}
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div>
                              {new Date(o.createdAt).toLocaleString("pt-BR")}
                            </div>
                            <div className="mt-0.5">
                              Status: {humanizeStatus(o.status)}
                            </div>
                          </div>
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
          .break-before-page { break-before: page; page-break-before: always; }
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
