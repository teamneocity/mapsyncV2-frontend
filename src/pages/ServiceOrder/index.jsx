"use client"

import { ConfirmationModal } from "@/components/confirmationModal"
import { DateRange } from "@/components/date-range"
import { GoogleMaps } from "@/components/googleMaps"
import { Pagination } from "@/components/pagination"
import { Sidebar } from "@/components/sidebar"
import { StatsCardNoTrend } from "@/components/statsCardNoTrend"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/auth"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { format } from "date-fns"
import { ChevronDown, ChevronRight, Filter, Menu, Search } from "lucide-react"
import React, { useEffect, useState, useCallback } from "react"
import { api } from "../../services/api"
import { ConcludeServiceOrderModal } from "./concludeServiceOrderModal"
import { BeforeAfterImageCarousel } from "./beforeAfterImageCaroussel"
import { ServiceOrderMediaCarousel } from "./serviceOrderVideoCarousell"
import { ServiceOrderManyImagesCaroussel } from "./serviceOrderManyImagesCaroussel"
import { LiveActionButton } from "@/components/live-action-button"

// Hook de debounce fora do componente
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function ServiceOrder() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  const [expandedRows, setExpandedRows] = useState(new Set())
  const [serviceOrders, setServiceOrders] = useState([])
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isConcludeServiceOrderModalOpen, setIsConcludeServiceOrderModalOpen] = useState(false)
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null)
  const [selectedOccurrenceType, setSelectedOccurrenceType] = useState("")
  const [confirmationAction, setConfirmationAction] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [recents, setRecents] = useState(null)
  const [recentsDifference, setRecentsDifference] = useState("")
  const [pending, setPending] = useState(null)
  const [inProgress, setInProgress] = useState(null)
  const [resolved, setResolved] = useState(null)
  const [resolvedDifference, setResolvedDifference] = useState("")
  const [inProgressTotal, setInProgressTotal] = useState(null)
  const [dateRange, setDateRange] = useState(null)
  const [selectedRecent, setSelectedRecent] = useState("Mais antigos")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const [serviceNatures, setServiceNatures] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [teams, setTeams] = useState([])
  const [selectedNature, setSelectedNature] = useState("")
  const [selectedTechnician, setSelectedTechnician] = useState("")
  const [selectedSupervisor, setSelectedSupervisor] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("")
  const [isLoading, setIsLoading] = useState({
    natures: false,
    technicians: false,
    supervisors: false,
    teams: false,
  })
  // Estado para controlar se os selects devem estar bloqueados
  const [selectsDisabled, setSelectsDisabled] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  // 1. First, add a new state for sectors and a function to fetch sectors
  // Add these to the existing state declarations at the top of the component:
  const [sectors, setSectors] = useState([])
  const [isChangingSector, setIsChangingSector] = useState(false)
  const [selectedSector, setSelectedSector] = useState("")
  const [dateRangeKey, setDateRangeKey] = useState(0)

  // Permite apenas uma OS expandida por vez para evitar conflito nos selects
  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const newExpandedRows = new Set()
      // Se a linha clicada já está expandida, feche-a
      // Caso contrário, abra apenas esta linha
      if (!prev.has(id)) {
        newExpandedRows.add(id)
      }
      return newExpandedRows
    })
  }

  const handleRecentFilter = (selection) => {
    setSelectedRecent(selection)
    setPage(1)
  }

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm)
    setPage(1)
  }

  async function fetchServiceOrders() {
    const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""
    const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""

    try {
      const response = await api.get(`/service-orders`, {
        params: {
          page,
          startDate,
          endDate,
          recent: selectedRecent === "Mais recentes" ? "desc" : "asc",
          search: appliedSearchTerm || debouncedSearchTerm,
          status: selectedStatus && selectedStatus !== "all" ? selectedStatus : undefined,
        },
      })

      setServiceOrders(response.data.serviceOrders)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar O.S.",
        description: error.response?.data?.error || "Tente novamente.",
      })
    }
  }

  useEffect(() => {
    fetchServiceOrders()
  }, [page, selectedRecent, dateRange, debouncedSearchTerm, appliedSearchTerm, selectedStatus])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await api.get("/service-orders/dashboard")

        setRecents(response.data.recent.total)
        setPending(response.data.pending)
        setResolved(response.data.resolved)
        setInProgressTotal(response.data.inProgress)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar dashboard",
          description: error.response?.data?.error || "Tente novamente.",
        })
      }
    }
    fetchDashboardData()
  }, [])

  const clearFilters = () => {
    setDateRange(null)
    setSelectedRecent("Mais antigos")
    setSearchTerm("")
    setAppliedSearchTerm("")
    setSelectedStatus("all")
    setPage(1)

    // Force re-render of DateRange component
    setDateRangeKey((prev) => prev + 1)
  }

  // Função para verificar se o setor é LIMPA FOSSA
  function isLimpaFossaSector(sectorName) {
    return sectorName && sectorName.toUpperCase() === "LIMPA FOSSA"
  }

  async function handleAssignServiceOrder(serviceOrderId, occurrenceType) {
    try {
      // Get the expanded order to check its sector
      const expandedOrder = serviceOrders.find((order) => order.id === serviceOrderId)
      const occurrence = expandedOrder?.occurrence_air || expandedOrder?.occurrence_land
      const sectorName = occurrence?.sector?.name
      const isLimpaFossa = isLimpaFossaSector(sectorName)

      // Only validate fields if not LIMPA FOSSA
      if (!isLimpaFossa && (!selectedNature || !selectedTechnician || !selectedSupervisor || !selectedTeam)) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Por favor, selecione a natureza, técnico, encarregado e equipe antes de assumir a O.S.",
        })
        return
      }

      if (occurrenceType === "Aerea") {
        const response = await api.post("/service-orders/assign", {
          id: serviceOrderId,
          aerial: true,
          natureId: isLimpaFossa ? null : selectedNature,
          technicianId: isLimpaFossa ? null : selectedTechnician,
          supervisorId: isLimpaFossa ? null : selectedSupervisor,
          teamId: selectedTeam, // Team is still required for LIMPA FOSSA
        })
      } else {
        const response = await api.post("/service-orders/assign", {
          id: serviceOrderId,
          aerial: false,
          natureId: isLimpaFossa ? null : selectedNature,
          technicianId: isLimpaFossa ? null : selectedTechnician,
          supervisorId: isLimpaFossa ? null : selectedSupervisor,
          teamId: selectedTeam, // Team is still required for LIMPA FOSSA
        })
      }

      // Reset selections after successful assignment
      setSelectedNature("")
      setSelectedTechnician("")
      setSelectedSupervisor("")
      setSelectedTeam("")

      toast({
        title: "O.S pega com sucesso!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao pegar O.S.",
        description: error.response?.data?.error || "Tente novamente.",
      })
    }

    fetchServiceOrders()
  }

  async function handleDeleteServiceOrder(serviceOrderId) {
    try {
      const response = await api.delete(`/service-orders/${serviceOrderId}`)

      toast({
        title: "O.S apagada com sucesso!",
      })

      fetchServiceOrders()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao apagar O.S.",
        description: error.response?.data?.error || "Tente novamente.",
      })
    }
  }

  const handleConfirmAction = () => {
    if (confirmationAction === "assign") {
      handleAssignServiceOrder(selectedOccurrenceId, selectedOccurrenceType)
    } else if (confirmationAction === "delete") {
      handleDeleteServiceOrder(selectedOccurrenceId)
    }
    setIsConfirmationModalOpen(false)
  }

  const handleConcludeServiceOrder = async (files) => {
    try {
      const formData = new FormData()
      formData.append("id", selectedOccurrenceId)

      // Append each file with the same key "photo_end"
      // Most APIs will handle this correctly and receive them as an array
      files.forEach((file) => {
        formData.append("photo_end", file)
      })

      if (selectedOccurrenceType === "Aerea") {
        formData.append("aerial", "true")
      } else {
        formData.append("aerial", "false")
      }

      const response = await api.post("/service-orders/concluded", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast({
        title: "O.S finalizada com sucesso!",
      })

      fetchServiceOrders()
    } catch (error) {
      console.log(error)
      toast({
        variant: "destructive",
        title: "Erro ao Finalizar O.S.",
        description: error.response?.data?.error || "Tente novamente.",
      })
    }
  }

  // Função para buscar naturezas de serviço com base no setor
  async function fetchServiceNatures(sectorName) {
    if (!sectorName) {
      console.error("Nome do setor não fornecido para buscar naturezas de serviço")
      return
    }

    setServiceNatures([])
    setIsLoading((prev) => ({ ...prev, natures: true }))
    try {
      const response = await api.get(`/occurrence-types`, {
        params: { sector: sectorName },
      })

      setServiceNatures(response.data.data || [])
    } catch (error) {
      console.error("Error fetching service natures:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar naturezas de serviço",
        description: error.response?.data?.error || "Tente novamente.",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, natures: false }))
    }
  }

  // Função para buscar técnicos com base no setor
  async function fetchTechnicians(sectorName) {
    if (!sectorName) {
      console.error("Nome do setor não fornecido para buscar técnicos")
      return
    }

    setTechnicians([])
    setIsLoading((prev) => ({ ...prev, technicians: true }))
    try {
      const response = await api.get(`/technicians`, {
        params: { sector: sectorName },
      })

      setTechnicians(response.data.data || [])
    } catch (error) {
      console.error("Error fetching technicians:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar técnicos",
        description: error.response?.data?.error || "Tente novamente.",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, technicians: false }))
    }
  }

  // Função para buscar encarregados com base no setor
  async function fetchSupervisors(sectorName) {
    if (!sectorName) {
      console.error("Nome do setor não fornecido para buscar encarregados")
      return
    }

    setSupervisors([])
    setIsLoading((prev) => ({ ...prev, supervisors: true }))
    try {
      const response = await api.get(`/in-charges`, {
        params: { sector: sectorName },
      })

      setSupervisors(response.data.data || [])
    } catch (error) {
      console.error("Error fetching supervisors:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar encarregados",
        description: error.response?.data?.error || "Tente novamente.",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, supervisors: false }))
    }
  }

  // Função para buscar equipes com base no setor
  async function fetchTeams(sectorName) {
    if (!sectorName) {
      console.error("Nome do setor não fornecido para buscar equipes")
      return
    }

    setTeams([])
    setIsLoading((prev) => ({ ...prev, teams: true }))
    try {
      const response = await api.get(`/teams`, {
        params: { sector: sectorName },
      })
      setTeams(response.data.data || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar equipes",
        description: error.response?.data?.error || "Tente novamente.",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, teams: false }))
    }
  }

  // 2. Add the fetchSectors function with the existing API functions
  const fetchSectors = useCallback(async () => {
    try {
      const response = await api.get("/sectors")
      setSectors(response.data.data)
    } catch (error) {
      console.error("Erro ao buscar setores:", error.message)
      toast({
        variant: "destructive",
        title: "Erro ao carregar setores",
        description: error.response?.data?.error || "Tente novamente.",
      })
    }
  }, [])

  // 3. Add a function to handle sector change
  const handleSectorChange = async (serviceOrderId, newSectorId) => {
    if (!newSectorId) return

    setIsChangingSector(true)
    try {
      await api.post("/service-orders/change-sector", {
        serviceOrderId,
        sectorId: newSectorId,
      })

      toast({
        title: "Setor alterado com sucesso!",
      })

      // Refresh service orders to show the updated sector
      fetchServiceOrders()
    } catch (error) {
      console.error("Erro ao alterar setor:", error.message)
      toast({
        variant: "destructive",
        title: "Erro ao alterar setor",
        description: error.response?.data?.error || "Tente novamente.",
      })
    } finally {
      setIsChangingSector(false)
    }
  }

  // Função para carregar todos os dados quando o setor estiver disponível
  function loadOperationalData(sectorName) {
    if (!sectorName) {
      console.error("Nome do setor não fornecido, não é possível carregar dados operacionais")
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Nome do setor não definido para esta ocorrência.",
      })
      return
    }

    fetchServiceNatures(sectorName)
    fetchTechnicians(sectorName)
    fetchSupervisors(sectorName)
    fetchTeams(sectorName)
  }

  // 4. Add useEffect to fetch sectors when component mounts
  useEffect(() => {
    fetchSectors()
  }, [fetchSectors])

  useEffect(() => {
    if (expandedRows.size > 0) {
      const expandedId = Array.from(expandedRows)[0]
      const expandedOrder = serviceOrders.find((order) => order.id === expandedId)

      if (expandedOrder) {
        const occurrence = expandedOrder.occurrence_air || expandedOrder.occurrence_land
        if (occurrence && occurrence.sector) {
          // Garantir que temos o nome do setor
          const sectorName = occurrence.sector.name

          if (sectorName) {
            // Verificar se é LIMPA FOSSA
            const isLimpaFossa = isLimpaFossaSector(sectorName)

            loadOperationalData(sectorName)

            // Se a ordem de serviço estiver em andamento, preencher os selects com os valores do banco
            if (expandedOrder.status === "EmAndamento" || expandedOrder.status === "Resolvida") {
              // Bloquear os selects para não permitir alteração
              setSelectsDisabled(true)

              // Preencher natureza do serviço
              if (expandedOrder.type_id) {
                setSelectedNature(expandedOrder.type_id.toString())
              }

              // Preencher técnico
              if (expandedOrder.tecnician_id) {
                setSelectedTechnician(expandedOrder.tecnician_id.toString())
              }

              // Preencher encarregado
              if (expandedOrder.incharge_id) {
                setSelectedSupervisor(expandedOrder.incharge_id.toString())
              }

              // Preencher equipe
              if (expandedOrder.team_id) {
                setSelectedTeam(expandedOrder.team_id.toString())
              }
            } else {
              // Desbloquear os selects se não estiver em andamento
              setSelectsDisabled(false)

              // Limpar selects se não estiver em andamento
              setSelectedNature("")
              setSelectedTechnician("")
              setSelectedSupervisor("")
              setSelectedTeam("")
            }
          } else {
            console.error("Nome do setor não definido para esta ocorrência")
            toast({
              variant: "destructive",
              title: "Erro ao carregar dados",
              description: "Nome do setor não definido para esta ocorrência.",
            })
          }
        } else {
          console.error("Dados do setor não encontrados para esta ocorrência")
          toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: "Dados do setor não encontrados para esta ocorrência.",
          })
        }
      }
    }
  }, [expandedRows, serviceOrders])

  // Renderização de cartões para visualização móvel
  const renderMobileCard = (serviceOrder) => {
    const occurrence = serviceOrder.occurrence_air || serviceOrder.occurrence_land
    const occurrenceType = serviceOrder.occurrence_air ? "Aerea" : "Terrestre"

    if (!occurrence) return null

    return (
      <Card key={serviceOrder.id} className="mb-4 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">OS #{serviceOrder.random_code}</span>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  serviceOrder.status === "Resolvida"
                    ? "bg-purple-100 text-purple-800" // Resolvido
                    : serviceOrder.status === "EmAndamento"
                      ? "bg-yellow-100 text-yellow-800" // EmAndamento
                      : "bg-orange-100 text-orange-800" // Pendente
                }`}
              >
                {serviceOrder.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {occurrence.zone} - {occurrence.neighborhood}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toggleRow(serviceOrder.id)} className="p-1 h-8 w-8">
            {expandedRows.has(serviceOrder.id) ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Endereço</p>
            <p className="truncate">{occurrence.address}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Data</p>
            <p>{new Date(serviceOrder.date_time).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>

        {expandedRows.has(serviceOrder.id) && (
          <div className="p-4 border-t bg-gray-50">
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Informações da ocorrência</h4>

                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <span className="text-gray-500 font-medium">Data/Hora:</span>
                    <span>{new Date(occurrence.date_time).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <span className="text-gray-500 font-medium">Ocorrência:</span>
                    <span>{occurrence.type}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <span className="text-gray-500 font-medium">Tipo:</span>
                    <span>{occurrenceType}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <span className="text-gray-500 font-medium">Quantidade:</span>
                    <span>{occurrence.quantity}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <span className="text-gray-500 font-medium">Piloto:</span>
                    <span>{serviceOrder.pilot?.name || "Não definido"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-1">
                    <span className="text-gray-500 font-medium">Local:</span>
                    <span className="break-words">{occurrence.address}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Operacional</h4>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Setor operacional responsável</label>
                    {serviceOrder.status === "Pendente" && (user?.role === "gestor" || user?.role === "admin") ? (
                      <Select
                        value={selectedSector || occurrence.sector?.id?.toString()}
                        onValueChange={(value) => handleSectorChange(serviceOrder.id, value)}
                        disabled={isChangingSector}
                      >
                        <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector.id} value={sector.id.toString()}>
                              {sector.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                        {occurrence.sector?.name || "Não definido"}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Responsável</label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                      {occurrence.sector?.responsible?.name || "Não definido"}
                    </div>
                  </div>

                  {/* Natureza do serviço */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">
                      Natureza do serviço{" "}
                      {isLimpaFossaSector(occurrence.sector?.name) ? "" : <span className="text-red-500">*</span>}
                    </label>
                    <Select
                      value={selectedNature}
                      onValueChange={setSelectedNature}
                      disabled={isLoading.natures || selectsDisabled || isLimpaFossaSector(occurrence.sector?.name)}
                    >
                      <SelectTrigger
                        className={`w-full bg-gray-50 border-gray-200 ${
                          !selectedNature && !selectsDisabled && !isLimpaFossaSector(occurrence.sector?.name)
                            ? "border-red-200"
                            : ""
                        }`}
                      >
                        <SelectValue
                          placeholder={
                            isLimpaFossaSector(occurrence.sector?.name)
                              ? "Não necessário para LIMPA FOSSA"
                              : "Selecione a natureza do serviço"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading.natures ? (
                          <SelectItem value="loading" disabled>
                            Carregando...
                          </SelectItem>
                        ) : serviceNatures.length > 0 ? (
                          serviceNatures.map((nature) => (
                            <SelectItem key={nature.id} value={nature.id.toString()}>
                              {nature.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            Nenhuma natureza disponível. Verifique o setor.
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Técnico */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">
                      Técnico{" "}
                      {isLimpaFossaSector(occurrence.sector?.name) ? "" : <span className="text-red-500">*</span>}
                    </label>
                    <Select
                      value={selectedTechnician}
                      onValueChange={setSelectedTechnician}
                      disabled={isLoading.technicians || selectsDisabled || isLimpaFossaSector(occurrence.sector?.name)}
                    >
                      <SelectTrigger
                        className={`w-full bg-gray-50 border-gray-200 ${
                          !selectedTechnician && !selectsDisabled && !isLimpaFossaSector(occurrence.sector?.name)
                            ? "border-red-200"
                            : ""
                        }`}
                      >
                        <SelectValue
                          placeholder={
                            isLimpaFossaSector(occurrence.sector?.name) ? "Não necessário para LIMPA FOSSA" : "Técnico"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading.technicians ? (
                          <SelectItem value="loading" disabled>
                            Carregando...
                          </SelectItem>
                        ) : technicians.length > 0 ? (
                          technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id.toString()}>
                              {tech.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            Nenhum técnico disponível. Verifique o setor.
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Encarregado */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">
                      Encarregado{" "}
                      {isLimpaFossaSector(occurrence.sector?.name) ? "" : <span className="text-red-500">*</span>}
                    </label>
                    <Select
                      value={selectedSupervisor}
                      onValueChange={setSelectedSupervisor}
                      disabled={isLoading.supervisors || selectsDisabled || isLimpaFossaSector(occurrence.sector?.name)}
                    >
                      <SelectTrigger
                        className={`w-full bg-gray-50 border-gray-200 ${
                          !selectedSupervisor && !selectsDisabled && !isLimpaFossaSector(occurrence.sector?.name)
                            ? "border-red-200"
                            : ""
                        }`}
                      >
                        <SelectValue
                          placeholder={
                            isLimpaFossaSector(occurrence.sector?.name)
                              ? "Não necessário para LIMPA FOSSA"
                              : "Encarregado"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading.supervisors ? (
                          <SelectItem value="loading" disabled>
                            Carregando...
                          </SelectItem>
                        ) : supervisors.length > 0 ? (
                          supervisors.map((supervisor) => (
                            <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                              {supervisor.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            Nenhum encarregado disponível. Verifique o setor.
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Equipe */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">
                      Equipe <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedTeam}
                      onValueChange={setSelectedTeam}
                      disabled={isLoading.teams || selectsDisabled}
                    >
                      <SelectTrigger
                        className={`w-full bg-gray-50 border-gray-200 ${
                          !selectedTeam && !selectsDisabled ? "border-red-200" : ""
                        }`}
                      >
                        <SelectValue placeholder="Equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading.teams ? (
                          <SelectItem value="loading" disabled>
                            Carregando...
                          </SelectItem>
                        ) : teams.length > 0 ? (
                          teams.map((team) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              {team.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            Nenhuma equipe disponível. Verifique o setor.
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 w-full">
                <div className="w-full" style={{ height: "300px" }}>
                  <div className="w-full h-full rounded-lg overflow-hidden">
                    {occurrenceType === "Aerea" ? (
                      <ServiceOrderMediaCarousel
                        image={
                          occurrence.photo_air_occcurrences && occurrence.photo_air_occcurrences[0]
                            ? `https://imag3semurb.nyc3.cdn.digitaloceanspaces.com/${occurrence.photo_air_occcurrences[0].path}`
                            : "/placeholder.svg?height=300&width=400"
                        }
                        video={
                          occurrence.photo_start
                            ? `https://imag3semurb.nyc3.cdn.digitaloceanspaces.com/${occurrence.photo_start}`
                            : null
                        }
                        altText="Service description"
                      />
                    ) : serviceOrder.status === "Resolvida" ? (
                      <BeforeAfterImageCarousel
                        beforeImages={(occurrence.photo_land_occurrences || []).map((img) => img.path)}
                        afterImages={(occurrence.photos_final_land_occurrences || []).map((img) => img.path)}
                      />
                    ) : (
                      <ServiceOrderManyImagesCaroussel
                        imagePaths={(occurrence.photo_land_occurrences || []).map((img) => img.path)}
                      />
                    )}
                  </div>
                </div>

                <div className="w-full" style={{ height: "300px" }}>
                  <div className="w-full h-full rounded-lg overflow-hidden">
                    <GoogleMaps
                      position={{
                        lat: Number.parseFloat(occurrence.latitude_coordinate || 0),
                        lng: Number.parseFloat(occurrence.longitude_coordinate || 0),
                      }}
                      label={occurrenceType}
                    />
                  </div>
                </div>

                {/* Add this button below the map */}
                <Button
                  variant="outline"
                  className="w-full mt-2 flex items-center justify-center gap-2"
                  onClick={() => {
                    const lat = Number.parseFloat(occurrence.latitude_coordinate || 0)
                    const lng = Number.parseFloat(occurrence.longitude_coordinate || 0)
                    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")
                  }}
                >
                  <span>Abrir no Google Maps</span>
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                {serviceOrder.responsible ? null : (
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={
                      !selectedTeam || // Team is always required
                      (!isLimpaFossaSector(occurrence.sector?.name) &&
                        (!selectedNature || !selectedTechnician || !selectedSupervisor))
                    }
                    onClick={() => {
                      setSelectedOccurrenceId(serviceOrder.id)
                      setConfirmationAction("assign")
                      setIsConfirmationModalOpen(true)
                      setSelectedOccurrenceType(occurrenceType)
                    }}
                  >
                    Assumir O.S.
                  </Button>
                )}

                {user?.id === serviceOrder.responsible_id && serviceOrder.status === "EmAndamento" ? (
                  <Button
                    variant="outline"
                    className="w-full bg-green-50 hover:bg-green-100 border-green-200 text-green-600"
                    onClick={() => {
                      setSelectedOccurrenceId(serviceOrder.id)
                      setSelectedOccurrenceType(occurrenceType)
                      setIsConcludeServiceOrderModalOpen(true)
                    }}
                  >
                    Finalizar O.S
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="bg-gray-50 sm:ml-[270px] font-inter min-h-screen flex flex-col">
      <Sidebar />
      <header className="flex justify-between items-center border-b py-4 px-4 sm:px-8 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Ordem de Serviços</h1>
        </div>
        <div className="flex items-center gap-2">
          <LiveActionButton />
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-xl font-semibold text-gray-900 sm:hidden">Ordem de Serviços</h3>
          <p className="text-gray-600 text-sm">Defina ou direcione os setores de execução</p>
        </div>

        {/* Filtros para mobile */}
        {isMobile && (
          <div className="mb-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-between"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
            </Button>

            {isFilterOpen && (
              <div className="mt-2 p-4 bg-white rounded-lg shadow-sm space-y-3">
                <div className="relative w-full flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar por número da O.S."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={handleSearch}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <DateRange key={dateRangeKey} selectedRange={dateRange} onDateRangeChange={setDateRange} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 justify-between">
                      {selectedRecent || "Recentes"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleRecentFilter("Mais recentes")}>
                      Mais recentes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRecentFilter("Mais antigos")}>Mais antigos</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="EmAndamento">Em Andamento</SelectItem>
                    <SelectItem value="Resolvida">Resolvida</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Filtros para desktop */}
        {!isMobile && (
          <div className="mt-6 flex items-center gap-4 flex-wrap sm:flex-nowrap">
            <div className="relative w-full max-w-sm flex gap-2">
              <input
                type="text"
                placeholder="Buscar por número da O.S."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <DateRange key={dateRangeKey} selectedRange={dateRange} onDateRangeChange={setDateRange} />

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

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="EmAndamento">Em Andamento</SelectItem>
                <SelectItem value="Resolvida">Resolvida</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              Limpar Filtros
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
          <StatsCardNoTrend text="Recentes" number={recents} />
          <StatsCardNoTrend text="Pendente" number={pending} />
          <StatsCardNoTrend text="Em Andamento" number={inProgressTotal} />
          <StatsCardNoTrend text="Finalizados" number={resolved} />
        </div>

        {/* Conteúdo principal - Tabela ou Cards */}
        <div className="mt-6">
          {isMobile ? (
            // Visualização móvel com cards
            <div className="space-y-4">{serviceOrders.map(renderMobileCard)}</div>
          ) : (
            // Visualização desktop com tabela
            <Card className="shadow-sm border-0 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="max-lg:hidden">Nº da O.S</TableHead>
                      <TableHead className="max-lg:hidden">Zona / Região</TableHead>
                      <TableHead>Bairro</TableHead>
                      <TableHead>Endereço, rua ou avenida</TableHead>
                      <TableHead className="max-lg:hidden">Ocorrências</TableHead>
                      <TableHead>Data da O.S</TableHead>
                      <TableHead>Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceOrders.map((serviceOrder) => {
                      const occurrence = serviceOrder.occurrence_air || serviceOrder.occurrence_land
                      const occurrenceType = serviceOrder.occurrence_air ? "Aerea" : "Terrestre"

                      // Skip rendering if occurrence is null or undefined
                      if (!occurrence) {
                        return null
                      }

                      return (
                        <React.Fragment key={serviceOrder.id}>
                          <TableRow
                            onClick={() => toggleRow(serviceOrder.id)}
                            className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                              expandedRows.has(serviceOrder.id) ? "bg-gray-100" : "bg-white"
                            }`}
                          >
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              {expandedRows.has(serviceOrder.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </TableCell>
                            <TableCell className="max-lg:hidden">{serviceOrder.random_code}</TableCell>
                            <TableCell className="font-medium max-lg:hidden">{occurrence.zone}</TableCell>
                            <TableCell>{occurrence.neighborhood}</TableCell>
                            <TableCell>{occurrence.address}</TableCell>
                            <TableCell className="max-lg:hidden">{occurrence.quantity}</TableCell>
                            <TableCell>{new Date(serviceOrder.date_time).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                  serviceOrder.status === "Resolvida"
                                    ? "bg-purple-100 text-purple-800" // Resolvido
                                    : serviceOrder.status === "EmAndamento"
                                      ? "bg-yellow-100 text-yellow-800" // EmAndamento
                                      : "bg-orange-100 text-orange-800" // Pendente
                                }`}
                              >
                                {serviceOrder.status}
                              </span>
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(serviceOrder.id) && (
                            <TableRow>
                              <TableCell colSpan={9}>
                                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 p-6 bg-gray-50 rounded-lg">
                                  {/* Left Column - Informações da ocorrência and Operacional */}
                                  <div className="space-y-6">
                                    <div className="bg-white p-5 rounded-lg shadow-sm">
                                      <h3 className="text-gray-700 mb-4 font-medium border-b pb-2">
                                        Informações da ocorrência
                                      </h3>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div>
                                          <span className="text-gray-500 font-medium">Data/Hora:</span>{" "}
                                          {new Date(occurrence.date_time).toLocaleString()}
                                        </div>
                                        <div>
                                          <span className="text-gray-500 font-medium">Nome da Ocorrencia:</span>{" "}
                                          {occurrence.type}
                                        </div>
                                        <div>
                                          <span className="text-gray-500 font-medium">Tipo de Ocorrência:</span>{" "}
                                          {occurrenceType}
                                        </div>
                                        <div>
                                          <span className="text-gray-500 font-medium">Quantidade:</span>{" "}
                                          {occurrence.quantity}
                                        </div>
                                        <div>
                                          <span className="text-gray-500 font-medium">Piloto:</span>{" "}
                                          {serviceOrder.pilot?.name || "Não definido"}
                                        </div>
                                        <div>
                                          <span className="text-gray-500 font-medium">Local:</span> {occurrence.address}
                                        </div>
                                        <div>
                                          <span className="text-gray-500 font-medium">CEP da Rua:</span>{" "}
                                          {occurrence.zip_code}
                                        </div>
                                        <div>
                                          <span className="text-gray-500 font-medium">Longitude:</span>{" "}
                                          {occurrence.longitude_coordinate}
                                        </div>
                                        <div>
                                          <span className="text-gray-500 font-medium">Latitude:</span>{" "}
                                          {occurrence.latitude_coordinate}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm">
                                      <h3 className="text-gray-700 mb-4 font-medium border-b pb-2">Operacional</h3>
                                      <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-sm text-gray-500 font-medium">
                                            Setor operacional responsável
                                          </label>
                                          {serviceOrder.status === "Pendente" &&
                                          (user?.role === "gestor" || user?.role === "admin") ? (
                                            <Select
                                              value={selectedSector || occurrence.sector?.id?.toString()}
                                              onValueChange={(value) => handleSectorChange(serviceOrder.id, value)}
                                              disabled={isChangingSector}
                                            >
                                              <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                                                <SelectValue placeholder="Selecione o setor" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {sectors.map((sector) => (
                                                  <SelectItem key={sector.id} value={sector.id.toString()}>
                                                    {sector.name}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          ) : (
                                            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                                              {occurrence.sector?.name || "Não definido"}
                                            </div>
                                          )}
                                        </div>

                                        {/* Responsável (fixo) */}
                                        <div className="flex flex-col gap-1">
                                          <label className="text-sm text-gray-500 font-medium">Responsável</label>
                                          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                                            {occurrence.sector?.responsible?.name || "Não definido"}
                                          </div>
                                        </div>

                                        {/* Natureza do serviço (dinâmico) */}
                                        <div className="flex flex-col gap-1">
                                          <label className="text-sm text-gray-500 font-medium">
                                            Natureza do serviço{" "}
                                            {isLimpaFossaSector(occurrence.sector?.name) ? (
                                              ""
                                            ) : (
                                              <span className="text-red-500">*</span>
                                            )}
                                          </label>
                                          <Select
                                            value={selectedNature}
                                            onValueChange={setSelectedNature}
                                            disabled={
                                              isLoading.natures ||
                                              selectsDisabled ||
                                              isLimpaFossaSector(occurrence.sector?.name)
                                            }
                                          >
                                            <SelectTrigger
                                              className={`w-full bg-gray-50 border-gray-200 ${
                                                !selectedNature &&
                                                !selectsDisabled &&
                                                !isLimpaFossaSector(occurrence.sector?.name)
                                                  ? "border-red-200"
                                                  : ""
                                              }`}
                                            >
                                              <SelectValue
                                                placeholder={
                                                  isLimpaFossaSector(occurrence.sector?.name)
                                                    ? "Não necessário para LIMPA FOSSA"
                                                    : "Selecione a natureza do serviço"
                                                }
                                              />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {isLoading.natures ? (
                                                <SelectItem value="loading" disabled>
                                                  Carregando...
                                                </SelectItem>
                                              ) : serviceNatures.length > 0 ? (
                                                serviceNatures.map((nature) => (
                                                  <SelectItem key={nature.id} value={nature.id.toString()}>
                                                    {nature.name}
                                                  </SelectItem>
                                                ))
                                              ) : (
                                                <SelectItem value="empty" disabled>
                                                  Nenhuma natureza disponível. Verifique o setor.
                                                </SelectItem>
                                              )}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {/* Técnico (dinâmico) */}
                                        <div className="flex flex-col gap-1">
                                          <label className="text-sm text-gray-500 font-medium">
                                            Técnico{" "}
                                            {isLimpaFossaSector(occurrence.sector?.name) ? (
                                              ""
                                            ) : (
                                              <span className="text-red-500">*</span>
                                            )}
                                          </label>
                                          <Select
                                            value={selectedTechnician}
                                            onValueChange={setSelectedTechnician}
                                            disabled={
                                              isLoading.technicians ||
                                              selectsDisabled ||
                                              isLimpaFossaSector(occurrence.sector?.name)
                                            }
                                          >
                                            <SelectTrigger
                                              className={`w-full bg-gray-50 border-gray-200 ${
                                                !selectedTechnician &&
                                                !selectsDisabled &&
                                                !isLimpaFossaSector(occurrence.sector?.name)
                                                  ? "border-red-200"
                                                  : ""
                                              }`}
                                            >
                                              <SelectValue
                                                placeholder={
                                                  isLimpaFossaSector(occurrence.sector?.name)
                                                    ? "Não necessário para LIMPA FOSSA"
                                                    : "Técnico"
                                                }
                                              />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {isLoading.technicians ? (
                                                <SelectItem value="loading" disabled>
                                                  Carregando...
                                                </SelectItem>
                                              ) : technicians.length > 0 ? (
                                                technicians.map((tech) => (
                                                  <SelectItem key={tech.id} value={tech.id.toString()}>
                                                    {tech.name}
                                                  </SelectItem>
                                                ))
                                              ) : (
                                                <SelectItem value="empty" disabled>
                                                  Nenhum técnico disponível. Verifique o setor.
                                                </SelectItem>
                                              )}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {/* Encarregado (dinâmico) */}
                                        <div className="flex flex-col gap-1">
                                          <label className="text-sm text-gray-500 font-medium">
                                            Encarregado{" "}
                                            {isLimpaFossaSector(occurrence.sector?.name) ? (
                                              ""
                                            ) : (
                                              <span className="text-red-500">*</span>
                                            )}
                                          </label>
                                          <Select
                                            value={selectedSupervisor}
                                            onValueChange={setSelectedSupervisor}
                                            disabled={
                                              isLoading.supervisors ||
                                              selectsDisabled ||
                                              isLimpaFossaSector(occurrence.sector?.name)
                                            }
                                          >
                                            <SelectTrigger
                                              className={`w-full bg-gray-50 border-gray-200 ${
                                                !selectedSupervisor &&
                                                !selectsDisabled &&
                                                !isLimpaFossaSector(occurrence.sector?.name)
                                                  ? "border-red-200"
                                                  : ""
                                              }`}
                                            >
                                              <SelectValue
                                                placeholder={
                                                  isLimpaFossaSector(occurrence.sector?.name)
                                                    ? "Não necessário para LIMPA FOSSA"
                                                    : "Encarregado"
                                                }
                                              />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {isLoading.supervisors ? (
                                                <SelectItem value="loading" disabled>
                                                  Carregando...
                                                </SelectItem>
                                              ) : supervisors.length > 0 ? (
                                                supervisors.map((supervisor) => (
                                                  <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                                                    {supervisor.name}
                                                  </SelectItem>
                                                ))
                                              ) : (
                                                <SelectItem value="empty" disabled>
                                                  Nenhum encarregado disponível. Verifique o setor.
                                                </SelectItem>
                                              )}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {/* Equipe (dinâmico) */}
                                        <div className="flex flex-col gap-1">
                                          <label className="text-sm text-gray-500 font-medium">
                                            Equipe <span className="text-red-500">*</span>
                                          </label>
                                          <Select
                                            value={selectedTeam}
                                            onValueChange={setSelectedTeam}
                                            disabled={isLoading.teams || selectsDisabled}
                                          >
                                            <SelectTrigger
                                              className={`w-full bg-gray-50 border-gray-200 ${
                                                !selectedTeam && !selectsDisabled ? "border-red-200" : ""
                                              }`}
                                            >
                                              <SelectValue placeholder="Equipe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {isLoading.teams ? (
                                                <SelectItem value="loading" disabled>
                                                  Carregando...
                                                </SelectItem>
                                              ) : teams.length > 0 ? (
                                                teams.map((team) => (
                                                  <SelectItem key={team.id} value={team.id.toString()}>
                                                    {team.name}
                                                  </SelectItem>
                                                ))
                                              ) : (
                                                <SelectItem value="empty" disabled>
                                                  Nenhuma equipe disponível. Verifique o setor.
                                                </SelectItem>
                                              )}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                                          <p className="text-gray-500 font-medium">
                                            Nome:{" "}
                                            <span className="text-gray-800 font-normal">
                                              {serviceOrder?.responsible?.name || "Não definido"}
                                            </span>
                                          </p>
                                          <p className="text-gray-500 font-medium">
                                            Email:{" "}
                                            <span className="text-gray-800 font-normal">
                                              {serviceOrder?.responsible?.email || "Não definido"}
                                            </span>
                                          </p>
                                          <p className="text-gray-500 font-medium">
                                            Data Designação:{" "}
                                            <span className="text-gray-800 font-normal">
                                              {serviceOrder?.responsible_assigned_at
                                                ? new Date(serviceOrder.responsible_assigned_at).toLocaleDateString(
                                                    "pt-BR",
                                                  )
                                                : "Não definido"}
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                      {serviceOrder.responsible ? null : (
                                        <Button
                                          className="px-12 bg-blue-500 hover:bg-blue-600 text-white"
                                          disabled={
                                            !selectedTeam || // Team is always required
                                            (!isLimpaFossaSector(occurrence.sector?.name) &&
                                              (!selectedNature || !selectedTechnician || !selectedSupervisor))
                                          }
                                          onClick={() => {
                                            setSelectedOccurrenceId(serviceOrder.id)
                                            setConfirmationAction("assign")
                                            setIsConfirmationModalOpen(true)
                                            setSelectedOccurrenceType(occurrenceType)
                                          }}
                                        >
                                          Assumir O.S.
                                        </Button>
                                      )}

                                      {user?.id === serviceOrder.responsible_id &&
                                      serviceOrder.status === "EmAndamento" ? (
                                        <Button
                                          variant="outline"
                                          className="px-12 bg-green-50 hover:bg-green-100 border-green-200 text-green-600"
                                          onClick={() => {
                                            setSelectedOccurrenceId(serviceOrder.id)
                                            setSelectedOccurrenceType(occurrenceType)
                                            setIsConcludeServiceOrderModalOpen(true)
                                          }}
                                        >
                                          Finalizar O.S
                                        </Button>
                                      ) : null}
                                    </div>
                                  </div>

                                  {/* Right Column - Images and Map */}
                                  <div className="w-full flex flex-col gap-20">
                                    {/* Imagem */}
                                    <div className="w-full h-[320px] rounded-lg shadow-sm">
                                      {occurrenceType === "Aerea" ? (
                                        <ServiceOrderMediaCarousel
                                          image={
                                            occurrence.photo_air_occcurrences && occurrence.photo_air_occcurrences[0]
                                              ? `https://imag3semurb.nyc3.cdn.digitaloceanspaces.com/${occurrence.photo_air_occcurrences[0].path}`
                                              : "/placeholder.svg"
                                          }
                                          video={
                                            occurrence.photo_start
                                              ? `https://imag3semurb.nyc3.cdn.digitaloceanspaces.com/${occurrence.photo_start}`
                                              : null
                                          }
                                          altText="Service description"
                                        />
                                      ) : serviceOrder.status === "Resolvida" ? (
                                        <BeforeAfterImageCarousel
                                          beforeImages={(occurrence.photo_land_occurrences || []).map(
                                            (img) => img.path,
                                          )}
                                          afterImages={(occurrence.photos_final_land_occurrences || []).map(
                                            (img) => img.path,
                                          )}
                                        />
                                      ) : (
                                        <ServiceOrderManyImagesCaroussel
                                          imagePaths={(occurrence.photo_land_occurrences || []).map((img) => img.path)}
                                        />
                                      )}
                                    </div>

                                    {/* Mapa */}
                                    <div className="w-full h-[280px] rounded-lg overflow-hidden shadow-sm">
                                      <GoogleMaps
                                        position={{
                                          lat: Number.parseFloat(occurrence.latitude_coordinate || 0),
                                          lng: Number.parseFloat(occurrence.longitude_coordinate || 0),
                                        }}
                                        label={occurrenceType}
                                      />
                                    </div>

                                    {/* Add this button below the map */}
                                    <Button
                                      variant="outline"
                                      className="w-full mt-2 flex items-center justify-center gap-2"
                                      onClick={() => {
                                        const lat = Number.parseFloat(occurrence.latitude_coordinate || 0)
                                        const lng = Number.parseFloat(occurrence.longitude_coordinate || 0)
                                        window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")
                                      }}
                                    >
                                      <span>Abrir no Google Maps</span>
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </main>

      <footer className="px-4 sm:px-8 py-4 bg-white border-t shadow-sm mt-auto">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </footer>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmationAction === "assign" ? "Assumir O.S." : "Deletar O.S."}
        message={
          confirmationAction === "assign"
            ? "Você deseja assumir esta Ordem de Serviço?"
            : "Você deseja deletar esta Ordem de Serviço?"
        }
      />

      <ConcludeServiceOrderModal
        isOpen={isConcludeServiceOrderModalOpen}
        onClose={() => setIsConcludeServiceOrderModalOpen(false)}
        onConfirm={handleConcludeServiceOrder}
        title={"Finalizar O.S?"}
        message={"Selecione a imagem da ocorrência finalizada"}
      />
    </div>
  )
}
