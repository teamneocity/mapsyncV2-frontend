// src/pages/ServicePlanning/index.jsx
"use client";

// React e libs
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { format as formatTz } from "date-fns-tz";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";

import { PlanningFilters } from "./PlanningFilters";

// Lista travada p/ planejamento
import { PlaninList } from "./PlaninList";

// Componentes locais
import { DailyPlanningPDF } from "./DailyPlanningPDF";
import { ExpandedRowPlanning } from "./ExpandedRowPlanning";

// Serviços
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Assets
import Printer from "@/assets/icons/Printer.svg?react";
import FilePdf from "@/assets/icons/filePdf.svg?react";

// Busca das ocorrencias em planejamento
async function fetchDailyPlanning({ queryKey }) {
  const [
    _key,
    {
      dateParam,
      debouncedStreet,
      neighborhoodId,
      occurrenceType,
      status,
      sectorId,
      foremanId,
      isDelayed,
    },
  ] = queryKey;

  const response = await api.get("/service-orders/daily-planning", {
    params: {
      date: dateParam,
      street: debouncedStreet?.trim() || undefined,
      neighborhoodId: neighborhoodId || undefined,
      occurrenceType: occurrenceType || undefined,
      status: status || undefined,
      sectorId: sectorId || undefined,
      foremanId: foremanId || undefined,
      isDelayed: isDelayed ? true : undefined,
    },
  });

  const formattedData = response.data.map((order, index) => {
    const occ = order.occurrence || {};
    const address = occ.address || {};

    return {
      __raw: order,
      id: order.id,
      createdAt: order.createdAt,
      protocol: order.protocolNumber,
      scheduledStart: order.scheduledStart,
      scheduledEnd: order.scheduledEnd,

      // flags
      isDelayed: order.isDelayed ?? false,
      isEmergencial: occ.isEmergencial ?? false,

      externalCompany: occ.externalCompany || "Emurb",
      neighborhood: address.neighborhoodName || "—",
      origin: "Plataforma",
      type: occ.type,
      status: order.status,
      sector: occ.sector,
      address: {
        street: address.street,
        number: address.number,
        city: "Aracaju",
        neighborhoodName: address.neighborhoodName,
      },
      author: occ.author,
      approvedBy: occ.approvedBy,
      pilot: order.inspector,
      ordem: index + 1,
      scheduledDate: order.scheduledDate,
      inspector: order.inspector,
      foreman: order.foreman,
      team: order.team,
      serviceNature: order.serviceNature,
      occurrence: { sector: occ.sector || null },
      fullOccurrence: {
        address: {
          street: address.street,
          number: address.number,
          neighborhoodName: address.neighborhoodName,
        },
        sector: occ.sector || null,
      },
    };
  });

  return formattedData;
}

function useDailyPlanning({
  dateParam,
  debouncedStreet,
  neighborhoodId,
  occurrenceType,
  status,
  sectorId,
  foremanId,
  isDelayed,
  toast,
}) {
  const query = useQuery({
    queryKey: [
      "daily-planning",
      {
        dateParam,
        debouncedStreet,
        neighborhoodId,
        occurrenceType,
        status,
        sectorId,
        foremanId,
        isDelayed,
      },
    ],

    queryFn: fetchDailyPlanning,
    keepPreviousData: true,
    onError: (error) => {
      console.error("Erro ao buscar planejamento diário:", error);

      toast?.({
        variant: "destructive",
        title: "Erro ao buscar planejamento diário",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Tente novamente mais tarde.",
      });
    },
  });

  return query;
}

export function ServicePlanning() {
  const { toast } = useToast();

  const [date, setDate] = useState(new Date());

  // filtros
  const [street, setStreet] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState(null);
  const [occurrenceType, setOccurrenceType] = useState(null);
  const [status, setStatus] = useState(null);
  const [sectorId, setSectorId] = useState(null);
  const [foremanId, setForemanId] = useState(null);
  const [isDelayed, setIsDelayed] = useState(false);

  // debounce para busca por rua
  const debouncedStreet = useDebouncedValue(street, 350);
  const dateParam = (() => {
    try {
      return formatTz(date, "yyyy-MM-dd", { timeZone: "America/Maceio" });
    } catch {
      return format(date, "yyyy-MM-dd");
    }
  })();

  const { data: serviceOrders = [] } = useDailyPlanning({
    dateParam,
    debouncedStreet,
    neighborhoodId,
    occurrenceType,
    status,
    sectorId,
    foremanId,
    isDelayed,
    toast,
  });

  const planinRef = useRef(null);

  const handlePrint = async () => {
    const selected = planinRef.current?.getSelected?.() ?? [];
    const ordered = planinRef.current?.getOrder?.() ?? serviceOrders;
    const dataForPdf = selected.length ? selected : ordered;

    const blob = await pdf(
      <DailyPlanningPDF
        data={dataForPdf}
        formattedDate={date.toLocaleDateString("pt-BR")}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader title="Planejamento" subtitle="Diário" />

      <main className="flex-1 flex flex-col px-4 py-4 sm:py-6 gap-4 overflow-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 sm:hidden">
          Planejamento diário
        </h1>

        {/* Filtros */}
        <PlanningFilters
          onSearch={(txt) => setStreet(txt)}
          onFilterNeighborhood={(id) => setNeighborhoodId(id || null)}
          onFilterType={(t) => setOccurrenceType(t || null)}
          onFilterStatus={(s) => setStatus(s || null)}
          onFilterDateRange={({ startDate }) => {
            if (startDate instanceof Date && !isNaN(startDate))
              setDate(startDate);
          }}
          onFilterForeman={(id) => setForemanId(id || null)}
          onFilterSector={(id) => setSectorId(id || null)}
          isDelayedFilter={isDelayed}
          onToggleDelayed={(value) => setIsDelayed(value)}
        />

        <PlaninList
          ref={planinRef}
          occurrences={serviceOrders}
          statusLabelOverrides={{ aguardando_execucao: "Agendada" }}
          renderExpandedRow={(occ) => (
            <ExpandedRowPlanning serviceorder={occ.__raw || occ} />
          )}
        />
      </main>

      {/* footer  */}
      <footer className="bg-[#EBEBEB] p-4 mt-auto">
        <div className="max-w-full mx-auto flex justify-end gap-3">
          <button
            onClick={handlePrint}
            className="flex h-[55px] items-center gap-2 bg-white text-sm text-[#4B4B62] px-4 py-2 rounded-xl shadow-sm border hover:shadow-md transition"
          >
            Imprimir
            <Printer className="w-5 h-5" />
          </button>

          <PDFDownloadLink
            document={
              <DailyPlanningPDF
                data={
                  (planinRef.current?.getSelected?.() ?? []).length
                    ? planinRef.current?.getSelected?.()
                    : planinRef.current?.getOrder?.() ?? serviceOrders
                }
                formattedDate={date.toLocaleDateString("pt-BR")}
              />
            }
            fileName={`planejamento-${format(date, "dd-MM-yyyy")}.pdf`}
          >
            {({ loading }) => (
              <button className="flex items-center h-[55px] gap-2 bg-white text-sm text-[#4B4B62] px-4 py-2 rounded-xl shadow-sm border hover:shadow-md transition">
                {loading ? "Gerando..." : "Exportar PDF"}
                <FilePdf className="w-5 h-5" />
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </footer>
    </div>
  );
}

// Hook geral de debounce
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
