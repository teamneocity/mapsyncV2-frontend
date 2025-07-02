"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { TrendingUp } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { GoogleMaps } from "@/components/googleMaps";
import { api } from "@/services/api";
import { format } from "date-fns";

import Bars from "@/assets/icons/Bars.svg?react";

export function PilotMap() {
  const [pilots, setPilots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapOpenId, setMapOpenId] = useState(null);

  useEffect(() => {
    async function fetchPilotsWithStatusAndMetrics() {
      try {
        // 1. Buscar métricas (ocorrências)
        const metricsRes = await api.get("/metrics/pilots/occurrences");
        const metricsMap = new Map();
        metricsRes.data.metrics.forEach((m) => {
          metricsMap.set(m.pilotId, {
            ocorrencias: m.createdOccurrences.currentMonth,
            resolvidos: m.finalizedOccurrences.currentMonth,
            diffOcorrencias: m.createdOccurrences.difference,
            diffResolvidos: m.finalizedOccurrences.difference,
          });
        });

        // 2. Buscar shifts de hoje
        const shiftsRes = await api.get(
          `/shifts/pilot/?date=${format(new Date(), "yyyy-MM-dd")}`
        );

        // 3. Montar lista com status de turno
        const pilotList = await Promise.all(
          shiftsRes.data.shifts.map(async (pilot) => {
            const latestShift = pilot.shifts[pilot.shifts.length - 1];
            const lastPoint =
              latestShift?.locationPoints?.[
                latestShift.locationPoints.length - 1
              ];

            let distance = "----";
            let duration = "----";

            try {
              const statsRes = await api.get(
                `/shifts/${pilot.pilotId}/stats?date=${format(
                  new Date(),
                  "yyyy-MM-dd"
                )}`
              );
              const stats = statsRes.data;
              distance = `${stats.distance.toFixed(2)} km`;
              duration = `${(stats.duration * 60).toFixed(1)} min`;
            } catch (err) {
              console.warn("Stats não encontrados para:", pilot.pilotId);
            }

            const metric = metricsMap.get(pilot.pilotId) || {
              ocorrencias: 0,
              resolvidos: 0,
              diffOcorrencias: 0,
              diffResolvidos: 0,
            };

            return {
              id: pilot.pilotId,
              name: pilot.pilotName,
              latitude: lastPoint?.latitude ?? "----",
              longitude: lastPoint?.longitude ?? "----",
              data: new Date(latestShift?.startedAt).toLocaleDateString(
                "pt-BR"
              ),
              endereco: "Localização dinâmica",
              bairro: "Desconhecido",
              cep: "----",
              zona: "----",
              shiftStatus: latestShift.endedAt
                ? "Turno finalizado"
                : "Turno em andamento",
              stats: {
                tempo: duration,
                km: distance,
                ...metric,
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

      <div className="px-6 pb-10 grid grid-cols-1 sm:[grid-template-columns:repeat(auto-fit,_minmax(384px,_1fr))] gap-x-4 gap-y-6">
        {pilots.map((item, index) => {
          const isOpen = mapOpenId === item.id;
          const position = { lat: item.latitude, lng: item.longitude };

          return (
            <div
              key={item.id || index}
              className="bg-[#F7F7F7] rounded-2xl shadow-sm w-full max-h-[630px] overflow-y-auto sm:h-[630px] sm:overflow-hidden"
            >
              {/* MAPA */}
              <div className="relative w-full h-[315px] p-2">
                <Dialog
                  open={isOpen}
                  onOpenChange={(open) => setMapOpenId(open ? item.id : null)}
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

                  <p>
                    <strong>Piloto:</strong> {item.name}
                  </p>
                  <p>
                    <strong>Telefone:</strong> Não informado
                  </p>
                  <p>
                    <strong>Data:</strong> {item.data}
                  </p>
                  <p>
                    <strong>Bairro:</strong> {item.bairro}
                  </p>

                  <p>
                    <strong>CEP:</strong> {item.cep}
                    <strong className="ml-4">Zona:</strong> {item.zona}
                  </p>
                  <p>
                    <strong>Endereço:</strong>
                    {item.endereco}
                  </p>

                  <p>
                    <strong>Longitude:</strong> {item.longitude}
                  </p>
                  <p>
                    <strong>Latitude:</strong> {item.latitude}
                  </p>
                  <p>
                    <strong>Tempo de percurso:</strong> {item.stats.tempo}
                  </p>
                  <p>
                    <strong>Km percorrido:</strong> {item.stats.km}
                  </p>
                </div>

                {/* Indicadores */}
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
