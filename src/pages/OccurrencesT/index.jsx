"use client";

// React e bibliotecas externas
import React, { useEffect, useState } from "react";
import { format } from "date-fns";

// Hooks customizados
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUserSector } from "@/hooks/useUserSector";
import { usePermissions } from "@/hooks/usePermissions";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { LiveActionButton } from "@/components/live-action-button";
import { Pagination } from "@/components/pagination";
import { OccurrenceList } from "@/components/OccurrenceList";

// Componentes locais
import { ExpandedRowWithLoad } from "./ExpandedRowWithLoad";

// Serviços e utilitários
import { api } from "@/services/api";

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
  const [filterRecent, setFilterRecent] = useState("recent");
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [filterStatus, setFilterStatus] = useState(null);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOccurrences(currentPage);
  }, [
    currentPage,
    searchTerm,
    filterType,
    filterRecent,
    filterNeighborhood,
    filterDateRange.startDate,
    filterDateRange.endDate,
    filterStatus,
  ]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  const handleToggleDateOrder = (order) => {
    setFilterRecent(order); // 'recent' | 'oldest'
    setCurrentPage(1);
  };

  const fetchOccurrences = async (page = 1) => {
    try {
      const response = await api.get("/occurrences", {
        params: {
          page,
          districtId: filterNeighborhood, // bairro
          street: searchTerm, // rua
          type: filterType,
          orderBy: filterRecent, 
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

      const {
        occurrences: allOccurrences = [],
        page: serverPage = page,
        totalPages: serverTotalPages = 1,
      } = response.data ?? {};

      // mantém o filtro local para não listar "em_analise"
      const filteredOccurrences = allOccurrences.filter(
        (occ) => occ.status !== "em_analise"
      );

      setOccurrences(filteredOccurrences);
      setCurrentPage(serverPage);
      setTotalPages(serverTotalPages);
    } catch (error) {
      const is400 = error.response?.status === 400;
      const isEnumError =
        error.response?.data?.message?.includes("Invalid enum");

      if (is400 && isEnumError) {
        toast({
          variant: "destructive",
          title: "Tipo inválido",
          description: "O tipo de ocorrência selecionado não é reconhecido.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao buscar ocorrências",
          description: error.message,
        });
      }

      if (!isEnumError) {
        setOccurrences([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
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
      const res = await api.get("/sectors/details");
      const allSectors = res.data.sectors || [];

      const sectorData = allSectors.find((s) => s.id === occurrence.sector.id);

      if (!sectorData) return; // setor não encontrado para essa ocorrência

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
          contextType="mapeamento"
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
            setFilterDateRange(range);
            setCurrentPage(1);
          }}
          handleApplyFilters={handleApplyFilters}
        />
      </div>

      <OccurrenceList
        occurrences={occurrences}
        dateOrder={filterRecent ?? "recent"} // nova prop
        onToggleDateOrder={handleToggleDateOrder} // nova prop
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchOccurrences}
          />
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
