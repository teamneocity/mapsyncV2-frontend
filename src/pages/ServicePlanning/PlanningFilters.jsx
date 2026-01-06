"use client";

import { useEffect, useState } from "react";
import { Filters } from "@/components/filters";
import { api } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function PlanningFilters({
  onSearch,
  onFilterNeighborhood,
  onFilterType,
  onFilterStatus,
  onFilterDateRange,

  onFilterSector = () => {},
  onFilterForeman = () => {},

  isDelayedFilter = false,
  onToggleDelayed = () => {},
}) {
  // Encarregados
  const [foremen, setForemen] = useState([]);
  const [selectedForeman, setSelectedForeman] = useState(null);

  // Setores
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);

  // Busca encarregados
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/foremen");

        const raw = Array.isArray(data) ? data : data?.foremen ?? [];
        const normalized = raw
          .map((u) => ({
            id: u?.id || u?.userId || u?.uuid,
            name:
              u?.name ||
              u?.fullName ||
              u?.displayName ||
              u?.username ||
              u?.email ||
              "Sem nome",
          }))
          .filter((f) => f.id && f.name);

        if (mounted) setForemen(normalized);
      } catch (err) {
        console.error("Erro ao buscar encarregados:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Busca setores
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await api.get("/sectors/names");

        const normalized = Array.isArray(data?.sectors) ? data.sectors : [];

        if (mounted) setSectors(normalized);
      } catch (err) {
        console.error("Erro ao buscar setores:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleForeman = (id) => {
    const value = id || null;
    setSelectedForeman(value);
    onFilterForeman(value);
  };

  const handleSector = (id) => {
    const value = id || null;
    setSelectedSector(value);
    onFilterSector(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <Filters
        contextType="padrao"
        showRecent={false}
        showDate={true}
        showCompany={false}
        onSearch={onSearch}
        onFilterNeighborhood={onFilterNeighborhood}
        onFilterType={onFilterType}
        onFilterStatus={onFilterStatus}
        onFilterDateRange={onFilterDateRange}
        showDelayed={true}
        isDelayedFilter={isDelayedFilter}
        onToggleDelayed={onToggleDelayed}
      >
        {/* Encarregado */}
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
            <DropdownMenuItem onClick={() => handleForeman(null)}>
              Todos
            </DropdownMenuItem>
            {foremen.map((f) => (
              <DropdownMenuItem key={f.id} onClick={() => handleForeman(f.id)}>
                {f.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Setor */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2 h-12 justify-between rounded-xl border-none shadow-sm text-[#4B4B62]"
            >
              {selectedSector
                ? `Setor: ${
                    sectors.find((s) => s.id === selectedSector)?.name || "—"
                  }`
                : "Setor"}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="max-h-[320px] overflow-y-auto">
            <DropdownMenuItem onClick={() => handleSector(null)}>
              Todos
            </DropdownMenuItem>
            {sectors.map((s) => (
              <DropdownMenuItem key={s.id} onClick={() => handleSector(s.id)}>
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Filters>
    </div>
  );
}
