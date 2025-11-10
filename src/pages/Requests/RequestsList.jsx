// src/pages/Requests/RequestsList.jsx
"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { getInicials } from "@/lib/utils";
import DoubleArrow from "@/assets/icons/DoubleArrow.svg?react";

function getStatusClasses(status) {
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
    aguardando: "bg-gray-100 text-gray-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
}

function StatusBadge({ status, isEmergencial, isDelayed }) {
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
    aguardando: "Aguardando",
  };

  if (isDelayed) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E9E4FC] text-[#4F26F0]">
        Atrasada
      </span>
    );
  }

  const baseClass = isEmergencial
    ? "bg-[#FFE8E8] text-[#FF2222]"
    : getStatusClasses(status);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${baseClass}`}
    >
      {statusLabels[status] || status || "—"}
    </span>
  );
}

const typeLabels = {
  TAPA_BURACO: "Asfalto",
  LIMPA_FOSSA: "Limpa fossa",
  DESOBSTRUCAO: "Drenagem",
  MEIO_FIO: "Meio fio",
  AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
  TERRAPLANAGEM: "Terraplanagem",
  LOGRADOURO: "Logradouro",
  PAVIMENTACAO: "Pavimentação",
  ILUMINACAO: "Iluminação pública",
  LIMPEZA: "Limpeza urbana",
  ESGOTO: "Esgoto",
  GALERIA_PLUVIAL: "Galeria pluvial",
  OUTRO: "Outro",
};

export function RequestsList({
  items = [],
  dateOrder = "recent",
  onToggleDateOrder = () => {},
  renderExpandedRow, // <- novo
}) {
  const [expandedRow, setExpandedRow] = useState(null);

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

  const SPANS = { date: 2, sentBy: 2, neighborhood: 2, address: 3, type: 2, status: 1 };
  const getSpan = (key) => spanClass(SPANS[key] || 1);

  const rows = useMemo(() => {
    return (items || []).map((it) => {
      const createdAt = it.createdAt || it.requestedAt;
      const dateLabel = createdAt
        ? format(new Date(createdAt), "dd/MM/yy")
        : "—";

      const solicitante =
        it?.sentBy?.name || it?.author?.name || it?.createdByName || "—";

      const neighborhood =
        it?.address?.neighborhood ||
        it?.address?.neighborhoodName ||
        it?.neighborhoodName ||
        "—";

      const addressStr =
        [
          it?.address?.street ?? it?.street,
          it?.address?.number ?? it?.number,
          it?.address?.complement ?? it?.complement,
          it?.address?.city ?? it?.city,
        ]
          .filter(Boolean)
          .join(", ") || "—";

      const typeLabel =
        typeLabels[it.type] || it.type?.replaceAll("_", " ") || "—";

      return {
        id: it.id,
        dateLabel,
        createdAt,
        solicitante,
        avatarInitials: getInicials(solicitante || "NA"),
        neighborhood,
        addressStr,
        type: typeLabel,
        status: it.status,
        isEmergencial: it.isEmergencial,
        isDelayed: it.isDelayed,
        description: it.description,
      };
    });
  }, [items]);

  const originalById = useMemo(() => {
    const map = {};
    for (const it of items || []) map[it.id] = it;
    return map;
  }, [items]);

  const toggleRow = (id) => setExpandedRow((prev) => (prev === id ? null : id));

  return (
    <div className="w-full mx-auto px-6">
      {/* Header desktop */}
      <div className="hidden xl:block bg-[#D9DCE2] text-[#020231] font-semibold rounded-xl px-4 py-5 border border-gray-200 mb-2 md:text-sm">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className={`${getSpan("date")}`} title="Data">
            <button
              type="button"
              onClick={() =>
                onToggleDateOrder(dateOrder === "recent" ? "oldest" : "recent")
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
          <div className={`${getSpan("sentBy")}`}>Enviado por</div>
          <div className={`${getSpan("neighborhood")}`}>Bairro</div>
          <div className={`${getSpan("address")}`}>Endereço</div>
          <div className={`${getSpan("type")}`}>Tipo</div>
          <div className={`${getSpan("status")} text-center`}>Status</div>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-1">
        {!rows.length ? (
          <div className="border border-dashed border-gray-300 rounded-xl bg-white">
            <div className="px-6 py-10 text-center">
              <div className="text-sm font-medium text-gray-700">
                Não há registros para os filtros selecionados.
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Ajuste os filtros ou limpe a busca para ver resultados.
              </div>
            </div>
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className={`${
                expandedRow === r.id ? "bg-[#F7F7F7]" : "bg-white"
              } border border-gray-200 rounded-xl overflow-hidden`}
            >
              {/* Cabeçalho da linha */}
              <div
                className="hover:bg-gray-50 transition cursor-pointer"
                onClick={() => toggleRow(r.id)}
              >
                {/* Mobile */}
                <div className="xl:hidden p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center mt-1">
                      {expandedRow === r.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {r.solicitante}
                          </div>
                          <div className="text-xs text-gray-500">
                            {r.dateLabel}
                          </div>
                        </div>
                        <StatusBadge
                          status={r.status}
                          isEmergencial={r.isEmergencial}
                          isDelayed={r.isDelayed}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Bairro
                          </span>
                          {r.neighborhood}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Tipo
                          </span>
                          {r.type}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-gray-400 block">
                          Endereço
                        </span>
                        <div className="text-sm text-gray-600">
                          {r.addressStr}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden xl:block p-4">
                  <div className="grid grid-cols-12 gap-4 items-center text-[#787891]">
                    <div className={`${getSpan("date")} flex items-center gap-2`}>
                      {expandedRow === r.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm">{r.dateLabel}</span>
                    </div>

                    <div className={`${getSpan("sentBy")} flex items-center gap-2`}>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                        {r.avatarInitials}
                      </span>
                      <span className="text-sm truncate">{r.solicitante}</span>
                    </div>

                    <div className={`${getSpan("neighborhood")} text-sm truncate`}>
                      {r.neighborhood}
                    </div>

                    <div className={`${getSpan("address")} text-sm truncate`}>
                      {r.addressStr}
                    </div>

                    <div className={`${getSpan("type")} text-sm truncate`}>
                      {r.type}
                    </div>

                    <div className={`${getSpan("status")} flex justify-center`}>
                      <StatusBadge
                        status={r.status}
                        isEmergencial={r.isEmergencial}
                        isDelayed={r.isDelayed}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandido */}
              {expandedRow === r.id && (
                <div className="px-3 py-3 bg-[#F7F7F7]">
                  <div className="bg-[#F8F8F8] rounded-xl p-4 flex flex-col gap-2 text-sm text-gray-800">
                    <p>
                      <strong>Data:</strong>{" "}
                      {r.createdAt
                        ? format(new Date(r.createdAt), "dd/MM/yyyy HH:mm")
                        : r.dateLabel}
                    </p>
                    <p><strong>Solicitante:</strong> {r.solicitante}</p>
                    <p><strong>Bairro:</strong> {r.neighborhood}</p>
                    <p><strong>Endereço:</strong> {r.addressStr}</p>
                    <p><strong>Tipo:</strong> {r.type}</p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <StatusBadge
                        status={r.status}
                        isEmergencial={r.isEmergencial}
                        isDelayed={r.isDelayed}
                      />
                    </p>
                    {r.description && (
                      <p><strong>Descrição:</strong> {r.description}</p>
                    )}
                  </div>

                  {typeof renderExpandedRow === "function" && (
                    <div className="mt-3">
                      {renderExpandedRow(originalById[r.id] || null)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
