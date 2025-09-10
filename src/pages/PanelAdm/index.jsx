// src/pages/PanelAdm/index.jsx
"use client";

import { useEffect, useState } from "react";

import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Pagination } from "@/components/pagination";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ChevronDown, ChevronRight } from "lucide-react";

import Mapa from "@/assets/Mapa.svg";

import { api } from "@/services/api";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const ROLE_LABEL = {
  ADMIN: "Admin",
  CHIEF: "Chefe Geral",
  SECTOR_CHIEF: "Chefe de Setor",
  ANALYST: "Analista",
  INSPECTOR: "Fiscal",
  FIELD_AGENT: "Agente de Campo",
  PILOT: "Piloto",
};

const ROLE_BADGE_CLASS = {
  ADMIN: "bg-[#E9E4FC] text-[#4F26F0] border-transparent",
  CHIEF: "bg-[#FFF4D6] text-[#986F00] border-transparent",
  SECTOR_CHIEF: "bg-[#D0E4FC] text-[#1678F2] border-transparent",
  ANALYST: "bg-[#DDF2EE] text-[#1C7551] border-transparent",
  INSPECTOR: "bg-[#FFF1CB] text-[#845B00] border-transparent",
  FIELD_AGENT: "bg-[#E8F7FF] text-[#1678F2] border-transparent",
  PILOT: "bg-[#F0DDEE] text-[#733B73] border-transparent",
};

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function formatDatePt(dateISO) {
  try {
    return format(new Date(dateISO), "dd/MM/yy", { locale: ptBR });
  } catch {
    return dateISO;
  }
}

function buildPageList(totalPages, current) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => String(i + 1));
  }
  const pages = [];
  pages.push("1");
  if (current > 4) pages.push("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(String(p));
  if (current < totalPages - 3) pages.push("…");
  pages.push(String(totalPages));
  return pages;
}

export function PanelAdm() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);

  const [perPage] = useState(10);

  const [payload, setPayload] = useState({
    page: 1,
    perPage: 10,
    totalCount: 0,
    totalPages: 1,
    employees: [],
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [expandedId, setExpandedId] = useState(null);
  const toggleRow = (id) => setExpandedId((prev) => (prev === id ? null : id));

  async function fetchPending() {
    try {
      setLoading(true);
      setErr(null);
      const { data } = await api.get("/employees/pending-verification", {
        params: { page, perPage },
      });
      setPayload({
        page: data.page,
        perPage: data.perPage,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        employees: data.employees || [],
      });
    } catch (e) {
      setErr("Não foi possível carregar os usuários pendentes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPending();
  }, [page, perPage]);

  const hasPrev = page > 1;
  const hasNext = page < (payload?.totalPages || 1);

  const roleBadge = (role) => {
    const classes =
      ROLE_BADGE_CLASS[role] || "bg-gray-100 text-gray-600 border-zinc-200";
    const label = ROLE_LABEL[role] || role;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-center border ${classes}`}
      >
        {label}
      </span>
    );
  };

  async function handleVerify(employeeId) {
    try {
      await api.patch(`/employees/${employeeId}/verify`);
      toast({
        title: "Verificado",
        description: "O usuário foi verificado com sucesso.",
      });
      fetchPending();
      setExpandedId((prev) => (prev === employeeId ? null : prev));
    } catch (e) {
      toast({
        title: "Erro ao verificar",
        description: "Não foi possível verificar o usuário.",
        variant: "destructive",
      });
    }
  }

  const startIdx = (payload.page - 1) * payload.perPage + 1;
  const endIdx = Math.min(payload.page * payload.perPage, payload.totalCount);
  const pageList = buildPageList(payload.totalPages || 1, payload.page);

  return (
    <div className="bg-[#EBEBEB] min-h-screen font-inter">
      <Sidebar />

      <main className="w-full px-6 sm:pl-[250px] max-w-full space-y-4 pt-6 pb-10">
        <TopHeader />

        {/* Introdução */}
        <section className="max-w-[1500px] w-full mx-auto bg-white rounded-xl p-2 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              <span className="font-semibold">Painel Administrativo.</span> Essa
              página é destinada aos administradores do sistema para controlar o
              gerenciamento de usuários. Aqui, os administradores podem
              acompanhar as solicitações de cadastro e decidir se os novos
              usuários serão aceitos ou não, garantindo a segurança e o controle
              de acesso à plataforma.
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

        {/* Lista  */}
        <section className="max-w-[1500px] w-full mx-auto mb-6">
          {/* Header desktop */}
          <div className="hidden xl:block bg-[#D9DCE2] text-[#020231] font-semibold rounded-xl px-4 py-5 border border-gray-300 mb-2 md:text-sm">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-5 pl-6">Usuário</div>
              <div className="col-span-4">E-mail</div>
              <div className="col-span-1">Criado em</div>
              <div className="col-span-2 text-center">Cargo</div>
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-2">
            {loading ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white">
                <div className="px-6 py-10 text-center text-sm text-gray-600">
                  Carregando…
                </div>
              </div>
            ) : err ? (
              <div className="border-2 border-red-300 rounded-xl bg-white">
                <div className="px-6 py-10 text-center text-sm text-red-600">
                  {err}
                </div>
              </div>
            ) : !payload.employees || payload.employees.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white">
                <div className="px-6 py-10 text-center">
                  <div className="text-sm font-medium text-gray-700">
                    Não há usuários pendentes no momento.
                  </div>
                </div>
              </div>
            ) : (
              payload.employees.map((emp) => {
                const isOpen = expandedId === emp.id;
                return (
                  <div
                    key={emp.id}
                    className={`${
                      isOpen ? "bg-[#F7F7F7]" : "bg-white"
                    } border-1 border-zinc-300 rounded-xl overflow-hidden shadow-sm`}
                  >
                    <div
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => toggleRow(emp.id)}
                    >
                      {/* Mobile */}
                      <div className="xl:hidden p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center mt-1">
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={undefined} alt={emp.name} />
                                  <AvatarFallback className="text-[13px]">
                                    {getInitials(emp.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {emp.name || "Sem nome"}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {emp.email}
                                  </div>
                                </div>
                              </div>
                              {roleBadge(emp.role)}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                              <div>
                                <span className="text-xs font-medium text-gray-400 block">
                                  Criado em
                                </span>
                                {formatDatePt(emp.createdAt)}
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-400 block">
                                  Status
                                </span>
                                {emp.isEmployeeVerified
                                  ? "Verificado"
                                  : "Pendente"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop */}
                      <div className="hidden xl:block p-4">
                        <div className="grid grid-cols-12 gap-4 items-center text-[#787891]">
                          <div className="col-span-5 flex items-center gap-2 min-w-0">
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={undefined} alt={emp.name} />
                              <AvatarFallback className="text-[12px]">
                                {getInitials(emp.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-900 font-medium truncate">
                              {emp.name || "Sem nome"}
                            </span>
                          </div>

                          <div className="col-span-4 text-sm truncate">
                            {emp.email}
                          </div>

                          <div className="col-span-1 text-sm">
                            {formatDatePt(emp.createdAt)}
                          </div>

                          <div className="col-span-2 flex justify-center items-center">
                            {roleBadge(emp.role)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Linha expandida: botão VERIFICAR */}
                    {isOpen && (
                      <div className="px-4 py-3 bg-[#F7F7F7] border-t border-zinc-300">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-xs text-gray-700">
                            ID: <span className="break-all">{emp.id}</span>
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="ghost"
                              className="h-9 px-4 bg-[#C9F2E9] hover:bg-[#baf0e4] text-[#1C7551] border-1 border-[#AEE9DD] rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerify(emp.id);
                              }}
                            >
                              Verificar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Paginação */}
          {!loading && payload.employees.length > 0 && (
            <Pagination
              currentPage={payload.page}
              totalPages={payload.totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </section>
      </main>
    </div>
  );
}
