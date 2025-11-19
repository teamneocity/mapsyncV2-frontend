"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { getInicials } from "@/lib/utils";
import { format } from "date-fns";
import DoubleArrow from "@/assets/icons/DoubleArrow.svg?react";

export const PlaninList = forwardRef(function PlaninList(
  {
    occurrences = [],
    renderExpandedRow,
    statusLabelOverrides = {},
    alwaysShowFullProtocol = true,
    onOrderChange, // opcional
  },
  ref
) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [rows, setRows] = useState(() => occurrences || []);
  const [selectedIds, setSelectedIds] = useState([]);
  const dragSrcId = useRef(null);
  const [dragOverId, setDragOverId] = useState(null);

  // reseta quando recarrega as ocorrências
  useEffect(() => {
    setRows(occurrences || []);
    setExpandedRow(null);
    setSelectedIds([]);
  }, [occurrences]);

  useImperativeHandle(ref, () => ({
    getOrder: () => rows,
    getSelected: () => rows.filter((r) => selectedIds.includes(r.id)),
  }));

  const reorder = (list, fromIdx, toIdx) => {
    const copy = list.slice();
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    return copy;
  };

  const onDragStart = (e, id) => {
    dragSrcId.current = id;
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e, id) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const onDrop = (e, targetId) => {
    e.preventDefault();
    const srcId = dragSrcId.current;
    setDragOverId(null);
    dragSrcId.current = null;
    if (!srcId || srcId === targetId) return;
    const fromIdx = rows.findIndex((r) => r.id === srcId);
    const toIdx = rows.findIndex((r) => r.id === targetId);
    const next = reorder(rows, fromIdx, toIdx);
    setRows(next);
    onOrderChange?.(next);
  };
  const onDragEnd = () => {
    setDragOverId(null);
    dragSrcId.current = null;
  };

  const toggleRow = (id) => setExpandedRow((p) => (p === id ? null : id));

  // seleção individual
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // helpers de período
  const fmt = (d) => {
    if (!d) return null;
    try {
      const date = d instanceof Date ? d : new Date(d);
      if (Number.isNaN(+date)) return null;
      return format(date, "dd/MM/yyyy");
    } catch {
      return null;
    }
  };
  const formatPeriodo = (start, end) => {
    const s = fmt(start);
    const e = fmt(end);
    if (s && e) return `${s} - ${e}`;
    if (s) return s;
    if (e) return e;
    return "—";
  };

  // largura colunas
  const SPANS = {
    protocol: 2,
    inspector: 1,
    foreman: 1,
    company: 1,
    address: 2,
    neighborhood: 1,
    type: 1,
    period: 2,
    status: 1,
  };
  const spanClass = (k) => `col-span-${SPANS[k] ?? 1}`;

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
    TAPA_BURACO: "Asfalto",
    AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
    MEIO_FIO: "Meio fio",
    DESOBSTRUCAO: "Drenagem",
    LIMPA_FOSSA: "Limpa fossa",
  };

  function StatusBadge({ status, isEmergencial, isDelayed, labelOverrides }) {
    const labels = {
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

    //  Se estiver atrasada, o label é sempre "Atrasado"
    const label = isDelayed
      ? "Atrasada"
      : (labelOverrides && labelOverrides[status]) ?? labels[status] ?? status;
   
    const base = isDelayed
      ? "bg-[#E9E4FC] text-[#4F26F0]"
      : isEmergencial
      ? "bg-[#FFE8E8] text-[#FF2222]"
      : getStatusClasses(status);

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${base}`}
      >
        {label}
      </span>
    );
  }

  const columns = [
    "protocol", // OS
    "inspector", // Técnico
    "foreman", // Encarregado
    "company", // Companhia
    "address", // Endereço
    "neighborhood", // Bairro
    "type", // Tipo
    "period", // Execução
    "status", // Status
  ];

  const dataToRender = rows || [];

  return (
    <div className="w-full mx-auto px-6">
      {/* Header */}
      <div className="hidden xl:block bg-[#D9DCE2] text-[#020231] font-semibold rounded-xl px-4 py-5 border border-gray-200 mb-2 md:text-sm">
        <div className="grid grid-cols-12 gap-4 items-center">
          {columns.map((key) => (
            <div key={key} className={spanClass(key)}>
              {
                {
                  protocol: (
                    <div className="flex items-center gap-2">
                      <ChevronRight />
                      OS
                    </div>
                  ),
                  inspector: "Técnico",
                  foreman: "Encarregado",
                  company: "Companhia",
                  address: "Endereço",
                  neighborhood: "Bairro",
                  type: "Tipo",
                  period: "Execução",
                  status: "Status",
                }[key]
              }
            </div>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-1">
        {dataToRender.map((occ) => {
          const company =
            occ.externalCompany || occ?.occurrence?.externalCompany || "EMURB";
          const insp = occ?.inspector?.name || occ?.pilot?.name || "—";
          const fore = occ?.foreman?.name || "—";
          const selected = selectedIds.includes(occ.id);
          const isDragOver = dragOverId === occ.id;
          const periodo = formatPeriodo(occ?.scheduledStart, occ?.scheduledEnd);

          return (
            <div
              key={occ.id}
              draggable
              onDragStart={(e) => onDragStart(e, occ.id)}
              onDragOver={(e) => onDragOver(e, occ.id)}
              onDrop={(e) => onDrop(e, occ.id)}
              onDragEnd={onDragEnd}
              className={`${
                expandedRow === occ.id ? "bg-[#F7F7F7]" : "bg-white"
              } border border-gray-200 rounded-xl overflow-hidden ${
                isDragOver ? "ring-2 ring-blue-300" : ""
              }`}
            >
              {/* Cabeçalho */}
              <div
                className="hover:bg-gray-50 transition cursor-pointer"
                onClick={() => toggleRow(occ.id)}
              >
                {/* Desktop */}
                <div className="hidden xl:block p-4">
                  <div className="grid grid-cols-12 gap-4 items-center text-[#787891]">
                    {/* OS  */}
                    <div
                      className={`${spanClass(
                        "protocol"
                      )} flex items-center gap-2`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(occ.id)}
                        className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-400"
                      />
                      <ChevronRight
                        className={`h-4 w-4 text-gray-500 transition-transform ${
                          expandedRow === occ.id ? "rotate-90" : ""
                        }`}
                      />
                      <span className="text-sm truncate">
                        {occ.protocol || occ.protocolNumber || "—"}
                      </span>
                    </div>

                    {/* Técnico */}
                    <div
                      className={`${spanClass(
                        "inspector"
                      )} flex items-center gap-2`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                        {getInicials(insp || "NA")}
                      </span>
                      <span className="text-sm truncate" title={insp}>
                        {insp}
                      </span>
                    </div>

                    {/* Encarregado */}
                    <div
                      className={`${spanClass(
                        "foreman"
                      )} flex items-center gap-2`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                        {getInicials(fore || "NA")}
                      </span>
                      <span className="text-sm truncate">{fore}</span>
                    </div>

                    {/* Companhia */}
                    <div className={`${spanClass("company")} text-sm truncate`}>
                      {company}
                    </div>

                    {/* Endereço */}
                    <div className={`${spanClass("address")} text-sm truncate`}>
                      {`${occ.address?.street || ""}, ${
                        occ.address?.number || ""
                      } - ${occ.address?.city || ""}`}
                    </div>

                    {/* Bairro */}
                    <div
                      className={`${spanClass(
                        "neighborhood"
                      )} text-sm truncate`}
                    >
                      {occ?.address?.neighborhoodName ||
                        occ?.address?.neighborhood ||
                        "—"}
                    </div>

                    {/* Tipo */}
                    <div className={`${spanClass("type")} text-sm truncate`}>
                      {typeLabels[occ.type] || occ.type || "—"}
                    </div>

                    {/* Execução (Período) */}
                    <div className={`${spanClass("period")} text-sm truncate`}>
                      {periodo}
                    </div>

                    {/* Status */}
                    <div
                      className={`${spanClass("status")} flex justify-center`}
                    >
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

              {expandedRow === occ.id && (
                <div className="px-3 py-3 bg-[#F7F7F7]">
                  {renderExpandedRow?.(occ)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
