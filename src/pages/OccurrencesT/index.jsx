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
import { ExpandedRowWithLoad } from "./ExpandedRowWithLoad";
import { TopHeader } from "@/components/topHeader";

export function OccurrencesT() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { setor } = useUserSector();
  const { isAdmin, isSupervisor, isInspector } = usePermissions();

  const [occurrences, setOccurrences] = useState([]);
  const [selectOptions, setSelectOptions] = useState({});
  const [selectedValues, setSelectedValues] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterRecent, setFilterRecent] = useState(null);
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  useEffect(() => {
    if (!isAdmin && !isSupervisor && !isInspector) {
      window.location.href = "/";
    }
  }, [isAdmin, isSupervisor, isInspector]);

  useEffect(() => {
  fetchOccurrences(1); // apenas carrega a página 1 inicialmente
}, []);



  const handleApplyFilters = () => {
    fetchOccurrences(1);
  };

  const fetchOccurrences = async (page = 1) => {
  try {
    const response = await api.get("/occurrences", {
      params: {
        page,
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
      },
    });

    const allOccurrences = response.data.occurrences || [];

    const filteredOccurrences = allOccurrences.filter(
      (occ) => occ.status !== "em_analise"
    );

    setOccurrences(filteredOccurrences);
    setCurrentPage(page);
    setHasNextPage(allOccurrences.length > 0);
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erro ao buscar ocorrências",
      description: error.message,
    });
    setOccurrences([]);
    setHasNextPage(false);
  }
};


  const handleReturnOccurrence = async () => {
    if (!returnReason.trim()) {
      toast({
        variant: "destructive",
        title: "Motivo obrigatório",
        description: "Informe o motivo da devolução.",
      });
      return;
    }

    try {
      await api.post("/occurrences/return", {
        occurrenceId: selectedOccurrenceId,
        reason: returnReason,
      });

      toast({ title: "Ocorrência devolvida com sucesso." });

      setIsReturnModalOpen(false);
      setReturnReason("");
      setSelectedOccurrenceId(null);
      fetchOccurrences(1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao devolver ocorrência",
        description: error.message,
      });
    }
  };

  const handleGenerateOS = async (occurrenceId) => {
    const values = selectedValues[occurrenceId];
    const occurrence = occurrences.find((o) => o.id === occurrenceId);

    if (!values || !occurrence) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Preencha os campos obrigatórios antes de gerar a O.S.",
      });
      return;
    }

    const { serviceNatureId, inspectorId, foremanId, teamId, scheduledDate } =
      values;

    if (!foremanId || !teamId || !scheduledDate) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha encarregado, equipe e data agendada.",
      });
      return;
    }

    const payload = {
      occurrenceId,
      sectorId: occurrence.sector.id,
      foremanId,
      teamId,
      scheduledDate: new Date(scheduledDate).toISOString(),
    };

    if (serviceNatureId) payload.serviceNatureId = serviceNatureId;
    if (inspectorId) payload.inspectorId = inspectorId;

    try {
      await api.post("/service-orders", payload);
      toast({ title: "Ordem de Serviço gerada com sucesso!" });
      fetchOccurrences(1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar O.S.",
        description: error.message,
      });
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await api.post("/occurrences/deletepicture", {
        data: { id: imageId },
      });

      toast({ title: "Imagem excluída com sucesso" });
      fetchOccurrences(1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir imagem",
        description: error.message,
      });
    }
  };

  const loadOptionsForOccurrence = async (occurrence) => {
    if (!occurrence || !occurrence.sector?.id) return;

    try {
      const res = await api.get(`/sectors/${occurrence.sector.id}/details`);
      const sectorData = res.data.sector;

      setSelectOptions((prev) => ({
        ...prev,
        [occurrence.id]: {
          natures:
            sectorData.teams?.flatMap((team) => team.serviceNatures) || [],
          technicians: sectorData.inspectors || [],
          teams: sectorData.teams || [],
          supervisors: sectorData.foremen || [],
          inspectors: sectorData.inspectors || [],
        },
      }));
    } catch (error) {
      console.error("Erro ao carregar dados do setor:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Ocorrências Terrestres
        </h1>
        <Filters
          title="Ocorrências"
          subtitle="Terrestres"
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
          <ExpandedRowWithLoad
            occurrence={occurrence}
            loadOptionsForOccurrence={loadOptionsForOccurrence}
            selectedValues={selectedValues}
            setSelectedValues={setSelectedValues}
            selectOptions={selectOptions}
            onGenerateOS={handleGenerateOS}
            showEmergencialStatus={true}
            onOpenReturnModal={(id) => {
              setSelectedOccurrenceId(id);
              setIsReturnModalOpen(true);
            }}
            onDeleteImage={handleDeleteImage}
          />
        )}
      />

      <footer className="bg-[#EBEBEB] p-4 mt-auto">
        <div className="max-w-full mx-auto">
          <Pagination onPageChange={fetchOccurrences} hasNextPage={hasNextPage} />


        </div>
      </footer>

      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-lg space-y-5 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Motivo da devolução
            </h2>

            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Descreva aqui..."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 resize-none outline-none"
              rows={4}
            />

            <div className="flex flex-col gap-3">
              <button
                onClick={handleReturnOccurrence}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-black text-white py-3 font-medium text-sm hover:bg-gray-900 transition"
              >
                <span className="text-lg">↩</span>
                Confirmar devolução
              </button>

              <button
                onClick={() => {
                  setIsReturnModalOpen(false);
                  setReturnReason("");
                  setSelectedOccurrenceId(null);
                }}
                className="text-sm text-gray-500 underline hover:text-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
