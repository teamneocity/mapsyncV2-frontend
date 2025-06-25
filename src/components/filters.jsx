"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { DateRange } from "./date-range";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Stroke from "@/assets/icons/Stroke.svg?react";

// Enum for neighborhoods
const neighborhoods = [
  "Centro",
  "Getulio_Vargas",
  "Cirurgia",
  "Pereira_Lobo",
  "Suissa",
  "Salgado_Filho",
  "Treze_de_Julho",
  "Dezoito_do_Forte",
  "Palestina",
  "Santo_Antonio",
  "Industrial",
  "Santos_Dumont",
  "Jose_Conrado_de_Araujo",
  "Novo_Paraiso",
  "America",
  "Siqueira_Campos",
  "Soledade",
  "Lamarao",
  "Cidade_Nova",
  "Japaozinho",
  "Porto_Dantas",
  "Bugio",
  "Jardim_Centenario",
  "Olaria",
  "Capucho",
  "Jabotiana",
  "Ponto_Novo",
  "Luzia",
  "Grageru",
  "Jardins",
  "Inacio_Barbosa",
  "Sao_Conrado",
  "Farolandia",
  "Coroa_do_Meio",
  "Aeroporto",
  "Atalaia",
  "Santa_Maria",
  "Zona_de_Expansao",
  "Sao_Jose",
  "Aruana",
];

export function Filters({
  text,
  onFilterRecent,
  onFilterType,
  onFilterDateRange,
  onFilterNeighborhood,
  handleApplyFilters,
  onSearch,
  title = "Análises de ocorrências",
  subtitle = "Via aplicativo",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecent, setSelectedRecent] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ from: null, to: null });

  const handleRecentFilter = (filter) => {
    setSelectedRecent(filter);
    onFilterRecent(filter === "Mais recentes" ? "desc" : "asc");
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    onFilterType(type);
  };

  const handleNeighborhoodFilter = (neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    onFilterNeighborhood(neighborhood);
  };

  const handleDateRangeChange = (range) => {
    if (range.from !== selectedRange.from || range.to !== selectedRange.to) {
      setSelectedRange(range);
      onFilterDateRange({ startDate: range.from, endDate: range.to });
    }
  };

  const formatNeighborhoodName = (name) => {
    return name.replace(/_/g, " ");
  };

  return (
    <header className="w-full bg-[#EBEBEB] px-1 py-1">
      <div className="w-full flex items-center justify-between gap-2 md:gap-3 flex-wrap md:flex-nowrap rounded-xl overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth">
        {/* Título dinâmico */}
        <div className="flex flex-col mr-2 min-w-[160px]">
          <span className="text-[18px] text-gray-700 leading-tight">
            {title}
          </span>
          <span className="text-[18px] font-semibold text-gray-900 leading-tight">
            {subtitle}
          </span>
        </div>

        {/* Input de busca */}
        <div className="flex-1 md:min-w-[220px]">
          <Input
            placeholder="Pesquise pelo bairro / nome da rua ou avenida"
            onChange={(e) => onSearch(e.target.value)}
            hideRing
            className="text-sm h-12 gap-2 justify-between rounded-xl border-none shadow-sm placeholder:text-[#4B4B62] truncate"
          />
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
            <DropdownMenuItem onClick={() => handleTypeFilter("LIMPA FOSSA")}>
              Limpa Fossa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter("TERRAPLANAGEM")}>
              Terra Planagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter("PAVIMENTACAO")}>
              Pavimentação
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
              Filtrar por status
              <Stroke className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuItem onClick={() => {}}>
              Todos os Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>em_analise</DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>aprovada</DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>os_gerada</DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              aguardando_execucao
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Intervalo de data */}
        <div className="w-full md:w-auto">
          <DateRange
            selectedRange={selectedRange}
            onDateRangeChange={handleDateRangeChange}
            className="h-9 text-[#4B4B62]"
          />
        </div>

        {/* Botão aplicar */}
        <Button
          className="bg-[#A6E0FF] text-[#00679D] hover:bg-[#ADD8E6]  w-full sm:w-auto gap-2 h-12 justify-between rounded-xl border-none shadow-sm"
          onClick={handleApplyFilters}
        >
          Aplicar
        </Button>
      </div>
    </header>
  );
}
