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
  const ALLOWED_TYPES = ["mapeamento", "metragem", "comunicacao"];
  const [status, setStatus] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [expandedId, setExpandedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState([]);

  // formData local
  const [formData, setFormData] = useState({
    type: "mapeamento",
    street: "",
    zipCode: "",
    latitude: "",
    longitude: "",
    neighborhoodId: "",
    observation: "",
    isEmergency: false,
    verificationDate: "",
    verificationTime: "",
  });

  const toYMD = (d) =>
    d instanceof Date && !isNaN(d) ? format(d, "yyyy-MM-dd") : undefined;

  // Busca principal
  const fetchInspections = async (page = 1) => {
    try {
      const params = {
        page,
        street: street || undefined,
        neighborhoodId: neighborhoodId || undefined,
        order: order || undefined,
        type: ALLOWED_TYPES.includes(type) ? type : undefined,
        status: ["pendente", "aceita", "rejeitada", "verificada"].includes(status)
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
  }, [currentPage, street, neighborhoodId, order, type, status, startDate, endDate]);

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

  const handleApplyFilters = () => {
    setCurrentPage(1);
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
            setType(ALLOWED_TYPES.includes(value) ? value : null);
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
            <div key={occ.id} className="relative">
              <AerialOccurrenceCard
                key={occ.id}
                occurrence={occ}
                expanded={expandedId === occ.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === occ.id ? null : occ.id))
                }
              />
            </div>
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
    </div>
  );
}
