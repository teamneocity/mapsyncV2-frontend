import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function GraficoDeOcorrencias({ dados = [] }) {
  // Transforma os dados vindos do chatbot
  const dataFormatada = dados.map((item) => ({
    status: item.status,
    quantidade: item._count?.id || 0,
  }));

  const cores = [
    "#5E56FF",
    "#8F7CFF",
    "#A594F9",
    "#9654F4",
    "#FFC857",
    "#A1C298",
  ];

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        Ocorrências por Status
      </h2>

      <div
        className="w-full"
        style={{ height: Math.max(300, dados.length * 60) }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dataFormatada}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="status"
              type="category"
              tick={{ fontSize: 12 }}
              width={100}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="quantidade"
              fill="#5E56FF"
              radius={[0, 6, 6, 0]}
              label={{ position: "right", fill: "#333", fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
