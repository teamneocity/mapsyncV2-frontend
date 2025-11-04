"use client";

// React e bibliotecas externas
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { format as formatTz } from "date-fns-tz";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { OccurrenceList } from "@/components/OccurrenceList"; // ✅ import corrigido

// Componentes locais
import { DailyPlanningPDF } from "./DailyPlanningPDF";
import { ExpandedRowPlanning } from "./ExpandedRowPlanning";

// Serviços e utilitários
import { api } from "@/services/api";

// Assets
import Printer from "@/assets/icons/Printer.svg?react";
import FilePdf from "@/assets/icons/filePdf.svg?react";
import { CalendarDays } from "lucide-react";

// helper: hoje local em YYYY-MM-DD (timezone Maceió)
function getTodayLocalYMD() {
  const now = new Date();
  return formatTz(now, "yyyy-MM-dd", { timeZone: "America/Maceio" });
}

export function ServicePlanning() {
  const [serviceOrders, setServiceOrders] = useState([]);

  // mantive um Date (para o PDF) e um string YYYY-MM-DD (para a rota)
  const [date, setDate] = useState(new Date());
  const [dateStr, setDateStr] = useState(getTodayLocalYMD());

  // 🖨️ Gera e abre PDF em nova aba
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

  // 🔄 Busca dados da rota /daily-planning?date=YYYY-MM-DD
  const fetchPlanning = async (dateYYYYMMDD) => {
    try {
      const response = await api.get(
        `/service-orders/daily-planning?date=${dateYYYYMMDD}`
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

  // dispara toda vez que a string YYYY-MM-DD mudar
  useEffect(() => {
    fetchPlanning(dateStr);

    const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
    if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
      setDate(new Date(y, m - 1, d));
    }
  }, [dateStr]);

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-left">
            <h2 className="text-xl font-semibold text-[#1F1F2C] leading-none">
              Planejamento
            </h2>
            <p className="text-sm text-[#6B7280] -mt-0.5">diário</p>
          </div>

          <div/>

          <div className="relative">
            <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700" />
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="h-[55px] pl-10 pr-4 rounded-xl border bg-[#fffff] hover:bg-gray-300 focus:bg-gray-200 outline-none transition-colors"
              aria-label="Selecionar data"
              title="Selecionar data"
            />
          </div>
        </div>
      </div>

      {/* Lista de Ordens */}
      <OccurrenceList
        occurrences={serviceOrders}
        statusLabelOverrides={{ aguardando_execucao: "Agendada" }}
        renderExpandedRow={(occ) => <ExpandedRowPlanning occurrence={occ} />}
      />

      {/* Ações (imprimir/exportar) */}
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
