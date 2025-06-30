"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "./date-range";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Stroke from "@/assets/icons/Stroke.svg?react";
import { api } from "@/services/api";

export function Filters({
  text,
  onFilterRecent,
  onFilterType,
  onFilterDateRange,
  onFilterNeighborhood,
  onFilterStatus,
  handleApplyFilters,
  onSearch,
  title = "Análises de ocorrências",
  subtitle = "Via aplicativo",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecent, setSelectedRecent] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [selectedRange, setSelectedRange] = useState({ from: null, to: null });
  const [neighborhoods, setNeighborhoods] = useState([]);

  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        const response = await api.get("/neighborhoods");
        setNeighborhoods(response.data.neighborhoods);
      } catch (error) {
        console.error("Erro ao buscar bairros:", error);
      }
    }

    fetchNeighborhoods();
  }, []);

  const handleRecentFilter = (filter) => {
    setSelectedRecent(filter);
    onFilterRecent(filter === "Mais recentes" ? "recent" : "oldest");
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    onFilterType(type);
  };

  const handleNeighborhoodFilter = (neighborhoodId) => {
    setSelectedNeighborhood(neighborhoodId);
    onFilterNeighborhood(neighborhoodId);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    onFilterStatus(status);
  };

  const handleDateRangeChange = (range) => {
    if (!range || !range.from || !range.to) return;

    if (range.from !== selectedRange.from || range.to !== selectedRange.to) {
      setSelectedRange(range);
      onFilterDateRange({ startDate: range.from, endDate: range.to });
    }
  };

  return (
    <header className="w-full bg-[#EBEBEB] px-1 py-1">
      <div className="w-full flex items-center justify-between gap-2 md:gap-3 flex-wrap md:flex-nowrap rounded-xl overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth">
        {/* Título */}
        <div className="flex flex-col mr-2 min-w-[160px]">
          <span className="text-[18px] text-gray-700 leading-tight">
            {title}
          </span>
          <span className="text-[18px] font-semibold text-gray-900 leading-tight">
            {subtitle}
          </span>
        </div>

        {/* Rua + Bairro */}
        <div className="flex gap-2 flex-1 md:min-w-[320px]">
          <Input
            placeholder="Pesquise pela rua ou avenida"
            onChange={(e) => onSearch(e.target.value)}
            hideRing
            className="text-sm h-12 flex-1 rounded-xl border-none shadow-sm placeholder:text-[#4B4B62] truncate"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2 h-12 justify-between rounded-xl border-none shadow-sm text-[#4B4B62]"
              >
                {selectedNeighborhood
                  ? neighborhoods.find((n) => n.id === selectedNeighborhood)
                      ?.name || "Bairro"
                  : "Bairro"}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
              <DropdownMenuItem onClick={() => handleNeighborhoodFilter(null)}>
                Todos os bairros
              </DropdownMenuItem>
              {neighborhoods.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => handleNeighborhoodFilter(n.id)}
                >
                  {n.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Recentes */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2 h-12 justify-between rounded-xl border-none shadow-sm text-[#4B4B62]"
            >
              {selectedRecent || "Recentes"}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => handleRecentFilter("Mais recentes")}
            >
              Mais recentes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRecentFilter("Mais antigos")}
            >
              Mais antigos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tipo */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-[220px] gap-2 h-12 px-3 justify-between rounded-xl border-none shadow-sm text-[#4B4B62] truncate"
            >
              <span className="truncate">Tipo de ocorrência</span>
              <Stroke className="ml-1 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleTypeFilter(null)}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter("DRENAGEM")}>
              Drenagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter("LIMPA_FOSSA")}>
              Limpa Fossa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter("TERRAPLANAGEM")}>
              Terra Planagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter("BURACO_NA_RUA")}>
              Buraco na Rua
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2 h-12 justify-between rounded-xl border-none shadow-sm text-[#4B4B62]"
            >
              {selectedStatus === "pendente"
                ? "Pendente"
                : selectedStatus === "aceita"
                ? "Aceita"
                : selectedStatus === "finalizada"
                ? "Finalizada"
                : selectedStatus === "aprovada"
                ? "Aprovadas"
                : selectedStatus === "os_gerada"
                ? "OS Gerada"
                : "Status"}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleStatusFilter(null)}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter("pendente")}>
              Pendente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter("aceita")}>
              Aceita
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter("finalizada")}>
              Finalizada
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter("aprovada")}>
              Aprovadas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusFilter("os_gerada")}>
              OS Gerada
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Data */}
        <div className="w-full md:w-auto">
          <DateRange
            selectedRange={selectedRange}
            onDateRangeChange={handleDateRangeChange}
            className="h-9 text-[#4B4B62]"
          />
        </div>

        {/* Botão aplicar */}
        <Button
          className="bg-[#A6E0FF] text-[#00679D] hover:bg-[#ADD8E6] w-full sm:w-auto gap-2 h-12 justify-between rounded-xl border-none shadow-sm"
          onClick={handleApplyFilters}
        >
          Aplicar
        </Button>
      </div>
    </header>
  );
}
