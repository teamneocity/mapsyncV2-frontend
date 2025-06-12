import { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRange } from '@/components/date-range';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


export function LogFilters({
  onFilterRecent,
  onFilterType,
  onFilterDateRange,
  handleApplyFilters,
  onSearch,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecent, setSelectedRecent] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRange, setSelectedRange] = useState({ from: null, to: null });


  // Função para resetar todos os filtros
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedRecent(null);
    setSelectedType(null);
    setSelectedRange({ from: null, to: null });

    onFilterRecent(null);
    onFilterType(null);
    onFilterDateRange({ startDate: null, endDate: null });
    onSearch("");

    // Refaz a busca sem filtros
    handleApplyFilters();
  };

  // Função para lidar com o filtro de "Recentes"
  const handleRecentFilter = (filter) => {
    setSelectedRecent(filter);
    onFilterRecent(filter === "Mais recentes" ? "desc" : "asc");
  };

  // Função para lidar com o filtro de tipo
  const handleTypeFilter = (type) => {
    setSelectedType(type);
    onFilterType(type);
  };




  // Função para lidar com o filtro de intervalo de datas
  const handleDateRangeChange = (range) => {
    if (range.from !== selectedRange.from || range.to !== selectedRange.to) {
      setSelectedRange(range);
      onFilterDateRange({ startDate: range.from, endDate: range.to });
    }
  };

  return (
    <form className="font-inter mt-6 flex flex-col gap-3 sm:ml-[270px] px-8">
      <div className='flex items-center gap-2 text-[#4B4B62]'>
        <DateRange selectedRange={selectedRange} onDateRangeChange={handleDateRangeChange} />

        <Select onValueChange={handleTypeFilter}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Selecione por Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="UPDATE">UPDATE</SelectItem>
          </SelectContent>
        </Select>

      </div>

      <div className='flex border rounded-[8px] items-center pr-3 h-9 text-[#4B4B62] text-sm'>
        <input
          type="text"
          className='outline-none w-full h-6 pl-3'
          placeholder='Digite o endereço de email'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch(e.target.value);
          }}
        />
        <Search size={20} />
      </div>

      <div className='text-[#4B4B62] text-sm flex justify-between items-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {selectedRecent || "Recentes"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleRecentFilter("Mais recentes")}>
              Mais recentes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRecentFilter("Mais antigos")}>
              Mais antigos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='flex gap-3'>
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
  );
}