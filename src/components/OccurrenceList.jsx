"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getInicials } from "@/lib/utils";
import { format } from "date-fns";

export function OccurrenceList({
  occurrences,
  serviceorders,
  renderExpandedRow,
  showEmergencialStatus = false,
  dateOrder = "recent",
  onToggleDateOrder,
  statusLabelOverrides = {},
}) {
  const [expandedRow, setExpandedRow] = useState(null);

  const dataToRender =
    serviceorders?.length > 0
      ? serviceorders.map((s) => ({
          ...s.occurrence,

          isEmergencial: s.occurrence?.isEmergencial,

          isDelayed: s?.isDelayed === true,
        }))
      : occurrences;

  if (serviceorders?.length > 0) {
    console.log(
      "isEmergencial da primeira OS:",
      serviceorders[0].occurrence?.isEmergencial
    );
  }

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const getStatusClasses = (status) => {
    const map = {
      em_analise: "bg-[#D0E4FC] text-[#1678F2]",
      emergencial: "bg-[#FFE8E8] text-[#FF2222]",
      aprovada: "bg-[#F6FFC6] text-[#79811C]",
      os_gerada: "bg-[#f0ddee] text-[#733B73]",
      aguardando_execucao: "bg-[#EBD4EA] text-[#5D2A61]",
      em_execucao: "bg-[#FFF1CB] text-[#845B00]",
      finalizada: "bg-[#C9F2E9] text-[#1C7551]",
      pendente: "bg-[#E8F7FF] text-[#33CFFF]",
      aceita: "bg-[#FFF4D6] text-[#986F00]",
      verificada: "bg-[#DDF2EE] text-[#40C4AA]",
      rejeitada: "bg-[#FFE8E8] text-[#9D0000]",
    };

    return map[status] || "bg-gray-100 text-gray-600";
  };

  const typeLabels = {
    TAPA_BURACO: "Buraco",
    AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
    MEIO_FIO: "Meio fio",
    DESOBSTRUCAO: "Desobstrução",
    LIMPA_FOSSA: "Limpa fossa",
  };

  function StatusBadge({
    status,
    isEmergencial,
    isDelayed,
    labelOverrides = {},
  }) {
    const statusLabels = {
      em_analise: "Em análise",
      emergencial: "Emergencial",
      aprovada: "Aprovada",
      os_gerada: "O.S. gerada",
      aguardando_execucao: "Agendada",
      em_execucao: "Andamento",
      finalizada: "Finalizada",
      pendente: "Pendente",
      aceita: "Aceita",
      verificada: "Verificada",
      rejeitada: "Rejeitada",
    };

    const labelBase =
      (labelOverrides && labelOverrides[status]) ??
      statusLabels[status] ??
      status;

    // ⏰ Se estiver atrasada, sobrescreve completamente (label e cores)
    if (isDelayed) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold break-words text-center bg-[#E9E4FC] text-[#4F26F0]">
          Atrasada
        </span>
      );
    }

    // 🔴 se for emergencial, força vermelho fixo
    const baseClass = isEmergencial
      ? "bg-[#FFE8E8] text-[#FF2222]"
      : getStatusClasses(status);

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold break-words text-center ${baseClass}`}
      >
        {labelBase}
      </span>
    );
  }

  return (
    <div className="w-full mx-auto px-6">
      {/* Header apenas para desktop */}
      <div className="hidden xl:block bg-[#D9DCE2] text-[#020231] font-semibold rounded-xl px-4 py-5 border border-gray-200 mb-2 md:text-sm">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1 pl-6" title="Data">
            <button
              type="button"
              onClick={() =>
                onToggleDateOrder?.(
                  dateOrder === "recent" ? "oldest" : "recent"
                )
              }
              className="group inline-flex items-center gap-1 select-none"
            >
              Data
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  dateOrder === "recent" ? "" : "rotate-180"
                }`}
              />
            </button>
          </div>

          <div className="col-span-1" title="Origem">
            Origem
          </div>
          <div className="col-span-1 " title="Protocolo">
            Protocolo
          </div>
          <div className="col-span-1 truncate" title="Enviado por">
            Enviado por
          </div>
          <div className="col-span-1 truncate" title="Revisado por">
            Revisado por
          </div>
          <div className="col-span-1" title="Bairro">
            Bairro
          </div>
          <div className="col-span-3" title="Endereço">
            Endereço
          </div>
          <div className="col-span-2" title="Tipo">
            Tipo
          </div>
          <div className="col-span-1" title="Status">
            Status
          </div>
        </div>
      </div>

      {/* Lista de ocorrências */}
      <div className="space-y-1">
        {/* ⬅️ estado vazio */}
        {!dataToRender || dataToRender.length === 0 ? (
          <div className="w-full">
            <div className="border border-dashed border-gray-300 rounded-xl bg-white">
              <div className="px-6 py-10 text-center">
                <div className="text-sm font-medium text-gray-700">
                  Não há ocorrências para os filtros selecionados.
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Ajuste os filtros ou limpe a busca para ver resultados.
                </div>
              </div>
            </div>
          </div>
        ) : (
          dataToRender.map((occ) => (
            <div
              key={occ.id}
              className={`${
                expandedRow === occ.id ? "bg-[#F7F7F7]" : "bg-white"
              } border border-gray-200 rounded-xl overflow-hidden`}
            >
              {/* Linha principal */}
              <div
                className="hover:bg-gray-50 transition cursor-pointer"
                onClick={() => toggleRow(occ.id)}
              >
                {/* Layout Mobile */}
                <div className="xl:hidden p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center mt-1">
                      {expandedRow === occ.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {occ.protocol || occ.protocolNumber || "—"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {occ.createdAt
                              ? format(new Date(occ.createdAt), "dd/MM/yy")
                              : "—"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            status={occ.status}
                            isEmergencial={occ.isEmergencial}
                            isDelayed={occ.isDelayed}
                            labelOverrides={statusLabelOverrides}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Origem
                          </span>
                          {occ.origin || "Plataforma"}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Tipo
                          </span>
                          {typeLabels[occ.type] || occ.type || "—"}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Bairro
                          </span>
                          {occ?.address?.neighborhoodName ||
                            occ?.address?.neighborhood ||
                            "—"}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Enviado por
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                              {getInicials(occ?.pilot?.name || "NA")}
                            </span>
                            <span className="text-xs" title={occ?.author?.name}>
                              {occ?.author?.name || occ?.requester?.name || "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-gray-400 block">
                          Endereço
                        </span>
                        <div className="text-sm text-gray-600">
                          {`${occ.address?.street || ""}, ${
                            occ.address?.number || ""
                          } - ${occ.address?.city || ""}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Layout Desktop */}
                <div className="hidden xl:block p-4">
                  <div className="grid grid-cols-12 gap-4 items-center text-[#787891]">
                    <div className="col-span-1 flex items-center gap-2">
                      {expandedRow === occ.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm">
                        {occ.createdAt || occ.requestedAt
                          ? format(
                              new Date(occ.createdAt || occ.requestedAt),
                              "dd/MM/yy"
                            )
                          : "—"}
                      </span>
                    </div>

                    <div className="col-span-1 text-sm">
                      {occ.origin || "Plataforma"}
                    </div>

                    <div className="col-span-1 text-sm min-w-0">
                      <span
                        className="block truncate"
                        title={occ.protocol || occ.protocolNumber || "—"}
                      >
                        {occ.protocol || occ.protocolNumber || "—"}
                      </span>
                    </div>

                    <div className="col-span-1 flex items-center gap-2">
                      <span className="flex h-7 w-7 px-3 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                        {getInicials(
                          occ?.author?.name || occ?.requester?.name || "NA"
                        )}
                      </span>
                      <span className="text-sm truncate">
                        {occ?.author?.name || occ?.requester?.name || "—"}
                      </span>
                    </div>

                    <div className="col-span-1 flex items-center gap-2">
                      <span className="flex h-7 w-7 px-3 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                        {getInicials(occ?.pilot?.name || "NA")}
                      </span>
                      <span className="text-sm truncate">
                        {occ?.approvedBy?.name || "—"}
                      </span>
                    </div>

                    <div className="col-span-1 text-sm">
                      {occ?.address?.neighborhoodName ||
                        occ?.address?.neighborhood ||
                        "—"}
                    </div>

                    <div className="col-span-3 text-sm truncate">
                      {`${occ.address?.street || ""}, ${
                        occ.address?.number || ""
                      } - ${occ.address?.city || ""}`}
                    </div>

                    <div className="col-span-2 text-sm truncate">
                      {typeLabels[occ.type] || occ.type || "—"}
                    </div>

                    <div className="col-span-1 flex justify-center items-center gap-2">
                      <StatusBadge
                        status={occ.status}
                        isEmergencial={occ.isEmergencial}
                        isDelayed={occ.isDelayed}
                        labelOverrides={statusLabelOverrides}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Linha expandida */}
              {expandedRow === occ.id && (
                <div className="px-3 py-3 bg-[#F7F7F7] ">
                  {renderExpandedRow ? renderExpandedRow(occ) : null}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
