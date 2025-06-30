"use client";

import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { TutorialCard } from "@/pages/Dashboard/tutorialCard.jsx";
import { StatBox } from "./StatBox";
import { LineRaceChart } from "./LineRaceChart";
import { PiePadAngleChart } from "./PiePadAngleChart";

import Bars from "@/assets/icons/Bars.svg?react";
import { BookText } from "lucide-react";

export function Dashboard() {
  // Componente BlogBox local
  const BlogBox = () => (
    <div className="flex items-start gap-4 bg-white rounded-2xl shadow px-4 py-2 w-full h-full">
      <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center">
        <BookText className="w-5 h-5 text-zinc-600" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Blog</h3>
        <p className="text-sm text-zinc-500 leading-tight mt-1">
          Explore o sistema passo a passo ou entre em contato com o suporte para
          lhe ajudar.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="flex-1">
        {/* Título */}
        <div className="px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            Dashboard 
          </h1>
        </div>

        {/* Tutorial + Blog */}
        <div className="flex flex-col xl:flex-row gap-4 w-full px-4 mb-6">
  <div className="flex-[3]">
    <TutorialCard />
  </div>
  <div className="flex-[1] h-full">
    <BlogBox />
  </div>
</div>


        {/* Cards de resumo */}
        <div className="px-4 pb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Resumo da Operação
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatBox
              title="Ocorrências"
              value={42}
              percentage={12}
              icon={Bars}
            />
            <StatBox title="Resolvidos" value={30} percentage={8} icon={Bars} />
            <StatBox title="Em aberto" value={5} percentage={-3} icon={Bars} />
            <StatBox title="Cancelados" value={2} percentage={0} icon={Bars} />
            <StatBox title="Atrasados" value={3} percentage={1} icon={Bars} />
            <StatBox
              title="Em andamento"
              value={12}
              percentage={6}
              icon={Bars}
            />
          </div>
        </div>

        {/* Gráficos */}
        <div className="px-4 pb-10 mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow px-4 pt-4 pb-2 xl:col-span-2">
            <LineRaceChart />
          </div>
          <div className="bg-white rounded-2xl shadow px-4 pt-2 pb-2 xl:col-span-1">
            <PiePadAngleChart />
          </div>
        </div>
      </div>
    </div>
  );
}
