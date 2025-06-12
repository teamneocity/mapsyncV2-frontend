"use client"
import { Filters } from "@/components/filters"
import { GoogleMaps } from "@/components/googleMaps"
import { Pagination } from "@/components/pagination"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/auth"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/usePermissions"
import { getInicials } from "@/lib/utils"
import { api } from "@/services/api"
import { format } from "date-fns"
import { ChevronDown, ChevronRight, ImageIcon } from "lucide-react"
import React, { useEffect, useState } from "react"
import { CreateOccurrenceModal } from "../../components/modal"
import { OccurrenceView } from "./videoimagecarousel"

export function OccurrencesA() {
  const { user } = useAuth()

  const [expandedRows, setExpandedRows] = useState(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null)
  const [selectedOccurrenceStatus, setSelectedOccurrenceStatus] = useState(null)
  const [confirmationAction, setConfirmationAction] = useState(null)
  const { toast } = useToast()
  const [occurrences, setOccurrences] = useState([])

  const [isIgnoreOcurrenceModalOpen, setIsIgnoreOcurrenceModalOpen] = useState(false)

  // Estados para os filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRecent, setFilterRecent] = useState(null)
  const [filterType, setFilterType] = useState(null)
  const [filterDateRange, setFilterDateRange] = useState({ startDate: null, endDate: null })

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOccurrences, setTotalOccurrences] = useState(0)
  const { isManager, isAnalyst, isOperator, isAdmin, isSupervisor } = usePermissions()

  // Função para expandir/recolher linhas da tabela
  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const newExpandedRows = new Set(prev)
      if (newExpandedRows.has(id)) {
        newExpandedRows.delete(id)
      } else {
        newExpandedRows.add(id)
      }
      return newExpandedRows
    })
  }

  // Função para buscar ocorrências com filtros
  const fetchOccurrences = async (page = 1) => {
    try {
      const params = {
        search: searchTerm,
        recent: filterRecent,
        type: filterType,
        startDate: filterDateRange.startDate ? format(filterDateRange.startDate, "yyyy-MM-dd") : null,
        endDate: filterDateRange.endDate ? format(filterDateRange.endDate, "yyyy-MM-dd") : null,
        page,
      }

      const response = await api.get("/air-occurrences", { params })
      setOccurrences(response.data.data)
      setCurrentPage(response.data.currentPage)
      setTotalPages(response.data.totalPages)
      setTotalOccurrences(response.data.totalOccurrences)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar ocorrências.",
        description: error.message,
      })
    }
  }

  // Função para lidar com a criação de uma ocorrência
  const handleCreateOccurrence = async (data) => {
    // const formData = new FormData();
    // formData.append("date_time", data.date_time);
    // formData.append("pilot_id", data.pilot_id);
    // formData.append("address", data.address);
    // formData.append("zip_code", data.zip_code);
    // formData.append("street_direction", data.street_direction);
    // formData.append("type", data.type);
    // formData.append("zone", data.zone);
    // formData.append("quantity", data.quantity);
    // formData.append("status", data.status);
    // formData.append("photo_start", data.photo_start);
    // formData.append("latitude_coordinate", data.latitude_coordinate);
    // formData.append("longitude_coordinate", data.longitude_coordinate);
    // formData.append("description", data.description);
    // formData.append("neighborhood", data.neighborhood);

    try {
      // const response = await api.post("/air-occurrences", formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });

      fetchOccurrences(currentPage)
      setIsModalOpen(false)
      toast({
        title: "Ocorrência criada com sucesso!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar ocorrência.",
        description: error.response?.data?.error || "Tente novamente.",
      })
    }
  }

  // Função para lidar com a criação de uma ordem de serviço
  const handleCreateServiceOrder = async (id) => {
    try {
      await api.post("/service-orders", { occurrenceId: id, aerial: true })
      toast({
        title: "Ordem de serviço criada com sucesso!",
      })
      fetchOccurrences(currentPage)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar ordem de serviço.",
        description: error.response?.data?.error || "Tente novamente.",
      })
    }
  }

  // Atualizar ocorrências quando os filtros mudarem
  useEffect(() => {
    fetchOccurrences(currentPage)
  }, [currentPage])

  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchOccurrences(1)
  }

  // const handleIgnoreOccurrence = async (id, status) => {

  //   try {
  //     console.log(status)
  //     if (status != "EmAnalise") {
  //       toast({
  //         variant: "destructive",
  //         title: "Erro ao apagar Ocorrência",
  //         description: "Ocorrência já em processo.",
  //       });
  //       return
  //     }

  //     const response = await api.put(`/air-occurrences/${id}`)

  //     toast({
  //       title: "Ocorrência apagada com sucesso!",
  //     });

  //     fetchOccurrences(currentPage);
  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Erro ao apagar Ocorrência",
  //       description: error.response?.data?.error || "Tente novamente.",
  //     });
  //     console.log(error)
  //   }
  // }

  // const handleAuthorizeClick = (id) => {
  //   setSelectedOccurrenceId(id);
  //   setConfirmationAction("authorize");
  //   setIsConfirmationModalOpen(true);
  // };

  // const handleIgnoreClick = (id, status) => {
  //   setSelectedOccurrenceId(id);
  //   setSelectedOccurrenceStatus(status);
  //   setConfirmationAction("ignore");
  //   setIsConfirmationModalOpen(true);
  // };

  // const confirmAction = () => {
  //   if (selectedOccurrenceId) {
  //     if (confirmationAction === "authorize") {
  //       handleCreateServiceOrder(selectedOccurrenceId);
  //     } else if (confirmationAction === "ignore") {
  //       handleIgnoreOccurrence(selectedOccurrenceId, selectedOccurrenceStatus);
  //     }
  //     setSelectedOccurrenceId(null);
  //     setConfirmationAction(null);
  //   }
  // };

  // const handleNotValidatePhoto = async (reason) => {
  //   try {

  //     const response = await api.delete(`/air-occurrences/refuse`, {
  //       data: {
  //         id: selectedOccurrenceId,
  //         reason: reason,
  //       },
  //     });

  //     toast({
  //       title: "Ocorrência Apagada com sucesso!",
  //     });

  //     fetchOccurrences(currentPage);

  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Erro ao Apagar Ocorrência",
  //       description: error.response?.data?.error || "Tente novamente.",
  //     });
  //     console.log(error)
  //   }
  // }

  // const handleValidatePhoto = async (occurrenceId) => {
  //   try {

  //     const response = await api.put(`/air-occurrences/accept/${occurrenceId}`)

  //     toast({
  //       title: "Ocorrência Aprovada com sucesso!",
  //     });

  //     fetchOccurrences(currentPage);

  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Erro ao Aprovar Ocorrência",
  //       description: error.response?.data?.error || "Tente novamente.",
  //     });
  //     console.log(error)
  //   }
  // }

  const filteredOccurrences = occurrences.filter((occurrence) => {
    if (isManager) return true
    if (isAdmin) return true
    if (isAnalyst) return occurrence.status === "EmAnalise"
    if (isOperator) {
      return ["EmFila", "EmAndamento", "Resolvido", "Pendente"].includes(occurrence.status)
    }
    return false
  })

  return (
    <div className="flex min-h-screen flex-col sm:ml-[270px] font-inter py-5">
      <Sidebar />
      <header className="hidden sm:flex sm:justify-end sm:gap-3 sm:items-center border-b py-5 px-8">
        <p className="font-medium text-[#5E56FF]">Map Sync</p>
        {/* <Button className="h-11 w-[130px] rounded-[16px] bg-[#5E56FF]" onClick={() => setIsModalOpen(true)}>
          Criar Ocorrência
        </Button> */}
      </header>
      <CreateOccurrenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleCreateOccurrence={handleCreateOccurrence}
      />

      {/* Filtros */}
      <Filters
        text="Ocorrências Aéreas"
        onFilterRecent={(order) => setFilterRecent(order)}
        onFilterType={(type) => setFilterType(type)}
        onFilterDateRange={(range) => setFilterDateRange(range)}
        onSearch={(input) => setSearchTerm(input)}
        handleApplyFilters={handleApplyFilters}
      />

      {/* Tabela de ocorrências */}
      <div className="flex-1 p-4">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Zona / Região</TableHead>
                <TableHead>Piloto responsável</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Ocorrências</TableHead>
                <TableHead>Imagens</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                {user.role === "admin" && <TableHead>Estado</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOccurrences.map((occurrence) => (
                <React.Fragment key={occurrence.id}>
                  <TableRow className="cursor-pointer" onClick={() => toggleRow(occurrence.id)}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      {expandedRows.has(occurrence.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>Sul</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-600">
                          {getInicials(occurrence.pilot?.name) || "N/A"}
                        </span>
                        {occurrence.pilot?.name || "N/A"} {/* Verificação condicional */}
                      </div>
                    </TableCell>
                    <TableCell>{occurrence.neighborhood}</TableCell>
                    <TableCell>{occurrence.quantity}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Exibir
                      </Button>
                    </TableCell>
                    <TableCell>{format(new Date(occurrence.date_time), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          occurrence.status === "Verificado"
                            ? "bg-[#80ed99] text-black" // Verificado
                            : "bg-[#3a86ff] text-white" // NaoVerificado
                        }`}
                      >
                        {occurrence.status}
                      </span>
                    </TableCell>
                    {/* {user.role === "admin" && (
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${occurrence.is_active === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                          {occurrence.is_active === 1 ? "Ativa" : "Desativada"}
                        </span>
                      </TableCell>
                    )} */}

                    {user.role === "admin" && (
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            occurrence.is_active === 1
                              ? "bg-[#80ed99] text-black" // Ativada
                              : "bg-[#d00000] text-white" // Desativada
                          }`}
                        >
                          {occurrence.is_active === 1 ? "Ativa" : "Desativada"}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                  {expandedRows.has(occurrence.id) && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <div className="space-y-4 p-4">
                          <div className="flex gap-4 max-2xl:gap-0 justify-between">
                            <div className="space-y-4 flex flex-col justify-between max-2xl:max-w-[250px]">
                              <div className="space-y-2 text-sm">
                                <h3 className="font-medium text-base">Informações da ocorrência</h3>
                                <div>
                                  <span className="text-gray-500">Data:</span>{" "}
                                  {format(new Date(occurrence.date_time), "dd/MM/yyyy HH:mm:ss")}
                                </div>
                                <div>
                                  <span className="text-gray-500">Piloto:</span> {occurrence.pilot.name}
                                </div>
                                <div>
                                  <span className="text-gray-500">Endereço:</span> {occurrence.address}
                                </div>
                                <div>
                                  <span className="text-gray-500">CEP Rua:</span> {occurrence.zip_code}
                                </div>
                                <div>
                                  <span className="text-gray-500">Direção:</span> {occurrence.street_direction}
                                </div>
                                <div>
                                  <span className="text-gray-500">Tipo de Ocorrência:</span> {occurrence.type}
                                </div>
                                <div>
                                  <span className="text-gray-500">Ocorrência:</span> {occurrence.description}
                                </div>
                                {(user.role === "admin" || user.role === "gestor") && (
                                  <div>
                                    <span className="text-gray-500">Ignorada por:</span>{" "}
                                    {occurrence.observation || "Não ignorada"}
                                  </div>
                                )}
                              </div>
                              {/* <ConfirmationModal
                                isOpen={isConfirmationModalOpen}
                                onClose={() => setIsConfirmationModalOpen(false)}
                                onConfirm={confirmAction}
                                message={confirmationAction === "authorize" ? "Tem certeza que deseja autorizar esta ocorrência?" : "Tem certeza que deseja ignorar esta ocorrência?"}
                              /> */}
                              <div className="flex gap-5 max-w-[600px]">
                                {/* {occurrence.status === "EmFila" && (
                                  <>
                                    <Button className="w-full bg-[#FD3E3E]" onClick={() => handleIgnoreClick(occurrence.id, occurrence.status)}>
                                      Ignorar
                                    </Button>
                                    <Button className="w-full bg-[#42F97E]" onClick={() => handleAuthorizeClick(occurrence.id)}>
                                      Autorizar
                                    </Button>
                                  </>
                                )}


                                {occurrence.status === "EmAnalise" && (
                                  <>
                                    <Button className="w-full bg-[#FD3E3E]" onClick={() => {
                                      setSelectedOccurrenceId(occurrence.id);
                                      setIsIgnoreOcurrenceModalOpen(true);
                                      setSelectedOccurrenceStatus(occurrence.status)

                                    }}>
                                      Ignorar
                                    </Button>
                                    <Button className="w-full bg-[#42F97E]" onClick={() => handleValidatePhoto(occurrence.id)}>
                                      Aceitar
                                    </Button>
                                  </>
                                )}


                                <IgnoreOccurrenceModal
                                  isOpen={isIgnoreOcurrenceModalOpen}
                                  onClose={() => setIsIgnoreOcurrenceModalOpen(false)}
                                  onConfirm={handleNotValidatePhoto}
                                  title={"Recusar ocorrência?"}
                                  message={"Indique o porque da ocorrência ser recusada."}
                                /> */}
                                {occurrence.status === "NaoVerificado" && (
                                  <Button
                                    className="w-full bg-[#42F97E]"
                                    onClick={async () => {
                                      try {
                                        await api.put(`/air-occurrences/accept/${occurrence.id}`)
                                        toast({
                                          title: "Ocorrência verificada com sucesso!",
                                        })
                                        fetchOccurrences(currentPage)
                                      } catch (error) {
                                        toast({
                                          variant: "destructive",
                                          title: "Erro ao verificar ocorrência",
                                          description: error.response?.data?.error || "Tente novamente.",
                                        })
                                      }
                                    }}
                                  >
                                    Verificar
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="h-[500px] rounded-lg flex justify-between gap-2 ml-5">
                                {/* Substitua a tag <img> por <video> */}
                                <OccurrenceView occurrence={occurrence} />
                                <GoogleMaps
                                  position={{
                                    lat: Number.parseFloat(occurrence.latitude_coordinate),
                                    lng: Number.parseFloat(occurrence.longitude_coordinate),
                                  }}
                                  label={occurrence.description}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Paginação */}
      <footer className="border-t bg-white p-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </footer>
    </div>
  )
}
