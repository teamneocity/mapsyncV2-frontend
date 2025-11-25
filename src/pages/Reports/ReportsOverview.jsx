// src/pages/Reports/ReportsOverview.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/services/api";
import { SelectField } from "@/components/selectField";

import ReportsDashboard from "./ReportsDashboard";
import { ReportsBySector } from "./ReportsBySector";

// Busca setores
async function fetchSectors() {
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

  return mapped;
}

// Busca do dashboard geral (sem filtros)
async function fetchDashboardCoverage() {
  const { data } = await api.get("/occurrences/dashboard/coverage");
  return data;
}

// Busca de alguns dados
async function fetchDashboardStats() {
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

  const emergency =
    typeof data?.currentEmergencial === "number" ? data.currentEmergencial : 0;

  return {
    statusMap,
    neighborhoods,
    emergency,
  };
}

// Busca dashboard por setor (mesma rota do geral, só que filtrada)
async function fetchCoverageData({ sectorId, status, isEmergency, isDelayed }) {
  const params = {
    sectorId,
    ...(status ? { status } : {}),
    ...(isEmergency ? { isEmergency: true } : {}),
    ...(isDelayed ? { isDelayed: true } : {}),
  };

  const { data } = await api.get("/occurrences/dashboard/coverage", {
    params,
  });

  return data || null;
}

// Busca bairros
async function fetchNeighborhoodList() {
  const { data } = await api.get("/neighborhoods");
  const list = Array.isArray(data?.neighborhoods) ? data.neighborhoods : [];
  return list
    .map((n) => ({
      id: n.id,
      name: n.name,
    }))
    .filter((n) => n.id && n.name);
}

// Componente princial
export default function ReportsOverview({
  title = "Relatórios",
  selectedSector = "Escolha o painél de exibição do setor",
  onSectorChange = () => {},
}) {
  const [params, setParams] = useSearchParams();

  const [selectedStatus, setSelectedStatus] = useState("em_analise");
  const [selectedPeriod, setSelectedPeriod] = useState("day");

  //  filtros extras
  const [isEmergencyFilter, setIsEmergencyFilter] = useState(false);
  const [isDelayedFilter, setIsDelayedFilter] = useState(false);

  const [builderOpen, setBuilderOpen] = useState(false);

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoFilters, setPhotoFilters] = useState({
    neighborhood: "",
    status: "",
    isEmergency: false,
    isDelayed: false,
  });

  const isDashboard =
    selectedSector === "Escolha o painél de exibição do setor" ||
    selectedSector === "Dashboard";

  // máscaras
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
      active: "ring-2 ring-rose-300",
      clickable: true,

      isFlag: true,
      flagKey: "isEmergency",
    },
    atrasada: {
      label: "Atrasada",
      cls: "bg-violet-100 text-violet-700",
      active: "ring-2 ring-violet-300",
      clickable: true,
      isFlag: true,
      flagKey: "isDelayed",
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

  function clearStatus() {
    setSelectedStatus("");
  }

  const {
    data: sectors = [],
    isLoading: loadingSectors,
    isFetching: fetchingSectors,
  } = useQuery({
    queryKey: ["reports", "sectors"],
    queryFn: fetchSectors,
  });

  const foundSector = useMemo(
    () => sectors.find((s) => s.name === selectedSector),
    [sectors, selectedSector]
  );

  const {
    data: dashboardCoverage,
    isLoading: loadingDashboardCoverage,
    isError: errorDashboardCoverage,
  } = useQuery({
    queryKey: ["occurrences-dashboard-coverage"],
    queryFn: fetchDashboardCoverage,
  });

  const {
    data: dashboardData,
    isLoading: loadingDashboard,
    isFetching: fetchingDashboard,
  } = useQuery({
    queryKey: ["reports", "dashboard-stats"],
    queryFn: fetchDashboardStats,
    enabled: isDashboard,
  });

  const sectorId = foundSector?.id || null;

  // Dashboard filtrado por status + emergencial/atrasada
  const {
    data: sectorDashboard,
    isLoading: loadingCoverage,
    isFetching: fetchingCoverage,
  } = useQuery({
    queryKey: [
      "reports",
      "sector-coverage",
      sectorId,
      selectedStatus,
      isEmergencyFilter,
      isDelayedFilter,
    ],
    queryFn: () =>
      fetchCoverageData({
        sectorId,
        status: selectedStatus,
        isEmergency: isEmergencyFilter,
        isDelayed: isDelayedFilter,
      }),
    enabled: !isDashboard && !!sectorId,
  });

  // Dashboard completo do setor (sem status/flags)
  const { data: sectorDashboardAll } = useQuery({
    queryKey: ["reports", "sector-coverage-all", sectorId],
    queryFn: () =>
      fetchCoverageData({
        sectorId,
        status: undefined,
        isEmergency: false,
        isDelayed: false,
      }),
    enabled: !isDashboard && !!sectorId,
  });

  const stats = sectorDashboard?.stats;
  const coverage = sectorDashboard?.coverage;

  const fullStats = sectorDashboardAll?.stats || stats;

  const {
    data: neighborhoodList = [],
    isLoading: loadingNeighborhoods,
    isFetching: fetchingNeighborhoods,
  } = useQuery({
    queryKey: ["reports", "neighborhoods"],
    queryFn: fetchNeighborhoodList,
    enabled: photoModalOpen,
  });

  const anyLoading =
    loadingSectors || loadingCoverage || fetchingSectors || fetchingCoverage;

  useEffect(() => {
    const p = params.get("period");
    if (p === "day" || p === "week" || p === "month") {
      setSelectedPeriod(p);
    }
  }, [params]);

  // reset ao trocar de "dashboard" para setor e vice-versa
  useEffect(() => {
    if (!isDashboard) {
      setSelectedStatus("em_analise");
    }
    setSelectedPeriod("day");
    // Limpo os flags ao trocar entre dashboard/setor
    setIsEmergencyFilter(false);
    setIsDelayedFilter(false);
  }, [isDashboard, selectedSector]);

  function getNeighborhoodNamesForPeriod(period) {
    // Primeiro tentamos montar a partir das ocorrências da janela
    const list = coverage?.occurrencesByWindow?.[period] || [];

    if (Array.isArray(list) && list.length) {
      const counts = list.reduce((acc, occ) => {
        const name =
          occ?.neighborhoodName ?? occ?.address?.neighborhoodName ?? "-";

        if (!name) return acc;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(counts).map(([name, count]) => ({
        name,
        count,
      }));
    }

    const fromCoverage = coverage?.neighborhoodNamesByWindow?.[period] || [];
    if (Array.isArray(fromCoverage) && fromCoverage.length) {
      return fromCoverage.map((name) => ({ name, count: null }));
    }

    return [];
  }

  function getStreetNamesForPeriod(period) {
    const fromCoverage = coverage?.streetNamesByWindow?.[period];
    if (Array.isArray(fromCoverage) && fromCoverage.length) {
      return fromCoverage;
    }

    const list = coverage?.occurrencesByWindow?.[period] || [];
    if (Array.isArray(list) && list.length) {
      const streetsSet = new Set();
      list.forEach((occ) => {
        const street = occ?.address?.street;
        if (street) streetsSet.add(street);
      });
      return Array.from(streetsSet);
    }

    return [];
  }

  const neighborhoods = useMemo(() => {
    const arr = getNeighborhoodNamesForPeriod(selectedPeriod);

    if (arr.some((n) => typeof n.count === "number")) {
      return [...arr].sort((a, b) => (b.count || 0) - (a.count || 0));
    }
    return [...arr].sort((a, b) => a.name.localeCompare(b.name));
  }, [coverage, stats, selectedPeriod]);

  const streetNames = useMemo(
    () => getStreetNamesForPeriod(selectedPeriod),
    [coverage, stats, selectedPeriod]
  );
  // Contagens globais de ocorrências (dashboard geral)
  const totals = dashboardCoverage?.stats?.totals ?? {};
  const windows = dashboardCoverage?.coverage?.occurrencesCountByWindow ?? {};

  const dayCount = totals.day ?? windows.day ?? 0;
  const weekCount = totals.week ?? windows.week ?? 0;
  const monthCount = totals.month ?? windows.month ?? 0;

  // Total geral de ocorrências 
  const totalCount =
    totals.overall ?? dashboardCoverage?.coverage?.totalOccurrences ?? 0;

  const sectorTotals = stats?.totals ?? {};
  const sectorOccurrencesByWindow = coverage?.occurrencesCountByWindow ?? {};

  const sectorCards = [
    {
      key: "day",
      label: "Ocorrências de hoje",
      value: sectorTotals.day ?? sectorOccurrencesByWindow.day ?? 0,
    },
    {
      key: "week",
      label: "Ocorrências na semana",
      value: sectorTotals.week ?? sectorOccurrencesByWindow.week ?? 0,
    },
    {
      key: "month",
      label: "Ocorrências neste mês",
      value: sectorTotals.month ?? sectorOccurrencesByWindow.month ?? 0,
    },
    {
      key: "overall",
      label: "Total de ocorrências do setor",
      value: sectorTotals.overall ?? coverage?.totalOccurrences ?? 0,
    },
  ];

  // Ações
  function handleChangePeriod(periodKey) {
    setSelectedPeriod(periodKey);
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("period", periodKey);
      return p;
    });
  }

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

      // se quiser, pode propagar os flags na URL também
      if (isEmergencyFilter) p.set("isEmergency", "true");
      else p.delete("isEmergency");

      if (isDelayedFilter) p.set("isDelayed", "true");
      else p.delete("isDelayed");

      return p;
    });
  }

  // toggles para emergencial/atrasada
  function handleToggleEmergency() {
    setIsEmergencyFilter((prev) => !prev);
  }

  function handleToggleDelayed() {
    setIsDelayedFilter((prev) => !prev);
  }

  // Modais
  function BuilderModal() {
    const [local, setLocal] = useState({
      list: "1",
      pieN: "1",
      pieS: "1",
      cmp: "1",
      all: "1",
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
        <div className="relative z-50 w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-neutral-200 p-6">
          <h3 className="text-xl font-semibold text-neutral-900">
            Configure o tipo de relatório
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Escolha o que entra no relatório e como ordenar/filtrar.
          </p>

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

  function PhotoFilterModal() {
    const [local, setLocal] = useState({
      neighborhood: photoFilters.neighborhood || "",
      status: photoFilters.status || "",
      isEmergency: !!photoFilters.isEmergency,
      isDelayed: !!photoFilters.isDelayed,
    });

    function handleClose() {
      setPhotoModalOpen(false);
    }

    function handleApply() {
      setPhotoFilters(local);

      setParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set("view", "printable_dashboard");

        if (local.neighborhood && local.neighborhood !== "__all__") {
          p.set("neighborhood", local.neighborhood.trim());
        } else {
          p.delete("neighborhood");
        }

        if (local.status && local.status !== "__all__") {
          p.set("status", local.status);
        } else {
          p.delete("status");
        }

        // NOVO: filtros que vêm do back
        if (local.isEmergency) {
          p.set("isEmergency", "true");
        } else {
          p.delete("isEmergency");
        }

        if (local.isDelayed) {
          p.set("isDelayed", "true");
        } else {
          p.delete("isDelayed");
        }

        return p;
      });

      setPhotoModalOpen(false);
    }

    const neighborhoodOptions = [
      { value: "__all__", label: "Todos os bairros" },
      ...neighborhoodList.map((n) => ({
        value: n.name,
        label: n.name,
      })),
    ];

    const statusOptions = [
      { value: "__all__", label: "Todos os status" },
      { value: "aguardando_execucao", label: "Aguardando execução" },
      { value: "em_execucao", label: "Em execução" },
      { value: "finalizada", label: "Finalizada" },
    ];

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
        <div className="relative z-50 w-full max-w-md rounded-2xl bg-white shadow-xl border border-neutral-200 p-6">
          <h3 className="text-xl font-semibold text-neutral-900">
            Gerar relatório fotográfico
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Se quiser, filtre as ordens de serviço por bairro, status e flags de
            emergência/atraso. Deixe em branco para incluir todos.
          </p>

          <div className="mt-5 space-y-4">
            <SelectField
              label="Bairro (opcional)"
              value={local.neighborhood}
              onChange={(v) =>
                setLocal((old) => ({
                  ...old,
                  neighborhood: v || "",
                }))
              }
              options={neighborhoodOptions}
              placeholder="Selecione um bairro"
            />

            {(loadingNeighborhoods || fetchingNeighborhoods) && (
              <p className="text-xs text-neutral-400 mt-1">
                Carregando bairros…
              </p>
            )}

            <SelectField
              label="Status (opcional)"
              value={local.status}
              onChange={(v) =>
                setLocal((old) => ({
                  ...old,
                  status: v || "",
                }))
              }
              options={statusOptions}
            />

            {/* checkboxes para emergencial / atrasada */}
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <label className="flex items-center gap-2 text-sm text-neutral-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300"
                  checked={local.isEmergency}
                  onChange={(e) =>
                    setLocal((old) => ({
                      ...old,
                      isEmergency: e.target.checked,
                    }))
                  }
                />
                <span>Somente emergenciais</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-neutral-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300"
                  checked={local.isDelayed}
                  onChange={(e) =>
                    setLocal((old) => ({
                      ...old,
                      isDelayed: e.target.checked,
                    }))
                  }
                />
                <span>Somente atrasadas</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="h-10 px-4 rounded-lg border border-neutral-200 bg-white text-neutral-700 text-sm hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="h-10 px-4 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800"
              disabled={loadingNeighborhoods || fetchingNeighborhoods}
            >
              Gerar relatório
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sectorOptions = useMemo(
    () => [
      "Escolha o painél de exibição do setor",
      ...sectors.map((s) => s.name),
    ],
    [sectors]
  );

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
                setBuilderOpen(true);
              } else {
                onSectorChange(val);
              }
            }}
            placeholder="Escolha o painél de exibição do setor"
            options={sectorOptions.map((name) => ({
              value: name,
              label: name,
            }))}
          />

          {(loadingSectors || fetchingSectors) && (
            <p className="text-xs text-gray-400 mt-1">Carregando setores…</p>
          )}
        </div>
      </div>
      {isDashboard ? (
        <ReportsDashboard
          dayCount={dayCount}
          weekCount={weekCount}
          monthCount={monthCount}
          totalCount={totalCount}
          loading={loadingDashboardCoverage}
          onOpenPhotoModal={() => setPhotoModalOpen(true)}
          onOpenBuilder={() => setBuilderOpen(true)}
        />
      ) : (
        <ReportsBySector
          cards={sectorCards}
          anyLoading={anyLoading}
          neighborhoods={neighborhoods}
          STATUS_MASK={STATUS_MASK}
          selectedStatus={selectedStatus}
          onChangeStatus={setSelectedStatus}
          clearStatus={clearStatus}
          stats={fullStats}
          streetNames={streetNames}
          selectedPeriod={selectedPeriod}
          onChangePeriod={handleChangePeriod}
          foundSector={foundSector}
          onOpenSectorReport={openSectorReport}
          // props para flags
          isEmergencyFilter={isEmergencyFilter}
          isDelayedFilter={isDelayedFilter}
          onToggleEmergency={handleToggleEmergency}
          onToggleDelayed={handleToggleDelayed}
        />
      )}

      {builderOpen ? <BuilderModal /> : null}
      {photoModalOpen ? <PhotoFilterModal /> : null}
    </section>
  );
}
