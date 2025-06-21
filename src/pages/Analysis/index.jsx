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
    if (!isAnalyst) navigate("/");
  }, [isAnalyst, navigate]);

  // useEffect(() => {
  //   api.get("/sectors").then((res) => setAllSectors(res.data.data));
  // }, []);

  useEffect(() => {
    fetchOccurrences(currentPage);
  }, [currentPage]);

  const fetchOccurrences = async (page = 1) => {
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

  const handleForwardOccurrence = async (occurrenceId) => {
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
      await api.delete(`/land-occurrences/refuse`, {
        data: {
          id: selectedOccurrenceId,
          reason: reason,
        },
      });

      toast({ title: "Ocorrência Apagada com sucesso!" });
      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao Apagar Ocorrência",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />

      <header className="flex justify-between items-center py-4 px-4 sm:px-8 bg-[#EBEBEB] sticky top-0 z-10">
        <div className="flex items-center bg-[#EBEBEB]">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
            Análises
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LiveActionButton />
        </div>
      </header>

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
