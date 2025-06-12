import { DateRange } from "@/components/date-range"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/statsCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from "@/components/pagination"


const occurrences = [
    {
      zone: "José",
      neighborhood: "Bugio",
      address: "Avenida José de Oliveira Gued...",
      occurrences: "Infraestrutura",
      date: "26/12/2024",
      status: "Analise",
    },
    {
      zone: "José",
      neighborhood: "Bugio",
      address: "Avenida José de Oliveira Gued...",
      occurrences: "Infraestrutura",
      date: "26/12/2024",
      status: "Analise",
    },
    {
      zone: "José",
      neighborhood: "Bugio",
      address: "Avenida José de Oliveira Gued...",
      occurrences: "Infraestrutura",
      date: "26/12/2024",
      status: "Analise",
    },
    {
      zone: "José",
      neighborhood: "Bugio",
      address: "Avenida José de Oliveira Gued...",
      occurrences: "Infraestrutura",
      date: "26/12/2024",
      status: "Analise",
    },
]


export function Activities() {


    
    return(
        <div className="bg-white sm:ml-[270px] font-inter">
            <Sidebar/>
            <header className="hidden sm:flex sm:justify-end sm:gap-3 sm:items-center  border-b py-5 px-8 ">
                <p className="font-medium text-[#5E56FF]">Mapping Sync</p>
                <Button className="h-11 w-[130px] rounded-[16px] bg-[#5E56FF]">Sincronizar</Button>
            </header>

            <main className="px-8 py-6">
                <div>
                    <h3 className="text-gray-900 font-semibold">Atividades</h3>
                    <p className="text-gray-600 text-sm">Defina ou direcione os setores de execução</p>
                </div>
                
                <div className="mt-6">
                    <DateRange/>
                </div>


                <Table className="mt-6">
                    <TableHeader>
                    <TableRow className="bg-gray-50/50">
                        <TableHead className="w-12">
                        <Checkbox />
                        </TableHead>
                        <TableHead className="max-lg:hidden">Responsável</TableHead>
                        <TableHead>Bairro</TableHead>
                        <TableHead>Endereço, rua ou avenida</TableHead>
                        <TableHead className="max-lg:hidden">Setor</TableHead>
                        <TableHead>Data da ocorrência</TableHead>
                        <TableHead>Situação</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody className="">
                    {occurrences.map((occurrence, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <TableCell>
                            <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium max-lg:hidden">{occurrence.zone}</TableCell>
                        <TableCell>{occurrence.neighborhood}</TableCell>
                        <TableCell>{occurrence.address}</TableCell>
                        <TableCell className="max-lg:hidden">{occurrence.occurrences}</TableCell>
                        <TableCell>{occurrence.date}</TableCell>
                        <TableCell>
                            <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                occurrence.status === "Analise"
                                ? "bg-red-50 text-red-600"
                                : occurrence.status === "Resolvido"
                                    ? "bg-green-50 text-green-600"
                                    : "bg-emerald-50 text-emerald-600"
                            }`}
                            >
                            {occurrence.status}
                            </span>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>

            </main>

            <footer className="px-8">
                <Pagination/>
            </footer>
        </div>
    )
}