"use client";

// React e React Query
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Hooks customizados
import { useToast } from "@/hooks/use-toast";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { OccurrenceList } from "@/components/OccurrenceList";

// Componentes locais
import { ExpandedRowWithLoad } from "./ExpandedRowWithLoad";

// Serviços e utilitários
import { api } from "@/services/api";

// Busca ocorrências terrestres
async function fetchOccurrencesTerrestrial({ queryKey }) {
  const [
    _key,
    {
      page,
      searchTerm,
      filterType,
      filterRecent,
      filterNeighborhood,
      filterDateRange,
      filterCompany,
    },
  ] = queryKey;

  const startDateIso = filterDateRange.startDate
    ? new Date(
        new Date(filterDateRange.startDate).setHours(0, 0, 0, 0)
      ).toISOString()
    : undefined;

  const endDateIso = filterDateRange.endDate
    ? new Date(
        new Date(filterDateRange.endDate).setHours(23, 59, 59, 999)
      ).toISOString()
    : undefined;

  const response = await api.get("/occurrences", {
    params: {
      page,
      districtId: filterNeighborhood,
      street: searchTerm,
      type: filterType,
      orderBy: filterRecent,
      externalCompanyName: filterCompany || undefined,
      startDate: startDateIso,
      endDate: endDateIso,
    },
  });

  const {
    occurrences: allOccurrences = [],
    page: serverPage = page ?? 1,
    totalPages: serverTotalPages = 1,
  } = response.data ?? {};

  // Filtro local para nao mostrar em analises
  const filteredOccurrences = allOccurrences.filter(
    (occ) => occ.status !== "em_analise"
  );

  return {
    list: filteredOccurrences,
    page: serverPage,
    totalPages: serverTotalPages,
  };
}

// Busca detalhes de setores
async function fetchSectorsDetails() {
  const res = await api.get("/sectors/details");
  return res.data?.sectors || [];
}

// Monta options para selects de uma ocorrência específica
async function buildSelectOptionsForOccurrence(occurrence) {
  if (!occurrence || !occurrence.sector?.id) return null;

  const allSectors = await fetchSectorsDetails();
  const sectorData = allSectors.find((s) => s.id === occurrence.sector.id);

  if (!sectorData) return null;

  return {
    natures: sectorData.teams?.flatMap((team) => team.serviceNatures) || [],
    technicians: sectorData.inspectors || [],
    teams: sectorData.teams || [],
    supervisors: sectorData.foremen || [],
    inspectors: sectorData.inspectors || [],
  };
}

function useOccurrencesTerrestrial({
  page,
  searchTerm,
  filterType,
  filterRecent,
  filterNeighborhood,
  filterDateRange,
  filterCompany,
  toast,
}) {
  return useQuery({
    queryKey: [
      "occurrences-terrestrial",
      {
        page,
        searchTerm,
        filterType,
        filterRecent,
        filterNeighborhood,
        filterDateRange,
        filterCompany,
      },
    ],
    queryFn: fetchOccurrencesTerrestrial,
    keepPreviousData: true,
    onError: (error) => {
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
    },
  });
}

export function OccurrencesT() {
  const { toast } = useToast();

  //  Força o refetch
  const queryClient = useQueryClient();

  // Recarrega a lista em qualquer situação
  function refetchOccurrences() {
    queryClient.invalidateQueries({
      queryKey: ["occurrences-terrestrial"],
    });
  }

  // dados da lista
  const [currentPage, setCurrentPage] = useState(1);

  // filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterRecent, setFilterRecent] = useState("recent");
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [filterCompany, setFilterCompany] = useState(null);

  // selects e valores da expanded row
  const [selectOptions, setSelectOptions] = useState({});
  const [selectedValues, setSelectedValues] = useState({});

  // modal de devolução
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null);

  // Busca de ocorrências via React Query
  const { data, isLoading } = useOccurrencesTerrestrial({
    page: currentPage,
    searchTerm,
    filterType,
    filterRecent,
    filterNeighborhood,
    filterDateRange,
    filterCompany,
    toast,
  });

  const occurrences = data?.list ?? [];
  const totalPages = data?.totalPages ?? 1;
  const effectivePage = data?.page ?? currentPage;

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  // Alterar ordenação por data (recent/oldest)
  const handleToggleDateOrder = (order) => {
    setFilterRecent(order);
    setCurrentPage(1);
  };

  // Devolver ocorrencias
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

      // Garantir que a lista recarregue
      refetchOccurrences();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao devolver ocorrência",
        description: error.message,
      });
    }
  };

  // Aprovar ocorrencias
  const handleApproveOccurrence = async (occurrenceId) => {
    try {
      await api.post("/occurrences/approve", {
        occurrenceId,
      });

      toast({ title: "Ocorrência aprovada com sucesso." });

      refetchOccurrences();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao aprovar ocorrência",
        description: error.message,
      });
    }
  };

  // Gerar Os
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

    const { serviceNatureId, inspectorId, foremanId, teamId, scheduledWindow } =
      values;

    if (
      !foremanId ||
      !teamId ||
      !scheduledWindow?.start ||
      !scheduledWindow?.end
    ) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha encarregado, equipe e o período (início e fim).",
      });
      return;
    }

    const payload = {
      occurrenceId,
      sectorId: occurrence.sector.id,
      foremanId,
      teamId,
      scheduledWindow: {
        start: new Date(scheduledWindow.start).toISOString(),
        end: new Date(scheduledWindow.end).toISOString(),
      },
    };

    if (serviceNatureId) payload.serviceNatureId = serviceNatureId;
    if (inspectorId) payload.inspectorId = inspectorId;

    try {
      await api.post("/service-orders", payload);
      toast({ title: "Ordem de Serviço gerada com sucesso!" });

      refetchOccurrences();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar O.S.",
        description: error.message,
      });
    }
  };

  // Carrega opções ao expandir a tela
  const loadOptionsForOccurrence = async (occurrence) => {
    const options = await buildSelectOptionsForOccurrence(occurrence);
    if (!options) return;

    setSelectOptions((prev) => ({
      ...prev,
      [occurrence.id]: options,
    }));
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
          title="Aceitar e"
          subtitle="gerar O.S."
          contextType="mapeamento"
          onFilterCompany={(company) => {
            setFilterCompany(company);
            setCurrentPage(1);
          }}
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
        dateOrder={filterRecent ?? "recent"}
        onToggleDateOrder={handleToggleDateOrder}
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
            onApproveOccurrence={handleApproveOccurrence}
          />
        )}
      />
      <footer className="bg-[#EBEBEB] p-4 mt-auto">
        <div className="max-w-full mx-auto">
          <Pagination
            currentPage={effectivePage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </footer>
      {/* Modal de retorno de ocorrencia para analise*/}
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
