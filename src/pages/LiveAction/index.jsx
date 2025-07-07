// React e bibliotecas externas
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle } from "lucide-react";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LiveActionButton } from "@/components/live-action-button";

// Serviços e utilitários
import { api } from "@/services/api";


export default function NeighborhoodOccurrences() {
  const [occurrences, setOccurrences] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get("/land-occurrences/neighborhoods")
      .then((res) => {
        const sorted = res.data.sort((a, b) => b.count - a.count)
        setOccurrences(sorted)
        setIsLoading(false)
      })
      .catch((err) => {
        setError("Erro ao carregar dados iniciais.")
        setIsLoading(false)
      })
  
    const socket = io(import.meta.env.REACT_APP_URL_SERVER || "http://localhost:5000") //  https://popcity.cloud 
  
    socket.on("connect", () => {
      setIsConnected(true)
    })
  
    socket.on("occurrences_by_neighborhood", (data) => {
      const sorted = data.sort((a, b) => b.count - a.count)
      setOccurrences(sorted)
    })
  
    socket.on("connect_error", (err) => {
      setError(`Falha ao conectar: ${err.message}`)
      setIsLoading(false)
    })
  
    return () => socket.disconnect()
  }, [])
  

  const totalOccurrences = occurrences.reduce((sum, item) => sum + item.count, 0)

  const topNeighborhoods = occurrences.slice(0, 5)

  return (
    <div className="bg-white sm:ml-[270px] font-inter">
      <Sidebar />
      <main className="">
        <header className="hidden sm:flex sm:justify-between sm:items-center border-b py-6 px-0">
        <img src="/logoAju.png" alt="Logo" className="h-16 object-contain ml-8" />
        <div className="mr-8">
           <LiveActionButton />
          </div>
      </header>

        <div className="py-4 px-8 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-medium">Ocorrências por Bairro</h1>
            <p className="text-gray-500 mt-1">Visualização em tempo real das ocorrências por bairro</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-40 space-y-4">
              <div className="flex space-x-2">
                <div
                  className="w-3 h-3 rounded-full bg-[#5E56FF] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-[#5E56FF] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-[#5E56FF] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">Conectando ao servidor de dados...</p>
            </div>
          ) : (
            <>
              {/* Connection status indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm text-gray-500">
                  {isConnected ? "Conectado em tempo real" : "Desconectado"}
                </span>
              </div>

              {/* Top neighborhoods cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {topNeighborhoods.map((item, index) => (
                  <Card key={item.neighborhood} className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{item.neighborhood}</CardTitle>
                      <CardDescription className="text-xs">
                        {((item.count / totalOccurrences) * 100).toFixed(1)}% do total
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">{item.count}</div>
                      <Progress
                        value={(item.count / (topNeighborhoods[0]?.count || 1)) * 100}
                        className="h-2"
                        indicatorClassName={`${index === 0 ? "bg-[#5E56FF]" : "bg-[#5E56FF]/70"}`}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Animated chart */}
              <Card className="w-full h-[500px] border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Ocorrências por Bairro</CardTitle>
                  <CardDescription>
                    Total de {totalOccurrences} ocorrências em {occurrences.length} bairros
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={occurrences.slice(0, 15)} // Show top 15 neighborhoods
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="neighborhood" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`${value} ocorrências`, "Total"]}
                        labelFormatter={(label) => `Bairro: ${label}`}
                      />
                      <Bar dataKey="count" fill="#5E56FF" animationDuration={1000} animationEasing="ease-in-out" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Neighborhood table for all data */}
              <Card className="mt-8 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Todos os Bairros</CardTitle>
                  <CardDescription>Lista completa de ocorrências por bairro</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="py-3 px-4 text-left font-medium">Posição</th>
                          <th className="py-3 px-4 text-left font-medium">Bairro</th>
                          <th className="py-3 px-4 text-right font-medium">Ocorrências</th>
                          <th className="py-3 px-4 text-right font-medium">Percentual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {occurrences.map((item, index) => (
                          <tr key={item.neighborhood} className="border-b">
                            <td className="py-3 px-4 text-left">{index + 1}</td>
                            <td className="py-3 px-4 text-left font-medium">{item.neighborhood}</td>
                            <td className="py-3 px-4 text-right">{item.count}</td>
                            <td className="py-3 px-4 text-right">
                              {((item.count / totalOccurrences) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
