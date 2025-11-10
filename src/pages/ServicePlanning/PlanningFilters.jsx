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

/*
 serbe para mecher mais no componente Filters original, adicionando o filtro de Encarregado
 */
export function PlanningFilters({
  title = "Planejamento",
  subtitle = "diário",
  onSearch,
  onFilterNeighborhood,
  onFilterType,
  onFilterStatus,
  onFilterDateRange,

  onFilterForeman = () => {},
}) {
  const [foremen, setForemen] = useState([]);
  const [selectedForeman, setSelectedForeman] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/foremen");

        const raw = Array.isArray(data) ? data : (data?.foremen ?? []);
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

  const handleForeman = (id) => {
    setSelectedForeman(id || null);
    onFilterForeman(id || null);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Seu Filters global, intacto */}
      <Filters
        title={title}
        subtitle={subtitle}
        contextType="padrao"
        showRecent={false}
        showDate={true}
        showCompany={false}
        onSearch={onSearch}
        onFilterNeighborhood={onFilterNeighborhood}
        onFilterType={onFilterType}
        onFilterStatus={onFilterStatus}
        onFilterDateRange={onFilterDateRange}
      />

      <div className="w-full bg-[#EBEBEB] px-1 pb-1 -mt-1">
        <div className="w-full flex items-center gap-2 md:gap-3 rounded-xl">
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
        </div>
      </div>
    </div>
  );
}
