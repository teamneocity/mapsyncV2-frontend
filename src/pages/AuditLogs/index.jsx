import { Sidebar } from "@/components/sidebar"
import { Table, TableBody, TableRow,TableHeader, TableHead, TableCell } from "@/components/ui/table"
import { api } from "@/services/api"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useEffect, useState } from "react"
import { Pagination } from "@/components/pagination"
import { LogFilters } from "./logs-filters"

export function AuditLogs() {

      const [logs, setLogs] = useState([])
      const [currentPage, setCurrentPage] = useState(1);
      const [totalPages, setTotalPages] = useState(1);
      const [totalOccurrences, setTotalOccurrences] = useState(0);

      const [searchTerm, setSearchTerm] = useState("");
      const [filterRecent, setFilterRecent] = useState(null);
      const [filterType, setFilterType] = useState(null);
      const [filterDateRange, setFilterDateRange] = useState({ startDate: null, endDate: null });


      async function fetchAllLogs(page = 1 ) {

        try {

          const params = {
            page,
            recent: filterRecent,
            status: filterType,
            startDate: filterDateRange.startDate,
            endDate: filterDateRange.endDate,
            search: searchTerm,
          }

          const response = await api.get("/view-logs",
             {params})

          setLogs(response.data.logs)
          setCurrentPage(response.data.currentPage);
          setTotalPages(response.data.totalPages);
        }catch(error){
          console.error(error)
        }



      }

      useEffect(() => {
        fetchAllLogs(currentPage)
      } ,[currentPage])


      const formatDate = (date) => {
        return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
      }

      
    const handleApplyFilters = () => {
      setCurrentPage(1);
      fetchAllLogs()
  };

    return(
        
        
        <>
            <Sidebar/>

            <div className="mb-6 sm:ml-[270px] px-8 mt-8">
                    <h3 className="font-semibold text-gray-900">Registro de Auditoria</h3>
                    <p className="text-gray-600">Veja o que foi feito por cada colaborador</p>
            </div>

            <LogFilters
              onFilterRecent={(order) => setFilterRecent(order)}
              onFilterType={(type) => setFilterType(type)}
              onFilterDateRange={(range) => setFilterDateRange(range)}
              onSearch={(input) => setSearchTerm(input)}
              handleApplyFilters={handleApplyFilters}
            />

            <main className="sm:ml-[270px] p-8 font-inter flex flex-col justify-between min-h-full ">


                


                <div className="border rounded-md mb-4">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="font-medium">Email</TableHead>
                        <TableHead className="font-medium">Ação</TableHead>
                        <TableHead className="font-medium">Data</TableHead>
                        <TableHead className="font-medium">IP</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell> {log.user ? log.user.email : "N/A"}</TableCell>
                            <TableCell>{log.reason}</TableCell>
                            <TableCell>{formatDate(log.occurredAt)}</TableCell>
                            <TableCell>{log.ip}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            </main>
        </>
    )
}