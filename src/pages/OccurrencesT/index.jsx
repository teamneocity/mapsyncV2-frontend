"use client";

import { Filters } from "@/components/filters";
import { GoogleMaps } from "@/components/googleMaps";
import { IgnoreOccurrenceModal } from "@/components/ignoreOccurrenceModal";
import { Pagination } from "@/components/pagination";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { getInicials } from "@/lib/utils";
import { api } from "@/services/api";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, ImageIcon, Menu } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ImageCarousel } from "./imagecarousel";
import { LiveActionButton } from "@/components/live-action-button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUserSector } from "@/hooks/useUserSector";

// Lista de bairros
const neighborhoods = [
  "Aruana",
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
];

export function OccurrencesT() {
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { setor, loading: setorLoading } = useUserSector();

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const [occurrences, setOccurrences] = useState([]);

  const [isIgnoreOcurrenceModalOpen, setIsIgnoreOcurrenceModalOpen] =
    useState(false);
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null);
  const [selectedOccurrenceStatus, setSelectedOccurrenceStatus] =
    useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estados para os filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRecent, setFilterRecent] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);

  const [editableNeighborhood, setEditableNeighborhood] = useState("");
  const [editableAddress, setEditableAddress] = useState("");
  const [editableSectorId, setEditableSectorId] = useState(null);
  const [allSectors, setAllSectors] = useState([]);

  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOccurrences, setTotalOccurrences] = useState(0);

  const { isManager, isAnalyst, isOperator, isAdmin, isSupervisor } =
    usePermissions();

  useEffect(() => {
    if (!isAnalyst) return;

    async function fetchSectors() {
      try {
        const res = await api.get("/sectors");
        setAllSectors(res.data.data);
      } catch (error) {
        console.error("Erro ao carregar setores:", error);
      }
    }

    fetchSectors();
  }, [isAnalyst]);

  // Função para expandir/recolher linhas da tabela
  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const newExpandedRows = new Set(prev);
      if (newExpandedRows.has(id)) {
        newExpandedRows.delete(id);
        // Remove this line: setIsEditing(false)
      } else {
        newExpandedRows.add(id);
        // Find the occurrence and set the editable fields
        const occurrence = occurrences.find((occ) => occ.id === id);
        if (occurrence) {
          setEditableNeighborhood(occurrence.neighborhood);
          setEditableAddress(occurrence.address);
          setEditableSectorId(occurrence.sector?.id ?? null);
        }
      }
      return newExpandedRows;
    });
  };

  // Função para buscar ocorrências com filtros
  const fetchOccurrences = async (page = 1) => {
    try {
      const params = {
        search: searchTerm,
        recent: filterRecent,
        type: filterType,
        neighborhood: filterNeighborhood,
        startDate: filterDateRange.startDate
          ? format(filterDateRange.startDate, "yyyy-MM-dd")
          : null,
        endDate: filterDateRange.endDate
          ? format(filterDateRange.endDate, "yyyy-MM-dd")
          : null,
        page,
      };

      const response = await api.get("/land-occurrences", { params });
      setOccurrences(response.data.data);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalOccurrences(response.data.totalOccurrences);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar ocorrências.",
        description: error.message,
      });
    }
  };

  // Função para lidar com a criação de uma ordem de serviço
  const handleCreateServiceOrder = async (id) => {
    try {
      await api.post("/service-orders", { occurrenceId: id, aerial: false });
      toast({
        title: "Ordem de serviço criada com sucesso!",
      });
      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar ordem de serviço.",
        description: error.response?.data?.error || "Tente novamente.",
      });
    }
  };

  // Atualizar ocorrências quando os filtros mudarem
  useEffect(() => {
    fetchOccurrences(currentPage);
  }, [currentPage]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchOccurrences(1);
  };

  const handleIgnoreOccurrence = async (id, status) => {
    try {
      if (status != "EmFila" && status != "EmAnalise") {
        toast({
          variant: "destructive",
          title: "Erro ao apagar Ocorrência",
          description: "Ocorrência já em processo.",
        });
        return;
      }

      const response = await api.put(`/land-occurrences/${id}`);

      toast({
        title: "Ocorrência apagada com sucesso!",
      });

      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao apagar Ocorrência",
        description: error.response?.data?.error || "Tente novamente.",
      });
      console.log(error);
    }
  };

  const handleNotValidatePhoto = async (reason) => {
    try {
      const response = await api.delete(`/land-occurrences/refuse`, {
        data: {
          id: selectedOccurrenceId,
          reason: reason,
        },
      });

      toast({
        title: "Ocorrência Apagada com sucesso!",
      });

      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao Apagar Ocorrência",
        description: error.response?.data?.error || "Tente novamente.",
      });
      console.log(error);
    }
  };

  const handleValidatePhoto = async (occurrenceId) => {
    try {
      const response = await api.put(
        `/land-occurrences/accept/${occurrenceId}`
      );

      toast({
        title: "Ocorrência Aprovada com sucesso!",
      });

      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao Aprovar Ocorrência",
        description: error.response?.data?.error || "Tente novamente.",
      });
      console.log(error);
    }
  };

  const handleSaveEdits = async (occurrenceId) => {
    try {
      const response = await api.put(
        `/land-occurrences/kelvin/${occurrenceId}`,
        {
          neighborhood: editableNeighborhood,
          address: editableAddress,
          sector_id: editableSectorId,
        }
      );

      toast({
        title: "Informações atualizadas com sucesso!",
      });

      setIsEditing(false);
      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar informações",
        description: error.response?.data?.error || "Tente novamente.",
      });
      console.log(error);
    }
  };

  const handleDeleteImage = async (image, occurrenceId) => {
    try {
      const response = await api.delete(`/land-occurrences/deletepicture`, {
        data: {
          image: image,
          occurrenceId,
        },
      });

      toast({
        title: "Ocorrência Apagada com sucesso!",
      });

      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao Apagar Ocorrência",
        description: error.response.data.message || "Tente novamente.",
      });
      console.log(error);
    }
  };

  const filteredOccurrences = occurrences.filter((occurrence) => {
    if (isManager) return true;
    if (isAdmin) return true;
    if (isAnalyst) return occurrence.status === "EmAnalise";
    if (isOperator) {
      return ["EmFila", "EmAndamento", "Resolvido", "Pendente"].includes(
        occurrence.status
      );
    }
    if (isSupervisor && setor?.name && occurrence.status !== "EmAnalise") {
      return (
        occurrence.sector?.name?.toLowerCase() === setor.name.toLowerCase()
      );
    }
    return false;
  });

  // Renderização de cartões para visualização móvel
  const renderMobileCard = (occurrence) => {
    if (isSupervisor && setorLoading) {
      return (
        <div className="p-4 text-gray-700">
          Carregando ocorrências do seu setor...
        </div>
      );
    }
    return (
      <Card key={occurrence.id} className="mb-4 overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{occurrence.zone}</h3>
              <p className="text-sm text-gray-500">{occurrence.neighborhood}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleRow(occurrence.id);
              }}
            >
              {expandedRows.has(occurrence.id) ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Piloto</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                {getInicials(occurrence.data[0]?.pilot?.name) || "N/A"}
              </span>
              <span className="truncate">
                {occurrence.pilot?.name || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-gray-500">Data</p>
            <p>{format(new Date(occurrence.date_time), "dd/MM/yyyy")}</p>
          </div>

          <div>
            <p className="text-gray-500">Status</p>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                occurrence.status === "Resolvido"
                  ? "bg-purple-100 text-purple-800" 
                  : occurrence.status === "EmAndamento"
                  ? "bg-yellow-100 text-yellow-800" 
                  : occurrence.status === "EmAnalise"
                  ? "bg-blue-100 text-blue-800" 
                  : occurrence.status === "EmFila"
                  ? "bg-red-100 text-red-800" 
                  : "bg-orange-100 text-orange-800" 
              }`}
            >
              {occurrence.status}
            </span>
          </div>

          <div>
            <p className="text-gray-500">Imagens</p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 mt-1 h-7 text-xs"
            >
              <ImageIcon className="h-3 w-3" />
              Exibir
            </Button>
          </div>
        </div>

        {expandedRows.has(occurrence.id) && (
          <div className="p-4 border-t bg-gray-50">
            <div className="space-y-4 ">
              <div className="bg-white p-4 rounded-lg shadow-sm ">
                <h4 className="font-semibold text-sm mb-3 pb-2 border-b ">
                  Informações da ocorrência
                </h4>

                <table className="w-full text-sm leading-tight">
                  <tbody>
                    <tr className="leading-tight">
                      <td className="text-gray-500 font-medium pr-2 py-0.5">
                        Data:
                      </td>
                      <td className="py-0.5">
                        {format(
                          new Date(occurrence.date_time),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </td>
                    </tr>
                    <tr className="leading-tight">
                      <td className="text-gray-500 font-medium pr-2 py-0.5">
                        Piloto:
                      </td>
                      <td className="py-0.5">
                        {occurrence.data[0]?.pilot?.name}
                      </td>
                    </tr>
                    <tr className="leading-tight">
                      <td className="text-gray-500 font-medium pr-2 py-0.5">
                        Bairro:
                      </td>
                      <td className="py-0.5">
                        {(isOperator || isAnalyst) &&
                        occurrence.status === "EmAnalise" &&
                        isEditing ? (
                          <select
                            value={editableNeighborhood}
                            onChange={(e) =>
                              setEditableNeighborhood(e.target.value)
                            }
                            className="w-full p-1 border rounded text-sm"
                          >
                            {neighborhoods.map((neighborhood) => (
                              <option key={neighborhood} value={neighborhood}>
                                {neighborhood.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        ) : (
                          occurrence.neighborhood
                        )}
                      </td>
                    </tr>
                    <tr className="leading-tight">
                      <td className="text-gray-500 font-medium pr-2 py-0.5">
                        Endereço:
                      </td>
                      <td className="py-0.5 break-words">
                        {(isOperator || isAnalyst) &&
                        occurrence.status === "EmAnalise" &&
                        isEditing ? (
                          <input
                            type="text"
                            value={editableAddress}
                            onChange={(e) => setEditableAddress(e.target.value)}
                            className="w-full p-1 border rounded text-sm"
                          />
                        ) : (
                          occurrence.address
                        )}
                      </td>
                    </tr>
                    <tr className="leading-tight">
                      <td className="text-gray-500 font-medium pr-2 py-0.5">
                        CEP:
                      </td>
                      <td className="py-0.5">{occurrence.zip_code}</td>
                    </tr>
                    <tr className="leading-tight">
                      <td className="text-gray-500 font-medium pr-2 py-0.5">
                        Setor:
                      </td>
                      <td className="py-0.5">
                        {isAnalyst &&
                        occurrence.status === "EmAnalise" &&
                        isEditing ? (
                          <select
                            value={editableSectorId ?? ""}
                            onChange={(e) =>
                              setEditableSectorId(Number(e.target.value))
                            }
                            className="w-full p-1 border rounded text-sm"
                          >
                            <option value="">Selecione o setor</option>
                            {allSectors.map((sector) => (
                              <option key={sector.id} value={sector.id}>
                                {sector.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          occurrence.sector?.name || "-"
                        )}
                      </td>
                    </tr>

                    <tr className="leading-tight">
                      <td className="text-gray-500 font-medium pr-2 py-0.5">
                        Ocorrência:
                      </td>
                      <td className="py-0.5 break-words">
                        {occurrence.description}
                      </td>
                    </tr>
                    {(user.role === "admin" || user.role === "gestor") && (
                      <tr className="leading-tight">
                        <td className="text-gray-500 font-medium pr-2 py-0.5">
                          Ignorada por:
                        </td>
                        <td className="py-0.5">
                          {occurrence.observation || "Não ignorada"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3">
                <div className="h-[250px] rounded-lg overflow-visible relative">
                  <div className="absolute inset-0 mx-6">
                    <ImageCarousel
                      occurrence={occurrence}
                      onDeleteImage={handleDeleteImage}
                    />
                  </div>
                </div>

                <div className="h-[250px] rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0">
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

              <div className="flex flex-col gap-3">
                {occurrence.status === "EmFila" && (
                  <>
                    <Button
                      className="w-full bg-[#FD3E3E] hover:bg-[#E03131]"
                      onClick={() =>
                        handleIgnoreOccurrence(occurrence.id, occurrence.status)
                      }
                    >
                      Ignorar
                    </Button>
                    <Button
                      className="w-full bg-[#42F97E] hover:bg-[#38D86E]"
                      onClick={() => handleCreateServiceOrder(occurrence.id)}
                    >
                      Autorizar
                    </Button>
                  </>
                )}

                {occurrence.status === "EmAnalise" && (
                  <>
                    <Button
                      className="w-full bg-[#FD3E3E]"
                      onClick={() => {
                        setSelectedOccurrenceId(occurrence.id);
                        setIsIgnoreOcurrenceModalOpen(true);
                        setSelectedOccurrenceStatus(occurrence.status);
                      }}
                    >
                      Ignorar
                    </Button>
                    <Button
                      className="w-full bg-[#42F97E]"
                      onClick={() => handleValidatePhoto(occurrence.id)}
                    >
                      Aceitar
                    </Button>
                  </>
                )}

                {(isOperator || isAnalyst) &&
                  occurrence.status === "EmAnalise" && (
                    <>
                      {isEditing ? (
                        <>
                          <Button
                            className="w-full bg-[#4287f5] hover:bg-[#3a75d8]"
                            onClick={() => handleSaveEdits(occurrence.id)}
                          >
                            Salvar Alterações
                          </Button>
                          <Button
                            className="w-full bg-[#FD3E3E] hover:bg-[#E03131]"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full bg-[#f5a742] hover:bg-[#d89638]"
                          onClick={() => setIsEditing(true)}
                        >
                          Editar Informações
                        </Button>
                      )}
                    </>
                  )}
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[270px] font-inter bg-gray-50">
      <Sidebar />
      <header className="flex justify-between items-center border-b py-4 px-4 sm:px-8 bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
            Ocorrências Terrestres
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LiveActionButton />
        </div>
      </header>

      <div className="px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Ocorrências Terrestres
        </h1>
        <Filters
          text="Ocorrências Terrestres"
          onFilterRecent={(order) => setFilterRecent(order)}
          onFilterType={(type) => setFilterType(type)}
          onFilterDateRange={(range) => setFilterDateRange(range)}
          onSearch={(input) => setSearchTerm(input)}
          onFilterNeighborhood={(neighborhood) =>
            setFilterNeighborhood(neighborhood)
          }
          handleApplyFilters={handleApplyFilters}
        />
      </div>

      <div className="flex-1 p-4">
        {isMobile ? (
          <div className="space-y-4">
            {filteredOccurrences.map(renderMobileCard)}
          </div>
        ) : (
          <Card className="shadow-md rounded-lg overflow-hidden border-0">
            <div className="overflow-x-auto">
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
                      <TableRow
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleRow(occurrence.id)}
                      >
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
                        <TableCell>{occurrence.zone}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-600">
                              {getInicials(occurrence.data[0]?.pilot?.name) ||
                                "N/A"}
                            </span>
                            {occurrence.pilot?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>{occurrence.neighborhood}</TableCell>
                        <TableCell>{occurrence.quantity}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 hover:bg-gray-100 transition-colors"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Exibir
                          </Button>
                        </TableCell>
                        <TableCell>
                          {format(new Date(occurrence.date_time), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              occurrence.status === "Resolvido"
                                ? "bg-purple-100 text-purple-800" // Resolvido
                                : occurrence.status === "EmAndamento"
                                ? "bg-yellow-100 text-yellow-800" // EmAndamento
                                : occurrence.status === "EmAnalise"
                                ? "bg-blue-100 text-blue-800" // EmAnálise
                                : occurrence.status === "EmFila"
                                ? "bg-red-100 text-red-800" // EmFila
                                : "bg-orange-100 text-orange-800" // Pendente
                            }`}
                          >
                            {occurrence.status}
                          </span>
                        </TableCell>
                        {user.role === "admin" && (
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                occurrence.is_active === 1
                                  ? "bg-green-100 text-green-800" // Ativada
                                  : "bg-red-100 text-red-800" // Desativada
                              }`}
                            >
                              {occurrence.is_active === 1
                                ? "Ativa"
                                : "Desativada"}
                            </span>
                          </TableCell>
                        )}
                      </TableRow>
                      {expandedRows.has(occurrence.id) && (
                        <TableCell colSpan={10}>
                          <div className="p-6 bg-background rounded-lg">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
                              {/* Coluna 1 - Informações da ocorrência */}
                              <div className="flex flex-col justify-between h-full">
                                <div>
                                  <h3 className="font-semibold text-base border-b pb-2">
                                    Informações sobre a ocorrência
                                  </h3>
                                  <div className="text-sm space-y-1.5">
                                    <p>
                                      <strong>Enviado por:</strong>{" "}
                                      {occurrence.created_by || "N/A"}
                                    </p>
                                    <p>
                                      <strong>Ocorrência:</strong>{" "}
                                      {occurrence.description}
                                    </p>
                                    <p>
                                      <strong>Data:</strong>{" "}
                                      {format(
                                        new Date(occurrence.date_time),
                                        "dd/MM/yyyy 'às' HH:mm"
                                      )}
                                    </p>
                                    <p>
                                      <strong>Piloto:</strong>{" "}
                                      {occurrence.data[0]?.pilot?.name || "N/A"}
                                    </p>
                                    <p>
                                      <strong>Local:</strong>{" "}
                                      {occurrence.address}
                                    </p>
                                    <p>
                                      <strong>CEP:</strong>{" "}
                                      {occurrence.zip_code}
                                    </p>
                                    <p>
                                      <strong>Região:</strong> {occurrence.zone}
                                    </p>
                                    <p>
                                      <strong>Long:</strong>{" "}
                                      {occurrence.longitude_coordinate}
                                    </p>
                                    <p>
                                      <strong>Alt:</strong>{" "}
                                      {occurrence.latitude_coordinate}
                                    </p>
                                  </div>

                                  <div className="space-y-2 pt-4">
                                    <h4 className="font-medium text-sm">
                                      Anotações da ocorrência
                                    </h4>
                                    <textarea
                                      className="w-full border rounded p-2 text-sm"
                                      rows={3}
                                      value={editableAddress}
                                      onChange={(e) =>
                                        setEditableAddress(e.target.value)
                                      }
                                      placeholder="Descrição do Serviço"
                                    />
                                  </div>
                                </div>

                                <div className="pt-4">
                                  <Button
                                    className="w-full h-14 bg-[#FFE8E8] hover:bg-[#E03131] text-[#9D0000]"
                                    onClick={() =>
                                      handleIgnoreOccurrence(
                                        occurrence.id,
                                        occurrence.status
                                      )
                                    }
                                  >
                                    Devolver
                                  </Button>
                                </div>
                              </div>

                              {/* Coluna 2 - Programar O.S */}
                              <div className="flex flex-col justify-between h-full">
                                <div>
                                  <h3 className="font-semibold text-base border-b pb-2">
                                    Programar e gerar O.S.
                                  </h3>
                                  <input
                                    className="w-full h-10 p-2 border rounded text-sm mb-4"
                                    placeholder="Pavimentação"
                                  />
                                  <input
                                    className="w-full h-10 p-2 border rounded text-sm mb-4"
                                    placeholder="Danúbia Mendonça"
                                  />
                                  <input
                                    className="w-full h-10 p-2 border rounded text-sm mb-4"
                                    placeholder="Técnico Responsável"
                                  />
                                  <input
                                    className="w-full h-10 p-2 border rounded text-sm mb-4"
                                    placeholder="Encarregado"
                                  />
                                  <input
                                    className="w-full h-10 p-2 border rounded text-sm mb-4"
                                    placeholder="Equipe"
                                  />
                                  <input
                                    className="w-full h-10 p-2 border rounded text-sm mb-4"
                                    placeholder="Natureza do Serviço"
                                  />
                                  <input
                                    type="date"
                                    className="w-full h-9 p-2 border rounded text-sm mb-4"
                                    placeholder="Agendar serviço"
                                  />
                                </div>

                                <Button
                                  className="w-full h-14 bg-green-100 hover:bg-green-200 text-green-800"
                                  onClick={() =>
                                    handleCreateServiceOrder(occurrence.id)
                                  }
                                >
                                  Gerar O.S.
                                </Button>
                              </div>

                              {/* Coluna 3 - Imagem e mapa */}
                              <div className="flex flex-col justify-between h-full space-y-4">
                                <div className="h-[250px] overflow-hidden">
                                  <ImageCarousel
                                    occurrence={occurrence}
                                    onDeleteImage={handleDeleteImage}
                                  />
                                </div>
                                <div className="h-[250px] overflow-hidden">
                                  <GoogleMaps
                                    position={{
                                      lat: Number.parseFloat(
                                        occurrence.latitude_coordinate
                                      ),
                                      lng: Number.parseFloat(
                                        occurrence.longitude_coordinate
                                      ),
                                    }}
                                    label={occurrence.description}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      <footer className="border-t bg-white p-4 shadow-sm sticky bottom-0 z-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </footer>

      <IgnoreOccurrenceModal
        isOpen={isIgnoreOcurrenceModalOpen}
        onClose={() => setIsIgnoreOcurrenceModalOpen(false)}
        onConfirm={handleNotValidatePhoto}
        title={"Recusar ocorrência?"}
        message={"Indique o porque da ocorrência ser recusada."}
      />
    </div>
  );
}
