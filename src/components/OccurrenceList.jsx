"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { getInicials } from "@/lib/utils"
import { format } from "date-fns"

export function OccurrenceList({ occurrences, serviceorders, renderExpandedRow }) {
  const [expandedRows, setExpandedRows] = useState(new Set())

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      newSet.has(id) ? newSet.delete(id) : newSet.add(id)
      return newSet
    })
  }

  const getStatusClasses = (status) => {
    const map = {
      em_analise: "bg-[#E8F7FF] text-[#33CFFF]",
      emergencial: "bg-[#FFE8E8] text-[#FF2222]",
      aprovada: "bg-[#FFF4D6] text-[#986F00]",
      os_gerada: "bg-[#f0ddee] text-[#733B73]",
      aguardando_execucao: "bg-[#FFE4B5] text-[#CD853F]",
    }

    return map[status] || "bg-gray-100 text-gray-600"
  }

  return (
    <div className="w-full mx-auto px-6">
      {/* Header apenas para desktop */}
      <div className="hidden xl:block bg-[#D9DCE2] text-[#020231] font-semibold rounded-xl px-4 py-5 border border-gray-200 mb-2">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1 pl-6">Data</div>
          <div className="col-span-1">Origem</div>
          <div className="col-span-2">Protocolo</div>
          <div className="col-span-1">Enviado por</div>
          <div className="col-span-1">Revisado por</div>
          <div className="col-span-1">Bairro</div>
          <div className="col-span-2">Endereço</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-1 text-center">Status</div>
        </div>
      </div>

      {/* Lista de ocorrências */}
      <div className="space-y-1">
        {occurrences.map((occ) => (
          <div key={occ.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Linha principal */}
            <div className="hover:bg-gray-50 transition cursor-pointer" onClick={() => toggleRow(occ.id)}>
              {/* Layout Mobile */}
              <div className="xl:hidden p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center mt-1">
                    {expandedRows.has(occ.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{occ.protocol || "254525"}</div>
                        <div className="text-xs text-gray-500">
                          {occ.createdAt ? format(new Date(occ.createdAt), "dd/MM/yy") : "—"}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(occ.status)}`}>
                        {occ.status.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                      <div>
                        <span className="text-xs font-medium text-gray-400 block">Origem</span>
                        {occ.origin || "Plataforma"}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 block">Tipo</span>
                        {occ.type || "—"}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 block">Bairro</span>
                        {occ?.address?.neighborhoodName || "—"}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 block">Enviado por</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                            {getInicials(occ?.pilot?.name || "NA")}
                          </span>
                          <span className="text-xs">{occ?.author?.name || "—"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-gray-400 block">Endereço</span>
                      <div className="text-sm text-gray-600">
                        {`${occ.address?.street || ""}, ${occ.address?.number || ""} - ${occ.address?.city || ""}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Desktop */}
              <div className="hidden xl:block p-4">
                <div className="grid grid-cols-12 gap-4 items-center text-[#787891]">
                  <div className="col-span-1 flex items-center gap-2">
                    {expandedRows.has(occ.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm">{occ.createdAt ? format(new Date(occ.createdAt), "dd/MM/yy") : "—"}</span>
                  </div>

                  <div className="col-span-1 text-sm">{occ.origin || "Plataforma"}</div>

                  <div className="col-span-2 text-sm">{occ.protocol || "254525"}</div>

                  <div className="col-span-1 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                      {getInicials(occ?.pilot?.name || "NA")}
                    </span>
                    <span className="text-sm truncate">{occ?.author?.name || "—"}</span>
                  </div>

                  <div className="col-span-1 text-sm">{occ?.approvedBy?.name || "—"}</div>

                  <div className="col-span-1 text-sm">{occ?.address?.neighborhoodName || "—"}</div>

                  <div className="col-span-2 text-sm truncate">
                    {`${occ.address?.street || ""}, ${occ.address?.number || ""} - ${occ.address?.city || ""}`}
                  </div>

                  <div className="col-span-2 text-sm">{occ.type || "—"}</div>

                  <div className="col-span-1 flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(occ.status)}`}>
                      {occ.status.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Linha expandida */}
            {expandedRows.has(occ.id) && (
              <div className="px-4 py-4 bg-[#FAFAFA] border-t border-gray-200">
                {renderExpandedRow ? renderExpandedRow(occ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}