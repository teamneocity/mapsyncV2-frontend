"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { AerialOccurrenceCard } from "./AerialOccurrenceCard";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Helper Data
const toYMD = (d) =>
  d instanceof Date && !isNaN(d) ? format(d, "yyyy-MM-dd") : undefined;

const ALLOWED_TYPES = ["mapeamento", "metragem", "comunicacao"];
const ALLOWED_STATUS = ["pendente", "aceita", "rejeitada", "verificada"];

async function fetchAerialInspections({ queryKey }) {
  const [
    _key,
    { page, street, neighborhoodId, order, type, status, startDate, endDate },
  ] = queryKey;

  const params = {
    page,
    street: street || undefined,
    neighborhoodId: neighborhoodId || undefined,
    order: order || undefined,
    type: ALLOWED_TYPES.includes(type) ? type : undefined,
    status: ALLOWED_STATUS.includes(status) ? status : undefined,
    startDate,
    endDate,
  };

  const { data } = await api.get("/aerial-inspections", { params });

  const list = data?.inspections ?? data?.data ?? [];
  const serverPage = data?.meta?.page ?? data?.page ?? page ?? 1;
  const perPage = data?.meta?.perPage ?? data?.perPage ?? 10;
  const serverTotalPages =
    data?.meta?.totalPages ??
    data?.totalPages ??
    Math.max(1, Math.ceil((data?.totalCount ?? 0) / perPage));

  return {
    list: Array.isArray(list) ? list : [],
    page: serverPage,
    totalPages: serverTotalPages,
  };
}

function useAerialInspections({
  page,
  street,
  neighborhoodId,
  order,
  type,
  status,
  startDate,
  endDate,
  toast,
}) {
  return useQuery({
    queryKey: [
      "aerial-inspections",
      {
        page,
        street,
        neighborhoodId,
        order,
        type,
        status,
        startDate: toYMD(startDate),
        endDate: toYMD(endDate),
      },
    ],
    queryFn: fetchAerialInspections,
    keepPreviousData: true,
    onError: (error) => {
      console.error("Erro ao buscar inspeções:", error);
      toast({
        title: "Não foi possível carregar as inspeções",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });
}

export function OccurrencesA() {
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);

  // Filtros
  const [street, setStreet] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState(null);
  const [order, setOrder] = useState("recent");
  const [type, setType] = useState(null);
  const [status, setStatus] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [expandedId, setExpandedId] = useState(null);

  const { data, isLoading } = useAerialInspections({
    page: currentPage,
    street,
    neighborhoodId,
    order,
    type,
    status,
    startDate,
    endDate,
    toast,
  });

  const occurrences = (data?.list ?? []).filter((occ) => {
    if (status === "rejeitada") return occ.status === "rejeitada";

    // Se algum status específico estiver selecionado, filtra por ele
    if (status && status !== "rejeitada") return occ.status === status;

    return occ.status !== "rejeitada";
  });

  const totalPages = data?.totalPages ?? 1;
  const effectivePage = data?.page ?? currentPage;

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader title="Mapeamento" subtitle="Aéreo" />

      <div className="px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Ocorrências Aéreas
        </h1>

        <Filters
          contextType="aerea"
          onSearch={(value) => {
            setStreet(value);
            setCurrentPage(1);
          }}
          onFilterType={(value) => {
            setType(ALLOWED_TYPES.includes(value) ? value : null);
            setCurrentPage(1);
          }}
          onFilterRecent={(value) => {
            setOrder(value === "oldest" ? "oldest" : "recent");
            setCurrentPage(1);
          }}
          onFilterNeighborhood={(value) => {
            setNeighborhoodId(value || null);
            setCurrentPage(1);
          }}
          onFilterDateRange={(range) => {
            setStartDate(range?.startDate || null);
            setEndDate(range?.endDate || null);
            setCurrentPage(1);
          }}
          onFilterStatus={(value) => {
            setStatus(ALLOWED_STATUS.includes(value) ? value : null);
            setCurrentPage(1);
          }}
          handleApplyFilters={handleApplyFilters}
          showType={false}
          showCompany={false}
        />
      </div>

      {/* Cards */}
      <div className="px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {occurrences?.length === 0 && !isLoading && (
            <div className="col-span-full">
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
                Nenhuma ocorrência encontrada.
              </div>
            </div>
          )}

          {occurrences?.map((occ) => (
            <div key={occ.id} className="relative">
              <AerialOccurrenceCard
                occurrence={occ}
                expanded={expandedId === occ.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === occ.id ? null : occ.id))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Paginação */}
      <footer className="bg-[#EBEBEB] p-4 mt-auto">
        <div className="max-w-full mx-auto">
          <Pagination
            currentPage={effectivePage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </footer>
    </div>
  );
}
