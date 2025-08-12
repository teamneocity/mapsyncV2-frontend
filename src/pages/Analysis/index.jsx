// src/pages/Analysis/index.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { Menu } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUserSector } from "@/hooks/useUserSector";
import { useAuth } from "@/hooks/auth";

import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { LiveActionButton } from "@/components/live-action-button";
import { OccurrenceList } from "@/components/OccurrenceList";
import { IgnoreOccurrenceModal } from "@/components/ignoreOccurrenceModal";

import { ExpandedRowAnalysis } from "./ExpandedRowAnalysis";
import { api } from "@/services/api";

export function Analysis() {
  const { user } = useAuth();
  const { isAnalyst } = usePermissions();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [occurrences, setOccurrences] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

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

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchOccurrences(1);
  }, []);

  const handleToggleDateOrder = (order) => {
    setFilterRecent(order); // 'recent' | 'oldest'
    fetchServiceOrders(1);
  };

  const fetchOccurrences = async (page = 1) => {
    console.log("📤 Enviando filtros:", {
      street: searchTerm,
      districtId: filterNeighborhood,
      type: filterType,
      orderBy: filterRecent,
      startDate: filterDateRange.startDate,
      endDate: filterDateRange.endDate,
    });

    try {
      const response = await api.get("/occurrences/in-analysis", {
        params: {
          page,
          street: searchTerm, // rua
          districtId: filterNeighborhood, // bairro
          type: filterType,
          orderBy: filterRecent, // 'recent' ou 'oldest'
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
        },
      });

      const list = response.data.occurrences || [];

      setOccurrences(list);
      setCurrentPage(page);
      setHasNextPage((list.length ?? 0) === PAGE_SIZE);
    } catch (error) {
      console.error("❌ Erro ao buscar ocorrências:", error);

      if (error.response) {
        console.error("➡️ status:", error.response.status);
        console.error("➡️ data:", error.response.data);
        console.error("➡️ headers:", error.response.headers);
      }

      toast({
        variant: "destructive",
        title: "Erro ao buscar ocorrências",
        description: error.message,
      });

      setOccurrences([]);
      setHasNextPage(false);
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
        reason,
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

  const handleApplyFiltersClick = () => {
    fetchOccurrences(1);
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
          handleApplyFilters={handleApplyFiltersClick}
        />
      </div>

      <OccurrenceList
        occurrences={occurrences || []}
        dateOrder={filterRecent ?? "recent"}
        onToggleDateOrder={handleToggleDateOrder}
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
            onPageChange={fetchOccurrences}
            hasNextPage={hasNextPage}
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
