"use client";

// React e bibliotecas externas
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown } from "lucide-react";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";

// Componentes locais
import { TutorialCard } from "@/pages/Dashboard/BarChart.jsx";
import { NeighborhoodNightingale } from "@/pages/Dashboard/NeighborhoodNightingale";

// Serviços e utilitários
import { api } from "@/services/api";
import { useAuth } from "@/hooks/auth";

// Assets

import Airplane from "@/assets/icons/Airplane.svg?react";

export function Dashboard() {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const [name] = useState(user.name);
  const navigate = useNavigate();

  const [pilotMetrics, setPilotMetrics] = useState([]);
  const [loadingPilots, setLoadingPilots] = useState(true);
  const [errPilots, setErrPilots] = useState(null);

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

  useEffect(() => {
    let ignore = false;
    async function fetchPilotMetrics() {
      try {
        setLoadingPilots(true);
        setErrPilots(null);
        const { data } = await api.get("/metrics/pilots/occurrences");
        if (ignore) return;
        setPilotMetrics(data?.metrics ?? []);
      } catch (e) {
        setErrPilots(e?.message || "Erro ao carregar métricas de pilotos");
      } finally {
        setLoadingPilots(false);
      }
    }
    fetchPilotMetrics();
    return () => {
      ignore = true;
    };
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

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="flex-1">
        {/* Título */}
        <div className="px-4 py-4">
          <h4>Olá {name},</h4>
          <h1 className="text-xl sm:text-4xl font-bold text-gray-800 mb-4">
            Bem vindo de volta 👋
          </h1>
        </div>

        {/* Tutorial + Blog */}
        <div className="flex flex-col xl:flex-row gap-4 w-full px-4 mb-4">
          {/* Coluna esquerda - Tutorial */}
          <div className="flex-[3] flex min-w-0">
            <div className="w-full min-w-0">
              <TutorialCard />
            </div>
          </div>

          {/* Coluna direita - Blog + Setores */}
        </div>

        {/* Gráficos */}

        <div className="mt-5 mb-10 grid grid-cols-1 xl:grid-cols-2 gap-3 px-4">
          {/* Card 1 */}
          <div className="px-4 h-[340px] sm:h-[360px] xl:h-[408px]">
            <div className="w-full h-full">
              {loadingPilots ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Carregando…
                </div>
              ) : errPilots ? (
                <div className="w-full h-full flex items-center justify-center text-red-600">
                  {errPilots}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                  {pilotMetrics.slice(0, 4).map((p, idx) => {
                    const formatName = (fullName = "") => {
                      const parts = fullName.trim().split(" ");
                      if (parts.length <= 1) return fullName;
                      return `${parts[0]} ${parts[parts.length - 1]}`;
                    };

                    const curr = p?.createdOccurrences?.currentMonth ?? 0;
                    const prev = p?.createdOccurrences?.lastMonth ?? 0;
                    const diff = curr - prev;
                    const isNeg = diff < 0;

                    const pct =
                      prev === 0
                        ? curr === 0
                          ? 0
                          : 100
                        : Math.round(((curr - prev) / prev) * 100);

                    return (
                      <div
                        key={p.pilotId || idx}
                        className="bg-white rounded-2xl shadow p-4 flex flex-col"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-[18px] line-clamp-1">
                            {formatName(p.pilotName)}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <span className="text-3xl font-bold">{curr}</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              isNeg
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {isNeg ? (
                              <ArrowDown size={14} strokeWidth={2} />
                            ) : (
                              <ArrowUp size={14} strokeWidth={2} />
                            )}
                            {Math.abs(pct)}%
                          </span>
                        </div>

                        <div className="mt-4 border-t border-gray-200" />

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Ocorrências
                          </span>

                          {/* Botão da setinha: navega para o dashboard de pilotos com o pilotId */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/pilots/dashboard?pilotId=${p.pilotId}`)
                            }
                            className="text-gray-400 hover:text-gray-800 transition rounded-full px-2 py-1 focus:outline-none focus:ring"
                            aria-label={`Abrir dashboard de ${p.pilotName}`}
                            title="Ver métricas"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow px-4 pt-4 pb-2 flex flex-col h-[340px] sm:h-[360px] xl:h-[408px]">
            <div className="flex items-center justify-start mb-2 gap-2">
              <Airplane className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg md:text-xl ">
                Ocorrências dinâmica por bairro
              </h3>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <NeighborhoodNightingale className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
