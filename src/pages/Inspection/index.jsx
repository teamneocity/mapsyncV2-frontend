"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Filters } from "@/components/filters";
import { LiveActionButton } from "@/components/live-action-button";
import { Pagination } from "@/components/pagination";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import logoEmurb from "../../assets/logoEmurb.png";

export function Inspection() {
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterRecent, setFilterRecent] = useState(null);
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const handleApplyFilters = () => {
    console.log("Aplicar filtros:", {
      searchTerm,
      filterType,
      filterRecent,
      filterNeighborhood,
      filterDateRange,
    });
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />

      <header className="flex justify-between items-center py-4 px-4 sm:px-8 bg-[#EBEBEB] sticky top-0 z-10">
        <div className="px-2 py-2">
          <Link to="/">
            <img
              src={logoEmurb}
              alt="Logo EMURB"
              className="h-16 w-auto rounded-md"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LiveActionButton />
        </div>
      </header>

      <div className="px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Fiscalização de O.S.
        </h1>
        <Filters
          title="Fiscalização de"
          subtitle="ordem de serviço"
          onSearch={(input) => setSearchTerm(input)}
          onFilterType={(type) => setFilterType(type)}
          onFilterRecent={(order) => setFilterRecent(order)}
          onFilterNeighborhood={(neighborhood) =>
            setFilterNeighborhood(neighborhood)
          }
          onFilterDateRange={(range) => setFilterDateRange(range)}
          handleApplyFilters={handleApplyFilters}
        />
      </div>

      <div className="px-4 text-center text-gray-600">
        Em breve: listagem de ordens para fiscalização
      </div>

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
