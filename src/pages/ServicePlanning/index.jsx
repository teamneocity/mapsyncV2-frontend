"use client";

// React e bibliotecas externas
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { format as formatTz } from "date-fns-tz";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { OccurrenceList } from "@/components/OccurrenceList";

// Componentes locais
import { DailyPlanningPDF } from "./DailyPlanningPDF";
import { ExpandedRowPlanning } from "./ExpandedRowPlanning"; // export nomeado

// Serviços e utilitários
import { api } from "@/services/api";

// Assets
import Printer from "@/assets/icons/Printer.svg?react";
import FilePdf from "@/assets/icons/filePdf.svg?react";

export function ServicePlanning() {
  const [serviceOrders, setServiceOrders] = useState([]);
  const [date, setDate] = useState(new Date());

  const [street, setStreet] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [occurrenceType, setOccurrenceType] = useState("");
  const [status, setStatus] = useState("");
  const [sectorId, setSectorId] = useState("");

  const handlePrint = async () => {
    const blob = await pdf(
      <DailyPlanningPDF
        data={serviceOrders}
        formattedDate={date.toLocaleDateString("pt-BR")}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const fetchPlanning = async (selectedDate) => {
    try {
      const formatted = formatTz(selectedDate, "yyyy-MM-dd", {
        timeZone: "America/Maceio",
      });

      const queryParams = new URLSearchParams({
        date: formatted,
        ...(street && { street }),
        ...(neighborhoodId && { neighborhoodId }),
        ...(occurrenceType && { occurrenceType }),
        ...(status && { status }),
        ...(sectorId && { sectorId }),
      });

      const response = await api.get(
        `/service-orders/daily-planning?${queryParams.toString()}`
      );

      const formattedData = response.data.map((order, index) => {
        const occ = order.occurrence || {};
        const address = occ.address || {};

        return {
          id: order.id,
          createdAt: order.createdAt,
          protocol: order.protocolNumber,
          origin: "Plataforma",
          type: occ.type,
          status: order.status,
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
          fullOccurrence: {
            address: {
              street: address.street,
              number: address.number,
              neighborhoodName: address.neighborhoodName,
            },
          },
        };
      });

      setServiceOrders(formattedData);
    } catch (error) {
      console.error("Erro ao buscar planejamento:", error);
    }
  };

  useEffect(() => {
    fetchPlanning(date);
  }, [date]);

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="px-6 py-4 sm:py-6">
        <Filters
          title="Planejamento"
          subtitle="diário"
          onSearch={(value) => setStreet(value)}
          onFilterType={(value) => setOccurrenceType(value)}
          onFilterRecent={(value) => setStatus(value)}
          onFilterNeighborhood={(value) => setNeighborhoodId(value)}
          onFilterSector={(value) => setSectorId(value)}
          onFilterDateRange={(range) => {
            if (range?.startDate) setDate(range.startDate);
          }}
          handleApplyFilters={() => fetchPlanning(date)}
        />
      </div>

      <OccurrenceList
        occurrences={serviceOrders}
        statusLabelOverrides={{ aguardando_execucao: "Agendada" }}
        renderExpandedRow={(occ) => <ExpandedRowPlanning occurrence={occ} />}
      />

      <div className="flex justify-end gap-3 px-6 pb-10 mt-4">
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
              data={serviceOrders}
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
    </div>
  );
}
