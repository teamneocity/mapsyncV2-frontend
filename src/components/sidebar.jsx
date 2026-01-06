import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import { Button } from "./ui/button";
import AssessmentIcon from "@/assets/icons/assessment.svg?react";
import CalendarIcon from "@/assets/icons/calendar.svg?react";
import AlertIcon from "@/assets/icons/Alert.svg?react";
import DroneIcon from "@/assets/icons/drone.svg?react";
import HouseCheckIcon from "@/assets/icons/house-circle-check.svg?react";
import NewsIcon from "@/assets/icons/newspaper.svg?react";
import RoadmapIcon from "@/assets/icons/roadmap.svg?react";
import TrackIcon from "@/assets/icons/track.svg?react";
import AngleSmallRight from "@/assets/icons/angleSmallRight.svg?react";
import PeopleLine from "@/assets/icons/peopleLine.svg?react";
import SettingsWindow from "@/assets/icons/settingsWindow.svg?react";
import IconUsers from "@/assets/icons/iconUsers.svg?react";
import TaskChecklist from "@/assets/icons/TaskChecklist.svg?react";
import IconFeedback from "@/assets/icons/IconFeedback.svg?react";
import { PanelLeftClose } from "lucide-react";
import PurpleCheck from "@/assets/icons/PurpleCheck.svg?react";
import DesktopIcon from "@/assets/icons/desktop.svg?react";
import Ninety from "@/assets/icons/Ninety.svg?react";
import DataAnalytics from "@/assets/icons/DataAnalytics.svg?react";
import Inspection from "@/assets/icons/Inspection.svg?react";
import AlertP from "@/assets/icons/AlertP.svg?react";
import { useAnalysisNotification } from "@/hooks/useAnalysisNotification";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { NavLink, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth";
import { useState, useEffect } from "react";
import { getInicials } from "@/lib/utils";
import { api } from "@/services/api";
import { usePermissions } from "@/hooks/usePermissions";
import NewAju from "../assets/NewAju.svg?react";

export function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const isOnAnalysis = pathname.startsWith("/analysis");

  const { hasNew } = useAnalysisNotification({
    userId: user?.id,
    paused: isOnAnalysis,
  });

  // depois do isOnAnalysis
  const isOnRequests = pathname.startsWith("/requests");

  // mostra vermelho somente quando realmente quer
  const showAnalysisAlert = !!hasNew && !isOnRequests;

  const [email] = useState(user.email);
  const [name] = useState(user.name);
  const userInitials = getInicials(user.name);

  const initialAvatarSrc = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${api.defaults.baseURL}/avatar/${user.avatar}`
    : undefined;

  const [avatarUrl, setAvatarUrl] = useState(initialAvatarSrc);

  const S3_BASE = "https://mapsync-media.s3.sa-east-1.amazonaws.com";

  async function loadSidebarAvatarUrl() {
    try {
      const res = await api.get("/employees/me/avatar/url");
      const key = typeof res.data === "string" ? res.data : res.data?.url;
      if (key) setAvatarUrl(`${S3_BASE}/${key}`);
    } catch (err) {}
  }

  useEffect(() => {
    loadSidebarAvatarUrl();
  }, []);

  const {
    isAdmin,
    isSupervisor,
    isAnalyst,
    isInspector,
    isChief,
    isDroneOperator,
    isCallCenter,
  } = usePermissions();
  const canSeeAll = isAdmin || isSupervisor;

  const roleLabel =
    {
      CHIEF: "Chefe Geral",
      ADMIN: "Admin",
      SECTOR_CHIEF: "Chefe de Setor",
      ANALYST: "Analista",
      INSPECTOR: "Fiscal",
      FIELD_AGENT: "Agente de Campo",
      DRONE_OPERATOR: "Operador de Drone",
      CALLCENTER: "Call Center",
    }[user?.role] || "Cargo desconhecido";

  const baseItem =
    "flex gap-2 items-center py-2 px-2 rounded-[6px] text-md transition-colors";
  const activeItem = "bg-[#D9DCE2] text-gray-900";
  const hoverItem = "hover:bg-[#EDEDEE] hover:text-gray-900";
  const linkClass = ({ isActive }) =>
    `${baseItem} ${isActive ? activeItem : hoverItem}`;

  const baseItemMobile =
    "flex gap-2 items-center py-2 px-3 rounded-lg transition-colors";
  const linkClassMobile = ({ isActive }) =>
    `${baseItemMobile} ${isActive ? activeItem : hoverItem}`;

  const isDashboardActive = (p) =>
    p === "/" || p === "/dashboard" || p.startsWith("/dashboard/");

  return (
    <div className="flex">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-[250px] sm:flex bg-[#EBEBEB] text-[#787891] flex-col font-inter max-h-screen overflow-y-auto">
        <nav className="flex flex-col px-4 py-6">
          <div className="bg-white p-3 rounded-lg mb-6 shadow-sm">
            <p className="text-base font-normal mb-2 text-[#4B4B62]">
              Workspace
            </p>

            <div className="flex flex-col gap-1 text-[#787891] pb-3">
              {isCallCenter ? (
                <>
                  {/* CALLCENTER: só vê Mapeamento Terrestre e O.S. */}
                  <NavLink to="/occurrencest" className={linkClass}>
                    <TrackIcon className="w-5 h-5 shrink-0" /> Mapeamento
                    Terrestre
                  </NavLink>

                  <NavLink to="/serviceorder" className={linkClass}>
                    <TaskChecklist className="w-5 h-5 shrink-0" /> O.S.
                  </NavLink>
                </>
              ) : (
                <>
                  {(canSeeAll || isChief) && (
                    <NavLink
                      to="/dashboard"
                      className={() =>
                        `${baseItem} ${
                          isDashboardActive(pathname) ? activeItem : hoverItem
                        }`
                      }
                    >
                      <HouseCheckIcon className="w-5 h-5 shrink-0" /> Dashboard
                    </NavLink>
                  )}

                  {(isAdmin || isChief) && (
                    <NavLink to="/requests" className={linkClass}>
                      <AlertP className="w-5 h-5 shrink-0" /> Pré-Análise
                    </NavLink>
                  )}

                  {(isAdmin || isAnalyst) && (
                    <NavLink
                      to="/analysis"
                      className={({ isActive }) =>
                        showAnalysisAlert
                          ? `${baseItem} ${
                              isActive
                                ? "bg-[#FFC3C3]"
                                : "bg-[#FFC3C3] hover:bg-[#ffb3b3]"
                            }`
                          : linkClass({ isActive })
                      }
                    >
                      <span
                        className={`flex items-center gap-2 ${
                          showAnalysisAlert ? "text-[#CC1C35]" : ""
                        }`}
                      >
                        <AlertIcon
                          className={`w-5 h-5 shrink-0 ${
                            showAnalysisAlert ? "text-[#CC1C35]" : ""
                          }`}
                        />
                        <span
                          className={showAnalysisAlert ? "font-semibold" : ""}
                        >
                          Análises
                        </span>
                      </span>
                    </NavLink>
                  )}

                  {(canSeeAll || isInspector || isChief || isDroneOperator) && (
                    <>
                      <NavLink to="/occurrencesa" className={linkClass}>
                        <DroneIcon className="w-5 h-5 shrink-0" /> Mapeamento
                        Aéreo
                      </NavLink>
                    </>
                  )}

                  {(canSeeAll || isInspector || isChief) && (
                    <NavLink to="/occurrencest" className={linkClass}>
                      <TrackIcon className="w-5 h-5 shrink-0" /> Mapeamento
                      Terrestre
                    </NavLink>
                  )}

                  {(canSeeAll || isChief) && (
                    <>
                      <NavLink to="/serviceorder" className={linkClass}>
                        <TaskChecklist className="w-5 h-5 shrink-0" /> O.S.
                      </NavLink>
                      <NavLink to="/servicePlanning" className={linkClass}>
                        <CalendarIcon className="w-5 h-5 shrink-0" />{" "}
                        Planejamento diário
                      </NavLink>
                      <NavLink to="/Warranty" className={linkClass}>
                        <Ninety className="w-5 h-5 shrink-0" /> Garantia 90 dias
                      </NavLink>
                      <NavLink to="/inspection" className={linkClass}>
                        <Inspection className="w-5 h-5 shrink-0" /> Fiscalização
                      </NavLink>

                      <NavLink to="/reports" className={linkClass}>
                        <DataAnalytics className="w-5 h-5 shrink-0" />{" "}
                        Relatórios
                      </NavLink>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="border-b border-gray-300" />

          {/* Ajustes */}
          {!isCallCenter && (
            <div className="w-full p-2">
              <p className="text-base font-normal mb-2 text-[#4B4B62]">
                Ajustes
              </p>
              <div className="flex flex-col gap-1 text-[#787891]">
                <NavLink to="/settings" className={linkClass}>
                  <SettingsWindow className="w-5 h-5 shrink-0" /> Configurações
                </NavLink>
              </div>
            </div>
          )}
        </nav>

        <div className="mt-auto w-full">
          {/* Nível de Usuário */}
          <div className="px-4 pb-3">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-gray-700 font-medium mb-1 inline-flex items-center gap-2">
                    Nível de usuário
                    <span className="bg-[#003DF6] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {{
                        CHIEF: "Avançado",
                        ADMIN: "Master",
                        DRONE_OPERATOR: "básico",
                        SECTOR_CHIEF: "Médio",
                        ANALYST: "Básico",
                        INSPECTOR: "Básico",
                        FIELD_AGENT: "Básico",
                        CALLCENTER: "Básico",
                      }[user?.role] || "Desconhecido"}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white">
                  <p className="text-xs font-medium">Cargo: {roleLabel}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-full h-[6px] bg-gray-200 rounded-full mt-1.5">
              <div
                className="h-[6px] rounded-full transition-all duration-300"
                style={{
                  width: `${
                    {
                      CHIEF: 80,
                      ADMIN: 100,
                      SECTOR_CHIEF: 60,
                      ANALYST: 40,
                      INSPECTOR: 40,
                      FIELD_AGENT: 40,
                      DRONE_OPERATOR: 40,
                      CALLCENTER: 40,
                    }[user?.role] || 0
                  }%`,
                  backgroundColor: "#003DF6",
                }}
              />
            </div>
          </div>

          {/* Card de perfil */}
          <NavLink
            to="/userprofile"
            className="mx-4 mb-5 bg-[#F7F7F7] rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={avatarUrl}
                  alt={name}
                  onError={() => setAvatarUrl(undefined)}
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm text-gray-900">
                    {name}
                  </span>
                  <PurpleCheck className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-xs text-gray-500">
                  {email.length > 20 ? `${email.slice(0, 20)}...` : email}
                </span>
              </div>
            </div>
            <AngleSmallRight className="w-4 h-4 text-gray-400" />
          </NavLink>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <div className="sm:hidden ">
        <header className="sticky top-0 z-30 flex h-14 items-center px-4 bg-[#EBEBEB] gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="border-0">
                <PanelLeftClose size={24} />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="sm:max-w-xs flex flex-col max-w-80"
            >
              <nav className="grid text-sm font-small">
                <div className="flex flex-col gap-1 text-[#787891] border-b pb-5">
                  {isCallCenter ? (
                    <>
                      {/*  CALLCENTER no mobile: só Mapeamento Terrestre e O.S. */}
                      <NavLink to="/occurrencest" className={linkClassMobile}>
                        <TrackIcon className="w-5 h-5 shrink-0" /> Mapeamento
                        Terrestre
                      </NavLink>

                      <NavLink to="/serviceorder" className={linkClassMobile}>
                        <TaskChecklist className="w-5 h-5 shrink-0" /> O.S.
                      </NavLink>
                    </>
                  ) : (
                    <>
                      {(canSeeAll || isChief) && (
                        <NavLink
                          to="/dashboard"
                          className={() =>
                            `${baseItemMobile} ${
                              isDashboardActive(pathname)
                                ? activeItem
                                : hoverItem
                            }`
                          }
                        >
                          <HouseCheckIcon className="w-5 h-5 shrink-0" />{" "}
                          Dashboard
                        </NavLink>
                      )}

                      {(isAdmin || isChief) && (
                        <NavLink to="/requests" className={linkClassMobile}>
                          <AlertP className="w-5 h-5 shrink-0" /> Pré-Análise
                        </NavLink>
                      )}

                      {(isAdmin || isAnalyst) && (
                        <NavLink to="/analysis" className={linkClassMobile}>
                          <span
                            className={`flex items-center gap-2 ${
                              showAnalysisAlert ? "!text-red-600" : ""
                            }`}
                          >
                            <AlertIcon className="w-5 h-5 shrink-0" />
                            <span
                              className={
                                showAnalysisAlert
                                  ? "!text-red-600 font-semibold"
                                  : ""
                              }
                            >
                              Análises
                            </span>
                          </span>
                        </NavLink>
                      )}

                      {(canSeeAll ||
                        isInspector ||
                        isChief ||
                        isDroneOperator) && (
                        <>
                          <NavLink to="/occurrencesa" className={linkClass}>
                            <DroneIcon className="w-5 h-5 shrink-0" />{" "}
                            Mapeamento Aéreo
                          </NavLink>
                        </>
                      )}

                      {(canSeeAll || isInspector || isChief) && (
                        <NavLink to="/occurrencest" className={linkClass}>
                          <TrackIcon className="w-5 h-5 shrink-0" /> Mapeamento
                          Terrestre
                        </NavLink>
                      )}

                      {(canSeeAll || isChief) && (
                        <>
                          <NavLink
                            to="/serviceorder"
                            className={linkClassMobile}
                          >
                            <TaskChecklist className="w-5 h-5 shrink-0" /> O.S.
                          </NavLink>

                          <NavLink
                            to="/servicePlanning"
                            className={linkClassMobile}
                          >
                            <CalendarIcon className="w-5 h-5 shrink-0" />{" "}
                            Planejamento diário
                          </NavLink>

                          <NavLink to="/inspection" className={linkClassMobile}>
                            <Inspection className="w-5 h-5 shrink-0" />{" "}
                            Fiscalização
                          </NavLink>

                          <NavLink to="/reports" className={linkClassMobile}>
                            <DataAnalytics className="w-5 h-5 shrink-0" /> Relatórios
                          </NavLink>
                          {!isCallCenter && (
                            <div>
                              <p className="text-base font-normal mb-2 text-[#4B4B62]">
                                Ajustes
                              </p>
                              <div className="flex flex-col gap-1 text-[#787891]">
                                <NavLink to="/settings" className={linkClass}>
                                  <SettingsWindow className="w-5 h-5 shrink-0" />{" "}
                                  Configurações
                                </NavLink>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </nav>

              <div className="mt-auto w-full">
                {/* Card de perfil */}
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to="/userprofile"
                        className="mx-4 mb-5 bg-[#F7F7F7] rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={avatarUrl}
                              alt={name}
                              onError={() => setAvatarUrl(undefined)}
                            />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                          </Avatar>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-sm text-gray-900">
                                {name}
                              </span>
                              <PurpleCheck className="w-4 h-4 shrink-0" />
                            </div>
                            <span className="text-xs text-gray-500">
                              {email.length > 20
                                ? `${email.slice(0, 20)}...`
                                : email}
                            </span>
                          </div>
                        </div>
                        <AngleSmallRight className="w-4 h-4 text-gray-400" />
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 text-white">
                      <p className="text-xs font-medium">Cargo: {roleLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </SheetContent>
          </Sheet>
        </header>
      </div>
    </div>
  );
}
