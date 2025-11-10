// src/pages/ServicePlanning/index.jsx
"use client";

// React e libs
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { format as formatTz } from "date-fns-tz";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";

// Lista travada p/ planejamento
import { PlaninList } from "./PlaninList";

// Componentes locais
import { DailyPlanningPDF } from "./DailyPlanningPDF";
import { ExpandedRowPlanning } from "./ExpandedRowPlanning";

// Serviços
import { api } from "@/services/api";

// Assets
import Printer from "@/assets/icons/Printer.svg?react";
import FilePdf from "@/assets/icons/filePdf.svg?react";

export function ServicePlanning() {
  // dados
  const [serviceOrders, setServiceOrders] = useState([]);

  // data diária
  const [date, setDate] = useState(new Date());

  // filtros suportados pela rota
  const [street, setStreet] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState(null);
  const [occurrenceType, setOccurrenceType] = useState(null);
  const [status, setStatus] = useState(null);
  const [sectorId, setSectorId] = useState(null);

  const debouncedStreet = useDebouncedValue(street, 350);

  const dateParam = (() => {
    try {
      return formatTz(date, "yyyy-MM-dd", { timeZone: "America/Maceio" });
    } catch {
      return format(date, "yyyy-MM-dd");
    }
  })();

  const buildQuery = () => {
    const params = new URLSearchParams({ date: dateParam });
    if ((debouncedStreet || "").trim())
      params.set("street", debouncedStreet.trim());
    if (neighborhoodId) params.set("neighborhoodId", neighborhoodId);
    if (occurrenceType) params.set("occurrenceType", occurrenceType);
    if (status) params.set("status", status);
    if (sectorId) params.set("sectorId", sectorId);
    return params.toString();
  };

  // busca
  const fetchPlanning = async () => {
    try {
      const query = buildQuery();
      const response = await api.get(`/service-orders/daily-planning?${query}`);

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

      setServiceOrders(formattedData);
    } catch (error) {
      console.error("Erro ao buscar planejamento:", error);
    }
  };

  // refetch quando data/filtros mudam
  useEffect(() => {
    fetchPlanning();
  }, [
    dateParam,
    debouncedStreet,
    neighborhoodId,
    occurrenceType,
    status,
    sectorId,
  ]);

  // ref para pegar ordem/seleção no print
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
      <TopHeader />

      <div className="px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Planejamento diário
        </h1>

        <Filters
          title="Planejamento"
          subtitle="diário"
          contextType="padrao"
          showRecent={false}
          showDate={true}
          showCompany={false}
          onSearch={(txt) => setStreet(txt)}
          onFilterNeighborhood={(id) => setNeighborhoodId(id || null)}
          onFilterType={(t) => setOccurrenceType(t || null)}
          onFilterStatus={(s) => setStatus(s || null)}
          onFilterDateRange={({ startDate }) => {
            if (startDate instanceof Date && !isNaN(startDate))
              setDate(startDate);
          }}
        />
      </div>

      {/* lista diretamente após os filtros  */}
      <PlaninList
        ref={planinRef}
        occurrences={serviceOrders}
        statusLabelOverrides={{ aguardando_execucao: "Agendada" }}
        renderExpandedRow={(occ) => (
          <ExpandedRowPlanning serviceorder={occ.__raw || occ} />
        )}
      />

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

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
