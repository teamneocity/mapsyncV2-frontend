"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Filters } from "@/components/filters";
import { LiveActionButton } from "@/components/live-action-button";
import { Pagination } from "@/components/pagination";
import { InspectionCard } from "./InspectionCard";
import { Link } from "react-router-dom";
import emurb from "../../assets/emurb.svg";

export function Inspection() {
  const [occurrences, setOccurrences] = useState([]);

  useEffect(() => {
    const mockData = [
      {
        id: "1",
        status: "os_gerada",
        imageUrl: "https://via.placeholder.com/500x200.png?text=Imagem+1/1",
        osNumber: "223565165",
        zone: "Zul",
        sector: "Pavimentação",
        sentBy: "Kelvin Marx",
        reviewedBy: "Anna Maria",
        neighborhood: "Cirurgia",
        address: "Rua Permínio de Souza",
        cep: "46030-250",
        longitude: "-10252456",
        altitude: "-358255",
        occurrenceType: "Pavimentação",
        timeline: {
          requested: "2025-04-29T00:24:00Z",
          accepted: "2025-04-29T00:24:00Z",
          started: "2025-04-29T00:24:00Z",
          finished: "2025-04-29T00:24:00Z",
        },
      },
      {
        id: "2",
        status: "finalizado",
        imageUrl: "https://via.placeholder.com/500x200.png?text=Imagem+1/1",
        osNumber: "823121233",
        zone: "Norte",
        sector: "Iluminação",
        sentBy: "Joana Prado",
        reviewedBy: "Carlos Souza",
        neighborhood: "Santos Dumont",
        address: "Rua das Flores",
        cep: "49032-000",
        longitude: "-10250000",
        altitude: "-320000",
        occurrenceType: "Iluminação Pública",
        timeline: {
          requested: "2025-04-27T14:00:00Z",
          accepted: "2025-04-28T08:00:00Z",
          started: "2025-04-28T10:00:00Z",
          finished: "2025-04-28T18:30:00Z",
        },
      },
      {
        id: "3",
        status: "os_gerada",
        imageUrl: "https://via.placeholder.com/500x200.png?text=Imagem+1/1",
        osNumber: "223565165",
        zone: "Zul",
        sector: "Pavimentação",
        sentBy: "Kelvin Marx",
        reviewedBy: "Anna Maria",
        neighborhood: "Cirurgia",
        address: "Rua Permínio de Souza",
        cep: "46030-250",
        longitude: "-10252456",
        altitude: "-358255",
        occurrenceType: "Pavimentação",
        timeline: {
          requested: "2025-04-29T00:24:00Z",
          accepted: "2025-04-29T00:24:00Z",
          started: "2025-04-29T00:24:00Z",
          finished: "",
        },
      },
      {
        id: "4",
        status: "os_gerada",
        imageUrl: "https://via.placeholder.com/500x200.png?text=Imagem+1/1",
        osNumber: "223565165",
        zone: "Zul",
        sector: "Pavimentação",
        sentBy: "Kelvin Marx",
        reviewedBy: "Anna Maria",
        neighborhood: "Cirurgia",
        address: "Rua Permínio de Souza",
        cep: "46030-250",
        longitude: "-10252456",
        altitude: "-358255",
        occurrenceType: "Pavimentação",
        timeline: {
          requested: "2025-04-29T00:24:00Z",
          accepted: "2025-04-29T00:24:00Z",
          started: "2025-04-29T00:24:00Z",
          finished: "2025-04-29T00:24:00Z",
        },
      },
    ];

    setOccurrences(mockData);
  }, []);

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
      <div className="px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Fiscalização de O.S.
        </h1>
        <Filters
          title="Fiscalização de"
          subtitle="ordem de serviço"
          onSearch={() => {}}
          onFilterType={() => {}}
          onFilterRecent={() => {}}
          onFilterNeighborhood={() => {}}
          onFilterDateRange={() => {}}
          handleApplyFilters={() => {}}
        />
      </div>

      {/* LISTA DE CARDS */}
      <div className="px-4 py-2 bg-[#EBEBEB]">
        <div className="overflow-x-auto">
          <div className="flex flex-col items-center justify-center md:flex-row md:items-start md:justify-start gap-4 w-max">
            {occurrences.map((occ) => (
              <InspectionCard key={occ.id} occurrence={occ} />
            ))}
          </div>
        </div>
      </div>

      {/* PAGINAÇÃO */}
      <footer className="bg-[#EBEBEB] p-4 mt-auto">
        <div className="max-w-full mx-auto">
          <Pagination
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        </div>
      </footer>
    </div>
  );
}
