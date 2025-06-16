"use client";

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";

import { Sidebar } from "@/components/sidebar";
import { Filters } from "@/components/filters";
import { LiveActionButton } from "@/components/live-action-button";
import { Pagination } from "@/components/pagination";

import { api } from "@/services/api";

import { format } from "date-fns";

import { useUserSector } from "@/hooks/useUserSector";
import { usePermissions } from "@/hooks/usePermissions";

import { OccurrenceList } from "@/components/OccurrenceList";
import { ExpandedRowT } from "./ExpandedRowT";

export function OccurrencesT() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [occurrences, setOccurrences] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterRecent, setFilterRecent] = useState(null);
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [selectOptions, setSelectOptions] = useState({});

  const { setor } = useUserSector();
  const { isAdmin, isSupervisor } = usePermissions();
  const [selectedValues, setSelectedValues] = useState({});

  const handleApplyFilters = () => {
    fetchOccurrences(1); // força a página 1 com os filtros atuais
  };

  useEffect(() => {
    fetchOccurrences(currentPage);
  }, [currentPage]);

  const fetchOccurrences = async (page = 1) => {
    try {
      const params = {
        search: searchTerm,
        recent: filterRecent,
        type: isSupervisor && !isAdmin ? setor?.name : null,
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

      const res = await api.get("/land-occurrences", { params });

      // salva todas e deixa o filtro pro front
      setOccurrences(res.data.data);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar ocorrências",
        description: error.message,
      });
    }
  };

  //devolve a ocorrencia
  const handleIgnoreOccurrence = async (id, status) => {
    try {
      await api.delete("/land-occurrences/refuse", {
        data: { id, status },
      });

      toast({
        title: "Ocorrência devolvida com sucesso",
      });

      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao devolver ocorrência",
        description: error.message,
      });
    }
  };

  //aceita a ocorrencia
  const handleGenerateOS = async (id, status) => {
    if (status === "Pendente") {
      toast({
        title: "O.S. já foi gerada para essa ocorrência.",
      });
      return;
    }

    try {
      // Envia o novo status no body
      await api.put(`/land-occurrences/accept/${id}`, {
        status: "Pendente",
      });

      toast({
        title: "Status alterado para Pendente com sucesso.",
      });

      fetchOccurrences(currentPage); // Atualiza a lista
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message,
      });
    }
  };

  //deleta a imagem do carrosel
  const handleDeleteImage = async (imageId) => {
    try {
      await api.delete("/land-occurrences/deletepicture", {
        data: { id: imageId },
      });

      toast({
        title: "Imagem excluída com sucesso",
      });

      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir imagem",
        description: error.message,
      });
    }
  };

  //busca informações do back
  const loadOptionsForOccurrence = async (occurrence) => {
    if (!occurrence || !occurrence.sector?.name) return;

    try {
      const [naturesRes, techsRes, teamsRes, supersRes] = await Promise.all([
        api.get(`/natures?sector=${occurrence.sector.name}`),
        api.get(`/technicians?sector=${occurrence.sector.name}`),
        api.get(`/teams?sector=${occurrence.sector.name}`),
        api.get(`/supervisors?sector=${occurrence.sector.name}`),
      ]);

      setSelectOptions((prev) => ({
        ...prev,
        [occurrence.id]: {
          natures: naturesRes.data.data || [],
          technicians: techsRes.data.data || [],
          teams: teamsRes.data.data || [],
          supervisors: supersRes.data.data || [],
        },
      }));
    } catch (error) {
      console.error("Erro ao carregar opções:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />

      <header className="flex justify-between items-center  py-4 px-4 sm:px-8 bg-[#EBEBEB] sticky top-0 z-10">
        <div className="flex items-center bg-[#EBEBEB]">
          <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
            Ocorrências Terrestres
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <LiveActionButton />
        </div>
      </header>

      <div className="px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Ocorrências Terrestres
        </h1>
        <Filters
          title="Ocorrências"
          subtitle="terrestres"
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
        filterStatus="EmFila"
        renderExpandedRow={(occurrence) => (
          <ExpandedRowT
            occurrence={occurrence}
            selectedValues={selectedValues}
            setSelectedValues={setSelectedValues}
            selectOptions={selectOptions}
            onGenerateOS={handleGenerateOS}
            onIgnore={handleIgnoreOccurrence}
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
