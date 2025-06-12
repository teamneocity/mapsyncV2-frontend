"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Home, MapPin, Search, SlidersHorizontal } from "lucide-react"
import { useState } from "react"
import { DateRange } from "./date-range"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecent, setSelectedRecent] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Função para lidar com o filtro de "Recentes"
  const handleRecentFilter = (filter) => {
    setSelectedRecent(filter)
    onFilterRecent(filter === "Mais recentes" ? "desc" : "asc")
  }

  // Função para lidar com o filtro de tipo
  const handleTypeFilter = (type) => {
    setSelectedType(type)
    onFilterType(type)
  }

  // Função para lidar com o filtro de bairro
  const handleNeighborhoodFilter = (neighborhood) => {
    setSelectedNeighborhood(neighborhood)
    onFilterNeighborhood(neighborhood)
  }

  const [selectedRange, setSelectedRange] = useState({ from: null, to: null })

  const handleDateRangeChange = (range) => {
    if (range.from !== selectedRange.from || range.to !== selectedRange.to) {
      setSelectedRange(range)
      onFilterDateRange({ startDate: range.from, endDate: range.to })
    }
  }

  // Format neighborhood name for display (replace underscores with spaces)
  const formatNeighborhoodName = (name) => {
    return name.replace(/_/g, " ")
  }

  return (
    <header className="bg-white p-3 md:p-4">
      {/* Title and search - always visible */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-3 md:mb-0">
        <h3 className="text-gray-900 font-medium">{text}</h3>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Pesquise pelo endereço / nome da rua ou avenida"
            className="pl-10 w-full"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Mobile filter toggle button */}
        <Button
          variant="outline"
          className="md:hidden flex items-center gap-2"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Filters - responsive layout */}
      <div
        className={`${showMobileFilters ? "flex" : "hidden"} md:flex flex-col sm:flex-row flex-wrap gap-3 md:items-center md:mt-3`}
      >
        {/* Dropdown para filtrar por "Recentes" */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto gap-2 justify-between">
              {selectedRecent || "Recentes"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleRecentFilter("Mais recentes")}>Mais recentes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRecentFilter("Mais antigos")}>Mais antigos</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dropdown para filtrar por tipo */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto gap-2 justify-between">
              <MapPin className="h-4 w-4" />
              {selectedType || "Filtrar por"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleTypeFilter(null)}>Todos os Setores</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter("DRENAGEM")}>Drenagem</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter("LIMPA FOSSA")}>Limpa Fossa</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter("TERRAPLANAGEM")}>Terra Planagem</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTypeFilter("PAVIMENTACAO")}>Pavimentação</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dropdown para filtrar por bairro */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto gap-2 justify-between">
              <Home className="h-4 w-4" />
              {selectedNeighborhood ? formatNeighborhoodName(selectedNeighborhood) : "Bairro"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuItem onClick={() => handleNeighborhoodFilter(null)}>Todos os Bairros</DropdownMenuItem>
            {neighborhoods.map((neighborhood) => (
              <DropdownMenuItem key={neighborhood} onClick={() => handleNeighborhoodFilter(neighborhood)}>
                {formatNeighborhoodName(neighborhood)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Componente DateRange para selecionar intervalo de datas */}
        <div className="w-full sm:w-auto">
          <DateRange selectedRange={selectedRange} onDateRangeChange={handleDateRangeChange} />
        </div>

        <Button className="bg-[#5E56FF] hover:bg-[#4A43E0] w-full sm:w-auto mt-2 sm:mt-0" onClick={handleApplyFilters}>
          Aplicar Filtros
        </Button>
      </div>
    </header>
  )
}
