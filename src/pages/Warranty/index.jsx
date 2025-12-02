// src/pages/Warranty/index.jsx
"use client";

// React e bibliotecas externas
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";

// Hooks e serviços
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Componentes locais
import { WarrantyCard } from "./WarrantyCard";

function isoStartOfDay(d) {
  if (!d) return undefined;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}
function isoEndOfDay(d) {
  if (!d) return undefined;
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
}

// Busca as duplicatas
async function fetchWarrantyOccurrences({ queryKey }) {
  const [
    _key,
    {
      page,
      searchTerm,
      filterType,
      filterStatus,
      filterRecent,
      filterNeighborhood,
      startDate,
      endDate,
    },
  ] = queryKey;

  const { data } = await api.get("/occurrences/warranty", {
    params: {
      page,
      street: searchTerm || undefined, 
      districtId: filterNeighborhood || undefined, 
      type: filterType || undefined, 
      status: filterStatus || undefined, 
      orderBy: filterRecent || "recent", 
      startDate,
      endDate,
    },
  });

  const {
    occurrences: listRaw = [],
    totalPages: apiTotalPages,
    totalCount,
    pageSize,
    page: apiPage,
  } = data ?? {};

  const flattened = Array.isArray(listRaw)
    ? listRaw.map((occ) => ({
        ...occ,
        protocolNumber: occ?.protocolNumber ?? occ?.id ?? "-",
      }))
    : [];

  const computedTotalPages =
    Number(apiTotalPages) ||
    Math.max(
      1,
      Math.ceil(
        (Number(totalCount) || flattened.length) / (Number(pageSize) || 10)
      )
    );

  const serverPage =
    typeof apiPage === "number" ? apiPage : page ?? 1;

  return {
    list: flattened,
    page: serverPage,
    totalPages: computedTotalPages,
  };
}

function useWarrantyOccurrences({
  page,
  searchTerm,
  filterType,
  filterStatus,
  filterRecent,
  filterNeighborhood,
  filterDateRange,
  toast,
}) {
  const startDate = filterDateRange.startDate
    ? isoStartOfDay(filterDateRange.startDate)
    : undefined;

  const endDate = filterDateRange.endDate
    ? isoEndOfDay(filterDateRange.endDate)
    : undefined;

  const query = useQuery({
    queryKey: [
      "warranty-occurrences",
      {
        page,
        searchTerm,
        filterType,
        filterStatus,
        filterRecent,
        filterNeighborhood,
        startDate,
        endDate,
      },
    ],
    queryFn: fetchWarrantyOccurrences,
    keepPreviousData: true,
    onError: (error) => {
      console.error(
        "Erro ao buscar ocorrências de garantia:",
        error?.response?.data || error
      );
      toast({
        variant: "destructive",
        title: "Erro ao buscar ocorrências (garantia)",
        description:
          error?.response?.data?.message || error.message,
      });
    },
  });

  return query;
}

export function Warranty() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterRecent, setFilterRecent] = useState("recent");
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [currentPage, setCurrentPage] = useState(1);

  const { data } = useWarrantyOccurrences({
    page: currentPage,
    searchTerm,
    filterType,
    filterStatus,
    filterRecent,
    filterNeighborhood,
    filterDateRange,
    toast,
  });

  const list = data?.list ?? [];
  const totalPages = data?.totalPages ?? 1;
  const effectivePage = data?.page ?? currentPage;

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader title="Garantia de" subtitle="90 dias"/>

      <div className="px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Ocorrências com Garantia (até 90 dias)
        </h1>

        <Filters
          contextType="garantia" 
          onSearch={(input) => {
            setSearchTerm(input);
            setCurrentPage(1);
          }}
          onFilterType={(type) => {
            setFilterType(type);
            setCurrentPage(1);
          }}
          onFilterRecent={(order) => {
            setFilterRecent(order);
            setCurrentPage(1);
          }}
          onFilterNeighborhood={(neighborhood) => {
            setFilterNeighborhood(neighborhood);
            setCurrentPage(1);
          }}
          onFilterDateRange={(range) => {
            setFilterDateRange(range || { startDate: null, endDate: null });
            setCurrentPage(1);
          }}
          onFilterStatus={(status) => {
            setFilterStatus(status);
            setCurrentPage(1);
          }}
          handleApplyFilters={handleApplyFilters}
        />
      </div>

      {/* Cards */}
      <div className="px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {list?.length === 0 && (
            <div className="col-span-full">
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
                Nenhuma ocorrência pendente de revisão dentro de 90 dias.
              </div>
            </div>
          )}

          {list?.map((occ) => (
            <WarrantyCard
              key={occ.id || occ.occurrenceId || occ.protocolNumber}
              occurrence={occ}
            />
          ))}
        </div>
      </div>

      {/* Paginação  */}
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
