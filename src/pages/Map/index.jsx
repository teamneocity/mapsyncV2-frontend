"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { TrendingUp } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { GoogleMaps } from "@/components/googleMaps";

import Bars from "@/assets/icons/Bars.svg?react";

export function Map() {
  const mockData = [
    {
      id: 1,
      piloto: "Kelvin Marx",
      telefone: "79 00000-0000",
      data: "25/04/2025",
      bairro: "Cirurgia",
      endereco: "Rua Permínio de Souza...",
      cep: "46030-250",
      zona: "Sul",
      longitude: -37.07,
      latitude: -10.9,
      tempo: "102h",
      km: "253km",
      ocorrencias: 83,
      resolvidos: 71,
    },
    {
      id: 2,
      piloto: "Kelvin Marx",
      telefone: "79 00000-0000",
      data: "25/04/2025",
      bairro: "Cirurgia",
      endereco: "Rua Permínio de Souza...",
      cep: "46030-250",
      zona: "Sul",
      longitude: -37.07,
      latitude: -10.9,
      tempo: "102h",
      km: "253km",
      ocorrencias: 83,
      resolvidos: 71,
    },
    {
      id: 3,
      piloto: "Kelvin Marx",
      telefone: "79 00000-0000",
      data: "25/04/2025",
      bairro: "Cirurgia",
      endereco: "Rua Permínio de Souza...",
      cep: "46030-250",
      zona: "Sul",
      longitude: -37.07,
      latitude: -10.9,
      tempo: "102h",
      km: "253km",
      ocorrencias: 83,
      resolvidos: 71,
    },
    {
      id: 4,
      piloto: "Kelvin Marx",
      telefone: "79 00000-0000",
      data: "25/04/2025",
      bairro: "Cirurgia",
      endereco: "Rua Permínio de Souza...",
      cep: "46030-250",
      zona: "Sul",
      longitude: -37.07,
      latitude: -10.9,
      tempo: "102h",
      km: "253km",
      ocorrencias: 83,
      resolvidos: 71,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Gestão de Pilotos
        </h1>

        <Filters
          title="Mapa de"
          subtitle="Percurso"
          onSearch={() => {}}
          onFilterType={() => {}}
          onFilterRecent={() => {}}
          onFilterNeighborhood={() => {}}
          onFilterDateRange={() => {}}
          handleApplyFilters={() => {}}
        />
      </div>

      <div className="px-6 pb-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-6">
        {mockData.map((item) => {
          const [mapOpen, setMapOpen] = useState(false);
          const position = { lat: item.latitude, lng: item.longitude };

          return (
            <div
              key={item.id}
              className="bg-[#F7F7F7] rounded-2xl shadow-sm w-full max-h-[630px] overflow-y-auto sm:h-[630px] sm:overflow-hidden"
            >
              {/* MAPA */}
              <div className="relative w-full h-[315px] p-2">
                <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                  <DialogTrigger asChild>
                    <div className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer border">
                      <GoogleMaps
                        position={position}
                        label="Piloto"
                        hideControls
                      />
                      <div className="absolute left-1/2 top-1/2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg" />
                      <div className="absolute bottom-2 left-2 bg-white text-sm px-3 py-1 rounded-full shadow text-gray-600 z-20">
                        Por rua: {item.endereco}
                      </div>
                    </div>
                  </DialogTrigger>

                  <DialogContent className="max-w-5xl w-full h-[80vh]">
                    <GoogleMaps
                      position={position}
                      label="Piloto"
                      fullHeight
                      hideControls
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* CONTEÚDO */}
              <div className="px-2 pb-4 h-[315px] flex flex-col lg:flex-row gap-6 items-stretch">
                {/* Info piloto */}
                <div className="bg-white p-3 rounded-xl w-full max-w-[320px] text-[#787891] text-sm space-y-1">
                  <p>
                    <strong>Piloto:</strong> {item.piloto}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {item.telefone}
                  </p>
                  <p>
                    <strong>Data:</strong> {item.data}
                  </p>
                  <p>
                    <strong>Bairro:</strong> {item.bairro}
                  </p>
                  <p>
                    <strong>Endereço:</strong> {item.endereco}
                  </p>
                  <p>
                    <strong>CEP:</strong> {item.cep}{" "}
                    <strong className="ml-4">Zona:</strong> {item.zona}
                  </p>
                  <p>
                    <strong>Longitude:</strong> {item.longitude}
                  </p>
                  <p>
                    <strong>Latitude:</strong> {item.latitude}
                  </p>
                  <p>
                    <strong>Tempo de percurso:</strong> {item.tempo}
                  </p>
                  <p>
                    <strong>Km percorrido:</strong> {item.km}
                  </p>
                </div>

                {/* Indicadores atualizados */}
                <div className="flex flex-col justify-between w-full h-full gap-2">
                  {/* Ocorrências */}
                  <div className="bg-white rounded-xl border shadow px-4 pt-4 pb-2 flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-500">Ocorrências</p>
                      <div className="p-2 rounded-md border border-gray-200">
                        <Bars className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-3xl font-bold text-[#4B4B62]">
                        {item.ocorrencias}
                      </p>
                      <span className="text-xs font-semibold text-white bg-[#5D5FEF] px-2 py-[2px] rounded-full">
                        +5%
                      </span>
                    </div>

                    {/* Linha separadora */}
                    <div className="border-t border-gray-200 mt-3 pt-2 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1 text-[#5D5FEF]">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-semibold">+27.5%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Do mês passado</span>
                        <span className="text-black">&rarr;</span>
                      </div>
                    </div>
                  </div>

                  {/* Resolvidos */}
                  <div className="bg-white rounded-xl border shadow px-4 pt-4 pb-2 flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-500">Resolvidos</p>
                      <div className="p-2 rounded-md border border-gray-200">
                        <Bars className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-3xl font-bold text-[#4B4B62]">
                        {item.resolvidos}
                      </p>
                      <span className="text-xs font-semibold text-white bg-[#5D5FEF] px-2 py-[2px] rounded-full">
                        +5%
                      </span>
                    </div>

                    {/* Linha separadora */}
                    <div className="border-t border-gray-200 mt-3 pt-2 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1 text-[#5D5FEF]">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-semibold">+27.5%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Do mês passado</span>
                        <span className="text-black">&rarr;</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
