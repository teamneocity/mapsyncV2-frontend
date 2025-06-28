// src/pages/Analysis/index.jsx

"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUserSector } from "@/hooks/useUserSector";
import { useAuth } from "@/hooks/auth";

import { Filters } from "@/components/filters";
import { Sidebar } from "@/components/sidebar";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { LiveActionButton } from "@/components/live-action-button";
import { Menu } from "lucide-react";

import { api } from "@/services/api";
import { format } from "date-fns";
import { OccurrenceList } from "@/components/OccurrenceList";
import { ExpandedRowAnalysis } from "./ExpandedRowAnalysis";
import { IgnoreOccurrenceModal } from "@/components/ignoreOccurrenceModal";
import { Link } from "react-router-dom";
import { TopHeader } from "@/components/topHeader";

import emurb from "../../assets/emurb.svg";

export function Analysis() {
  const { user } = useAuth();
  const { isAnalyst } = usePermissions();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [occurrences, setOccurrences] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRecent, setFilterRecent] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);

  const [editableSectorId, setEditableSectorId] = useState(null);
  const [editableDescription, setEditableDescription] = useState("");
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null);
  const [selectedOccurrenceStatus, setSelectedOccurrenceStatus] =
    useState(null);
  const [allSectors, setAllSectors] = useState([]);

  const [isIgnoreOcurrenceModalOpen, setIsIgnoreOcurrenceModalOpen] =
    useState(false);

  useEffect(() => {
    fetchOccurrences(currentPage);
  }, [currentPage]);

  const fetchOccurrences = async (page = 1) => {
  try {
    const params = {
      page,
      limit: 6,
      districtId: filterNeighborhood, // bairro
      street: searchTerm,             // rua
      type: filterType,
      orderBy: filterRecent,          // 'recent' ou 'oldest'
      startDate: filterDateRange.startDate
        ? format(filterDateRange.startDate, "yyyy-MM-dd")
        : undefined,
      endDate: filterDateRange.endDate
        ? format(filterDateRange.endDate, "yyyy-MM-dd")
        : undefined,
    };

    const res = await api.get("/occurrences/in-analysis", { params });
    const allOccurrences = res.data.occurrences || [];

    setOccurrences(allOccurrences);
    setCurrentPage(res.data.currentPage || 1);
    setTotalPages(res.data.totalPages || 1);
  } catch (error) {
    console.error("❌ Erro ao buscar ocorrências:", error);
    toast({
      variant: "destructive",
      title: "Erro ao buscar ocorrências",
      description: error.message,
    });
  }
};


  const handleForwardOccurrence = async (occurrenceId, isEmergencial) => {
    try {
      if (!editableSectorId) {
        toast({
          variant: "destructive",
          title: "Setor não selecionado",
          description: "Por favor, selecione um setor para encaminhar.",
        });
        return;
      }

      await api.post("/occurrences/approve", {
        occurrenceId,
        sectorId: editableSectorId,
        isEmergencial,
      });

      toast({ title: "Ocorrência encaminhada com sucesso!" });
      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao encaminhar ocorrência",
        description: error.message,
      });
    }
  };

  const handleDeleteImage = async (image, occurrenceId) => {
    try {
      await api.delete(`/occurrence/photo/${image.id}`);
      toast({ title: "Imagem excluída com sucesso" });
      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir imagem",
        description: error.message,
      });
    }
  };

  const handleNotValidatePhoto = async (reason) => {
    try {
      await api.post(`/occurrences/reject`, {
        occurrenceId: selectedOccurrenceId,
        reason: reason,
      });

      toast({ title: "Ocorrência apagada com sucesso!" });
      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao apagar ocorrência",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />

      <TopHeader />

      <div className="px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Análises
        </h1>
        <Filters
          title="Análise"
          subtitle="das ocorrências"
          onSearch={(input) => setSearchTerm(input)}
          onFilterType={(type) => setFilterType(type)}
          onFilterRecent={(order) => setFilterRecent(order)}
          onFilterNeighborhood={(neighborhood) =>
            setFilterNeighborhood(neighborhood)
          }
          onFilterDateRange={(range) => setFilterDateRange(range)}
          handleApplyFilters={() => fetchOccurrences(1)}
        />
      </div>

      <OccurrenceList
        occurrences={occurrences || []}
        renderExpandedRow={(occurrence) => (
          <ExpandedRowAnalysis
            occurrence={occurrence}
            allSectors={allSectors}
            editableSectorId={editableSectorId}
            editableDescription={editableDescription}
            setEditableSectorId={setEditableSectorId}
            setEditableDescription={setEditableDescription}
            setSelectedOccurrenceId={setSelectedOccurrenceId}
            setIsIgnoreOcurrenceModalOpen={setIsIgnoreOcurrenceModalOpen}
            setSelectedOccurrenceStatus={setSelectedOccurrenceStatus}
            handleForwardOccurrence={handleForwardOccurrence}
            handleDeleteImage={handleDeleteImage}
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

      <IgnoreOccurrenceModal
        isOpen={isIgnoreOcurrenceModalOpen}
        onClose={() => setIsIgnoreOcurrenceModalOpen(false)}
        onConfirm={handleNotValidatePhoto}
        title={"Recusar ocorrência?"}
        message={"Indique o motivo da recusa."}
      />
    </div>
  );
}
