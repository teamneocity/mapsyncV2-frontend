// src/pages/ServiceOrder/index.jsx
"use client";

// React e bibliotecas externas
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

// Hooks customizados
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { LiveActionButton } from "@/components/live-action-button";
import { Pagination } from "@/components/pagination";
import { OccurrenceList } from "@/components/OccurrenceList";

// Componentes locais
import { ExpandedRowServiceOrder } from "./ExpandedRowServiceOrder";

// Serviços e utilitários
import { api } from "@/services/api";

export function ServiceOrder() {
  const { toast } = useToast();
  const { isAdmin, isSupervisor } = usePermissions();

  const [occurrences, setOccurrences] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [selectOptions, setSelectOptions] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterRecent, setFilterRecent] = useState("recent");
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [filterCompany, setFilterCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    fetchServiceOrders(currentPage);
  }, [
    currentPage,
    searchTerm,
    filterType,
    filterStatus,
    filterRecent,
    filterNeighborhood,
    filterDateRange.startDate,
    filterDateRange.endDate,
    filterCompany,
    isDelayed,
  ]);

  const handleToggleDateOrder = (order) => {
    setFilterRecent(order);
    setCurrentPage(1);
  };

  const fetchServiceOrders = async (page = 1) => {
    try {
      const response = await api.get("/service-orders", {
        params: {
          page,
          street: searchTerm,
          districtId: filterNeighborhood,
          occurrenceType: filterType,
          status: filterStatus,
          orderBy: filterRecent || "recent",
          externalCompanyName: filterCompany || undefined,
          startDate: filterDateRange.startDate
            ? new Date(
                new Date(filterDateRange.startDate).setHours(0, 0, 0, 0)
              ).toISOString()
            : undefined,
          endDate: filterDateRange.endDate
            ? new Date(
                new Date(filterDateRange.endDate).setHours(23, 59, 59, 999)
              ).toISOString()
            : undefined,
          isDelayed: isDelayed ? true : undefined,
        },
      });

      const data = response.data ?? {};
      const meta = data.meta ?? {};

      const listRaw = Array.isArray(data.serviceorders)
        ? data.serviceorders
        : [];

      const serverPage = typeof meta.page === "number" ? meta.page : page;
      const serverTotalPages =
        typeof meta.totalPages === "number" ? meta.totalPages : 1;

      const flattened = listRaw.map((order) => ({
        id: order.id,
        status: order?.status || order.status,
        createdAt: order.occurrence?.createdAt || order.createdAt,
        type: order.occurrence?.type || order.type,
        author: order.occurrence?.author || null,
        approvedBy: order.occurrence?.approvedBy || null,
        address: order.occurrence?.address || {},
        protocol: order.protocolNumber || "-",
        zone: order.occurrence?.zone || "—",
        origin: "Plataforma",
        isEmergencial: order.occurrence?.isEmergencial || false,
        raw: order,
      }));

      setOccurrences(flattened);
      setCurrentPage(serverPage);
      setTotalPages(serverTotalPages);
    } catch (error) {
      console.error(
        "Erro ao buscar ordens de serviço:",
        error?.response?.data || error
      );

      toast({
        variant: "destructive",
        title: "Erro ao buscar ordens de serviço",
        description: error.message,
      });

      setOccurrences([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  const handleGenerateOS = (id) => {
    console.log("Gerar OS:", id);
  };

  const handleOpenReturnModal = () => {};

  const handleDeleteImage = (imageId) => {
    console.log("Deletar imagem", imageId);
  };

  const loadOptionsForOccurrence = async (occurrence) => {
    try {
      const res = await api.get(
        `/sectors/${occurrence.raw?.occurrence?.sector?.id}/details`
      );
      const sectorData = res.data.sector;
      setSelectOptions((prev) => ({
        ...prev,
        [occurrence.id]: {
          natures:
            sectorData.teams?.flatMap((team) => team.serviceNatures) || [],
          technicians: sectorData.inspectors || [],
          teams: sectorData.teams || [],
          supervisors: sectorData.foremen || [],
        },
      }));
    } catch (error) {
      console.error("Erro ao carregar dados do setor:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />

      <TopHeader title="Ordem de" subtitle="Serviço" />

      <div className="px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Ordens de Serviço
        </h1>
        <Filters
          contextType="padrao"
          // filtro de companhia
          onFilterCompany={(company) => {
            setFilterCompany(company);
            setCurrentPage(1);
          }}
          // busca por rua / protocolo
          onSearch={(input) => {
            setSearchTerm(input);
            setCurrentPage(1);
          }}
          // tipo de ocorrência
          onFilterType={(type) => {
            setFilterType(type);
            setCurrentPage(1);
          }}
          // ordenação por data
          onFilterRecent={(order) => {
            setFilterRecent(order);
            setCurrentPage(1);
          }}
          // bairro
          onFilterNeighborhood={(neighborhood) => {
            setFilterNeighborhood(neighborhood);
            setCurrentPage(1);
          }}
          // intervalo de datas
          onFilterDateRange={(range) => {
            setFilterDateRange(range);
            setCurrentPage(1);
          }}
          // status
          onFilterStatus={(status) => {
            setFilterStatus(status);
            setCurrentPage(1);
          }}
          handleApplyFilters={handleApplyFilters}
          // botão “Somente atrasadas”
          showDelayed={true}
          isDelayedFilter={isDelayed}
          onToggleDelayed={(value) => {
            setIsDelayed(value);
            setCurrentPage(1);
          }}
        />
      </div>

      <OccurrenceList
        occurrences={occurrences}
        dateOrder={filterRecent ?? "recent"}
        onToggleDateOrder={handleToggleDateOrder}
        renderExpandedRow={(occurrence) => (
          <ExpandedRowServiceOrder
            occurrence={occurrence.raw}
            loadOptionsForOccurrence={loadOptionsForOccurrence}
            selectedValues={selectedValues}
            setSelectedValues={setSelectedValues}
            selectOptions={selectOptions}
            onGenerateOS={handleGenerateOS}
            onOpenReturnModal={handleOpenReturnModal}
            onDeleteImage={handleDeleteImage}
          />
        )}
      />

      <footer className="bg-[#EBEBEB] p-4 mt-auto">
        <div className="max-w-full mx-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchServiceOrders}
          />
        </div>
      </footer>
    </div>
  );
}