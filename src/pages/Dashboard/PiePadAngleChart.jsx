import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "@/services/api";

import Pie from "@/assets/chart/Pie.svg?react";

export function PiePadAngleChart() {
  const [dados, setDados] = useState([]);

  const colors = ["#5E56FF", "#9654F4", "#8469aa", "#F472B6", "#6366F1"];

  useEffect(() => {
    async function fetchData() {
      const res = await api.get("/occurrences");
      const ocorrencias = res.data.occurrences;

      const setores = {};
      for (const o of ocorrencias) {
        const nome = o.sector?.name || "Sem setor";
        setores[nome] = (setores[nome] || 0) + 1;
      }

      const data = Object.entries(setores).map(([name, value]) => ({
        name,
        value,
      }));

      setDados(data);
    }

    fetchData();
  }, []);

  const option = {
    color: colors,
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        name: "Ocorrências por setor",
        type: "pie",
        radius: ["50%", "80%"],
        center: ["50%", "50%"],
        padAngle: 5,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold",
          },
        },
        data: dados,
      },
    ],
  };

  return (
    <div className="w-full">
      {/* Título */}
      <div className="flex items-center gap-2 mb-4">
        <Pie className="w-5 h-5 text-[#5E56FF]" />
        <h2 className="text-lg font-semibold text-gray-800">
          Ocorrências por Bairros
        </h2>
      </div>

      {/* Legenda abaixo do título */}
      <div className="flex flex-wrap gap-4 mb-6">
        {dados.map((item, index) => (
          <div key={item.name} className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm font-medium text-gray-700">
                {item.name}
              </span>
            </div>
            <span className="text-xs text-gray-500 ml-5">
              {item.value} ocorrências
            </span>
          </div>
        ))}
      </div>

      {/* Gráfico centralizado */}
      <div className="flex justify-center">
        <ReactECharts option={option} style={{ height: 400, width: "100%" }} />
      </div>
    </div>
  );
}
