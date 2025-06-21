"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { OccurrenceList } from "@/components/OccurrenceList";
import { ExpandedRowServiceOrder } from "./ExpandedRowServiceOrder";
import { Filters } from "@/components/filters";
import { LiveActionButton } from "@/components/live-action-button";
import { Pagination } from "@/components/pagination";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import logoEmurb from "../../assets/logoEmurb.png";

export function ServiceOrder() {
  const { toast } = useToast();
  const { isAdmin, isSupervisor } = usePermissions();

  const [occurrences, setOccurrences] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [selectOptions, setSelectOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterRecent, setFilterRecent] = useState(null);
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    if (!isAdmin && !isSupervisor) {
      window.location.href = "/";
    }
  }, [isAdmin, isSupervisor]);

  useEffect(() => {
    fetchServiceOrders(currentPage);
  }, [currentPage]);

  const fetchServiceOrders = async (page = 1) => {
    try {
      const params = {
        search: searchTerm,
        recent: filterRecent,
        type: filterType,
        neighborhood: filterNeighborhood,
        startDate: filterDateRange.startDate
          ? format(filterDateRange.startDate, "yyyy-MM-dd")
          : null,
        endDate: filterDateRange.endDate
          ? format(filterDateRange.endDate, "yyyy-MM-dd")
          : null,
        page,
        limit: 6,
      };

      const res = await api.get("/service-orders", { params });
      const result = res.data;

      const flattened = (result.serviceorders || []).map((order) => ({
        id: order.id,
        status: order.occurrence?.status || order.status,
        createdAt: order.occurrence?.createdAt || order.createdAt,
        author: order.occurrence?.author || null,
        approvedBy: order.occurrence?.approvedBy || null,
        address: order.occurrence?.address || {},
        protocol: order.protocolNumber || "-",
        zone: order.occurrence?.zone || "—",
        origin: "Plataforma",
        raw: order, // mantemos o original para passar para o expandido
      }));

      setOccurrences(flattened);
      setCurrentPage(result.currentPage || 1);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar ordens de serviço",
        description: error.message,
      });
      setOccurrences([]);
    }
  };

  const handleApplyFilters = () => {
    fetchServiceOrders(1);
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

      <header className="flex justify-between items-center py-4 px-4 sm:px-8 bg-[#EBEBEB] sticky top-0 z-10">
        <div className="px-2 py-2">
          <Link to="/">
            <img
              src={logoEmurb}
              alt="Logo EMURB"
              className="h-16 w-auto rounded-md"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LiveActionButton />
        </div>
      </header>

      <div className="px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Ordens de Serviço
        </h1>
        <Filters
          title="Ordens de Serviço"
          subtitle="registradas"
          onSearch={(input) => setSearchTerm(input)}
          onFilterType={(type) => setFilterType(type)}
          onFilterRecent={(order) => setFilterRecent(order)}
          onFilterNeighborhood={(neighborhood) =>
            setFilterNeighborhood(neighborhood)
          }
          onFilterDateRange={(range) => setFilterDateRange(range)}
          handleApplyFilters={handleApplyFilters}
        />
      </div>

      <OccurrenceList
        occurrences={occurrences}
        renderExpandedRow={(occurrence) => (
          <ExpandedRowServiceOrder
            occurrence={occurrence.raw} // passa o dado original completo para o expandido
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
            onPageChange={setCurrentPage}
          />
        </div>
      </footer>
    </div>
  );
}
