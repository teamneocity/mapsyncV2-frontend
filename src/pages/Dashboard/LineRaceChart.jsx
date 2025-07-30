import { useEffect, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown, Building2 } from "lucide-react";
import { api } from "@/services/api";

import Line from "@/assets/chart/Line.svg?react";

const COLORS = ["#9654F4", "#5E56FF", "#8F7CFF"];

export function LineRaceChart() {
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState([]);
  const [bairrosSelecionados, setBairrosSelecionados] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);

  useEffect(() => {
    async function fetchStats() {
      const res = await api.get("/occurrences/stats");
      const stats = res.data.byNeighborhood || [];

      setBairrosDisponiveis(stats.map((b) => b.neighborhood));
      setBairrosSelecionados(stats.slice(0, 3).map((b) => b.neighborhood));
      setOcorrencias(stats);
    }
    fetchStats();
  }, []);

  const dadosGrafico = useMemo(() => {
    return bairrosSelecionados.map((nome, index) => {
      const dado = ocorrencias.find((o) => o.neighborhood === nome);
      return {
        name: nome,
        color: COLORS[index % COLORS.length],
        data: [dado?.previous || 0, dado?.current || 0],
        total: dado?.current || 0,
        variation: dado?.difference || 0,
      };
    });
  }, [bairrosSelecionados, ocorrencias]);

  const chartOptions = {
    tooltip: { trigger: "axis" },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: { type: "category", data: ["Mês Anterior", "Mês Atual"] },
    yAxis: { type: "value" },
    color: dadosGrafico.map((b) => b.color),
    series: dadosGrafico.map((b) => ({
      name: b.name,
      type: "line",
      smooth: true,
      data: b.data,
    })),
  };

  return (
    <div className="w-full">
      {/* Título */}
      <div className="flex items-center gap-2 mb-4">
        <Line className="w-5 h-5 text-[#5E56FF]" />
        <h2 className="text-lg font-semibold text-gray-800">
          Ocorrências por Bairros
        </h2>
      </div>

      {/* Seletor de bairros */}
      <div className="mb-6 max-w-md">
        <Listbox
          value={bairrosSelecionados}
          onChange={(selected) =>
            selected.length <= 3 && setBairrosSelecionados(selected)
          }
          multiple
        >
          <div className="relative">
            <Listbox.Button className="w-full border px-4 py-2 rounded-lg flex justify-between items-center bg-white shadow">
              <span className="truncate text-sm text-gray-700">
                {bairrosSelecionados.join(", ") || "Selecione os bairros"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Listbox.Button>
            <Listbox.Options className="absolute mt-2 w-full bg-white border rounded-lg shadow z-10 max-h-60 overflow-auto">
              {bairrosDisponiveis.map((bairro) => (
                <Listbox.Option
                  key={bairro}
                  value={bairro}
                  className={({ active }) =>
                    `cursor-pointer px-4 py-2 text-sm ${
                      active ? "bg-gray-100" : ""
                    }`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span>{bairro}</span>
                      {selected && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
        <p className="text-xs text-gray-500 mt-1">Selecione até 3 bairros.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {dadosGrafico.map((bairro) => (
          <div
            key={bairro.name}
            className="flex items-center gap-4 border rounded-xl px-4 py-3"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F4F3FD]">
              <Building2 className="w-5 h-5 text-[#9654F4]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">
                {bairro.name}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-900">
                  {bairro.total.toLocaleString("pt-BR")}
                </span>
                <span
                  className={`text-xs px-2 py-[2px] rounded-full font-semibold ${
                    bairro.variation > 0
                      ? "bg-[#5E56FF]/10 text-[#5E56FF]"
                      : bairro.variation < 0
                      ? "bg-red-500/10 text-red-500"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {bairro.variation > 0 ? "+" : ""}
                  {bairro.variation}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <ReactECharts
        option={chartOptions}
        style={{ height: 350, width: "100%" }}
      />
    </div>
  );
}
