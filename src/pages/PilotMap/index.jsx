"use client";

// React e bibliotecas externas
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,         
  DialogDescription,   
} from "@/components/ui/dialog";

import { GoogleMaps } from "@/components/googleMaps";

// Serviços e utilitários
import { api } from "@/services/api";

// Assets
import Bars from "@/assets/icons/Bars.svg?react";

export function PilotMap() {
  const [pilots, setPilots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapOpenId, setMapOpenId] = useState(null);

  useEffect(() => {
    async function fetchPilotsWithStatusAndMetrics() {
      try {
        // 1. Buscar métricas (todos os pilotos)
        const metricsRes = await api.get("/metrics/pilots/occurrences");
        const metricsData = metricsRes.data.metrics;

        // 2. Buscar turnos de hoje (apenas quem está em turno)
        const shiftsRes = await api.get(
          `/shifts/pilot/?date=${format(new Date(), "yyyy-MM-dd")}`
        );
        const shiftsMap = new Map();
        shiftsRes.data.shifts.forEach((pilot) => {
          shiftsMap.set(pilot.pilotId, pilot);
        });

        // 3. Montar lista final com base em TODOS os pilotos das métricas
        const pilotList = await Promise.all(
          metricsData.map(async (m) => {
            const shiftPilot = shiftsMap.get(m.pilotId);
            const latestShift = shiftPilot?.shifts?.at(-1);
            const lastPoint = latestShift?.locationPoints?.at(-1);

            let distance = "----";
            let duration = "----";

            if (latestShift) {
              try {
                const statsRes = await api.get(
                  `/shifts/${m.pilotId}/stats?date=${format(
                    new Date(),
                    "yyyy-MM-dd"
                  )}`
                );
                const stats = statsRes.data;
                distance = `${stats.distance.toFixed(2)} km`;
                duration = `${(stats.duration * 60).toFixed(1)} min`;
              } catch (err) {
                console.warn("Stats não encontrados para:", m.pilotId);
              }
            }

            return {
              id: m.pilotId,
              name: m.pilotName,
              latitude: lastPoint?.latitude ?? "----",
              longitude: lastPoint?.longitude ?? "----",
              data: latestShift
                ? new Date(latestShift.startedAt).toLocaleDateString("pt-BR")
                : "----",
              endereco: "Localização dinâmica",
              bairro: "Desconhecido",
              cep: "----",
              zona: "----",
              shiftStatus: latestShift
                ? latestShift.endedAt
                  ? "Turno finalizado"
                  : "Turno em andamento"
                : "Sem turno",
              stats: {
                tempo: duration,
                km: distance,
                ocorrencias: m.createdOccurrences.currentMonth,
                resolvidos: m.finalizedOccurrences.currentMonth,
                diffOcorrencias: m.createdOccurrences.difference,
                diffResolvidos: m.finalizedOccurrences.difference,
              },
            };
          })
        );

        setPilots(pilotList);
      } catch (err) {
        console.error("Erro ao buscar dados dos pilotos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPilotsWithStatusAndMetrics();
  }, []);

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

      <div className="px-4 py-2 bg-[#EBEBEB]">
        <div className="w-full p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-6 place-items-center [&>div]:min-h-[600px] [&>div]:w-full">
            {pilots.map((item, index) => {
              const isOpen = mapOpenId === item.id;
              const position = { lat: item.latitude, lng: item.longitude };

              return (
                <div
                  key={item.id || index}
                  className="bg-[#F7F7F7] rounded-2xl shadow-sm w-full h-[630px] overflow-hidden flex flex-col min-w-0 break-words"
                >
                  {/* MAPA */}
                  <div className="relative w-full h-[315px] p-2 shrink-0">
                    <Dialog
                      open={isOpen}
                      onOpenChange={(open) =>
                        setMapOpenId(open ? item.id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <div className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer border">
                          <GoogleMaps
                            position={position}
                            label={item.name}
                            hideControls
                          />
                          <div className="absolute left-1/2 top-1/2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg" />
                          <div className="absolute bottom-2 left-2 bg-white text-sm px-3 py-1 rounded-full shadow text-gray-600 z-20">
                            Por rua: {item.endereco}
                          </div>
                        </div>
                      </DialogTrigger>

                      <DialogContent className="max-w-5xl w-full h-[80vh]">
                        <DialogTitle className="sr-only">
                          Mapa do piloto
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          Este modal mostra a localização atual do piloto em
                          tempo real.
                        </DialogDescription>

                        <GoogleMaps
                          position={position}
                          label="Piloto"
                          fullHeight
                          hideControls
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* CONTEÚDO COM SCROLL */}
                  <div className="overflow-y-auto px-2 pb-4 flex-1">
                    <div className="flex flex-col xl:flex-row gap-6 items-stretch min-w-0">
                      {/* Info piloto */}
                      <div className="bg-white p-3 rounded-xl w-full max-w-[440px] xl:max-w-[320px] text-[#787891] text-sm space-y-1 break-words min-w-0">
                        <p>
                          <strong>Status:</strong>{" "}
                          <span
                            className={`px-2 py-[2px] rounded-full text-xs font-semibold ${
                              item.shiftStatus === "Turno em andamento"
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.shiftStatus}
                          </span>
                        </p>

                        <p className="break-words">
                          <strong>Piloto:</strong> {item.name}
                        </p>
                        <p className="break-words">
                          <strong>Telefone:</strong> Não informado
                        </p>
                        <p className="break-words">
                          <strong>Data:</strong> {item.data}
                        </p>
                        <p className="break-words">
                          <strong>Bairro:</strong> {item.bairro}
                        </p>
                        <p className="break-words">
                          <strong>CEP:</strong> {item.cep}
                          <strong className="ml-4">Zona:</strong> {item.zona}
                        </p>
                        <p className="break-words">
                          <strong>Endereço:</strong> {item.endereco}
                        </p>
                        <p className="break-words">
                          <strong>Longitude:</strong> {item.longitude}
                        </p>
                        <p className="break-words">
                          <strong>Latitude:</strong> {item.latitude}
                        </p>
                        <p className="break-words">
                          <strong>Tempo de percurso:</strong> {item.stats.tempo}
                        </p>
                        <p className="break-words">
                          <strong>Km percorrido:</strong> {item.stats.km}
                        </p>
                      </div>

                      {/* Indicadores */}
                      <div className="flex flex-col justify-between w-full h-full gap-2 min-w-0">
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
                              {item.stats.ocorrencias}
                            </p>
                            <span className="text-xs font-semibold text-white bg-[#5D5FEF] px-2 py-[2px] rounded-full">
                              {item.stats.diffOcorrencias > 0 ? "+" : ""}
                              {item.stats.diffOcorrencias}%
                            </span>
                          </div>

                          <div className="border-t border-gray-200 mt-3 pt-2 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1 text-[#5D5FEF]">
                              <TrendingUp className="w-3 h-3" />
                              <span className="font-semibold">
                                {item.stats.diffOcorrencias > 0 ? "+" : ""}
                                {item.stats.diffOcorrencias}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">
                                Do mês passado
                              </span>
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
                              {item.stats.resolvidos}
                            </p>
                            <span className="text-xs font-semibold text-white bg-[#5D5FEF] px-2 py-[2px] rounded-full">
                              {item.stats.diffResolvidos > 0 ? "+" : ""}
                              {item.stats.diffResolvidos}%
                            </span>
                          </div>

                          <div className="border-t border-gray-200 mt-3 pt-2 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1 text-[#5D5FEF]">
                              <TrendingUp className="w-3 h-3" />
                              <span className="font-semibold">
                                {item.stats.diffResolvidos > 0 ? "+" : ""}
                                {item.stats.diffResolvidos}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">
                                Do mês passado
                              </span>
                              <span className="text-black">&rarr;</span>
                            </div>
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
      </div>
    </div>
  );
}
