import React from "react";
import ReactECharts from "echarts-for-react";

export default function PieChartOcorrencias({ dados = [] }) {
  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: { fontSize: 12 },
    },
    series: [
      {
        name: "Ocorrências",
        type: "pie",
        radius: "60%",
        data: dados.map((item) => ({
          name: item.status,
          value: item.total,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        Ocorrências por Status
      </h2>
      <ReactECharts option={option} style={{ height: 400, width: "100%" }} />
    </div>
  );
}
