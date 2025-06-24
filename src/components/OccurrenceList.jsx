"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getInicials } from "@/lib/utils";
import { format } from "date-fns";

export function OccurrenceList({ occurrences, renderExpandedRow }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const getStatusClasses = (status) => {
    const map = {
      em_analise: "bg-[#E8F7FF] text-[#33CFFF]",
      emergencial: "bg-[#FFE8E8] text-[#FF2222]",
      aprovada: "bg-[#FFF4D6] text-[#FFC118]",
      os_gerada: "bg-[#f0ddee] text-[#733B73]",
      aguardando_execucao : "bg-[#FFE4B5] text-[#CD853F]"
    };

    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="overflow-x-auto w-full mx-auto px-6">
      {/* Header apenas para desktop */}
      <div className="hidden xl-custom:grid grid-cols-12 gap-2 bg-[#F2F3F5] text-gray-800 font-semibold rounded-xl px-4 py-5 border border-gray-200 mb-2">
        <div></div>
        <div>Data</div>
        <div>Origem</div>
        <div>Zona</div>
        <div>Protocolo</div>
        <div className="col-span-2">Enviado por:</div>
        <div>Revisado por:</div>
        <div>Bairro</div>
        <div className="col-span-2">Endereço</div>
        <div>Status</div>
      </div>

      <table className="min-w-full text-sm table-auto border-separate border-spacing-y-1">
        <tbody>
          {occurrences.map((occ) => (
            <React.Fragment key={occ.id}>
              <tr onClick={() => toggleRow(occ.id)}>
                <td colSpan={11} className="px-2">
                  <div className="flex flex-wrap xl-custom:grid xl-custom:grid-cols-12 gap-4 px-4 py-5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                    {/* Ícone */}
                    <div className="flex items-center sm:block col-span-1">
                      {expandedRows.has(occ.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>

                    {/* Data */}
                    <div className="sm:col-span-1 whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Data
                      </span>
                      {occ.createdAt
                        ? format(new Date(occ.createdAt), "dd/MM/yy")
                        : "—"}
                    </div>

                    {/* Origem */}
                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Origem
                      </span>
                      {occ.origin || "Plataforma"}
                    </div>

                    {/* Zona */}
                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Zona
                      </span>
                      {occ.zone || "—"}
                    </div>

                    {/* Protocolo */}
                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Protocolo
                      </span>
                      {occ.protocol || "254525"}
                    </div>

                    {/* Enviado por */}
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                        {getInicials(occ?.pilot?.name || "NA")}
                      </span>
                      {occ?.author?.name || "—"}
                    </div>

                    {/* Revisado por */}
                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Revisado por
                      </span>
                      {occ?.approvedBy?.name || "—"}
                    </div>

                    {/* Bairro */}
                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Bairro
                      </span>
                      {occ?.address?.neighborhoodName || "—"}
                    </div>

                    {/* Endereço */}
                    <div className="sm:col-span-2 truncate">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Endereço
                      </span>
                      {`${occ.address?.street || ""}, ${
                        occ.address?.number || ""
                      } - ${occ.address?.city || ""}`}
                    </div>

                    {/* Status */}
                    <div className="sm:col-span-1 w-full break-words">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Status
                      </span>
                      <span
                        className={`flex flex-col items-center justify-center text-center px-3 py-1 rounded-full text-xs font-semibold leading-tight ${getStatusClasses(
                          occ.status
                        )}`}
                      >
                        {occ.status
                          .replace("_", " ")
                          .replace(/^\w/, (c) => c.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Linha expandida */}
              {expandedRows.has(occ.id) && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-4 bg-[#FAFAFA] rounded-b-xl border border-t-0 border-gray-200"
                  >
                    {renderExpandedRow ? renderExpandedRow(occ) : null}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
