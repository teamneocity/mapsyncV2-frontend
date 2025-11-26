// src/pages/Reports/ReportsBySector.jsx
import React from "react";
import { ChevronRight } from "lucide-react";

function cardBoxClasses(isActive, alignLeft = false) {
  return [
    "relative h-[170px] rounded-xl border shadow-sm overflow-hidden flex items-center",
    alignLeft ? "justify-start px-4" : "justify-center",
    "transition-all bg-[#F6F8FA] text-[#787891]",
    isActive ? "ring-2 ring-indigo-300" : "hover:ring-1 hover:ring-neutral-300",
    "cursor-pointer select-none",
  ].join(" ");
}

export function ReportsBySector({
  cards,
  anyLoading,
  neighborhoods,
  STATUS_MASK,
  selectedStatus,
  onChangeStatus,
  clearStatus,
  stats,
  streetNames,
  selectedPeriod,
  onChangePeriod,
  foundSector,
  onOpenSectorReport,
  // flags
  isEmergencyFilter,
  isDelayedFilter,
  onToggleEmergency,
  onToggleDelayed,
  // janelas setoriais
  sectorDay,
  onChangeSectorDay,
  sectorWeek,
  onChangeSectorWeek,
  sectorMonth,
  onChangeSectorMonth,
}) {
  function renderSelector(cardKey) {
    if (cardKey === "day") {
      return (
        <div
          className="absolute right-3 top-3 flex flex-col gap-1 rounded-xl bg-gray-200 p-2 shadow-sm border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[11px] text-slate-600 font-medium">
            Escolha o dia
          </p>
          <input
            type="date"
            value={sectorDay || ""}
            onChange={(e) => {
              const v = e.target.value;
              // ao mexer no filtro de dia, seleciona o card de dia
              onChangePeriod?.("day");
              onChangeSectorDay?.(v);
            }}
            className="h-[32px] bg-white text-[11px] text-slate-600 rounded-lg px-2 focus:outline-none cursor-pointer"
          />
        </div>
      );
    }

    if (cardKey === "week") {
      return (
        <div
          className="absolute right-3 top-3 flex flex-col gap-1 rounded-xl bg-gray-200 p-2 shadow-sm border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[11px] text-slate-600 font-medium">
            Intervalo da semana
          </p>

          <select
            value={sectorWeek || ""}
            onChange={(e) => {
              const v = e.target.value;
              // ao mexer no filtro de semana, seleciona o card de semana
              onChangePeriod?.("week");
              onChangeSectorWeek?.(v);
            }}
            className="h-[32px] bg-white text-[11px] text-slate-600 rounded-lg px-2 focus:outline-none cursor-pointer"
          >
            <option value="">Selecione</option>
            <option value="0">Semana atual</option>
            <option value="7">Semana de 7 dias atrás</option>
            <option value="14">Semana de 14 dias atrás</option>
          </select>
        </div>
      );
    }

    if (cardKey === "month") {
      return (
        <div
          className="absolute right-3 top-3 flex flex-col gap-1 rounded-xl bg-gray-200 p-2 shadow-sm border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[11px] text-slate-600 font-medium">
            Escolha o mês
          </p>
          <input
            type="month"
            value={sectorMonth || ""}
            onChange={(e) => {
              const v = e.target.value;
              // ao mexer no filtro de mês, seleciona o card de mês
              onChangePeriod?.("month");
              onChangeSectorMonth?.(v);
            }}
            className="h-[32px] bg-white text-[11px] text-slate-600 rounded-lg px-2 focus:outline-none cursor-pointer"
          />
        </div>
      );
    }

    return null;
  }

  return (
    <>
      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const isSelectable = ["day", "week", "month"].includes(card.key);
          const isActive = card.key === selectedPeriod;

          if (isSelectable) {
            // 3 primeiros cards alinhados à esquerda (igual geral)
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => onChangePeriod(card.key)}
                className={cardBoxClasses(isActive, true)}
                title={`Mostrar bairros de ${card.label.toLowerCase()}`}
              >
                <span className="text-[96px] font-semibold leading-none">
                  {anyLoading ? "..." : card.value}
                </span>

                <div className="absolute left-4 bottom-3 text-[14px] tracking-wide text-[#555]">
                  {card.label}
                </div>

                {/* seletores dia / semana / mês */}
                {renderSelector(card.key)}
              </button>
            );
          }

          // Último card (total) continua centralizado
          return (
            <div
              key={card.key}
              className="relative h-[170px] rounded-xl border shadow-sm overflow-hidden flex items-center justify-center transition-all bg-[#F6F8FA] text-[#787891]"
            >
              <span className="text-[96px] font-semibold leading-none">
                {anyLoading ? "..." : card.value}
              </span>
              <div className="absolute left-4 bottom-3 text-[14px] tracking-wide">
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bairros */}
        <div className="lg:col-span-7 rounded-xl border border-neutral-200/70 bg-white shadow-sm p-5">
          <h3 className="text-2xl font-semibold">
            Bairros co-relacionados atendidos
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {selectedPeriod === "day" &&
              (sectorDay ? `No dia selecionado (${sectorDay})` : "Hoje")}
            {selectedPeriod === "week" &&
              (sectorWeek
                ? `Na semana do dia (${sectorWeek})`
                : "Nesta semana")}
            {selectedPeriod === "month" &&
              (sectorMonth
                ? `No mês selecionado (${sectorMonth})`
                : "Neste mês")}
          </p>

          {neighborhoods.length > 0 ? (
            <div className="mt-4 space-y-3">
              {neighborhoods.map((n, idx) => {
                const mask = STATUS_MASK[selectedStatus] || {};
                const bgClass = mask.cls?.split(" ")[0] || "bg-gray-100";
                const textClass = mask.cls?.split(" ")[1] || "text-gray-800";

                return (
                  <div key={`${n.name}-${idx}`} className="w-full">
                    <div
                      className={`flex items-center justify-between rounded-lg px-4 h-10 ${bgClass} ${textClass} transition-colors`}
                    >
                      <span className="text-[15px] font-medium truncate pr-3">
                        {n.name || "-"}
                      </span>
                      {typeof n.count === "number" ? (
                        <span className="min-w-10 text-center px-2 py-0.5 rounded-full bg-white/50 text-xs font-semibold">
                          {n.count}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
              {anyLoading ? "Carregando…" : "Sem bairros para este período."}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onOpenSectorReport}
              disabled={!foundSector?.id}
              className="h-12 px-4 rounded-lg border border-neutral-200 bg-white text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Abrir relatório do setor e status selecionados"
            >
              Abrir relatório deste setor
            </button>
          </div>
        </div>

        {/* Status + Endereços */}
        <div className="lg:col-span-5 rounded-xl border border-neutral-200/70 bg-[#F6F8FA] shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Status co-relacionados</h3>

            <button
              type="button"
              onClick={clearStatus}
              disabled={!selectedStatus}
              className="text-xs h-8 px-3 rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remover status
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                key: "em_analise",
                value: stats?.totalsByStatus?.em_analise ?? 0,
              },
              {
                key: "aprovada",
                value: stats?.totalsByStatus?.aprovada ?? 0,
              },
              { key: "emergencial", value: stats?.totalsEmergency ?? 0 },
              { key: "atrasada", value: stats?.totalsDelayed ?? 0 },
              {
                key: "em_execucao",
                value: stats?.totalsByStatus?.em_execucao ?? 0,
              },
              {
                key: "finalizada",
                value: stats?.totalsByStatus?.finalizada ?? 0,
              },
            ].map(({ key, value }) => {
              const mask = STATUS_MASK[key] || {};
              const isFlag = mask.isFlag;

              let isActive = false;
              if (isFlag) {
                if (key === "emergencial") {
                  isActive = !!isEmergencyFilter;
                } else if (key === "atrasada") {
                  isActive = !!isDelayedFilter;
                }
              } else {
                isActive = key === selectedStatus;
              }

              const baseCls = `${mask.cls || ""} ${
                isActive ? mask.active || "" : ""
              } px-4 py-4 rounded-lg text-sm font-medium flex items-center justify-between w-full`;

              if (mask.clickable) {
                const handleClick = () => {
                  if (isFlag) {
                    if (key === "emergencial" && onToggleEmergency) {
                      onToggleEmergency();
                    } else if (key === "atrasada" && onToggleDelayed) {
                      onToggleDelayed();
                    }
                  } else {
                    onChangeStatus(key);
                  }
                };

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={handleClick}
                    className={baseCls}
                    title={
                      isFlag
                        ? `Filtrar por flag ${mask.label}`
                        : `Filtrar por ${mask.label}`
                    }
                  >
                    <span>{mask.label}</span>
                    <span className="opacity-70">({value})</span>
                  </button>
                );
              }

              return (
                <div
                  key={key}
                  className={`${baseCls} cursor-not-allowed`}
                  title={`${mask.label} (informativo)`}
                >
                  <span>{mask.label}</span>
                  <span className="opacity-70">({value})</span>
                </div>
              );
            })}
          </div>

          <h3 className="text-lg font-semibold mt-6">
            Endereços co-relacionados
          </h3>
          <div className="mt-2">
            {streetNames && streetNames.length > 0 ? (
              <div className="space-y-3">
                {streetNames.map((street, idx) => (
                  <button
                    key={`${street}-${idx}`}
                    type="button"
                    className="w-full h-[64px] flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 transition"
                    title={street}
                  >
                    <ChevronRight className="shrink-0 opacity-60" size={18} />
                    <span className="truncate text-[15px]">{street}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-[120px] flex items-center justify-center text-gray-400 text-sm">
                {anyLoading
                  ? "Carregando endereços…"
                  : "Sem endereços para este período."}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
