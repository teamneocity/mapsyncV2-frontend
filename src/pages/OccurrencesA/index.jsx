"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { AerialOccurrenceCard } from "./AerialOccurrenceCard";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export function OccurrencesA() {
  const { toast } = useToast();

  const [occurrences, setOccurrences] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros
  const [street, setStreet] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState(null);
  const [order, setOrder] = useState("recent");
  const [type, setType] = useState(null);
  const [status, setStatus] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [expandedId, setExpandedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState([]);

  const [formData, setFormData] = useState({
    type: "mapeamento_metragem",
    street: "",
    zipCode: "",
    latitude: "",
    longitude: "",
    neighborhoodId: "",
    observation: "",
  });

  const toYMD = (d) =>
    d instanceof Date && !isNaN(d) ? format(d, "yyyy-MM-dd") : undefined;

  const fetchInspections = async (page = 1) => {
    try {
      const params = {
        page,
        street: street || undefined,
        neighborhoodId: neighborhoodId || undefined,
        order: order || undefined, // 'recent' | 'oldest'
        type:
          type === "mapeamento_metragem" || type === "analise_pavimentacao"
            ? type
            : undefined,
        status: ["pendente", "aceita", "rejeitada", "verificada"].includes(
          status
        )
          ? status
          : undefined,

        startDate: toYMD(startDate),
        endDate: toYMD(endDate),
      };

      const { data } = await api.get("/aerial-inspections", { params });

      const list = data?.inspections ?? data?.data ?? [];
      const serverPage = data?.meta?.page ?? data?.page ?? page;
      const perPage = data?.meta?.perPage ?? data?.perPage ?? 10;
      const serverTotalPages =
        data?.meta?.totalPages ??
        data?.totalPages ??
        Math.max(1, Math.ceil((data?.totalCount ?? 0) / perPage));

      setOccurrences(Array.isArray(list) ? list : []);
      setCurrentPage(serverPage);
      setTotalPages(serverTotalPages);
    } catch (error) {
      console.error("Erro ao buscar inspeções:", error);
      toast({
        title: "Não foi possível carregar as inspeções",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
      setOccurrences([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchInspections(currentPage);
  }, [
    currentPage,
    street,
    neighborhoodId,
    order,
    type,
    status,
    startDate,
    endDate,
  ]);

  const fetchNeighborhoods = async () => {
    try {
      const res = await api.get("/neighborhoods");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.neighborhoods || res.data?.data || [];
      setNeighborhoods(list);
    } catch (error) {
      console.error("Erro ao buscar bairros:", error);
    }
  };

  useEffect(() => {
    if (modalOpen) fetchNeighborhoods();
  }, [modalOpen]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
  };

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/aerial-inspections", formData);
      toast({
        title: "Inspeção criada com sucesso!",
        description: "Sua solicitação foi enviada.",
      });
      setModalOpen(false);
      setFormData({
        type: "mapeamento_metragem",
        street: "",
        zipCode: "",
        latitude: "",
        longitude: "",
        neighborhoodId: "",
        observation: "",
      });

      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao criar inspeção",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Ocorrências Aéreas
        </h1>

        <Filters
          title="Mapeamento"
          subtitle="Aéreo"
          contextType="aerea"
          onSearch={(value) => {
            setStreet(value);
            setCurrentPage(1);
          }}
          onFilterType={(value) => {
            setType(
              value === "mapeamento_metragem" ||
                value === "analise_pavimentacao"
                ? value
                : null
            );
            setCurrentPage(1);
          }}
          onFilterRecent={(value) => {
            setOrder(value === "oldest" ? "oldest" : "recent");
            setCurrentPage(1);
          }}
          onFilterNeighborhood={(value) => {
            setNeighborhoodId(value || null);
            setCurrentPage(1);
          }}
          onFilterDateRange={(range) => {
            setStartDate(range?.startDate || null);
            setEndDate(range?.endDate || null);
            setCurrentPage(1);
          }}
          onFilterStatus={(value) => {
            setStatus(
              ["pendente", "aceita", "rejeitada", "verificada"].includes(value)
                ? value
                : null
            );
            setCurrentPage(1);
          }}
          handleApplyFilters={handleApplyFilters}
        />

        {/* Solicitar inspeção */}
        <div className="flex justify-start mt-2 mb-1">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-black hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-xl transition"
          >
            Solicitar uma inspeção aérea
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {occurrences?.length === 0 && (
            <div className="col-span-full">
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500">
                Nenhuma ocorrência encontrada.
              </div>
            </div>
          )}

          {occurrences?.map((occ) => (
            <AerialOccurrenceCard
              key={occ.id}
              occurrence={occ}
              expanded={expandedId === occ.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === occ.id ? null : occ.id))
              }
            />
          ))}
        </div>
      </div>

      {/* Paginação */}
      <footer className="bg-[#EBEBEB] p-4 mt-auto">
        <div className="max-w-full mx-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchInspections}
          />
        </div>
      </footer>

      {/* Modal de criação */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Solicitar Inspeção Aérea
            </h2>

            <form onSubmit={handleCreateInspection} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tipo de inspeção
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#1C7551]"
                >
                  <option value="mapeamento_metragem">
                    Mapeamento / Metragem
                  </option>
                  <option value="outro_tipo">Outro tipo</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Rua / Avenida
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: Avenida Ministro Geraldo Barreto Sobral"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder="49026-010"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Bairro
                  </label>
                  <select
                    value={formData.neighborhoodId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        neighborhoodId: e.target.value,
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Selecione</option>
                    {neighborhoods.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Observação
                </label>
                <textarea
                  rows="3"
                  value={formData.observation}
                  onChange={(e) =>
                    setFormData({ ...formData, observation: e.target.value })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Descreva brevemente a necessidade..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[#1C7551] hover:bg-[#176043] disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Solicitar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
