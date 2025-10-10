"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { WarrantyCard } from "./WarrantyCard";

export function Warranty() {
  const [occurrences, setOccurrences] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filtros (padrão das outras páginas)
  const [street, setStreet] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [order, setOrder] = useState(""); // "recent" | "oldest"
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { toast } = useToast();

  const fetchWarrantyOccurrences = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        ...(street && { street }),
        ...(neighborhoodId && { neighborhoodId }),
        ...(order && { order }),
        ...(type && { type }),
        ...(status && { status }),
        ...(startDate && { startDate: startDate.toISOString().split("T")[0] }),
        ...(endDate && { endDate: endDate.toISOString().split("T")[0] }),
      });

      const { data } = await api.get(
        `/occurrences/warranty?${queryParams.toString()}`
      );

      const { serviceorders = [], totalCount, pageSize } = data;

      const list = serviceorders.map((item) => {
        const occ = item?.occurrence ?? {};
        return {
          ...occ,

          protocolNumber:
            item?.protocolNumber ?? occ?.protocolNumber ?? occ?.id ?? null,
          status: occ?.status ?? item?.status ?? null,
          createdAt: occ?.createdAt ?? item?.createdAt ?? null,
          acceptedAt: occ?.acceptedAt ?? item?.acceptedAt ?? null,
          updatedAt: occ?.updatedAt ?? item?.updatedAt ?? null,
          startedAt: occ?.startedAt ?? item?.startedAt ?? null,
          finishedAt: occ?.finishedAt ?? item?.finishedAt ?? null,
        };
      });

      setOccurrences(list);
      setTotalPages(
        Math.max(
          1,
          Math.ceil(
            (Number(totalCount) || list.length) / (Number(pageSize) || 10)
          )
        )
      );
    } catch (error) {
      console.error("Erro ao buscar ocorrências de garantia:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as ocorrências de garantia.",
        variant: "destructive",
      });
      setOccurrences([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchWarrantyOccurrences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      {/* Filtros: mesmo padrão das outras telas */}
      <div className="px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Ocorrências com Garantia (até 90 dias)
        </h1>

        <Filters
          title="Garantia"
          subtitle="Até 90 dias"
          contextType="garantia"
          onSearch={(value) => setStreet(value)}
          onFilterType={(value) => setType(value)}
          onFilterRecent={(value) => setOrder(value)}
          onFilterNeighborhood={(value) => setNeighborhoodId(value)}
          onFilterDateRange={(range) => {
            setStartDate(range?.startDate || null);
            setEndDate(range?.endDate || null);
          }}
          onFilterStatus={(value) => setStatus(value)}
          handleApplyFilters={() => {
            setCurrentPage(1);
            fetchWarrantyOccurrences();
          }}
        />
      </div>

      {/* LISTA DE CARDS (padrão) */}
      <div className="px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {occurrences?.length === 0 && (
            <div className="col-span-full">
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
                Nenhuma ocorrência pendente de revisão dentro de 90 dias.
              </div>
            </div>
          )}

          {occurrences?.map((occ) => (
            <WarrantyCard
              key={occ.id || occ.occurrenceId || occ.protocolNumber}
              occurrence={occ}
            />
          ))}
        </div>
      </div>

      {/* PAGINAÇÃO */}
      <footer className="bg-[#EBEBEB] p-4 mt-auto">
        <div className="max-w-full mx-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </footer>
    </div>
  );
}
