"use client";

// React e bibliotecas externas
import React, { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

// Hooks customizados
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";

// Componentes locais
import { InspectionCard } from "./inspectionCard";

// Serviços e utilitários
import { api } from "@/services/api";


// Busca de dados
async function fetchInspectionOrders({ queryKey }) {
  const [
    _key,
    {
      page,
      searchTerm,
      filterType,
      filterRecent,
      filterStatus,
      filterNeighborhood,
      startDate,
      endDate,
    },
  ] = queryKey;

  const params = {
    page,
    street: searchTerm,
    districtId: filterNeighborhood,
    type: filterType,
    status: filterStatus,
    orderBy: filterRecent,
    startDate,
    endDate,
  };

  const { data } = await api.get("/service-orders", { params });

  const list = data?.serviceorders ?? [];
  const serverPage = data?.meta?.page ?? data?.page ?? page ?? 1;
  const serverTotalPages = data?.meta?.totalPages ?? data?.totalPages ?? 1;

  return {
    list,
    page: serverPage,
    totalPages: serverTotalPages,
  };
}

function useInspectionOrders({
  page,
  searchTerm,
  filterType,
  filterRecent,
  filterStatus,
  filterNeighborhood,
  filterDateRange,
  toast,
}) {
  // Formatação de datas
  const startDate = filterDateRange.startDate
    ? format(filterDateRange.startDate, "yyyy-MM-dd")
    : undefined;

  const endDate = filterDateRange.endDate
    ? format(filterDateRange.endDate, "yyyy-MM-dd")
    : undefined;

  const query = useQuery({
    queryKey: [
      "inspection-service-orders",
      {
        page,
        searchTerm,
        filterType,
        filterRecent,
        filterStatus,
        filterNeighborhood,
        startDate,
        endDate,
      },
    ],
    queryFn: fetchInspectionOrders,
    keepPreviousData: true,
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao buscar ordens de serviço",
        description: error?.response?.data?.message || error.message,
      });
    },
  });

  return query;
}

export function Inspection() {
  const { toast } = useToast();
  const { isAdmin, isSupervisor } = usePermissions();

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterRecent, setFilterRecent] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, error } = useInspectionOrders({
    page: currentPage,
    searchTerm,
    filterType,
    filterRecent,
    filterStatus,
    filterNeighborhood,
    filterDateRange,
    toast,
  });

  const occurrences = data?.list ?? [];
  const totalPages = data?.totalPages ?? 1;
  const effectivePage = data?.page ?? currentPage;

  const handleApplyFilters = () => {
    // Volta para página 1 quando filtrado
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="flex-1">
        {/* Filtros */}
        <div className="sticky top-[88px] z-10 bg-[#EBEBEB] px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
            Fiscalização de O.S.
          </h1>
          <Filters
            title="Fiscalização de"
            subtitle="O.S."
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
            onFilterStatus={(status) => {
              setFilterStatus(status);
              setCurrentPage(1);
            }}
            onFilterNeighborhood={(neighborhood) => {
              setFilterNeighborhood(neighborhood);
              setCurrentPage(1);
            }}
            onFilterDateRange={(range) => {
              setFilterDateRange(range);
              setCurrentPage(1);
            }}
            handleApplyFilters={handleApplyFilters}
          />
        </div>

        {/* Cards */}
        <div className="px-4 py-2 bg-[#EBEBEB]">
          <div className="w-full p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-6 place-items-center [&>div]:min-h-[600px] [&>div]:w-full">
              {occurrences.map((order) => (
                <InspectionCard key={order.id} serviceorder={order} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Paginação */}
      <footer className="bottom-0 z-10 bg-[#EBEBEB] p-4">
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
