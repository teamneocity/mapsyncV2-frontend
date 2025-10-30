"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getInicials } from "@/lib/utils";
import { format } from "date-fns";
import DoubleArrow from "@/assets/icons/DoubleArrow.svg?react";

export function OccurrenceList({
  occurrences,
  serviceorders,
  renderExpandedRow,
  showEmergencialStatus = false,
  dateOrder = "recent",
  onToggleDateOrder,
  statusLabelOverrides = {},
  hiddenColumns = [],
}) {
  const [expandedRow, setExpandedRow] = useState(null);

  const hide = (key) => hiddenColumns?.includes(key);

  const spanClass = (n) => {
    const map = {
      1: "col-span-1",
      2: "col-span-2",
      3: "col-span-3",
      4: "col-span-4",
      5: "col-span-5",
      6: "col-span-6",
      7: "col-span-7",
      8: "col-span-8",
      9: "col-span-9",
      10: "col-span-10",
      11: "col-span-11",
      12: "col-span-12",
    };
    return map[Math.max(1, Math.min(12, n))];
  };

  const BASE_SPANS = {
    data: 1,
    origin: 1,
    protocol: 1,
    sentBy: 1,
    reviewedBy: 1,
    neighborhood: 1,
    address: 3,
    type: 2,
    status: 1,
  };

  const visibleSpans = Object.entries(BASE_SPANS).reduce((sum, [key, span]) => {
    return hide(key) ? sum : sum + span;
  }, 0);

  let deficit = Math.max(0, 12 - visibleSpans);

  let addressSpanNum = hide("address") ? 0 : BASE_SPANS.address;
  let typeSpanNum = hide("type") ? 0 : BASE_SPANS.type;

  if (deficit > 0) {
    if (!hide("address")) {
      const add = deficit;
      addressSpanNum = Math.min(12, addressSpanNum + add);
      deficit -= add;
    }
    if (deficit > 0 && !hide("type")) {
      typeSpanNum = Math.min(12 - addressSpanNum, typeSpanNum + deficit);
      deficit = 0;
    }
  }

  if (addressSpanNum + typeSpanNum > 12) {
    const extra = addressSpanNum + typeSpanNum - 12;
    if (typeSpanNum >= extra) typeSpanNum -= extra;
    else {
      const rest = extra - typeSpanNum;
      typeSpanNum = 0;
      addressSpanNum = Math.max(1, addressSpanNum - rest);
    }
  }

  const dataToRender =
    serviceorders?.length > 0
      ? serviceorders.map((s) => ({
          ...s.occurrence,
          isEmergencial: s.occurrence?.isEmergencial,
          isDelayed: s?.isDelayed === true,
          raw: s,
        }))
      : occurrences;

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
      encaminhada_externa: "bg-[#EDEDED] text-[#5F5F5F]",
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
      encaminhada_externa: "Arquivada",
    };

    const labelBase =
      (labelOverrides && labelOverrides[status]) ??
      statusLabels[status] ??
      status;

    if (isDelayed) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold break-words text-center bg-[#E9E4FC] text-[#4F26F0]">
          Atrasada
        </span>
      );
    }

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
          {!hide("data") && (
            <div className="col-span-1" title="Data">
              <button
                type="button"
                onClick={() =>
                  onToggleDateOrder?.(
                    dateOrder === "recent" ? "oldest" : "recent"
                  )
                }
                className="group inline-flex items-center gap-4 select-none"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    dateOrder === "recent" ? "" : "rotate-180"
                  }`}
                />
                Data
                <DoubleArrow className="max-[1430px]:hidden inline" />
              </button>
            </div>
          )}

          {!hide("origin") && (
            <div className="col-span-1" title="Origem">
              Origem
            </div>
          )}
          {!hide("protocol") && (
            <div className="col-span-1" title="Protocolo">
              Protocolo
            </div>
          )}
          {!hide("sentBy") && (
            <div className="col-span-1 truncate" title="Enviado por">
              Enviado por
            </div>
          )}
          {!hide("reviewedBy") && (
            <div className="col-span-1 truncate" title="Revisado por">
              Revisado por
            </div>
          )}
          {!hide("neighborhood") && (
            <div className="col-span-1" title="Bairro">
              Bairro
            </div>
          )}
          {!hide("address") && (
            <div className={`${spanClass(addressSpanNum)}`} title="Endereço">
              Endereço
            </div>
          )}
          {!hide("type") && (
            <div className={`${spanClass(typeSpanNum)}`} title="Tipo">
              Tipo
            </div>
          )}
          {!hide("status") && (
            <div className="col-span-1" title="Status">
              Status
            </div>
          )}
        </div>
      </div>

      {/* Lista de ocorrências */}
      <div className="space-y-1">
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
          dataToRender.map((occ) => {
            const companyName =
              (typeof occ?.externalCompany === "string" &&
                occ.externalCompany.trim()) ||
              (typeof occ?.occurrence?.externalCompany === "string" &&
                occ.occurrence.externalCompany.trim()) ||
              (typeof occ?.raw?.occurrence?.externalCompany === "string" &&
                occ.raw.occurrence.externalCompany.trim()) ||
              occ?.externalCompany ||
              occ?.occurrence?.externalCompany ||
              occ?.raw?.occurrence?.externalCompany ||
              "EMURB";

            return (
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
                            {!hide("data") && (
                              <div className="text-xs text-gray-500">
                                {occ.createdAt
                                  ? format(new Date(occ.createdAt), "dd/MM/yy")
                                  : "—"}
                              </div>
                            )}
                          </div>
                          {!hide("status") && (
                            <div className="flex items-center gap-2">
                              <StatusBadge
                                status={occ.status}
                                isEmergencial={occ.isEmergencial}
                                isDelayed={occ.isDelayed}
                                labelOverrides={statusLabelOverrides}
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                          {!hide("origin") && (
                            <div>
                              <span className="text-xs font-medium text-gray-400 block">
                                Origem
                              </span>
                              {occ.origin || "Plataforma"}
                            </div>
                          )}
                          {!hide("type") && (
                            <div>
                              <span className="text-xs font-medium text-gray-400 block">
                                Tipo
                              </span>
                              {typeLabels[occ.type] || occ.type || "—"}
                            </div>
                          )}
                          {!hide("neighborhood") && (
                            <div>
                              <span className="text-xs font-medium text-gray-400 block">
                                Bairro
                              </span>
                              {occ?.address?.neighborhoodName ||
                                occ?.address?.neighborhood ||
                                "—"}
                            </div>
                          )}
                          {!hide("sentBy") && (
                            <div>
                              <span className="text-xs font-medium text-gray-400 block">
                                Enviado por
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                                  {getInicials(occ?.pilot?.name || "NA")}
                                </span>
                                <span
                                  className="text-xs"
                                  title={occ?.author?.name}
                                >
                                  {occ?.author?.name ||
                                    occ?.requester?.name ||
                                    "—"}
                                </span>
                              </div>
                            </div>
                          )}

                          {!hide("company") && (
                            <div>
                              <span className="text-xs font-medium text-gray-400 block">
                                Companhia
                              </span>
                              {companyName}
                            </div>
                          )}
                        </div>

                        {!hide("address") && (
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
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Layout Desktop */}
                  <div className="hidden xl:block p-4">
                    <div className="grid grid-cols-12 gap-4 items-center text-[#787891]">
                      {!hide("data") && (
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
                      )}

                      {!hide("origin") && (
                        <div className="col-span-1 text-sm">
                          {occ.origin || "Plataforma"}
                        </div>
                      )}

                      {!hide("protocol") && (
                        <div className="col-span-1 text-sm min-w-0">
                          <span
                            className="block truncate"
                            title={occ.protocol || occ.protocolNumber || "—"}
                          >
                            {occ.protocol || occ.protocolNumber || "—"}
                          </span>
                        </div>
                      )}

                      {!hide("sentBy") && (
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
                      )}

                      {!hide("reviewedBy") && (
                        <div className="col-span-1 flex items-center gap-2">
                          <span className="flex h-7 w-7 px-3 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                            {getInicials(occ?.pilot?.name || "NA")}
                          </span>
                          <span className="text-sm truncate">
                            {occ?.approvedBy?.name || "—"}
                          </span>
                        </div>
                      )}

                      {!hide("neighborhood") && (
                        <div className="col-span-1 text-sm">
                          {occ?.address?.neighborhoodName ||
                            occ?.address?.neighborhood ||
                            "—"}
                        </div>
                      )}

                      {!hide("address") && (
                        <div
                          className={`${spanClass(
                            addressSpanNum
                          )} text-sm truncate`}
                        >
                          {`${occ.address?.street || ""}, ${
                            occ.address?.number || ""
                          } - ${occ.address?.city || ""}`}
                        </div>
                      )}

                      {!hide("type") && (
                        <div
                          className={`${spanClass(
                            typeSpanNum
                          )} text-sm truncate`}
                        >
                          <div className="truncate">
                            {typeLabels[occ.type] || occ.type || "—"}
                          </div>
                          {!hide("company") && (
                            <div className="text-xs text-gray-500 truncate">
                              Companhia: {companyName}
                            </div>
                          )}
                        </div>
                      )}

                      {!hide("status") && (
                        <div className="col-span-1 flex justify-center items-center gap-2">
                          <StatusBadge
                            status={occ.status}
                            isEmergencial={occ.isEmergencial}
                            isDelayed={occ.isDelayed}
                            labelOverrides={statusLabelOverrides}
                          />
                        </div>
                      )}
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
            );
          })
        )}
      </div>
    </div>
  );
}
