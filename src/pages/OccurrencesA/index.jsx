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

  const [street, setStreet] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [order, setOrder] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchInspections = async () => {
  try {
    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      ...(street && { street }),
      ...(neighborhoodId && { neighborhoodId }),
      ...(order && { order }),
      ...(type && { type }),
      ...(status && { status }),
      ...(startDate && {
        startDate: startDate.toISOString().split("T")[0],
      }),
      ...(endDate && { endDate: endDate.toISOString().split("T")[0] }),
    });

    const response = await api.get(
      `/aerial-inspections?${queryParams.toString()}`
    );

    const { inspections, totalCount } = response.data;
    setOccurrences(inspections);
    setTotalPages(Math.ceil(totalCount / 10));
  } catch (error) {
    console.error("Erro ao buscar inspeções:", error);
  }
};

useEffect(() => {
  fetchInspections(currentPage);
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
          onSearch={(value) => setStreet(value)}
          onFilterType={(value) => setType(value)}
          onFilterRecent={(value) => setOrder(value)}
          onFilterNeighborhood={(value) => setNeighborhoodId(value)}
          onFilterDateRange={(range) => {
            setStartDate(range?.startDate || null);
            setEndDate(range?.endDate || null);
          }}
          onFilterStatus={(value) => setStatus(value)} // se tiver disponível no componente
          handleApplyFilters={() => {
            setCurrentPage(1);
            fetchInspections();
          }}
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
