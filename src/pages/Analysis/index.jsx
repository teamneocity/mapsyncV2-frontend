// Analysis.jsx

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ImageIcon, ChevronDown, ChevronRight, Menu } from "lucide-react";
import { format } from "date-fns";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { api } from "@/services/api";
import { getInicials } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUserSector } from "@/hooks/useUserSector";
import { IgnoreOccurrenceModal } from "@/components/ignoreOccurrenceModal";
import { GoogleMaps } from "@/components/googleMaps";
import { ImageCarousel } from "@/pages/OccurrencesT/imagecarousel";
import { LiveActionButton } from "@/components/live-action-button";
import { useAuth } from "@/hooks/auth";
import { useNavigate } from "react-router-dom";
import { useTransition, animated } from "react-spring";
import { ThumbsUp, ThumbsDown } from "lucide-react";

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

export function Analysis() {
  const { user } = useAuth();
  const { isAnalyst } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAnalyst) {
      navigate("/");
    }
  }, [isAnalyst, navigate]);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const { setor } = useUserSector();
  const { toast } = useToast();

  const [occurrences, setOccurrences] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editableDescription, setEditableDescription] = useState("");
  const [editableNeighborhood, setEditableNeighborhood] = useState("");
  const [editableAddress, setEditableAddress] = useState("");
  const [editableSectorId, setEditableSectorId] = useState(null);
  const [allSectors, setAllSectors] = useState([]);
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null);
  const [selectedOccurrenceStatus, setSelectedOccurrenceStatus] =
    useState(null);
  const [isIgnoreOcurrenceModalOpen, setIsIgnoreOcurrenceModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRecent, setFilterRecent] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAnalyst) return;
    api.get("/sectors").then((res) => setAllSectors(res.data.data));
  }, [isAnalyst]);

  useEffect(() => {
    fetchOccurrences(currentPage);
  }, [currentPage]);

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
        status: "EmAnalise", 
      };

      const res = await api.get("/land-occurrences", { params });

      setOccurrences(res.data.data); 
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar ocorrências",
        description: error.message,
      });
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchOccurrences(1);
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else {
        const occ = occurrences.find((o) => o.id === id);
        if (occ) {
          setEditableNeighborhood(occ.neighborhood);
          setEditableAddress(occ.address);
          setEditableSectorId(occ.sector?.id ?? null);
          setEditableDescription(occ.description || "");
        }
        copy.add(id);
      }
      return copy;
    });
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

  const handleForwardOccurrence = async (occurrenceId) => {
    try {
      // Salva as edições primeiro
      await api.put(`/land-occurrences/kelvin/${occurrenceId}`, {
        neighborhood: editableNeighborhood,
        address: editableAddress,
        sector_id: editableSectorId,
        description: editableDescription,
      });

      // Aceita a ocorrência
      await api.put(`/land-occurrences/accept/${occurrenceId}`);

      toast({ title: "Ocorrência encaminhada com sucesso!" });

      setIsEditing(false);
      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao encaminhar ocorrência",
        description: error.response?.data?.error || "Tente novamente.",
      });
      console.error(error);
    }
  };

  const handleDeleteImage = async (image, occurrenceId) => {
    try {
      await api.delete(`/occurrence/photo/${image.id}`);
      toast({ title: "Imagem excluída com sucesso" });
      fetchOccurrences(currentPage);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir imagem",
        description: error.message,
      });
    }
  };

  const transitions = useTransition(Array.from(expandedRows), {
    from: { opacity: 0, transform: "scaleY(0)", transformOrigin: "top" },
    enter: { opacity: 1, transform: "scaleY(1)" },
    leave: { opacity: 0, transform: "scaleY(0)" },
    keys: (item) => item,
    config: { tension: 250, friction: 20 },
  });

  return (
    <div className="w-full">
      <div className="flex min-h-screen flex-col sm:ml-[270px] font-inter bg-gray-50">
        <Sidebar />

        {/* Header */}
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
              Análises
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LiveActionButton />
          </div>
        </header>

        {/* Filtros */}
        <div className="px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
            Análises
          </h1>
          <Filters
            text="Análises de ocorrências via aplicativo"
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
                  {occurrences.map((occurrence) => (
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
                        </TableCell>
                      </TableRow>

                      {transitions((style, id) =>
                        id === occurrence.id ? (
                          <TableRow key={`expand-${id}`}>
                            <TableCell colSpan={10} className="p-0">
                              <animated.div
                                style={style}
                                className="overflow-hidden origin-top"
                              >
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm text-sm">
                                    {/* Coluna 1 - Informações */}
                                    <div className="flex flex-col justify-between space-y-4 h-full">
                                      <div className="space-y-1">
                                        <h3 className="font-semibold text-base mb-2 border-b pb-1">
                                          Informações sobre a ocorrência
                                        </h3>
                                        <p>
                                          <span className="text-gray-500 font-medium">
                                            Data:
                                          </span>{" "}
                                          {format(
                                            new Date(occurrence.date_time),
                                            "dd/MM/yyyy HH:mm"
                                          )}
                                        </p>
                                        <p>
                                          <span className="text-gray-500 font-medium">
                                            Piloto:
                                          </span>{" "}
                                          {occurrence.data[0]?.pilot?.name}
                                        </p>
                                        <p>
                                          <span className="text-gray-500 font-medium">
                                            Local:
                                          </span>{" "}
                                          {occurrence.address}
                                        </p>
                                        <p>
                                          <span className="text-gray-500 font-medium">
                                            CEP:
                                          </span>{" "}
                                          {occurrence.zip_code}
                                        </p>
                                        <p>
                                          <span className="text-gray-500 font-medium">
                                            Bairro:
                                          </span>{" "}
                                          {occurrence.neighborhood}
                                        </p>
                                        <p>
                                          <span className="text-gray-500 font-medium">
                                            Região:
                                          </span>{" "}
                                          {occurrence.zone}
                                        </p>
                                        <p>
                                          <span className="text-gray-500 font-medium">
                                            Tipo:
                                          </span>{" "}
                                          {occurrence.type}
                                        </p>
                                        <p>
                                          <span className="text-gray-500 font-medium">
                                            Setor atual:
                                          </span>{" "}
                                          {occurrence.sector?.name ||
                                            "Não informado"}
                                        </p>
                                      </div>
                                      <Button
                                        className="w-full bg-[#ffc8c8] hover:bg-[#ffadae] flex items-center justify-center gap-2"
                                        style={{ color: "#9D0000" }}
                                        onClick={() => {
                                          setSelectedOccurrenceId(
                                            occurrence.id
                                          );
                                          setIsIgnoreOcurrenceModalOpen(true);
                                          setSelectedOccurrenceStatus(
                                            occurrence.status
                                          );
                                        }}
                                      >
                                        Ignorar
                                        <ThumbsDown className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    {/* Coluna 2 - Edição */}
                                    <div className="flex flex-col justify-between space-y-4 h-full">
                                      <div className="space-y-4">
                                        <div>
                                          <label className="font-semibold block mb-1">
                                            Setor responsável
                                          </label>
                                          <select
                                            value={editableSectorId ?? ""}
                                            onChange={(e) =>
                                              setEditableSectorId(
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-full p-2 border rounded"
                                          >
                                            <option value="">
                                              Selecione o setor
                                            </option>
                                            {allSectors.map((sector) => (
                                              <option
                                                key={sector.id}
                                                value={sector.id}
                                              >
                                                {sector.name}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="font-semibold block mb-1">
                                            Anotações da ocorrência
                                          </label>
                                          <textarea
                                            rows={4}
                                            value={editableDescription}
                                            onChange={(e) =>
                                              setEditableDescription(
                                                e.target.value
                                              )
                                            }
                                            className="w-full p-2 border rounded"
                                            placeholder="Descrição do Serviço"
                                          />
                                        </div>
                                      </div>
                                      <Button
                                        className="w-full bg-[#FFF0E6] hover:bg-[#FFE0CC] text-orange-700 flex items-center justify-center gap-2"
                                        onClick={() =>
                                          handleForwardOccurrence(occurrence.id)
                                        }
                                      >
                                        Encaminhar
                                        <ThumbsUp className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    {/* Coluna 3 - Imagem e Mapa */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                      <div className="h-full rounded-lg overflow-hidden shadow bg-white flex items-center justify-center">
                                        <div className="w-full h-full">
                                          <ImageCarousel
                                            occurrence={occurrence}
                                            onDeleteImage={handleDeleteImage}
                                          />
                                        </div>
                                      </div>
                                      <div className="h-full rounded-lg overflow-hidden shadow bg-white flex items-center justify-center">
                                        <div className="w-full h-full">
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
                                </div>
                              </animated.div>
                            </TableCell>
                          </TableRow>
                        ) : null
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
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
    </div>
  );
}
