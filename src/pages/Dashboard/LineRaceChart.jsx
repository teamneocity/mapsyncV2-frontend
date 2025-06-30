import ReactECharts from "echarts-for-react";
import { Building2 } from "lucide-react";

export function LineRaceChart() {
  const bairros = [
    {
      name: "Jobotiana",
      color: "#9654F4",
      data: [12, 18, 25, 32, 28, 40],
      total: 96000,
      variation: 5,
    },
    {
      name: "Farolândia",
      color: "#5E56FF",
      data: [8, 15, 20, 26, 21, 30],
      total: 24000,
      variation: -3,
    },
    {
      name: "Santos Dumont",
      color: "#8F7CFF",
      data: [10, 14, 19, 22, 25, 29],
      total: 14000,
      variation: 0,
    },
  ];

  const option = {
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    },
    yAxis: {
      type: "value",
    },
    color: bairros.map((b) => b.color),
    series: bairros.map((b) => ({
      name: b.name,
      type: "line",
      smooth: true,
      data: b.data,
    })),
  };

  return (
    <div className="w-full">
      {/* Título */}
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Ocorrências por Bairros
      </h2>

      {/* Legenda em formato de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {bairros.map((bairro) => (
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
                  {bairro.total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
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

      {/* Gráfico de linha */}
      <ReactECharts option={option} style={{ height: 350, width: "100%" }} />
    </div>
  );
}
