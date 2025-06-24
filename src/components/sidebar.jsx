// ... imports mantidos iguais
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import { Button } from "./ui/button";
import AssessmentIcon from "@/assets/icons/assessment.svg?react";
import CalendarIcon from "@/assets/icons/calendar.svg?react";
import AlertIcon from "@/assets/icons/diamond-exclamation.svg?react";
import DroneIcon from "@/assets/icons/drone.svg?react";
import HouseCheckIcon from "@/assets/icons/house-circle-check.svg?react";
import NewsIcon from "@/assets/icons/newspaper.svg?react";
import RoadmapIcon from "@/assets/icons/roadmap.svg?react";
import TrackIcon from "@/assets/icons/track.svg?react";
import AngleSmallRight from "@/assets/icons/angleSmallRight.svg?react";
import PeopleLine from "@/assets/icons/peopleLine.svg?react";
import SettingsWindow from "@/assets/icons/settingsWindow.svg?react";
import { PanelLeftClose } from "lucide-react";

import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth";
import { useState } from "react";
import { getInicials } from "@/lib/utils";
import { api } from "@/services/api";
import { usePermissions } from "@/hooks/usePermissions";
import logoAju1 from "../assets/logoAju1.png";

export function Sidebar() {
  const { user } = useAuth();
  const [email] = useState(user.email);
  const [name] = useState(user.name);
  const userInitials = getInicials(user.name);

  const { isAdmin, isSupervisor, isAnalyst, isInspector } = usePermissions();
  const canSeeAll = isAdmin || isSupervisor;

  return (
    <div className="flex">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-[250px] sm:flex bg-[#EBEBEB] text-[#787891] flex-col font-inter">
        <div className="px-4 py-5">
          <Link to="/">
            <img src={logoAju1 || "/placeholder.svg"} alt="Logo" width={"159px"} />
          </Link>
        </div>

        <nav className="flex flex-col px-4 py-1">
          <div>
            <p className="text-base font-normal mb-2 text-[#4B4B62]">
              Workspace
            </p>
            <div className="flex flex-col gap-1 text-[#787891] border-b pb-3">
              {canSeeAll && (
                <Link
                  to="/"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 text-md"
                >
                  <HouseCheckIcon className="w-5 h-5 shrink-0" /> Dashboard
                </Link>
              )}
              {isSupervisor && (
                <Link
                  to="/sectorAdmin"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <PeopleLine className="w-5 h-5 shrink-0" /> Setor
                </Link>
              )}
              {isAnalyst && (
                <Link
                  to="/analysis"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <AlertIcon className="w-5 h-5 shrink-0" /> Análises
                </Link>
              )}
              {(canSeeAll || isInspector) && (
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
              {canSeeAll && (
                <>
                  <Link
                    to="/serviceorder"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <CalendarIcon className="w-5 h-5 shrink-0" /> O.S.
                  </Link>
                  <Link
                    to="/inspection"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <AssessmentIcon className="w-5 h-5 shrink-0" /> Fiscalização
                  </Link>
                  <Link
                    to="/routemap"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <RoadmapIcon className="w-5 h-5 shrink-0" /> Mapa de
                    Percurso
                  </Link>

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

          <div className="w-full border-b pb-3">
            <p className="text-base font-normal mb-2 text-[#4B4B62]">Ajustes</p>
            <div className="flex flex-col gap-1 text-[#787891]">
              <Link
                to="/dashboard"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
              >
                <SettingsWindow className="w-5 h-5 shrink-0" /> Configurações
              </Link>
            </div>
          </div>

          {canSeeAll && (
            <div className="mt-3 w-full">
              <p className="text-base font-normal mb-2 text-[#4B4B62]">
                Suporte
              </p>
            </div>
          )}
        </nav>

        <div className="mt-auto flex items-center px-4 py-3 justify-between">
          <div className="flex gap-4 items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`${api.defaults.baseURL}/avatar/${user.avatar}`}
              />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">{name}</p>
              <p className="text-[10px] text-gray-600">{email}</p>
            </div>
          </div>
          <Link to="/userprofile">
            <AngleSmallRight className="w-5 h-5 shrink-0" />
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
                  {canSeeAll && (
                    <Link
                      to="/"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <HouseCheckIcon className="w-5 h-5 shrink-0" /> Dashboard
                    </Link>
                  )}
                  {isSupervisor && (
                    <Link
                      to="/sectorAdmin"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <PeopleLine className="w-5 h-5 shrink-0" /> Setor
                    </Link>
                  )}
                  {isAnalyst && (
                    <Link
                      to="/analysis"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <AlertIcon className="w-5 h-5 shrink-0" /> Análises
                    </Link>
                  )}
                  {(canSeeAll || isInspector) && (
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
                  {canSeeAll && (
                    <>
                      <Link
                        to="/serviceorder"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <CalendarIcon className="w-5 h-5 shrink-0" /> O.S.
                      </Link>
                      <Link
                        to="/inspection"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <AssessmentIcon className="w-5 h-5 shrink-0" />{" "}
                        Fiscalização
                      </Link>
                      <Link
                        to="/routemap"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <RoadmapIcon className="w-5 h-5 shrink-0" /> Mapa de
                        Percurso
                      </Link>
                      <Link
                        to="/reports"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <NewsIcon className="w-5 h-5 shrink-0" /> Relatórios
                      </Link>
                    </>
                  )}
                  {/* Ajustes */}
                  <Link
                    to="/dashboard"
                    className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <SettingsWindow className="w-5 h-5 shrink-0" />{" "}
                    Configurações
                  </Link>
                </div>
              </nav>

              <div className="mt-auto flex items-center justify-between px-4 py-6 gap-3">
                <Avatar>
                  <AvatarImage
                    src={`${api.defaults.baseURL}/avatar/${user.avatar}`}
                  />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                  <p className="text-[8px] text-gray-600">{email}</p>
                </div>
                <Link to="/userprofile">
                  <AngleSmallRight className="w-5 h-5 shrink-0" />
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </header>
      </div>
    </div>
  );
}
