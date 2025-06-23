// ... imports mantidos iguais
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import { Button } from "./ui/button";
import {
  LogInIcon as Logs,
  HomeIcon,
  Settings,
  Building2,
  Send,
  Map,
  Database,
  BarChartIcon as ChartColumn,
  PanelLeftClose,
  MailOpen,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
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
            <img src={logoAju1 || "/placeholder.svg"} alt="Logo" />
          </Link>
        </div>

        <nav className="flex flex-col px-1 py-1">
          <div>
            <p className="text-base font-normal mb-2 text-[#4B4B62]">
              Workspace
            </p>
            <div className="flex flex-col gap-1 text-[#787891] border-b pb-3">
              {canSeeAll && (
                <Link
                  to="/"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <HomeIcon /> Dashboard
                </Link>
              )}
              {isSupervisor && (
                <Link
                  to="/sectorAdmin"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <ChartColumn /> Setor
                </Link>
              )}
              {isAnalyst && (
                <Link
                  to="/analysis"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <ChartColumn /> Análises
                </Link>
              )}
              {(canSeeAll || isInspector) && (
                <>
                  <Link
                    to="/occurrencest"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <Building2 /> Mapeamento Terrestre
                  </Link>
                  <Link
                    to="/occurrencesa"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <Send /> Mapeamento Aéreo
                  </Link>
                </>
              )}
              {canSeeAll && (
                <>
                  <Link
                    to="/routemap"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <Map /> Mapa de Percurso
                  </Link>
                  <Link
                    to="/serviceorder"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <Database /> O.S.
                  </Link>
                  <Link
                    to="/reports"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <ChartColumn /> Relatórios
                  </Link>
                  <Link
                    to="/inspection"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <ShieldCheck /> Fiscalização
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
                <Settings /> Configurações
              </Link>
              <Link
                to="/notifications"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
              >
                <MailOpen /> Notificações
              </Link>
            </div>
          </div>

          {canSeeAll && (
            <div className="mt-3 w-full">
              <p className="text-base font-normal mb-2 text-[#4B4B62]">
                Suporte
              </p>
              {/* <div className="flex flex-col gap-1 text-[#787891]">
                <Link
                  to="/teammanagement"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <MailOpen /> Gestão de Equipes
                </Link>
                <Link
                  to="/logs"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <Logs /> Auditoria
                </Link>
              </div> */}
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
            <ChevronRight />
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
                      <HomeIcon /> Dashboard
                    </Link>
                  )}
                  {isAnalyst && (
                    <Link
                      to="/analysis"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <ChartColumn /> Análises
                    </Link>
                  )}
                  {(canSeeAll || isInspector) && (
                    <>
                      <Link
                        to="/occurrencest"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <Building2 /> Mapeamento Terrestre
                      </Link>
                      <Link
                        to="/occurrencesa"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <Send /> Mapeamento Aéreo
                      </Link>
                    </>
                  )}
                  {canSeeAll && (
                    <>
                      <Link
                        to="/routemap"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <Map /> Mapa de Percurso
                      </Link>
                      <Link
                        to="/serviceorder"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <Database /> O.S.
                      </Link>
                      <Link
                        to="/reports"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <ChartColumn /> Relatórios
                      </Link>
                      <Link
                        to="/inspection"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <ShieldCheck /> Fiscalização
                      </Link>
                    </>
                  )}
                  <Link
                    to="/dashboard"
                    className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <Settings /> Configurações
                  </Link>
                  <Link
                    to="/notifications"
                    className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                  >
                    <MailOpen /> Notificações
                  </Link>
                  {canSeeAll && (
                    <>
                      <Link
                        to="/teammanagement"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <MailOpen /> Gestão de Equipes
                      </Link>
                      <Link
                        to="/logs"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <Logs /> Auditoria
                      </Link>
                    </>
                  )}
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
                  <ChevronRight />
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </header>
      </div>
    </div>
  );
}
