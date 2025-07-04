"use client";

import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { TutorialCard } from "@/pages/Dashboard/tutorialCard.jsx";
import { StatBox } from "./statBox";
import { LineRaceChart } from "./LineRaceChart";
import { PiePadAngleChart } from "./PiePadAngleChart";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInicials } from "@/lib/utils";
import { api } from "@/services/api";

import Bars from "@/assets/icons/Bars.svg?react";
import { BookText } from "lucide-react";

export function Dashboard() {
  // Componente BlogBox local

  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await api.get("/employees");
        setUsers(res.data.employees || []);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    }
    fetchUsers();
  }, []);

  const [chiefs, setChiefs] = useState([]);

  useEffect(() => {
    async function fetchChiefs() {
      try {
        const res = await api.get("/employees?role=SECTOR_CHIEF");
        setChiefs(res.data.employees.slice(0, 5));
      } catch (err) {
        console.error("Erro ao buscar chefes:", err);
      }
    }
    fetchChiefs();
  }, []);

  const BlogBox = () => (
    <div className="flex items-start gap-4 rounded-2xl px-10 py-10 w-full h-full bg-white">
      <div className="w-full">
        <div className="flex items-center justify-between w-full px-0 py-0">
          <div className="flex -space-x-3">
            {users.slice(0, 5).map((user, index) => (
              <div
                key={user.id}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white`}
                style={{
                  zIndex: 10 - index,
                  backgroundColor: [
                    "#B5E0A2",
                    "#D1C4E9",
                    "#F8BBD0",
                    "#A5D6A7",
                    "#CE93D8",
                  ][index % 5],
                }}
              >
                {getInicials(user.name)}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/userManagement")}
            className="px-4 py-2 h-[55px] border border-zinc-300 text-sm rounded-xl hover:bg-zinc-100 transition"
          >
            + Gerir usuário
          </button>
        </div>
      </div>
    </div>
  );

  const SectorBox = () => (
    <div className="flex items-start gap-4 rounded-2xl px-10 py-10 w-full h-full bg-white">
      <div className="w-full">
        <div className="flex items-center justify-between w-full px-0 py-0">
          <div className="flex -space-x-3">
            {chiefs.slice(0, 5).map((chief, index) => (
              <div
                key={chief.id}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white`}
                style={{
                  zIndex: 10 - index,
                  backgroundColor: [
                    "#B5E0A2",
                    "#D1C4E9",
                    "#F8BBD0",
                    "#A5D6A7",
                    "#CE93D8",
                  ][index % 5],
                }}
              >
                {getInicials(chief.name)}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/sectorAdmin")}
            className="px-4 py-2 h-[55px] border border-zinc-300 text-sm rounded-xl hover:bg-zinc-100 transition"
          >
            + Gerir Setores
          </button>
        </div>
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
          <h4 c>
            Olá usuário,
          </h4>
          <h1 className="text-xl sm:text-4xl font-bold text-gray-800 mb-4">
            Bem vindo de volta 👋
          </h1>
        </div>

        {/* Tutorial + Blog */}
        <div className="flex flex-col xl:flex-row gap-4 w-full px-4 mb-6">
          {/* Coluna esquerda - Tutorial */}
          <div className="flex-[3] flex">
            <div className="w-full">
              <TutorialCard />
            </div>
          </div>

          {/* Coluna direita - Blog + Setores */}
          <div className="flex-[1] flex flex-col gap-4">
            <div className="flex-1">
              <BlogBox />
            </div>
            <div className="flex-1">
              <SectorBox />
            </div>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="px-4 pb-6">
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
