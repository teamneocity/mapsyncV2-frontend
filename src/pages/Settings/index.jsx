"use client";

import { useState, useMemo, Suspense, lazy } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import Mapa from "@/assets/Mapa.svg";
import SystemMode from "@/assets/Mode/SystemMode.svg?react";
import LightMode from "@/assets/Mode/LightMode.svg?react";
import DarkMode from "@/assets/Mode/DarkMode.svg?react";

// Lazy load dos conteúdos pesados (carrega só quando clicar)
const PanelAdmContent = lazy(() => import("./PanelAdmContent"));
const UserManagementContent = lazy(() => import("./UserManagementContent"));
const SectorAdminContent = lazy(() => import("./SectorAdminContent"));

export function Settings() {
  const [activeTab, setActiveTab] = useState("Painéis de B.I.");
  const [selectedTheme, setSelectedTheme] = useState(null);

  const tabs = useMemo(
    () => [
      "Painéis de B.I.",
      "Notificações",
      "Criar usuários",
      "Gestão de usuários",
      "Gestão de setores",
      "LGPD",
    ],
    []
  );

  const ContentByTab = {
    "Painéis de B.I.": () => (
      <>
        <h2 className="text-lg font-semibold text-[#787891]">
          Selecione o tema e o modelo do seu B.I.
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Escolha o tema perfeito para personalizar sua experiência e torná-la
          exclusivamente sua
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
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
          ].map(({ label, icon: Icon, desc }, index) => {
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
    ),

    Notificações: () => (
      <>
        <h2 className="text-lg font-semibold text-[#787891] mb-2">
          Notificações
        </h2>
        <p className="text-sm text-zinc-500">
          Em breve você poderá configurar preferências de alerta por e-mail /
          in-app aqui.
        </p>
      </>
    ),

    "Gestão de usuários": () => (
      <Suspense
        fallback={
          <div className="text-sm text-zinc-500">Carregando painel…</div>
        }
      >
        <PanelAdmContent />
      </Suspense>
    ),

    "Criar usuários": () => (
      <Suspense
        fallback={
          <div className="text-sm text-zinc-500">Carregando usuários…</div>
        }
      >
        <UserManagementContent />
      </Suspense>
    ),
    "Gestão de setores": () => (
      <Suspense
        fallback={
          <div className="text-sm text-zinc-500">Carregando setor…</div>
        }
      >
        <SectorAdminContent />
      </Suspense>
    ),

    LGPD: () => (
      <>
        <h2 className="text-lg font-semibold text-[#787891] mb-2">LGPD</h2>
        <p className="text-sm text-zinc-500">
          Políticas e termos de privacidade. (Conteúdo em preparação.)
        </p>
      </>
    ),
  };

  const ActiveContent = ContentByTab[activeTab];

  return (
    <div className="bg-[#EBEBEB] min-h-screen font-inter">
      <Sidebar />
      <main className="w-full px-6 sm:pl-[250px] max-w-full space-y-2 pt-2">
        <TopHeader />

        {/* Introdução */}
        <section className="max-w-[1500px] w-full bg-white rounded-xl p-2 justify-between items-center mx-auto flex flex-col xl:flex-row items-start gap-6">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              <span className="font-semibold">Configurações.</span>Aqui nessa
              sessão você pode configurar seu perfil de visualização da
              dashboard, adaptar suas visualizações combinadas com suas rotinas,
              definir as notificações. Também conhecer nossos termos e os nível
              de segurança aliadas as nossas regras do{" "}
              <span className="font-semibold">LGPD</span>.
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

        <section className="max-w-[1500px] w-full mx-auto flex flex-col xl:flex-row gap-6">
          <aside
            className="
     w-full xl:w-[250px] bg-white rounded-xl p-2 shadow-sm
     self-start
     xl:sticky xl:top-24               
     max-h-[calc(100vh-8rem)]         
     overflow-auto"
          >
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
          {/* Bloco branco onde as páginas aparecem */}
          <div className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            {ActiveContent ? (
              <ActiveContent />
            ) : (
              <div className="text-sm text-zinc-500">Selecione uma opção</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
