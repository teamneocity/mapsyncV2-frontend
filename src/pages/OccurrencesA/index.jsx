"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { OccurrenceList } from "@/components/OccurrenceList";
import { ExpandedRowA } from "./ExpandedRowA";
import { api } from "@/services/api";
import { Pagination } from "@/components/pagination";

export function OccurrencesA() {
  const [occurrences, setOccurrences] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const response = await api.get("/aerial-inspections/");
        const data = Object.values(response.data);
        setOccurrences(data);
        setTotalPages(1); // ajustar se houver paginação futura
      } catch (error) {
        console.error("Erro ao buscar inspeções:", error);
      }
    };

    fetchInspections();
  }, [currentPage]);

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Ocorrências Aéreas
        </h1>

        <Filters
          title="Ocorrências" 
          subtitle="Aéreas"
          onSearch={() => {}}
          onFilterType={() => {}}
          onFilterRecent={() => {}}
          onFilterNeighborhood={() => {}}
          onFilterDateRange={() => {}}
          handleApplyFilters={() => {}}
        />
      </div>

      <OccurrenceList
        occurrences={occurrences}
        renderExpandedRow={(occ) => <ExpandedRowA occurrence={occ} />}
      />

      <footer className="bg-[#EBEBEB] p-4 mt-auto">
        <div className="max-w-full mx-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </footer>
    </div>
  );
}
