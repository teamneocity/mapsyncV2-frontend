"use client";

import React, { useMemo, useState, useEffect } from "react";
import ReportsPieCard from "./ReportsPieCard";
import ReportsNeighborhoodNightingale from "./ReportsNeighborhoodNightingale";
import { api } from "@/services/api";
import { useSearchParams } from "react-router-dom";
import { SelectField } from "@/components/selectField";

import PrintableDashboardReport from "./PrintableDashboardReport";
import CustomPrintableSOReport from "./CustomPrintableSOReport";
import SectorStatusCoverageReport from "./SectorStatusCoverageReport";

export default function ReportsOverview({
  title = "Relatórios",
  selectedSector = "Escolha o painél de exibição do setor",
  onSectorChange = () => {},
}) {
  const [sectors, setSectors] = useState([]);
  const [loadingSectors, setLoadingSectors] = useState(false);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  function clearStatus() {
    setSelectedStatus(""); // sem filtro
  }

  const [coverage, setCoverage] = useState(null);
  const [loadingCoverage, setLoadingCoverage] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("em_analise");
  const [selectedPeriod, setSelectedPeriod] = useState("day");

  const [dashboardStatus, setDashboardStatus] = useState(null);
  const [dashboardNeighborhoods, setDashboardNeighborhoods] = useState([]);
  const [dashboardEmergency, setDashboardEmergency] = useState(0);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [params, setParams] = useSearchParams();

  const isDashboard =
    selectedSector === "Escolha o painél de exibição do setor" ||
    selectedSector === "Dashboard";

  const STATUS_MASK = {
    em_analise: {
      label: "Sob análise",
      cls: "bg-sky-100 text-sky-700",
      active: "ring-2 ring-sky-300",
      clickable: true,
    },
    aprovada: {
      label: "Aprovadas",
      cls: "bg-[#E8F2FF] text-[#4593F5]",
      active: "ring-2 ring-sky-300",
      clickable: true,
    },
    emergencial: {
      label: "Emergencial",
      cls: "bg-rose-100 text-rose-700",
      active: "",
      clickable: false,
    },
    atrasada: {
      label: "Atrasada",
      cls: "bg-violet-100 text-violet-700",
      active: "",
      clickable: false,
    },
    em_execucao: {
      label: "Andamento",
      cls: "bg-amber-100 text-amber-800",
      active: "ring-2 ring-amber-300",
      clickable: true,
    },
    finalizada: {
      label: "Finalizado",
      cls: "bg-emerald-100 text-emerald-700",
      active: "ring-2 ring-emerald-300",
      clickable: true,
    },
  };

  const [builderOpen, setBuilderOpen] = useState(false);

  const foundSector = useMemo(
    () => sectors.find((s) => s.name === selectedSector),
    [sectors, selectedSector]
  );

  function openSectorReport() {
    if (!foundSector?.id) return;
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("view", "sector_report");
      p.set("sectorId", String(foundSector.id));
      p.set("sectorName", String(foundSector.name));
      p.set("period", String(selectedPeriod || "month"));

      if (selectedStatus) p.set("status", String(selectedStatus));
      else p.delete("status");

      return p;
    });
  }

  // pega o período
  useEffect(() => {
    const p = params.get("period");
    if (p === "day" || p === "week" || p === "month") {
      setSelectedPeriod(p);
    }
  }, [params]);

  // busca ocorrencias do dashboard geral
  useEffect(() => {
    let mounted = true;

    async function fetchDashboardStats() {
      if (!isDashboard) return; // só busca quando for o painel geral
      setLoadingDashboard(true);
      try {
        const { data } = await api.get("/occurrences/stats");

        const statusRows = Array.isArray(data?.byStatus) ? data.byStatus : [];
        const statusMap = statusRows.reduce((acc, r) => {
          const key = r?.status ?? "";
          const val = r?.count ?? 0;
          if (key) acc[key] = val;
          return acc;
        }, {});

        const neighborhoods = Array.isArray(data?.byNeighborhood)
          ? data.byNeighborhood.map((n) => ({
              name: n?.neighborhood ?? n?.name ?? "-",
              current: Number(n?.current ?? 0),
              previous: Number(n?.previous ?? 0),
              difference: Number(n?.difference ?? 0),
            }))
          : [];

        const emerg =
          typeof data?.currentEmergencial === "number"
            ? data.currentEmergencial
            : 0;

        if (mounted) {
          setDashboardStatus(statusMap);
          setDashboardNeighborhoods(neighborhoods);
          setDashboardEmergency(emerg);
        }
      } catch (e) {
        console.warn(
          "[ReportsOverview] erro /occurrences/stats (dashboard):",
          e
        );
        if (mounted) {
          setDashboardStatus(null);
          setDashboardNeighborhoods([]);
          setDashboardEmergency(0);
        }
      } finally {
        if (mounted) setLoadingDashboard(false);
      }
    }

    fetchDashboardStats();
    return () => {
      mounted = false;
    };
  }, [isDashboard]);

  useEffect(() => {
    let mounted = true;
    async function fetchSectors() {
      setLoadingSectors(true);
      try {
        const { data } = await api.get("/sectors/details");
        const list = Array.isArray(data?.sectors)
          ? data.sectors
          : data?.data?.sectors;
        const mapped = (list || [])
          .map((s) => ({
            id: s.id || s.sectorId || s.uuid,
            name: s.name || s.sectorName || s.title,
          }))
          .filter((s) => s.id && s.name);
        if (mounted) setSectors(mapped);
      } catch (e) {
        console.error("Erro ao buscar setores:", e);
        if (mounted) setSectors([]);
      } finally {
        if (mounted) setLoadingSectors(false);
      }
    }
    fetchSectors();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isDashboard) setSelectedStatus("em_analise");
    else {
      setStats(null);
      setCoverage(null);
    }
    setSelectedPeriod("day");
  }, [selectedSector]);

  useEffect(() => {
    async function fetchStats() {
      if (isDashboard) return;

      const found = sectors.find((s) => s.name === selectedSector);
      const sectorId = found?.id;
      if (!sectorId) return;

      setLoadingStats(true);
      try {
        const { data } = await api.get("/sectors/stats/by-status", {
          params: {
            sectorId,
            ...(selectedStatus ? { status: selectedStatus } : {}),
          },
        });
        setStats(data?.data || null);
      } catch (err) {
        console.error("Erro ao carregar estatísticas do setor:", err);
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, [selectedSector, selectedStatus, sectors, isDashboard]);

  useEffect(() => {
    async function fetchCoverage() {
      if (isDashboard) return;

      const found = sectors.find((s) => s.name === selectedSector);
      const sectorId = found?.id;
      if (!sectorId) return;

      setLoadingCoverage(true);
      try {
        const { data } = await api.get("/reports/neighborhood-coverage", {
          params: {
            sectorId,
            ...(selectedStatus ? { status: selectedStatus } : {}),
          },
        });
        setCoverage(data?.data || null);
      } catch (err) {
        console.error("Erro ao carregar cobertura de bairros:", err);
        setCoverage(null);
      } finally {
        setLoadingCoverage(false);
      }
    }
    fetchCoverage();
  }, [selectedSector, selectedStatus, sectors, isDashboard]);

  //conta a quantidade de bairros
  const neighborhoodsAttendedCount = useMemo(() => {
    if (!Array.isArray(dashboardNeighborhoods)) return 0;
    return dashboardNeighborhoods.reduce((acc, n) => {
      const cur = Number(n?.current ?? 0);
      return acc + (cur > 0 ? 1 : 0);
    }, 0);
  }, [dashboardNeighborhoods]);

  //conta a quantidade geral de ocorrencias
  const totalCurrentOccurrences = useMemo(() => {
    if (!Array.isArray(dashboardNeighborhoods)) return 0;
    return dashboardNeighborhoods.reduce((acc, n) => {
      const cur = Number(n?.current ?? 0);
      return acc + cur;
    }, 0);
  }, [dashboardNeighborhoods]);

  function goToBuilder() {
    setBuilderOpen(true);
  }

  function openReport(reportType = "overview") {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("view", "report");
      p.set("reportType", reportType);
      return p;
    });
  }

  function getNeighborhoodNamesForPeriod(period) {
    const fromCoverage = coverage?.neighborhoodNamesByWindow?.[period] || null;

    if (Array.isArray(fromCoverage)) {
      return fromCoverage.map((name) => ({ name, count: null }));
    }

    const key =
      period === "day"
        ? "neighborhoodsToday"
        : period === "week"
        ? "neighborhoodsWeek"
        : "neighborhoodsMonth";
    const raw = stats?.[key] || [];
    return (raw || []).map((n) => ({
      name: n?.name ?? n?.neighborhood_name ?? n?.neighborhood ?? "-",
      count: n?.count ?? n?.total ?? null,
    }));
  }

  const neighborhoods = useMemo(() => {
    const arr = getNeighborhoodNamesForPeriod(selectedPeriod);

    if (arr.some((n) => typeof n.count === "number")) {
      return [...arr].sort((a, b) => (b.count || 0) - (a.count || 0));
    }
    return [...arr].sort((a, b) => a.name.localeCompare(b.name));
  }, [coverage, stats, selectedPeriod]);

  const dayCount = coverage?.neighborhoodsCountByWindow?.day ?? 0;
  const weekCount = coverage?.neighborhoodsCountByWindow?.week ?? 0;
  const monthCount = coverage?.neighborhoodsCountByWindow?.month ?? 0;

  const cards = [
    { key: "day", label: "Bairros atendidos hoje", value: dayCount },
    { key: "week", label: "Bairros atendidos nessa semana", value: weekCount },
    { key: "month", label: "Bairros atendidos nesse mês", value: monthCount },
    {
      key: "overall",
      label: "Total de ocorrências",
      value: coverage?.totalOccurrences ?? stats?.totals?.overall ?? 0,
    },
  ];

  const sectorOptions = useMemo(
    () => [
      "Escolha o painél de exibição do setor",
      ...sectors.map((s) => s.name),
    ],
    [sectors]
  );

  const sixStatus = [
    { key: "em_analise", value: stats?.totalsByStatus?.em_analise ?? 0 },
    { key: "aprovada", value: stats?.totalsByStatus?.aprovada ?? 0 },
    { key: "emergencial", value: stats?.totalsEmergency ?? 0 }, // não clica
    { key: "atrasada", value: stats?.totalsDelayed ?? 0 }, // não clica
    { key: "em_execucao", value: stats?.totalsByStatus?.em_execucao ?? 0 },
    { key: "finalizada", value: stats?.totalsByStatus?.finalizada ?? 0 },
  ];

  function cardBoxClasses(isActive) {
    return [
      "relative h-[170px] rounded-xl border shadow-sm overflow-hidden flex items-center justify-center transition-all",
      "bg-[#F6F8FA] text-[#787891]",
      isActive
        ? "ring-2 ring-indigo-300"
        : "hover:ring-1 hover:ring-neutral-300",
      "cursor-pointer select-none",
    ].join(" ");
  }

  const anyLoading = loadingSectors || loadingStats || loadingCoverage;

  const view = params.get("view");
  if (view === "printable_dashboard") {
    return (
      <PrintableDashboardReport
        onClose={() =>
          setParams((prev) => {
            const p = new URLSearchParams(prev);
            p.delete("view");
            p.delete("reportType");
            return p;
          })
        }
      />
    );
  }
  if (view === "custom_report") {
    return (
      <CustomPrintableSOReport
        onClose={() =>
          setParams((prev) => {
            const p = new URLSearchParams(prev);
            p.delete("view");
            return p;
          })
        }
      />
    );
  }
  if (view === "sector_report") {
    return (
      <SectorStatusCoverageReport
        onClose={() =>
          setParams((prev) => {
            const p = new URLSearchParams(prev);
            p.delete("view");
            p.delete("sectorId");
            p.delete("sectorName");
            p.delete("status");
            p.delete("period");
            return p;
          })
        }
      />
    );
  }

  function BuilderModal() {
    const [local, setLocal] = useState({
      // 1 exibe, 0 oculta
      list: "1", // Lista de bairros
      pieN: "1", // Pizza por bairro
      pieS: "1", // Pizza por status
      cmp: "1", // Comparação mês atual vs anterior
      all: "1", // Todas as ocorrências (2 por página)
    });

    const set = (patch) => setLocal((old) => ({ ...old, ...patch }));

    function handleSave() {
      setParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set("view", "custom_report");
        p.set("rt", "custom");

        p.set("list", local.list);
        p.set("pieN", local.pieN);
        p.set("pieS", local.pieS);
        p.set("cmp", local.cmp);
        p.set("all", local.all);

        return p;
      });

      setBuilderOpen(false);
    }

    function handleClose() {
      setBuilderOpen(false);
    }

    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Painel principal */}
        <div className="relative z-50 w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-neutral-200 p-6">
          <h3 className="text-xl font-semibold text-neutral-900">
            Configure o tipo de relatório
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Escolha o que entra no relatório e como ordenar/filtrar.
          </p>

          {/* selects */}
          <div className="mt-5 grid grid-cols-1 gap-4">
            <SelectField
              label="Lista de bairros (mês atual)"
              value={local.list}
              onChange={(v) => set({ list: v })}
              options={[
                { value: "1", label: "Incluir" },
                { value: "0", label: "Ocultar" },
              ]}
            />

            <SelectField
              label="Gráfico de pizza por bairro"
              value={local.pieN}
              onChange={(v) => set({ pieN: v })}
              options={[
                { value: "1", label: "Incluir" },
                { value: "0", label: "Ocultar" },
              ]}
            />

            <SelectField
              label="Gráfico de pizza por status"
              value={local.pieS}
              onChange={(v) => set({ pieS: v })}
              options={[
                { value: "1", label: "Incluir" },
                { value: "0", label: "Ocultar" },
              ]}
            />

            <SelectField
              label="Comparação mês atual vs anterior (por bairro)"
              value={local.cmp}
              onChange={(v) => set({ cmp: v })}
              options={[
                { value: "1", label: "Incluir" },
                { value: "0", label: "Ocultar" },
              ]}
            />

            <SelectField
              label="Lista de todas as ocorrências (2 por página)"
              value={local.all}
              onChange={(v) => set({ all: v })}
              options={[
                { value: "1", label: "Incluir" },
                { value: "0", label: "Ocultar" },
              ]}
            />
          </div>

          {/* Botões */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="h-10 px-4 rounded-lg border border-neutral-200 bg-white text-neutral-700 text-sm hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="h-10 px-4 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800"
            >
              Salvar e abrir relatório
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-[1500px] w-full mx-auto bg-white rounded-xl p-6 mt-4">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h2 className="text-[32px] font-semibold text-black">{title}</h2>
          <p className="text-[20px] text-gray-500 mt-1">
            {isDashboard ? "Dashboard" : selectedSector}
          </p>
        </div>

        <div className="w-full md:w-auto">
          <SelectField
            className="[&_[data-radix-select-item]]:text-left [&_[data-radix-select-item]]:justify-start"
            label=""
            value={selectedSector}
            onChange={(val) => {
              if (val === "builder") {
                goToBuilder();
              } else {
                onSectorChange(val);
              }
            }}
            placeholder="Escolha o painél de exibição do setor"
            options={[
              {
                value: "Escolha o painél de exibição do setor",
                label: "Escolha o painél de exibição do setor",
              },
              ...sectors.map((s) => ({
                value: s.name,
                label: s.name,
              })),
            ]}
          />

          {loadingSectors && (
            <p className="text-xs text-gray-400 mt-1">Carregando setores…</p>
          )}
        </div>
      </div>

      {isDashboard ? (
        <>
          {/* Cards do dashboard geral */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                label: "Bairros atendidos",
                value: loadingDashboard ? "..." : neighborhoodsAttendedCount,
                bg: "#F6F8FA",
                text: "#787891",
              },
              {
                label: "Ocorrências em andamento",
                value: loadingDashboard
                  ? "..."
                  : dashboardStatus?.em_execucao ?? 0,
                bg: "#FFF6E0",
                text: "#966422",
              },
              {
                label: "Ocorrências emergenciais",
                value: loadingDashboard ? "..." : dashboardEmergency,
                bg: "#FFF0F3",
                text: "#96132C",
              },
              {
                label: "Total de ocorrências",
                value: loadingDashboard ? "..." : totalCurrentOccurrences,
                bg: "#EFFEFA",
                text: "#40C4AA",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="relative h-[170px] rounded-xl border shadow-sm overflow-hidden flex items-center justify-center transition-all"
                style={{
                  backgroundColor: card.bg,
                  color: card.text,
                  borderColor: card.text,
                }}
              >
                <span className="text-[96px] font-semibold leading-none">
                  {card.value}
                </span>
                <div className="absolute left-4 bottom-3 text-[14px] tracking-wide">
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 h-[388px] rounded-xl border border-neutral-200/70 bg-white shadow-sm flex items-center justify-center">
              <p className="text-gray-400 text-sm">
                Gráfico ou conteúdo futuro
              </p>
            </div>
            <div className="lg:col-span-5 h-[388px] rounded-xl border border-neutral-200/70 bg-white shadow-sm">
              <ReportsNeighborhoodNightingale
                mobileHeight="h-full"
                height="md:h-full xl:h-full"
                className="h-full"
              />
            </div>
          </div>

          {/*  Botões do dashboard  */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() =>
                setParams((prev) => {
                  const p = new URLSearchParams(prev);
                  p.set("view", "printable_dashboard"); // muda para a view do relatório
                  return p;
                })
              }
              className="h-12 px-4 rounded-lg border border-neutral-200 bg-white text-gray-700 text-sm hover:bg-neutral-50 transition-colors"
              title="Gerar relatório imprimível do dashboard geral"
            >
              Gere um relatório fotográfico
            </button>

            <button
              onClick={goToBuilder}
              className="h-12 px-4 rounded-lg border border-neutral-200 bg-white text-gray-700 text-sm"
            >
              Gere um relatório customizado
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card) => {
              const isSelectable = ["day", "week", "month"].includes(card.key);
              const isActive = card.key === selectedPeriod;

              if (isSelectable) {
                return (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(card.key);
                      setParams((prev) => {
                        const p = new URLSearchParams(prev);
                        p.set("period", card.key);
                        return p;
                      });
                    }}
                    className={cardBoxClasses(isActive)}
                    title={`Mostrar bairros de ${card.label.toLowerCase()}`}
                  >
                    <span className="text-[96px] font-semibold leading-none">
                      {anyLoading ? "..." : card.value}
                    </span>
                    <div className="absolute left-4 bottom-3 text-[14px] tracking-wide text-[#555]">
                      {card.label}
                    </div>
                  </button>
                );
              }

              return (
                <div
                  key={card.key}
                  className="relative h-[170px] rounded-xl border shadow-sm overflow-hidden flex items-center justify-center transition-all bg-[#F6F8FA] text-[#787891]"
                >
                  <span className="text-[96px] font-semibold leading-none">
                    {anyLoading ? "..." : card.value}
                  </span>
                  <div className="absolute left-4 bottom-3 text-[14px] tracking-wide">
                    {card.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-xl border border-neutral-200/70 bg-white shadow-sm p-5">
              <h3 className="text-2xl font-semibold">
                Bairros co-relacionados atendidos
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedPeriod === "day" && "Hoje"}
                {selectedPeriod === "week" && "Nesta semana"}
                {selectedPeriod === "month" && "Neste mês"}
              </p>

              {neighborhoods.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {neighborhoods.map((n, idx) => {
                    // usa a cor do status selecionado
                    const mask = STATUS_MASK[selectedStatus] || {};
                    const bgClass = mask.cls?.split(" ")[0] || "bg-gray-100";
                    const textClass =
                      mask.cls?.split(" ")[1] || "text-gray-800";

                    return (
                      <div key={`${n.name}-${idx}`} className="w-full">
                        <div
                          className={`flex items-center justify-between rounded-lg px-4 h-10 ${bgClass} ${textClass} transition-colors`}
                        >
                          <span className="text-[15px] font-medium truncate pr-3">
                            {n.name || "-"}
                          </span>
                          {typeof n.count === "number" ? (
                            <span className="min-w-10 text-center px-2 py-0.5 rounded-full bg-white/50 text-xs font-semibold">
                              {n.count}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
                  {anyLoading
                    ? "Carregando…"
                    : "Sem bairros para este período."}
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={openSectorReport}
                  disabled={!foundSector?.id}
                  className="h-12 px-4 rounded-lg border border-neutral-200 bg-white text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Abrir relatório do setor e status selecionados"
                >
                  Abrir relatório deste setor
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-neutral-200/70 bg-[#F6F8FA] shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">
                  Status co-relacionados
                </h3>

                <button
                  type="button"
                  onClick={clearStatus}
                  disabled={!selectedStatus}
                  className="text-xs h-8 px-3 rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remover status
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    key: "em_analise",
                    value: stats?.totalsByStatus?.em_analise ?? 0,
                  },
                  {
                    key: "aprovada",
                    value: stats?.totalsByStatus?.aprovada ?? 0,
                  },
                  { key: "emergencial", value: stats?.totalsEmergency ?? 0 },
                  { key: "atrasada", value: stats?.totalsDelayed ?? 0 },
                  {
                    key: "em_execucao",
                    value: stats?.totalsByStatus?.em_execucao ?? 0,
                  },
                  {
                    key: "finalizada",
                    value: stats?.totalsByStatus?.finalizada ?? 0,
                  },
                ].map(({ key, value }) => {
                  const mask = STATUS_MASK[key];
                  const isActive = key === selectedStatus && mask.clickable;
                  const baseCls = `${mask.cls} ${
                    isActive ? mask.active : ""
                  } px-4 py-4 rounded-lg text-sm font-medium flex items-center justify-between w-full`;
                  if (mask.clickable) {
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedStatus(key)}
                        className={baseCls}
                        title={`Filtrar por ${mask.label}`}
                      >
                        <span>{mask.label}</span>
                        <span className="opacity-70">({value})</span>
                      </button>
                    );
                  }
                  return (
                    <div
                      key={key}
                      className={`${baseCls} cursor-not-allowed`}
                      title={`${mask.label} (informativo)`}
                    >
                      <span>{mask.label}</span>
                      <span className="opacity-70">({value})</span>
                    </div>
                  );
                })}
              </div>

              <h3 className="text-lg font-semibold mt-6">
                Endereços co-relacionados
              </h3>
              <div className="text-gray-400 text-sm mt-2"></div>
            </div>
          </div>
        </>
      )}
      {builderOpen ? <BuilderModal /> : null}
    </section>
  );
}
