"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "./date-range";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Stroke from "@/assets/icons/Stroke.svg?react";
import { api } from "@/services/api";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export function Filters({
  children,
  text,
  onFilterRecent = () => {},
  onFilterType = () => {},
  onFilterDateRange = () => {},
  onFilterNeighborhood = () => {},
  onFilterStatus = () => {},
  onFilterCompany = () => {},
  onFilterForeman = () => {},
  handleApplyFilters,
  onSearch = () => {},

  contextType = "padrao",

  showRecent = true,
  showType = true,
  showDate = true,
  showNeighborhood = true,
  showStatus = true,
  showCompany = true,
  showForeman = false,
  foremanEndpoint = "/users?role=FOREMAN",

  // apenas para OS / Planejamento
  showDelayed = false,
  isDelayedFilter = false,
  onToggleDelayed = () => {},
}) {
  const [selectedRecent, setSelectedRecent] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRange, setSelectedRange] = useState({ from: null, to: null });
  const [neighborhoods, setNeighborhoods] = useState([]);

  const [foremen, setForemen] = useState([]);
  const [selectedForeman, setSelectedForeman] = useState(null);

  const [neighborhoodQuery, setNeighborhoodQuery] = useState("");
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);

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

  useEffect(() => {
    if (!showForeman) return;

    async function fetchForemen() {
      try {
        const { data } = await api.get(foremanEndpoint);

        const raw = data?.foremen ?? data?.users ?? data ?? [];

        const normalized = Array.isArray(raw)
          ? raw.map((u) => ({
              id: u.id || u.userId || u.uuid,
              name:
                u.name ||
                u.fullName ||
                u.displayName ||
                u.username ||
                u.email ||
                "Sem nome",
            }))
          : [];

        setForemen(normalized.filter((f) => f?.id && f?.name));
      } catch (error) {
        console.error("Erro ao buscar encarregados:", error);
      }
    }

    fetchForemen();
  }, [showForeman, foremanEndpoint]);

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
    setNeighborhoodQuery("");
    onFilterNeighborhood(neighborhoodId);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    onFilterStatus(status);
  };

  const handleCompanyFilter = (company) => {
    setSelectedCompany(company);
    onFilterCompany(company);
  };

  const handleDateRangeChange = (range) => {
    if (!range || !range.from || !range.to) return;
    if (range.from !== selectedRange.from || range.to !== selectedRange.to) {
      setSelectedRange(range);
      onFilterDateRange({ startDate: range.from, endDate: range.to });
    }
  };

  const handleForemanFilter = (id) => {
    setSelectedForeman(id);
    onFilterForeman(id || null);
  };

  // filtro local dos bairros pela busca
  const filteredNeighborhoods = useMemo(() => {
    const q = (neighborhoodQuery || "").trim().toLowerCase();
    if (!q) return neighborhoods;
    return neighborhoods.filter((n) => n.name?.toLowerCase().includes(q));
  }, [neighborhoods, neighborhoodQuery]);

  const handleNeighborhoodQueryKeyDown = (e) => {
    if (e.key === "Enter") {
      const first = filteredNeighborhoods?.[0];
      if (first) {
        handleNeighborhoodFilter(first.id);
        setNeighborhoodOpen(false);
      }
    }
  };

  const statusOptions = {
    padrao: [
      { value: "em_execucao", label: "Andamento" },
      { value: "aguardando_execucao", label: "Agendada" },
      { value: "finalizada", label: "Finalizada" },
    ],
    mapeamento: [
      { value: "os_gerada", label: "OS Gerada" },
      { value: "aprovada", label: "Aprovadas" },
    ],
    aerea: [
      { value: "aceita", label: "Aceita" },
      { value: "pendente", label: "Pendente" },
      { value: "verificada", label: "Verificada" },
      { value: "rejeitada", label: "Rejeitada" },
    ],
    analise: [{ value: "recusada", label: "Recusada" }],
  };

  const currentStatusList = statusOptions[contextType] || statusOptions.padrao;

  return (
    <header className="w-full bg-[#EBEBEB] px-1 py-1">
      <div className="w-full flex flex-wrap items-center justify-start gap-2 md:gap-3 rounded-xl">

        {/* Rua + Bairro */}
        <div className="flex flex-col sm:flex-row gap-2 flex-1 md:min-w-[320px]">
          <Input
            placeholder="Pesquise pela rua, avenida e número de protocolo"
            onChange={(e) => onSearch(e.target.value)}
            hideRing
            className="text-sm h-12 w-full sm:flex-1 rounded-xl border-none shadow-sm placeholder:text-[#4B4B62] truncate"
          />
          {showNeighborhood && (
            <Popover open={neighborhoodOpen} onOpenChange={setNeighborhoodOpen}>
              <PopoverTrigger asChild>
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
              </PopoverTrigger>

              <PopoverContent align="start" className="w-[200px] p-0">
                {/* Campo de busca */}
                <div className="sticky top-0 bg-white p-2 border-b">
                  <Input
                    autoFocus
                    value={neighborhoodQuery}
                    onChange={(e) => setNeighborhoodQuery(e.target.value)}
                    onKeyDown={handleNeighborhoodQueryKeyDown}
                    placeholder="Digite o nome do bairro…"
                    className="h-9 text-sm"
                  />
                </div>

                {/* Lista scrollável */}
                <div className="max-h-[320px] overflow-y-auto py-1">
                  <div className="px-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleNeighborhoodFilter(null);
                        setNeighborhoodOpen(false);
                      }}
                      className="w-full text-left px-2 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm"
                    >
                      Todos os bairros
                    </button>
                  </div>

                  {filteredNeighborhoods.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      Nenhum bairro encontrado
                    </div>
                  ) : (
                    filteredNeighborhoods.map((n) => (
                      <div key={n.id} className="px-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleNeighborhoodFilter(n.id);
                            setNeighborhoodOpen(false);
                          }}
                          className="w-full text-left px-2 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm"
                        >
                          {n.name}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        {/* Encarregado */}
        {showForeman && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2 h-12 justify-between rounded-xl border-none shadow-sm text-[#4B4B62]"
              >
                {selectedForeman
                  ? `Encarregado: ${
                      foremen.find((f) => f.id === selectedForeman)?.name || "—"
                    }`
                  : "Encarregado"}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="max-h-[320px] overflow-y-auto">
              <DropdownMenuItem onClick={() => handleForemanFilter(null)}>
                Todos
              </DropdownMenuItem>

              {foremen.map((f) => (
                <DropdownMenuItem
                  key={f.id}
                  onClick={() => handleForemanFilter(f.id)}
                >
                  {f.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {/* Recentes */}
        {showRecent && (
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
        )}
        {/* Tipo */}
        {showType && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:min-w-[200px] sm:max-w-[300px] gap-2 h-12 px-3 justify-between rounded-xl border-none shadow-sm text-[#4B4B62] truncate"
              >
                <span className="truncate">Tipo de ocorrência</span>
                <Stroke className="ml-1 h-4 w-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleTypeFilter(null)}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeFilter("TAPA_BURACO")}>
                Asfalto
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTypeFilter("DESOBSTRUCAO")}
              >
                Drenagem
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTypeFilter("DESOBSTRUCAO_CAMINHAO")}
              >
                Desobstrução
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeFilter("LIMPA_FOSSA")}>
                Limpa Fossa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTypeFilter("TERRAPLANAGEM")}
              >
                Terraplanagem
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeFilter("LOGRADOURO")}>
                Logradouro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeFilter("MEIO_FIO")}>
                Meio fio
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTypeFilter("AUSENCIA_DE_MEIO_FIO")}
              >
                Ausência de meio fio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {/* Companhia */}
        {showCompany && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2 h-12 justify-between rounded-xl border-none shadow-sm text-[#4B4B62]"
              >
                {selectedCompany === "SERGAS"
                  ? "Companhia: SERGAS"
                  : selectedCompany === "IGUA"
                  ? "Companhia: IGUA"
                  : "Companhia"}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleCompanyFilter(null)}>
                Todas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCompanyFilter("SERGAS")}>
                SERGAS
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCompanyFilter("IGUA")}>
                IGUA
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {/* Status */}
        {showStatus && (
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
                  : selectedStatus === "verificada"
                  ? "Verificada"
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
              {currentStatusList.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => handleStatusFilter(status.value)}
                >
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {/* Somente atrasadas (apenas OS / Planejamento) */}
        {showDelayed && (
          <Button
            type="button"
            onClick={() => onToggleDelayed(!isDelayedFilter)}
            variant="outline"
            className={`
      w-full sm:w-auto gap-2 h-12 justify-between rounded-xl shadow-sm
      text-[#4B4B62]
      border-none
      ${
        isDelayedFilter
          ? "bg-[#4B4B62] text-white font-medium shadow-md"
          : "bg-white hover:bg-gray-100"
      }
    `}
          >
            {isDelayedFilter ? "Somente atrasadas" : "Incluir atrasadas"}
          </Button>
        )}
        {children}
        {/* Data */}
        {showDate && (
          <div className="w-full md:w-auto">
            <DateRange
              selectedRange={selectedRange}
              onDateRangeChange={handleDateRangeChange}
              className="h-9 text-[#4B4B62]"
            />
          </div>
        )}
      </div>
    </header>
  );
}
