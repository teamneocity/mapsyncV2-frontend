// src/pages/Reports/index.jsx
"use client";

// React
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";

// Assets
import ImgUsers from "@/assets/icons/imgUsers.svg";

// Componentes locais
import ReportsOverview from "./ReportsOverview";
import ReportsBuilder from "./ReportsBuilder";

// Relatórios
import PrintableDashboardReport from "./PrintableDashboardReport";
import CustomPrintableSOReport from "./CustomPrintableSOReport";
import SectorStatusCoverageReport from "./SectorStatusCoverageReport";

export function Reports() {
  const [selected, setSelected] = useState("Dashboard");

  const [params] = useSearchParams();
  const view = params.get("view") || "overview";

  function handleCloseReport() {
    const p = new URLSearchParams(window.location.search);
    p.delete("view");
    p.delete("reportType");

    p.delete("sectorId");
    p.delete("sectorName");
    p.delete("status");
    p.delete("period");

    const next = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState(null, "", next);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  if (view === "printable_dashboard") {
    return (
      <div className="bg-white min-h-screen">
        <PrintableDashboardReport onClose={handleCloseReport} />
      </div>
    );
  }

  // Página única para o relatório custom
  if (view === "custom_report") {
    return (
      <div className="bg-white min-h-screen">
        <CustomPrintableSOReport onClose={handleCloseReport} />
      </div>
    );
  }

  // Página única para o relatório por Setor+Status
  if (view === "sector_report") {
    return (
      <div className="bg-white min-h-screen">
        <SectorStatusCoverageReport onClose={handleCloseReport} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="px-4 py-4 sm:py-6 space-y-4">
        {/* Título + Imagem */}
        <section className="max-w-[1500px] w-full mx-auto bg-white rounded-xl p-4 sm:p-6 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              <span className="font-semibold">Relatórios. </span>
              Nesta seção, você pode acessar, gerar e exportar relatórios
              personalizados com base nas suas atividades e monitoramentos.
              Visualize dados detalhados por período, filtros e categorias
              específicas, facilitando a análise e a tomada de decisões.
            </p>
          </div>

          <div className="flex-1 max-w-md w-full">
            <img
              src={ImgUsers}
              alt="Ilustração"
              className="w-full rounded-xl object-contain"
            />
          </div>
        </section>

        {view === "builder" ? (
          <section className="max-w-[1500px] w-full mx-auto bg-white rounded-xl p-4 sm:p-6">
            <ReportsBuilder selectedSector={selected} />
          </section>
        ) : (
          <ReportsOverview
            title="Resumo de indicadores operacionais"
            selectedSector={selected}
            onSectorChange={setSelected}
          />
        )}

        <div aria-hidden className="h-8 md:h-3" />
      </div>
    </div>
  );
}
