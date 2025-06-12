"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRange } from "@/components/date-range"
import { api } from "@/services/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const neighborhoods = [
  "Centro",
  "Getúlio_Vargas",
  "Cirurgia",
  "Pereira_Lobo",
  "Suíssa",
  "Salgado_Filho",
  "Treze_de_Julho",
  "Dezoito_do_Forte",
  "Palestina",
  "Santo_Antônio",
  "Industrial",
  "Santos_Dumont",
  "José_Conrado_de_Araújo",
  "Novo_Paraíso",
  "América",
  "Siqueira_Campos",
  "Soledade",
  "Lamarão",
  "Cidade_Nova",
  "Japãozinho",
  "Porto_Dantas",
  "Bugio",
  "Jardim_Centenário",
  "Olaria",
  "Capucho",
  "Jabotiana",
  "Ponto_Novo",
  "Luzia",
  "Grageru",
  "Jardins",
  "Inácio_Barbosa",
  "São_Conrado",
  "Farolândia",
  "Coroa_do_Meio",
  "Aeroporto",
  "Atalaia",
  "Santa_Maria",
  "Zona_de_Expansão",
  "São_José",
]

export function ReportFilters({
  onFilterRecent,
  onFilterType,
  onFilterDateRange,
  onFilterNeighborhood,
  onFilterPilot,
  handleApplyFilters,
  onSearch,
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecent, setSelectedRecent] = useState(null)
  const [selectedType, setSelectedType] = useState("")
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("")
  const [pilots, setPilots] = useState([])
  const [pilotId, setPilotId] = useState("")
  const [selectedRange, setSelectedRange] = useState({ from: null, to: null })
  const [resetKey, setResetKey] = useState(0)

  // Busca a lista de pilotos ao carregar o componente
  const fetchPilots = async () => {
    try {
      const response = await api.get("/pilots")
      setPilots(response.data.data)
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    fetchPilots()
  }, [])

  // Função para resetar todos os filtros
  const handleResetFilters = () => {
    setSearchTerm("")
    setSelectedRecent(null)
    setSelectedType("")
    setSelectedNeighborhood("")
    setPilotId("")
    setSelectedRange({ from: null, to: null })
    setResetKey((prev) => prev + 1) // Force DateRange re-render

    // Notifica o componente pai para remover os filtros
    onFilterRecent(null)
    onFilterType(null)
    onFilterDateRange({ startDate: null, endDate: null })
    onFilterNeighborhood("")
    onFilterPilot("")
    onSearch("")

    // Refaz a busca sem filtros
    handleApplyFilters()
  }

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

  // Função para lidar com o filtro de piloto
  const handleFilterPilot = (pilotId) => {
    setPilotId(pilotId)
    onFilterPilot(pilotId)
  }

  // Função para lidar com o filtro de bairro
  const handleFilterNeighborhood = (neighborhood) => {
    setSelectedNeighborhood(neighborhood)
    onFilterNeighborhood(neighborhood)
  }

  // Função para lidar com o filtro de intervalo de datas
  const handleDateRangeChange = (range) => {
    if (range.from !== selectedRange.from || range.to !== selectedRange.to) {
      setSelectedRange(range)
      onFilterDateRange({ startDate: range.from, endDate: range.to })
    }
  }

  return (
    <form className="font-inter mt-6 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[#4B4B62]">
        <DateRange key={resetKey} selectedRange={selectedRange} onDateRangeChange={handleDateRangeChange} />

        <Select value={selectedType} onValueChange={handleTypeFilter}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Selecione por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="EmAndamento">EmAndamento</SelectItem>
            <SelectItem value="Resolvida">Resolvida</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedNeighborhood} onValueChange={handleFilterNeighborhood}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um bairro" />
          </SelectTrigger>
          <SelectContent>
            {neighborhoods.map((neighborhood) => (
              <SelectItem key={neighborhood} value={neighborhood}>
                {neighborhood.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={pilotId} onValueChange={handleFilterPilot}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o Piloto" />
          </SelectTrigger>
          <SelectContent>
            {pilots.map((pilot) => (
              <SelectItem key={pilot.id} value={`${pilot.name} - ${pilot.id}`}>
                {pilot.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex border rounded-[8px] items-center pr-3 h-9 text-[#4B4B62] text-sm">
        <input
          type="text"
          className="outline-none w-full h-6 pl-3"
          placeholder="Digite o endereço"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            onSearch(e.target.value)
          }}
        />
        <Search size={20} />
      </div>

      <div className="text-[#4B4B62] text-sm flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {selectedRecent || "Recentes"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleRecentFilter("Mais recentes")}>Mais recentes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRecentFilter("Mais antigos")}>Mais antigos</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex gap-3">
          <Button
            className="bg-white rounded-[8px] h-9 text-gray-700"
            type="button"
            variant="outline"
            onClick={handleApplyFilters}
          >
            Filtrar <Filter />
          </Button>
          <Button
            className="bg-white rounded-[8px] h-9 text-gray-700"
            type="button"
            variant="outline"
            onClick={handleResetFilters}
          >
            Remover Filtros <X />
          </Button>
        </div>
      </div>
    </form>
  )
}
