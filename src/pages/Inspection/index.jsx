"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Filters } from "@/components/filters";
import { LiveActionButton } from "@/components/live-action-button";
import { Pagination } from "@/components/pagination";
import { InspectionCard } from "./inspectionCard";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { api } from "@/services/api";
import { Link } from "react-router-dom";
import emurb from "../../assets/emurb.svg";

export function Inspection() {
  const { toast } = useToast();
  const { isAdmin, isSupervisor } = usePermissions();

  const [occurrences, setOccurrences] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterRecent, setFilterRecent] = useState(null);
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    if (!isAdmin && !isSupervisor) {
      window.location.href = "/";
    }
  }, [isAdmin, isSupervisor]);

  useEffect(() => {
    fetchServiceOrders(1);
  }, []);

  const fetchServiceOrders = async (page = 1) => {
    try {
      const response = await api.get("/service-orders", {
        params: {
          page,
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
        },
      });

      const result = response.data;
      setOccurrences(result.serviceorders || []);
      setCurrentPage(page);
      setHasNextPage(result.serviceorders?.length > 0);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar ordens de serviço",
        description: error.message,
      });
      setOccurrences([]);
      setHasNextPage(false);
    }
  };

  const handleApplyFilters = () => {
    fetchServiceOrders(1);
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />

      {/* HEADER */}
      <header className="flex justify-between items-center py-4 px-4 sm:px-8 bg-[#EBEBEB] sticky top-0 z-10">
        <div className="px-2 py-2">
          <Link to="/">
            <img
              src={emurb}
              alt="Logo EMURB"
              className="h-16 w-auto rounded-md"
            />
          </Link>
        </div>
        <LiveActionButton />
      </header>

      {/* FILTROS */}
      <div className="sticky top-[88px] z-10 bg-[#EBEBEB] px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Fiscalização de O.S.
        </h1>
        <Filters
          title="Fiscalização de"
          subtitle="Ordens de serviço"
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

      {/* LISTA DE CARDS */}
      <div className="px-4 py-2 bg-[#EBEBEB]">
        <div className="w-full p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-6 place-items-center">
            {occurrences.map((order) => (
              <InspectionCard key={order.id} serviceorder={order} />
            ))}
          </div>
        </div>
      </div>

      {/* PAGINAÇÃO */}
      <footer className="sticky bottom-0 z-10 bg-[#EBEBEB] p-4 ">
        <div className="max-w-full mx-auto">
          <Pagination
            onPageChange={fetchServiceOrders}
            hasNextPage={hasNextPage}
          />
        </div>
      </footer>
    </div>
  );
}
