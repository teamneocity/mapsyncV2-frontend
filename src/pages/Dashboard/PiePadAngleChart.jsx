import ReactECharts from "echarts-for-react";

export function PiePadAngleChart() {
  const chartData = [
    { value: 35, name: "Diretoria" },
    { value: 25, name: "Supervisão" },
    { value: 20, name: "Operacional" },
    { value: 20, name: "Apoio / TI" },
  ];

  const chartColors = ["#9654F4", "#5E56FF", "#8F7CFF", "#A594F9"];
  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const option = {
    title: {
      text: "Gráfico de Performance",
      left: "center",
      top: 10,
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}<br/>{c} pontos ({d}%)",
    },
    color: chartColors,
    series: [
      {
        name: "Performance",
        type: "pie",
        radius: ["50%", "70%"], // donut
        center: ["50%", "70%"], // empurra mais para baixo (para compensar altura maior)
        startAngle: 180,
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
            formatter: "{b}\n{d}%",
          },
        },
        labelLine: { show: false },
        data: [
          ...chartData,
          {
            value: total,
            name: "",
            itemStyle: {
              color: "none",
              decal: { symbol: "none" },
            },
            label: { show: false },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Gráfico de Performance
      </h2>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 mb-4">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartColors[index] }}
            />
            <div className="flex flex-col text-sm text-gray-700 leading-tight">
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-gray-500">{item.value} pontos</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico aumentado */}
      <ReactECharts option={option} style={{ height: 450, width: "100%" }} />
    </div>
  );
}
