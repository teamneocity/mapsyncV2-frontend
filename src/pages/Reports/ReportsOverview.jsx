// src/pages/Reports/ReportsOverview.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

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

// Dashboard geral (sem filtros)
async function fetchDashboardCoverage() {
  const { data } = await api.get("/occurrences/dashboard/coverage");
  return data;
}

// Dashboard geral passando data
async function fetchDashboardCoverageWindow({ window, anchorDate }) {
  const params = { window };
  if (anchorDate) params.anchorDate = anchorDate;

  const { data } = await api.get("/occurrences/dashboard/coverage", {
    params,
  });

  return data;
}

// Stats gerais
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

// Dashboard por setor (rota única com filtros)
async function fetchCoverageData({
  sectorId,
  status,
  isEmergency,
  isDelayed,
  window,
  anchorDate,
}) {
  const params = {
    sectorId,
    ...(status ? { status } : {}),
    ...(isEmergency ? { isEmergency: true } : {}),
    ...(isDelayed ? { isDelayed: true } : {}),
    ...(window ? { window } : {}),
    ...(anchorDate ? { anchorDate } : {}),
  };

  const { data } = await api.get("/occurrences/dashboard/coverage", {
    params,
  });

  return data || null;
}

// Bairros
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

export default function ReportsOverview({
  title = "Relatórios",
  selectedSector = "Escolha o painél de exibição do setor",
  onSectorChange = () => {},
}) {
  const [params, setParams] = useSearchParams();

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("day");

  // flags setoriais
  const [isEmergencyFilter, setIsEmergencyFilter] = useState(false);
  const [isDelayedFilter, setIsDelayedFilter] = useState(false);

  // JANELAS DO DASHBOARD GERAL
  const [dayAnchorDate, setDayAnchorDate] = useState(null);
  const [weekAnchorDate, setWeekAnchorDate] = useState(null);
  const [monthAnchorDate, setMonthAnchorDate] = useState(null);

  // JANELAS DO DASHBOARD SETORIAL
  const [sectorDayValue, setSectorDayValue] = useState("");
  const [sectorWeekValue, setSectorWeekValue] = useState("");
  const [sectorMonth, setSectorMonth] = useState("");

  const [sectorDayAnchorDate, setSectorDayAnchorDate] = useState(null);
  const [sectorWeekAnchorDate, setSectorWeekAnchorDate] = useState(null);
  const [sectorMonthAnchorDate, setSectorMonthAnchorDate] = useState(null);

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

  const STATUS_MASK = {
    em_analise: {
      label: "Sob análise",
      cls: "bg-sky-100 text-sky-700",
      active: "ring-2 ring-sky-300",
      clickable: true,
      chartColor: "#0369A1", 
    },

    aprovada: {
      label: "Aprovadas",
      cls: "bg-[#E8F2FF] text-[#4593F5]",
      active: "ring-2 ring-sky-300",
      clickable: true,
      chartColor: "#E8F2FF", 
    },

    emergencial: {
      label: "Emergencial",
      cls: "bg-rose-100 text-rose-700",
      active: "ring-2 ring-rose-300",
      clickable: true,
      isFlag: true,
      flagKey: "isEmergency",
      chartColor: "#BE123C", 
    },

    atrasada: {
      label: "Atrasada",
      cls: "bg-violet-100 text-violet-700",
      active: "ring-2 ring-violet-300",
      clickable: true,
      isFlag: true,
      flagKey: "isDelayed",
      chartColor: "#6D28D9", 
    },

    em_execucao: {
      label: "Andamento",
      cls: "bg-amber-100 text-amber-800",
      active: "ring-2 ring-amber-300",
      clickable: true,
      chartColor: "#FFF1CB",
    },

    finalizada: {
      label: "Finalizado",
      cls: "bg-emerald-100 text-emerald-700",
      active: "ring-2 ring-emerald-300",
      clickable: true,
      chartColor: "#DDF3EF", 
    },
  };

  function clearStatus() {
    setSelectedStatus("");
  }

  // setores
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

  // Dashboard geral "default"
  const { data: dashboardCoverage, isLoading: loadingDashboardCoverage } =
    useQuery({
      queryKey: ["occurrences-dashboard-coverage"],
      queryFn: fetchDashboardCoverage,
    });

  // Dashboard geral quando window=day
  const {
    data: dayWindowCoverage,
    isLoading: loadingDayWindow,
    isFetching: fetchingDayWindow,
  } = useQuery({
    queryKey: ["occurrences-dashboard-coverage", "day-window", dayAnchorDate],
    queryFn: () =>
      fetchDashboardCoverageWindow({
        window: "day",
        anchorDate: dayAnchorDate,
      }),
    enabled: !!dayAnchorDate,
  });

  // Dashboard geral quando window=week
  const {
    data: weekWindowCoverage,
    isLoading: loadingWeekWindow,
    isFetching: fetchingWeekWindow,
  } = useQuery({
    queryKey: ["occurrences-dashboard-coverage", "week-window", weekAnchorDate],
    queryFn: () =>
      fetchDashboardCoverageWindow({
        window: "week",
        anchorDate: weekAnchorDate,
      }),
    enabled: !!weekAnchorDate,
  });

  // Dashboard geral quando window=month
  const {
    data: monthWindowCoverage,
    isLoading: loadingMonthWindow,
    isFetching: fetchingMonthWindow,
  } = useQuery({
    queryKey: [
      "occurrences-dashboard-coverage",
      "month-window",
      monthAnchorDate,
    ],
    queryFn: () =>
      fetchDashboardCoverageWindow({
        window: "month",
        anchorDate: monthAnchorDate,
      }),
    enabled: !!monthAnchorDate,
  });

  // Stats gerais
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

  let sectorWindow = undefined;
  let sectorAnchorForQuery = undefined;

  if (selectedPeriod === "day" && sectorDayAnchorDate) {
    sectorWindow = "day";
    sectorAnchorForQuery = sectorDayAnchorDate;
  } else if (selectedPeriod === "week" && sectorWeekAnchorDate) {
    sectorWindow = "week";
    sectorAnchorForQuery = sectorWeekAnchorDate;
  } else if (selectedPeriod === "month" && sectorMonthAnchorDate) {
    sectorWindow = "month";
    sectorAnchorForQuery = sectorMonthAnchorDate;
  }

  // Dashboard setorial filtrado
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
      selectedPeriod,
      sectorAnchorForQuery || null,
    ],
    queryFn: () =>
      fetchCoverageData({
        sectorId,
        status: selectedStatus,
        isEmergency: isEmergencyFilter,
        isDelayed: isDelayedFilter,
        window: sectorWindow,
        anchorDate: sectorAnchorForQuery,
      }),
    enabled: !isDashboard && !!sectorId,
  });

  // Dashboard completo do setor (sem status/flags)
  const { data: sectorDashboardAll } = useQuery({
    queryKey: [
      "reports",
      "sector-coverage-all",
      sectorId,
      selectedPeriod,
      sectorAnchorForQuery || null,
    ],
    queryFn: () =>
      fetchCoverageData({
        sectorId,
        window: sectorWindow,
        anchorDate: sectorAnchorForQuery,
      }),
    enabled: !isDashboard && !!sectorId,
  });

  const stats = sectorDashboard?.stats;
  const coverage = sectorDashboard?.coverage;

  const fullStats = sectorDashboardAll?.stats || stats;

  // Bairros para o relatório fotográfico
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

  // reset ao alternar entre dashboard geral e setorial
  useEffect(() => {
    // sempre entra sem status selecionado
    setSelectedStatus(null);
    setSelectedPeriod("day");
    setIsEmergencyFilter(false);
    setIsDelayedFilter(false);

    if (!isDashboard) {
      setDayAnchorDate(null);
      setWeekAnchorDate(null);
      setMonthAnchorDate(null);
    } else {
      setSectorDayValue("");
      setSectorWeekValue("");
      setSectorMonth("");
      setSectorDayAnchorDate(null);
      setSectorWeekAnchorDate(null);
      setSectorMonthAnchorDate(null);
    }
  }, [isDashboard, selectedSector]);

  // funções auxiliares
  function getNeighborhoodNamesForPeriod(period) {
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

  // Contagens globais do dashboard geral
  const totals = dashboardCoverage?.stats?.totals ?? {};
  const windows = dashboardCoverage?.coverage?.occurrencesCountByWindow ?? {};

  const baseDayCount = totals.day ?? windows.day ?? 0;
  const baseWeekCount = totals.week ?? windows.week ?? 0;
  const baseMonthCount = totals.month ?? windows.month ?? 0;

  const totalCount =
    totals.overall ?? dashboardCoverage?.coverage?.totalOccurrences ?? 0;

  // valores dos cards gerais com janelas customizadas
  const dayCardValue =
    dayAnchorDate && dayWindowCoverage?.coverage
      ? dayWindowCoverage.coverage.totalOccurrences ?? baseDayCount
      : baseDayCount;

  const weekCardValue =
    weekAnchorDate && weekWindowCoverage?.coverage
      ? weekWindowCoverage.coverage.totalOccurrences ?? baseWeekCount
      : baseWeekCount;

  const monthCardValue =
    monthAnchorDate && monthWindowCoverage?.coverage
      ? monthWindowCoverage.coverage.totalOccurrences ?? baseMonthCount
      : baseMonthCount;

  // Totais setoriais base
  const sectorTotals = stats?.totals ?? {};
  const sectorOccurrencesByWindow = coverage?.occurrencesCountByWindow ?? {};

  const sectorDayCardValue =
    selectedPeriod === "day" &&
    sectorDayAnchorDate &&
    coverage &&
    typeof coverage.totalOccurrences === "number"
      ? coverage.totalOccurrences
      : sectorTotals.day ?? sectorOccurrencesByWindow.day ?? 0;

  const sectorWeekCardValue =
    selectedPeriod === "week" &&
    sectorWeekAnchorDate &&
    coverage &&
    typeof coverage.totalOccurrences === "number"
      ? coverage.totalOccurrences
      : sectorTotals.week ?? sectorOccurrencesByWindow.week ?? 0;

  const sectorMonthCardValue =
    selectedPeriod === "month" &&
    sectorMonthAnchorDate &&
    coverage &&
    typeof coverage.totalOccurrences === "number"
      ? coverage.totalOccurrences
      : sectorTotals.month ?? sectorOccurrencesByWindow.month ?? 0;

  const sectorCards = [
    {
      key: "day",
      label: "Ocorrências de hoje",
      value: sectorDayCardValue,
    },
    {
      key: "week",
      label: "Ocorrências na semana",
      value: sectorWeekCardValue,
    },
    {
      key: "month",
      label: "Ocorrências neste mês",
      value: sectorMonthCardValue,
    },
    {
      key: "overall",
      label: "Total de ocorrências do setor",
      value: sectorTotals.overall ?? coverage?.totalOccurrences ?? 0,
    },
  ];

  // Handlers gerais
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

    // Descobre a janela (window) e a anchorDate de acordo com o período atual
    let windowParam = null;
    let anchorDateParam = null;

    if (selectedPeriod === "day") {
      windowParam = "day";
      anchorDateParam = sectorDayAnchorDate || null;
    } else if (selectedPeriod === "week") {
      windowParam = "week";
      anchorDateParam = sectorWeekAnchorDate || null;
    } else if (selectedPeriod === "month") {
      windowParam = "month";
      anchorDateParam = sectorMonthAnchorDate || null;
    }

    setParams((prev) => {
      const p = new URLSearchParams(prev);

      p.set("view", "sector_report");
      p.set("sectorId", String(foundSector.id));
      p.set("sectorName", String(foundSector.name));

      // mantém o period pra UI
      p.set("period", String(selectedPeriod || "month"));

      if (selectedStatus) p.set("status", String(selectedStatus));
      else p.delete("status");

      // flags
      if (isEmergencyFilter) p.set("isEmergency", "true");
      else p.delete("isEmergency");

      if (isDelayedFilter) p.set("isDelayed", "true");
      else p.delete("isDelayed");

      // filtros de janela iguais ao dashboard setorial
      if (windowParam) {
        p.set("window", windowParam);
      } else {
        p.delete("window");
      }

      if (anchorDateParam) {
        p.set("anchorDate", anchorDateParam);
      } else {
        p.delete("anchorDate");
      }

      return p;
    });
  }

  function handleToggleEmergency() {
    setIsEmergencyFilter((prev) => !prev);
  }

  function handleToggleDelayed() {
    setIsDelayedFilter((prev) => !prev);
  }

  // dia geral – usa a data exatamente como veio do input
  function handleChangeDayAnchor(value) {
    if (!value) {
      setDayAnchorDate(null);
      return;
    }

    // value vem no formato "yyyy-MM-dd"
    const [year, month, day] = value.split("-");
    const d = new Date(Number(year), Number(month) - 1, Number(day));

    const anchorDate = format(d, "yyyy-MM-dd");
    setDayAnchorDate(anchorDate);
  }

  // semana geral – usa presets: 0, 7, 14 dias atrás
  function handleChangeWeekAnchor(offsetStr) {
    if (offsetStr === "" || offsetStr == null) {
      setWeekAnchorDate(null);
      return;
    }

    const offset = Number(offsetStr);
    const today = new Date();

    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - offset
    );

    const anchorDate = format(d, "yyyy-MM-dd");
    setWeekAnchorDate(anchorDate);
  }

  // mês geral – ancora no primeiro dia do mês selecionado
  function handleChangeMonthAnchor(monthStr) {
    if (!monthStr) {
      setMonthAnchorDate(null);
      return;
    }

    const [year, month] = monthStr.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    const anchorDate = format(d, "yyyy-MM-dd");
    setMonthAnchorDate(anchorDate);
  }

  // dia do setor
  function handleChangeSectorDay(value) {
    setSectorDayValue(value || "");

    if (!value) {
      setSectorDayAnchorDate(null);
      return;
    }

    const [year, month, day] = value.split("-");
    const d = new Date(Number(year), Number(month) - 1, Number(day));

    const anchorDate = format(d, "yyyy-MM-dd");
    setSectorDayAnchorDate(anchorDate);
  }

  // semana do setor – presets: 0, 7, 14 dias atrás
  function handleChangeSectorWeek(offsetStr) {
    setSectorWeekValue(offsetStr || "");

    if (!offsetStr) {
      setSectorWeekAnchorDate(null);
      return;
    }

    const offset = Number(offsetStr);
    const today = new Date();

    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - offset
    );

    const anchorDate = format(d, "yyyy-MM-dd");
    setSectorWeekAnchorDate(anchorDate);
  }

  // mês do setor – ancora no primeiro dia do mês selecionado
  function handleChangeSectorMonth(value) {
    setSectorMonth(value || "");
    if (!value) {
      setSectorMonthAnchorDate(null);
      return;
    }

    const [year, month] = value.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    const anchorDate = format(d, "yyyy-MM-dd");
    setSectorMonthAnchorDate(anchorDate);
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

      let windowParam = null;
      let anchorDateParam = null;

      if (selectedPeriod === "day") {
        windowParam = "day";
        anchorDateParam = dayAnchorDate || null;
      } else if (selectedPeriod === "week") {
        windowParam = "week";
        anchorDateParam = weekAnchorDate || null;
      } else if (selectedPeriod === "month") {
        windowParam = "month";
        anchorDateParam = monthAnchorDate || null;
      }

      setParams((prev) => {
        const p = new URLSearchParams(prev);

        // tipo de relatório
        p.set("view", "printable_dashboard");

        // filtros de bairro
        if (local.neighborhood && local.neighborhood !== "__all__") {
          p.set("neighborhood", local.neighborhood.trim());
        } else {
          p.delete("neighborhood");
        }

        // filtros de status
        if (local.status && local.status !== "__all__") {
          p.set("status", local.status);
        } else {
          p.delete("status");
        }

        // flags do back
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

        if (windowParam) {
          p.set("window", windowParam);
        } else {
          p.delete("window");
        }

        if (anchorDateParam) {
          p.set("anchorDate", anchorDateParam);
        } else {
          p.delete("anchorDate");
        }

        if (selectedPeriod) {
          p.set("period", selectedPeriod);
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
          dayCount={dayCardValue}
          weekCount={weekCardValue}
          monthCount={monthCardValue}
          totalCount={totalCount}
          loading={
            loadingDashboardCoverage ||
            loadingDayWindow ||
            loadingWeekWindow ||
            loadingMonthWindow ||
            fetchingDayWindow ||
            fetchingWeekWindow ||
            fetchingMonthWindow
          }
          onOpenPhotoModal={() => setPhotoModalOpen(true)}
          onOpenBuilder={() => setBuilderOpen(true)}
          // callbacks para janelas (geral)
          onChangeDayAnchor={handleChangeDayAnchor}
          onChangeWeekAnchor={handleChangeWeekAnchor}
          onChangeMonthAnchor={handleChangeMonthAnchor}
          // seleção de período no GERAL
          selectedPeriod={selectedPeriod}
          onChangePeriod={handleChangePeriod}
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
          // flags
          isEmergencyFilter={isEmergencyFilter}
          isDelayedFilter={isDelayedFilter}
          onToggleEmergency={handleToggleEmergency}
          onToggleDelayed={handleToggleDelayed}
          // janelas setoriais
          sectorDay={sectorDayValue}
          onChangeSectorDay={handleChangeSectorDay}
          sectorWeek={sectorWeekValue}
          onChangeSectorWeek={handleChangeSectorWeek}
          sectorMonth={sectorMonth}
          onChangeSectorMonth={handleChangeSectorMonth}
        />
      )}

      {builderOpen ? <BuilderModal /> : null}
      {photoModalOpen ? <PhotoFilterModal /> : null}
    </section>
  );
}
