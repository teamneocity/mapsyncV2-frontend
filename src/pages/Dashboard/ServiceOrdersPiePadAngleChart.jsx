import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "@/services/api";

import Pie from "@/assets/chart/Pie.svg?react";

// Mapeia status de O.S. para labels formatadas
function formatarStatusOS(status) {
  const mapa = {
    aguardando_execucao: "Aguardando Execução",
    em_execucao: "Em Execução",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
    reagendada: "Reagendada",
    pendente: "Pendente",
    // fallback mantém o valor original se vier algo fora do previsto
  };
  return mapa[status] || status;
}

export function ServiceOrdersPiePadAngleChart() {
  const [dados, setDados] = useState([]);

  const colors = ["#5E56FF", "#9654F4", "#8469aa", "#F472B6", "#6366F1"];

  useEffect(() => {
    async function fetchData() {
      // ✔️ rota nova
      const res = await api.get("/service-orders/stats");
      const statusList = res.data?.byStatus || [];

      const data = statusList.map((item) => ({
        name: formatarStatusOS(item.status),
        value: item.count,
      }));

      setDados(data);
    }

    fetchData();
  }, []);

  const option = {
    color: colors,
    tooltip: {
      trigger: "item",
      formatter: (params) =>
        `${params.name}: <strong>${params.value}</strong> O.S.`,
    },
    series: [
      {
        name: "O.S. por status",
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
          Ordens de Serviço por Status
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
              {item.value} O.S.
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
