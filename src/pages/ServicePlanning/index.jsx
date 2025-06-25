"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { OccurrenceList } from "@/components/OccurrenceList"; // ajuste conforme o nome real
import { api } from "@/services/api";
import { format } from "date-fns";

export function ServicePlanning() {
  const [serviceOrders, setServiceOrders] = useState([]);
  const [date, setDate] = useState(new Date());

  const fetchPlanning = async (selectedDate) => {
    try {
      const formatted = format(selectedDate, "yyyy-MM-dd");
      const response = await api.get(
        `/service-orders/daily-planning?date=${formatted}`
      );

      // Mapeando para estrutura compatível com OccurrenceList
      const formattedData = response.data.map((order) => {
        const occ = order.occurrence || {};
        const address = occ.address || {};

        return {
          id: order.id,
          createdAt: order.createdAt,
          protocol: order.protocolNumber,
          origin: "Plataforma", // ou outra fonte se disponível
          type: occ.type,
          status: order.status,
          address: {
            street: address.street,
            number: address.number,
            city: "Aracaju", // ou use address.city se existir
            neighborhoodName: address.neighborhoodName,
          },
          author: occ.author,
          approvedBy: occ.approvedBy,
          pilot: order.inspector,
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
          title="Planejamento & execução "
          subtitle="de ordem de serviço"
          onSearch={() => {}}
          onFilterType={() => {}}
          onFilterRecent={() => {}}
          onFilterNeighborhood={() => {}}
          onFilterDateRange={(range) => {
            if (range?.startDate) setDate(range.startDate);
          }}
          handleApplyFilters={() => fetchPlanning(date)}
        />
      </div>

      <OccurrenceList occurrences={serviceOrders} />
    </div>
  );
}
