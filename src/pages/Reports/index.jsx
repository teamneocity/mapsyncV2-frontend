"use client"

import { Pagination } from "@/components/pagination"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAuth } from "@/hooks/auth"
import { api } from "@/services/api"
import { format } from "date-fns"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { FileSpreadsheet, Clock, CheckCircle, AlertCircle, MapPin, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ReportFilters } from "./reports-filters"

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"]

export function Reports() {
  const [selectedItems, setSelectedItems] = useState([])
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRecent, setFilterRecent] = useState(null)
  const [filterType, setFilterType] = useState(null)
  const [filterDateRange, setFilterDateRange] = useState({ startDate: null, endDate: null })
  const [filterNeighborhood, setFilterNeighborhood] = useState("")
  const [filterPilot, setFilterPilot] = useState("")
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({
    pendente: 0,
    emAndamento: 0,
    resolvida: 0,
    total: 0,
  })
  const [neighborhoodData, setNeighborhoodData] = useState([])

  // Calculate statistics from reports data
  const calculateStats = (data) => {
    const pendente = data.filter((item) => item.status === "Pendente").length
    const emAndamento = data.filter((item) => item.status === "EmAndamento").length
    const resolvida = data.filter((item) => item.status === "Resolvida").length
    const total = data.length

    setStats({ pendente, emAndamento, resolvida, total })

    // Calculate neighborhood data
    const neighborhoodCount = data.reduce((acc, item) => {
      const occurrence = item.occurrence_air || item.occurrence_land
      if (occurrence) {
        const neighborhood = occurrence.neighborhood
        acc[neighborhood] = (acc[neighborhood] || 0) + 1
      }
      return acc
    }, {})

    const neighborhoodArray = Object.entries(neighborhoodCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 neighborhoods

    setNeighborhoodData(neighborhoodArray)
  }

  const statusData = [
    { name: "Pendente", value: stats.pendente, color: "#ef4444" },
    { name: "Em Andamento", value: stats.emAndamento, color: "#f59e0b" },
    { name: "Resolvida", value: stats.resolvida, color: "#10b981" },
  ]

  const handleSelectAll = () => {
    if (selectedItems.length === reports.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(reports.map((item) => item.id))
    }
  }

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const handleGenerateReport = async () => {
    const itemsToProcess =
      selectedItems.length > 0 ? reports.filter((item) => selectedItems.includes(item.id)) : reports

    // Recalcular estatísticas para os itens selecionados
    const selectedStats = {
      pendente: itemsToProcess.filter((item) => item.status === "Pendente").length,
      emAndamento: itemsToProcess.filter((item) => item.status === "EmAndamento").length,
      resolvida: itemsToProcess.filter((item) => item.status === "Resolvida").length,
      total: itemsToProcess.length,
    }

    // Recalcular dados de bairros para os itens selecionados
    const selectedNeighborhoodCount = itemsToProcess.reduce((acc, item) => {
      const occurrence = item.occurrence_air || item.occurrence_land
      if (occurrence) {
        const neighborhood = occurrence.neighborhood
        acc[neighborhood] = (acc[neighborhood] || 0) + 1
      }
      return acc
    }, {})

    const selectedNeighborhoodData = Object.entries(selectedNeighborhoodCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Create PDF with improved layout
    const doc = new jsPDF()

    // Header com estilo
    doc.setFillColor(94, 86, 255)
    doc.rect(0, 0, 210, 40, "F")

    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.text("RELATÓRIO DE ORDENS DE SERVIÇO", 20, 25)

    // Informações do relatório
    const currentDate = format(new Date(), "dd/MM/yyyy HH:mm")
    const formatDate = (date) => (date ? format(new Date(date), "dd/MM/yyyy") : "")
    const filterStartDate = formatDate(filterDateRange.startDate)
    const filterEndDate = formatDate(filterDateRange.endDate)
    const period = filterStartDate && filterEndDate ? `${filterStartDate} - ${filterEndDate}` : "Todos os períodos"

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Gerado em: ${currentDate}`, 20, 50)
    doc.text(`Por: ${user.name}`, 20, 58)
    doc.text(`Período: ${period}`, 20, 66)
    doc.text(`Itens incluídos: ${selectedItems.length > 0 ? "Selecionados" : "Todos"}`, 20, 74)

    // Seção de Resumo Executivo
    doc.setFontSize(16)
    doc.setTextColor(94, 86, 255)
    doc.text("RESUMO EXECUTIVO", 20, 90)

    // Cards de estatísticas
    const cardY = 100
    const cardWidth = 40
    const cardHeight = 25

    // Card Total
    doc.setFillColor(240, 240, 240)
    doc.rect(20, cardY, cardWidth, cardHeight, "F")
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("TOTAL DE OS", 22, cardY + 8)
    doc.setFontSize(18)
    doc.setTextColor(94, 86, 255)
    doc.text(selectedStats.total.toString(), 22, cardY + 18)

    // Card Pendentes
    doc.setFillColor(254, 242, 242)
    doc.rect(70, cardY, cardWidth, cardHeight, "F")
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("PENDENTES", 72, cardY + 8)
    doc.setFontSize(18)
    doc.setTextColor(239, 68, 68)
    doc.text(selectedStats.pendente.toString(), 72, cardY + 18)

    // Card Em Andamento
    doc.setFillColor(255, 251, 235)
    doc.rect(120, cardY, cardWidth, cardHeight, "F")
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("EM ANDAMENTO", 122, cardY + 8)
    doc.setFontSize(18)
    doc.setTextColor(245, 158, 11)
    doc.text(selectedStats.emAndamento.toString(), 122, cardY + 18)

    // Card Resolvidas
    doc.setFillColor(240, 253, 244)
    doc.rect(170, cardY, cardWidth, cardHeight, "F")
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("RESOLVIDAS", 172, cardY + 8)
    doc.setFontSize(18)
    doc.setTextColor(16, 185, 129)
    doc.text(selectedStats.resolvida.toString(), 172, cardY + 18)

    // Tabela de Status
    doc.setFontSize(14)
    doc.setTextColor(94, 86, 255)
    doc.text("DISTRIBUIÇÃO POR STATUS", 20, 145)

    const statusTableData = [
      [
        "Pendente",
        selectedStats.pendente.toString(),
        `${((selectedStats.pendente / selectedStats.total) * 100).toFixed(1)}%`,
      ],
      [
        "Em Andamento",
        selectedStats.emAndamento.toString(),
        `${((selectedStats.emAndamento / selectedStats.total) * 100).toFixed(1)}%`,
      ],
      [
        "Resolvida",
        selectedStats.resolvida.toString(),
        `${((selectedStats.resolvida / selectedStats.total) * 100).toFixed(1)}%`,
      ],
    ]

    doc.autoTable({
      head: [["Status", "Quantidade", "Percentual"]],
      body: statusTableData,
      startY: 155,
      theme: "grid",
      headStyles: {
        fillColor: [94, 86, 255],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 11,
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40, halign: "center" },
        2: { cellWidth: 40, halign: "center" },
      },
    })

    // Seção de Bairros
    let currentY = doc.autoTable.previous.finalY + 20

    doc.setFontSize(14)
    doc.setTextColor(94, 86, 255)
    doc.text("TOP BAIRROS COM MAIS ORDENS DE SERVIÇO", 20, currentY)

    if (selectedNeighborhoodData.length > 0) {
      const neighborhoodTableData = selectedNeighborhoodData
        .slice(0, 10)
        .map((item, index) => [
          `${index + 1}º`,
          item.name,
          item.value.toString(),
          `${((item.value / selectedStats.total) * 100).toFixed(1)}%`,
        ])

      doc.autoTable({
        head: [["Posição", "Bairro", "Quantidade", "Percentual"]],
        body: neighborhoodTableData,
        startY: currentY + 10,
        theme: "grid",
        headStyles: {
          fillColor: [94, 86, 255],
          textColor: [255, 255, 255],
          fontSize: 12,
        },
        bodyStyles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 25, halign: "center" },
          1: { cellWidth: 80 },
          2: { cellWidth: 35, halign: "center" },
          3: { cellWidth: 35, halign: "center" },
        },
      })

      currentY = doc.autoTable.previous.finalY + 15
    }

    // Análise e Insights
    doc.setFontSize(14)
    doc.setTextColor(94, 86, 255)
    doc.text("ANÁLISE E INSIGHTS", 20, currentY)

    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)

    const insights = [
      `• Taxa de resolução: ${((selectedStats.resolvida / selectedStats.total) * 100).toFixed(1)}%`,
      `• OS em andamento: ${selectedStats.emAndamento} (${((selectedStats.emAndamento / selectedStats.total) * 100).toFixed(1)}%)`,
      `• Bairro com mais OS: ${selectedNeighborhoodData[0]?.name || "N/A"} (${selectedNeighborhoodData[0]?.value || 0} ocorrências)`,
      `• Total de bairros atendidos: ${selectedNeighborhoodData.length}`,
    ]

    insights.forEach((insight, index) => {
      doc.text(insight, 20, currentY + 15 + index * 8)
    })

    // Calcular posição final dos insights
    const insightsEndY = currentY + 15 + insights.length * 8 + 20

    // Verificar se há espaço suficiente para o footer
    const pageHeight = doc.internal.pageSize.height
    const footerHeight = 30

    if (insightsEndY + footerHeight > pageHeight - 20) {
      // Adicionar nova página se não houver espaço
      doc.addPage()
      currentY = 20
    } else {
      currentY = insightsEndY
    }

    // Footer com posição segura
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text("Pop City - Sistema de Gestão de Ordens de Serviço", 20, pageHeight - 20)
    doc.text(`Página 1 - Gerado em ${currentDate}`, 20, pageHeight - 12)

    doc.save(`relatorio_os_detalhado_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "EmAndamento":
        return "bg-yellow-100 text-yellow-800"
      case "Resolvida":
        return "bg-green-100 text-green-800"
      case "Pendente":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const fetchData = async () => {
    try {
      const response = await api.get("/reports", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          recent: filterRecent,
          status: filterType,
          startDate: filterDateRange.startDate,
          endDate: filterDateRange.endDate,
          search: searchTerm,
          pilot: filterPilot,
          neighborhood: filterNeighborhood,
        },
      })

      setCurrentPage(response.data.currentPage)
      setTotalPages(response.data.totalPages)
      setReports(response.data.data)
      calculateStats(response.data.data)
    } catch (error) {
      console.error("Erro ao buscar dados:", error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage])

  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchData()
  }

  return (
    <>
      <Sidebar />
      <div className="flex min-h-screen flex-col sm:ml-[270px] font-inter">
        <main className="flex flex-col h-full">
          <div className="px-8 pt-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
              <p className="text-gray-600">Dashboard completo de ordens de serviço e métricas</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Todas as ordens de serviço</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.pendente}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total > 0 ? `${((stats.pendente / stats.total) * 100).toFixed(1)}%` : "0%"} do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.emAndamento}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total > 0 ? `${((stats.emAndamento / stats.total) * 100).toFixed(1)}%` : "0%"} do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.resolvida}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total > 0 ? `${((stats.resolvida / stats.total) * 100).toFixed(1)}%` : "0%"} do total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                  <CardDescription>Proporção de OS por situação</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      pendente: { label: "Pendente", color: "#ef4444" },
                      emAndamento: { label: "Em Andamento", color: "#f59e0b" },
                      resolvida: { label: "Resolvida", color: "#10b981" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Bairros</CardTitle>
                  <CardDescription>Bairros com mais ordens de serviço</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={neighborhoodData.slice(0, 8)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                        <YAxis />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border rounded shadow-lg">
                                  <p className="font-medium">{label}</p>
                                  <p className="text-blue-600">OS: {payload[0].value}</p>
                                  <p className="text-gray-600">
                                    {((payload[0].value / stats.total) * 100).toFixed(1)}% do total
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="value" fill="#5E56FF" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Lista dos top bairros */}
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 mb-3">Ranking Completo:</h4>
                    {neighborhoodData.slice(0, 5).map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-blue-600">{item.value}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({((item.value / stats.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Configure os filtros para personalizar seu relatório</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportFilters
                  onFilterRecent={(order) => setFilterRecent(order)}
                  onFilterType={(type) => setFilterType(type)}
                  onFilterDateRange={(range) => setFilterDateRange(range)}
                  onSearch={(input) => setSearchTerm(input)}
                  onFilterNeighborhood={(neighborhood) => setFilterNeighborhood(neighborhood)}
                  onFilterPilot={(pilotId) => setFilterPilot(pilotId)}
                  handleApplyFilters={handleApplyFilters}
                />
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedItems.length > 0
                    ? `${selectedItems.length} items selecionados`
                    : `${reports.length} items encontrados`}
                </span>
              </div>
              <Button onClick={handleGenerateReport} className="bg-[#5E56FF] hover:bg-[#4842cc] gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Gerar Relatório PDF
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="flex flex-col px-8">
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-auto h-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px] sticky top-0 bg-white">
                            <Checkbox
                              checked={selectedItems.length === reports.length && reports.length > 0}
                              onCheckedChange={handleSelectAll}
                              aria-label="Selecionar todos os items"
                            />
                          </TableHead>
                          <TableHead className="sticky top-0 bg-white">Zona / Região</TableHead>
                          <TableHead className="sticky top-0 bg-white">Bairro</TableHead>
                          <TableHead className="sticky top-0 bg-white">Endereço</TableHead>
                          <TableHead className="sticky top-0 bg-white text-center">Ocorrências</TableHead>
                          <TableHead className="sticky top-0 bg-white">Data da OS</TableHead>
                          <TableHead className="sticky top-0 bg-white">Piloto</TableHead>
                          <TableHead className="sticky top-0 bg-white">Situação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.map((item) => {
                          const occurrence = item.occurrence_air || item.occurrence_land

                          if (!occurrence) {
                            return (
                              <TableRow key={item.id}>
                                <TableCell colSpan={8} className="text-center text-gray-500">
                                  Sem dados de ocorrência
                                </TableCell>
                              </TableRow>
                            )
                          }

                          return (
                            <TableRow key={item.id} className={selectedItems.includes(item.id) ? "bg-muted/50" : ""}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedItems.includes(item.id)}
                                  onCheckedChange={() => handleSelectItem(item.id)}
                                  aria-label={`Selecionar item ${item.id}`}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{occurrence.zone}</TableCell>
                              <TableCell>{occurrence.neighborhood}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{occurrence.address}</TableCell>
                              <TableCell className="text-center font-semibold">{occurrence.quantity}</TableCell>
                              <TableCell>
                                {item.date_time && !isNaN(new Date(item.date_time))
                                  ? format(new Date(item.date_time), "dd/MM/yyyy")
                                  : "Data não disponível"}
                              </TableCell>
                              <TableCell>{item.pilot?.name}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                                >
                                  {item.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Pagination */}
        <div className="py-4 border-t bg-white px-8 mt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </>
  )
}
