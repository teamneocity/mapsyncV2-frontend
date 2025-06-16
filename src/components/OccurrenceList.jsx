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

  return (
    <div className="overflow-x-auto max-w-full mx-auto px-2">
      {/* Header apenas para desktop */}
      <div className="hidden sm:grid grid-cols-12 gap-2 bg-[#F2F3F5] text-gray-800 font-semibold rounded-xl px-4 py-5 border border-gray-200 mb-2">
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
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                    {/* Ícone */}
                    <div className="flex items-center sm:block col-span-1">
                      {expandedRows.has(occ.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>

                    {/* Cada campo no mobile vem com label */}
                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Data
                      </span>
                      {format(new Date(occ.date_time), "dd/MM/yy")}
                    </div>

                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Origem
                      </span>
                      {occ.origin || "Plataforma"}
                    </div>

                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Zona
                      </span>
                      {occ.zone}
                    </div>

                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Protocolo
                      </span>
                      {occ.protocol || "254525"}
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                        {getInicials(occ.data[0]?.pilot?.name || "NA")}
                      </span>
                      {occ.pilot?.name || "—"}
                    </div>

                    <div className="sm:col-span-1 text-gray-400">...</div>

                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Bairro
                      </span>
                      {occ.neighborhood}
                    </div>

                    <div className="sm:col-span-2 truncate">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Endereço
                      </span>
                      {occ.address}
                    </div>

                    <div className="sm:col-span-1">
                      <span className="block sm:hidden text-xs font-semibold text-gray-400">
                        Status
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          occ.status === "Em análise"
                            ? "bg-blue-100 text-blue-600"
                            : occ.status === "Emergencial"
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {occ.status}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>

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
