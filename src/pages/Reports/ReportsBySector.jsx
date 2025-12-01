// src/pages/Reports/ReportsBySector.jsx
import React, { useEffect, useRef, useState } from "react";
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

function NeighborhoodBar({ name, count, barColor, maxCount }) {
  const containerRef = useRef(null);
  const labelRef = useRef(null);
  const [minWidthPct, setMinWidthPct] = useState(0);

  // mede o tamanho do texto vs container e calcula a % mínima
  useEffect(() => {
    const containerEl = containerRef.current;
    const labelEl = labelRef.current;
    if (!containerEl || !labelEl) return;

    const containerWidth = containerEl.getBoundingClientRect().width;
    const labelWidth = labelEl.getBoundingClientRect().width;

    if (containerWidth > 0 && labelWidth > 0) {
      const paddingX = 32;
      const neededPct = ((labelWidth + paddingX) / containerWidth) * 100;

      setMinWidthPct(Math.min(neededPct, 100));
    }
  }, [name]);

  const hasCount = typeof count === "number" && !Number.isNaN(count);

  const fraction = hasCount && maxCount > 0 ? count / maxCount : 0;
  const widthPercent = fraction > 0 ? Math.max(fraction * 100, 8) : 0;
  const finalWidth = Math.max(widthPercent, minWidthPct || 0);

  return (
    <div className="w-full">
      {/* container fixo com 40px de altura */}
      <div
        className="h-10 w-full rounded-lg overflow-hidden"
        ref={containerRef}
      >
        <div
          className="h-full flex items-center rounded-lg justify-between px-4 transition-all"
          style={{
            width: `${finalWidth}%`,
            backgroundColor: barColor,
          }}
        >
          <span
            ref={labelRef}
            className="text-[15px] font-semibold text-black pr-3 whitespace-nowrap"
          >
            {name || "-"}
          </span>

          {hasCount ? (
            <span className="min-w-10 text-right text-xs font-semibold text-black">
              {count}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
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
  // campos setoriais
  sectorDay,
  onChangeSectorDay,
  sectorWeek,
  onChangeSectorWeek,
  sectorMonth,
  onChangeSectorMonth,
}) {
  // máscara ativa para pegar a cor da barra
  const activeMask = selectedStatus ? STATUS_MASK[selectedStatus] : null;
  // se tiver chartColor no STATUS_MASK, pega,se não cai pra cinza
  const barColor = activeMask?.chartColor || "#9CA3AF";

  function renderSelector(cardKey) {
    if (cardKey === "day") {
      return (
        <div
          className="absolute right-3 top-3 flex flex-col gap-4 rounded-xl bg-[#ECEFF3] p-1 shadow-sm border "
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
            className="h-[64px] bg-white text-[11px] text-slate-600 rounded-lg px-2 focus:outline-none cursor-pointer"
          />
        </div>
      );
    }

    if (cardKey === "week") {
      return (
        <div
          className="absolute right-3 top-3 flex flex-col gap-4 rounded-xl bg-[#ECEFF3] p-1 shadow-sm border "
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
            className="h-[64px] w-[80px] bg-white text-[11px] text-slate-600 rounded-lg px-2 focus:outline-none cursor-pointer"
          >
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
          className="absolute right-3 top-3 flex flex-col gap-4 rounded-xl bg-[#ECEFF3] p-1 shadow-sm border "
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
            className="h-[64px] w-[110px] bg-white text-[11px] text-slate-600 rounded-lg px-2 focus:outline-none cursor-pointer"
          />
        </div>
      );
    }

    return null;
  }

  // calcula o maior count para usar como base do gráfico
  const maxCount = neighborhoods.reduce((max, n) => {
    if (typeof n.count === "number" && !Number.isNaN(n.count)) {
      return Math.max(max, n.count);
    }
    return max;
  }, 0);

  return (
    <>
      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const isSelectable = ["day", "week", "month"].includes(card.key);
          const isActive = card.key === selectedPeriod;

          // controla tamanho do número conforme quantidade de dígitos
          const valueLabel = anyLoading ? "..." : card.value ?? 0;
          const valueStr = String(valueLabel);
          const isLongNumber =
            !anyLoading &&
            typeof card.value === "number" &&
            valueStr.length >= 4;

          if (isSelectable) {
            const numberClass = isLongNumber
              ? "text-[40px] sm:text-[52px] md:text-[64px] lg:text-[72px] xl:text-[80px]"
              : "text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] xl:text-[110px]";

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => onChangePeriod(card.key)}
                className={cardBoxClasses(isActive, true)}
                title={`Mostrar bairros de ${card.label.toLowerCase()}`}
              >
                <span
                  className={[
                    "font-semibold leading-none whitespace-nowrap",
                    numberClass,
                  ].join(" ")}
                >
                  {valueLabel}
                </span>

                <div className="absolute left-4 bottom-3 text-[14px] tracking-wide text-[#555]">
                  {card.label}
                </div>

                {/* seletores dia / semana / mês */}
                {renderSelector(card.key)}
              </button>
            );
          }

          const totalNumberClass = isLongNumber
            ? "text-[30px] sm:text-[30px] md:text-[30px] lg:text-[30px] xl:text-[40px] 2xl:text-[70px]"
            : "text-[40px] sm:text-[40px] md:text-[40px] lg:text-[52px] xl:text-[60px] 2xl:text-[90px]";

          return (
            <div
              key={card.key}
              className="relative h-[170px] rounded-xl border shadow-sm overflow-hidden flex items-center justify-center transition-all bg-[#F6F8FA] text-[#787891]"
            >
              <span
                className={[
                  "font-semibold leading-none whitespace-nowrap",
                  totalNumberClass,
                ].join(" ")}
              >
                {valueLabel}
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
              {neighborhoods.map((n, idx) => (
                <NeighborhoodBar
                  key={`${n.name}-${idx}`}
                  name={n.name}
                  count={n.count}
                  barColor={barColor}
                  maxCount={maxCount}
                />
              ))}
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
              title="Abrir relatório deste setor"
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

          {/* Linha de status principais: Aprovadas, Andamento, Finalizado */}
          {/* REMOVI o h-[55px] daqui pra não esmagar nada no mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                key: "aprovada",
                value: stats?.totalsByStatus?.aprovada ?? 0,
              },
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
                    } else if (key === "atrasada") {
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

          {/* Flags opcionais */}
          <h4 className="text-sm font-semibold mt-5 mb-1 text-neutral-700">
            Flags opcionais
          </h4>
          <p className="text-[11px] text-neutral-500 mb-2">
            Você pode combinar com um status acima, se desejar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "atrasada", value: stats?.totalsDelayed ?? 0 },
              { key: "emergencial", value: stats?.totalsEmergency ?? 0 },
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
                    } else if (key === "atrasada") {
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
