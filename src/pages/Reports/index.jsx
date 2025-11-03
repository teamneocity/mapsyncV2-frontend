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

import PrintableDashboardReport from "./PrintableDashboardReport";

export function Reports() {
  const [selected, setSelected] = useState("Dashboard");

  
  const [params] = useSearchParams();
  const view = params.get("view") || "overview";

    // Quando exibir o relatório apenas aparecerá ele
  if (view === "printable_dashboard") {
    return (
      <div className="bg-white min-h-screen">
        <PrintableDashboardReport />
      </div>
    );
  }

  return (
    <div className="bg-[#EBEBEB] min-h-screen font-inter">
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo principal */}
      <main className="w-full px-6 sm:pl-[250px] max-w-full space-y-4 pt-6">
        {/* TopHeader */}
        <TopHeader />

        {/* Título + Imagem */}
        <section className="max-w-[1500px] w-full mx-auto bg-white rounded-xl p-2 flex flex-col xl:flex-row justify-between items-center gap-6 mt-4">
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

        {/*
          explicação:
          - Mantive seu ReportsOverview como está.
          - Quando ?view=builder estiver na URL (definido lá de dentro do ReportsOverview),
            eu rendo o ReportsBuilder.
          - O wrapper de largura/estilo é igual (max-w-[1500px], bg-white, rounded, etc.)
            para o visual ficar idêntico ao do que já renderiza.
        */}
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
      </main>
    </div>
  );
}
