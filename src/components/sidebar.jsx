// ... imports mantidos iguais
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
import { Icon, PanelLeftClose } from "lucide-react";
import PurpleCheck from "@/assets/icons/PurpleCheck.svg?react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth";
import { useState, useEffect } from "react";
import { getInicials } from "@/lib/utils";
import { api } from "@/services/api";
import { usePermissions } from "@/hooks/usePermissions";
import logoAju1 from "../assets/logoAju1.png";

export function Sidebar() {
  const { user } = useAuth();
  const [email] = useState(user.email);
  const [name] = useState(user.name);
  const userInitials = getInicials(user.name);

  // URL inicial
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

      if (key) {
        setAvatarUrl(`${S3_BASE}/${key}`);
      }
    } catch (err) {}
  }

  useEffect(() => {
    loadSidebarAvatarUrl();
  }, []);

  const { isAdmin, isSupervisor, isAnalyst, isInspector, isChief } =
    usePermissions();
  const canSeeAll = isAdmin || isSupervisor;

  const roleLabel =
    {
      CHIEF: "Chefe Geral",
      ADMIN: "Admin",
      SECTOR_CHIEF: "Chefe de Setor",
      ANALYST: "Analista",
      INSPECTOR: "Fiscal",
      FIELD_AGENT: "Agente de Campo",
    }[user?.role] || "Cargo desconhecido";

  return (
    <div className="flex">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-[250px] sm:flex bg-[#EBEBEB] text-[#787891] flex-col font-inter max-h-screen overflow-y-auto">
        <div className="px-4 py-5">
          <Link to="/">
            <img
              src={logoAju1 || "/placeholder.svg"}
              alt="Logo"
              width={"159px"}
            />
          </Link>
        </div>

        <nav className="flex flex-col px-4 py-1">
          <div>
            <p className="text-base font-normal mb-2 text-[#4B4B62]">
              Workspace
            </p>
            <div className="flex flex-col gap-1 text-[#787891] border-b pb-3">
              {(canSeeAll || isChief) && (
                <>
                  <Link
                    to="/"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 text-md"
                  >
                    <HouseCheckIcon className="w-5 h-5 shrink-0" /> Dashboard
                  </Link>
                </>
              )}

              {/* {(canSeeAll || isChief) && (
                <Link
                  to="/sectorAdmin"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <PeopleLine className="w-5 h-5 shrink-0" /> Setor
                </Link>
              )} */}
              {(isAdmin || isAnalyst) && (
                <Link
                  to="/analysis"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <AlertIcon className="w-5 h-5 shrink-0" /> Análises
                </Link>
              )}
              {(canSeeAll || isInspector || isChief) && (
                <>
                  <Link
                    to="/occurrencesa"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <DroneIcon className="w-5 h-5 shrink-0" /> Mapeamento Aéreo
                  </Link>
                  <Link
                    to="/occurrencest"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <TrackIcon className="w-5 h-5 shrink-0" /> Mapeamento
                    Terrestre
                  </Link>
                </>
              )}
              {(canSeeAll || isChief) && (
                <>
                  <Link
                    to="/serviceorder"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <TaskChecklist className="w-5 h-5 shrink-0" /> O.S.
                  </Link>
                  <Link
                    to="/servicePlanning"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <CalendarIcon className="w-5 h-5 shrink-0" /> Planejamento
                  </Link>

                  <Link
                    to="/inspection"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <AssessmentIcon className="w-5 h-5 shrink-0" /> Fiscalização
                  </Link>
                  {/* <Link
                    to="/PilotMap"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <RoadmapIcon className="w-5 h-5 shrink-0" /> Mapa de
                    Percurso
                  </Link> */}

                  <Link
                    to="/reports"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <NewsIcon className="w-5 h-5 shrink-0" /> Relatórios
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* <div className="w-full border-b pb-3">
            <p className="text-base font-normal mb-2 text-[#4B4B62]">Ajustes</p>
            <div className="flex flex-col gap-1 text-[#787891]">
              <Link
                to="/settings"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
              >
                <SettingsWindow className="w-5 h-5 shrink-0" /> Configurações
              </Link>

              {(isAdmin || isChief) && (
                <>
                  <Link
                    to="/userManagement"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 text-md"
                  >
                    <IconUsers className="w-5 h-5 shrink-0" /> Usuários
                  </Link>
                </>
              )}
            </div>
          </div> */}

          {/* {(canSeeAll || isChief) && (
            <div className="mt-3 w-full">
              <p className="text-base font-normal mb-2 text-[#4B4B62]">
                Suporte
              </p>
              <Link
                to="/feedback"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 text-md"
              >
                <IconFeedback className="w-5 h-5 shrink-0" /> Feedback
              </Link>
            </div>
          )} */}
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
                        SECTOR_CHIEF: "Médio",
                        ANALYST: "Básico",
                        INSPECTOR: "Básico",
                        FIELD_AGENT: "Básico",
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
                    }[user?.role] || 0
                  }%`,
                  backgroundColor: "#003DF6",
                }}
              />
            </div>
          </div>

          {/* Card de perfil */}
          <Link
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
          </Link>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <div className="sm:hidden ">
        <header className="sticky top-0 z-30 flex h-14 items-center px-4  bg-[#EBEBEB] gap-4">
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
                  {(canSeeAll || isChief) && (
                    <Link
                      to="/"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <HouseCheckIcon className="w-5 h-5 shrink-0" /> Dashboard
                    </Link>
                  )}
                  {/* {(canSeeAll || isChief) && (
                    <Link
                      to="/sectorAdmin"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <PeopleLine className="w-5 h-5 shrink-0" /> Setor
                    </Link>
                  )} */}
                  {(isAnalyst || isAdmin || isChief) && (
                    <Link
                      to="/analysis"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <AlertIcon className="w-5 h-5 shrink-0" /> Análises
                    </Link>
                  )}
                  {(canSeeAll || isInspector || isChief) && (
                    <>
                      <Link
                        to="/occurrencesa"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <DroneIcon className="w-5 h-5 shrink-0" /> Mapeamento
                        Aéreo
                      </Link>
                      <Link
                        to="/occurrencest"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <TrackIcon className="w-5 h-5 shrink-0" /> Mapeamento
                        Terrestre
                      </Link>
                    </>
                  )}
                  {(canSeeAll || isChief) && (
                    <>
                      <Link
                        to="/serviceorder"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <TaskChecklist className="w-5 h-5 shrink-0" /> O.S.
                      </Link>
                      <Link
                        to="/inspection"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <AssessmentIcon className="w-5 h-5 shrink-0" />{" "}
                        Fiscalização
                      </Link>
                      {/* <Link
                        to="/PilotMap"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <RoadmapIcon className="w-5 h-5 shrink-0" /> Mapa de
                        Percurso
                      </Link> */}
                      <Link
                        to="/reports"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <NewsIcon className="w-5 h-5 shrink-0" /> Relatórios
                      </Link>
                    </>
                  )}
                  {/* Ajustes */}
                  {/* <Link
                    to="/dashboard"
                    className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <SettingsWindow className="w-5 h-5 shrink-0" />{" "}
                    Configurações
                  </Link> */}
                  {/* {(canSeeAll || isChief) && (
                    <>
                      <Link
                        to="/userManagement"
                        className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 text-md"
                      >
                        <IconUsers className="w-5 h-5 shrink-0" /> Usuários
                      </Link>
                    </>
                  )} */}
                  {/* {(canSeeAll || isChief) && (
                    <Link
                      to="/feedback"
                      className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 text-md"
                    >
                      <IconFeedback className="w-5 h-5 shrink-0" /> Feedback
                    </Link>
                  )} */}
                </div>
              </nav>

              <div className="mt-auto w-full">
                {/* Card de perfil */}
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
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
                      </Link>
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
