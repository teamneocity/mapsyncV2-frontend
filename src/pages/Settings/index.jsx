"use client";

// React e bibliotecas externas
import { useState } from "react";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";

// Assets
import Mapa from "@/assets/Mapa.svg";
import SystemMode from "@/assets/Mode/SystemMode.svg?react";
import LightMode from "@/assets/Mode/LightMode.svg?react";
import DarkMode from "@/assets/Mode/DarkMode.svg?react";


export function Settings() {
  const [activeTab, setActiveTab] = useState("Dashboards");
  const [selectedTheme, setSelectedTheme] = useState(null);

  const tabs = [
    "Dashboards",
    "Notificações",
    "Termos de uso",
    "Privacidade",
    "Segurança",
    "LGPD",
  ];

  const themes = [
    {
      label: "System (Default)",
      icon: SystemMode,
      desc: "Opte pelo tema do sistema padrão para um ambiente limpo",
    },
    {
      label: "Light Mode",
      icon: LightMode,
      desc: "Ideal para ambientes bem iluminados e trabalho diurno",
    },
    {
      label: "Dark Mode",
      icon: DarkMode,
      desc: "Opte pelo tema do sistema escuro para melhor desempenho noturno",
    },
  ];

  return (
    <div className="bg-[#EBEBEB] min-h-screen font-inter">
      <Sidebar />
      <main className="w-full px-6 sm:pl-[250px] max-w-full space-y-4 pt-6">
        <TopHeader />

        {/* Introdução */}
        <section className="max-w-[1500px] w-full mx-auto bg-white rounded-xl p-2 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              <span className="font-semibold">Configurações gerais.</span> Aqui
              nessa sessão você pode configurar seu perfil de visualização da
              dashboard, adaptar suas visualizações combinadas com suas rotinas,
              definir as notificações. Também conhecer nossos termos e os nível
              de segurança aliadas as nossas regras do LGDP
            </p>
          </div>
          <div className="flex-1 max-w-md w-full">
            <img
              src={Mapa}
              alt="Ilustração"
              className="w-full rounded-xl object-contain"
            />
          </div>
        </section>

        {/* Seletor de temas e abas */}
        <section className="max-w-[1500px] w-full mx-auto flex flex-col xl:flex-row gap-6">
          {/* Coluna da seleção lateral */}
          <aside className="w-full xl:w-[250px] bg-white rounded-xl p-2 shadow-sm">
            <ul>
              {tabs.map((tab, index) => (
                <li
                  key={tab}
                  className={`${
                    index !== tabs.length - 1 ? "border-b border-[#EEEEEE]" : ""
                  }`}
                >
                  <button
                    onClick={() => setActiveTab(tab)}
                    className={`w-full h-[55px] flex items-center justify-center text-sm font-medium transition rounded-md ${
                      activeTab === tab
                        ? "bg-[#F5F5F5] text-zinc-800"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Coluna do conteúdo ativo */}
          <div className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            {activeTab === "Dashboards" ? (
              <>
                <h2 className="text-lg font-semibold text-[#787891]">
                  Selecione o tema e o modelo do seu B.I.
                </h2>
                <p className="text-sm text-zinc-500 mb-4">
                  Escolha o tema perfeito para personalizar sua experiência e
                  torná-la exclusivamente sua
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {themes.map(({ label, icon: Icon, desc }, index) => {
                    const isSelected = selectedTheme === index;

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedTheme(index)}
                        className={`cursor-pointer bg-white rounded-xl p-3 border ${
                          isSelected ? "border-zinc-800" : "border-zinc-200"
                        } shadow-sm transition`}
                      >
                        <div className="w-full bg-[#F5F5F5] p-4 rounded-md flex items-center justify-center">
                          <Icon className="w-full h-auto max-h-[140px] object-contain" />
                        </div>
                        <div className="mt-3">
                          <h3 className="text-sm font-semibold text-zinc-800">
                            {label}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-1">{desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-[#787891] mb-4">
                  {activeTab}
                </h2>
                <div className="text-zinc-500 text-sm">
                  Conteúdo da aba <strong>{activeTab}</strong> virá aqui em
                  breve.
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
