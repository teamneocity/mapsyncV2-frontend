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

export default function GraficoDeBairros({ dados = [] }) {
  const dataFormatada = dados.map((item) => ({
    bairro: item.bairro,
    total: item.total,
  }));

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        Ocorrências por Bairro
      </h2>

      <div
        className="w-full"
        style={{ height: Math.max(300, dados.length * 50) }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dataFormatada}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="bairro"
              type="category"
              tick={{ fontSize: 12 }}
              width={150}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="total"
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
