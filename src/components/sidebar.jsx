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
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth";
import { useState } from "react";
import { getInicials } from "@/lib/utils";
import { api } from "@/services/api";
import { usePermissions } from "@/hooks/usePermissions";
import logoAju1 from "../assets/logoAju1.png"


export function Sidebar() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(null);
  const userInitials = getInicials(user.name);

const { isAdmin, isSupervisor, isAnalyst, isOperator } = usePermissions();


  return (
    <div className="flex w-full flex-col bg-[#EBEBEB] font-inter">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-[250px]  sm:flex bg-[#EBEBEB]  text-[#787891] flex-col">
        <div className="px-4 py-5 ">
          <Link to="/">
            <img src={logoAju1 || "/placeholder.svg"} alt="" />
          </Link>
        </div>

        <nav className="flex flex-col items-center gap-2 px-3 py-3 ">
          <div>
            <p className="text-base font-normal mb-2 text-[#4B4B62]">
              Dashboard
            </p>

            <div className="flex flex-col gap-1 text-[#787891] border-b pb-3">
              {(isAdmin || isSupervisor) && (
                <Link
                  to="/"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <HomeIcon />
                  Dashboard
                </Link>
              )}
              {isAnalyst && (
                <Link
                  to="/analysis"
                  className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                >
                  <ChartColumn />
                  Análises
                </Link>
              )}

              <Link
                to="/occurrencest"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
              >
                <Building2 />
                Mapeamento Terrestre
              </Link>
              <Link
                to="/occurrencesa"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDED] hover:text-gray-900"
              >
                <Send />
                Mapeamento Aéreo
              </Link>

              <Link
                to="/routemap"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
              >
                <Map />
                Mapa de Percurso
              </Link>
              <Link
                to="/serviceorder"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
              >
                <Database />
                O.S.
              </Link>
              <Link
                to="/reports"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
              >
                <ChartColumn />
                Relatórios
              </Link>
            </div>
          </div>

          <div className=" w-full border-b pb-3">
            <p className="text-base font-normal mb-2 text-[#4B4B62] ">
              Preferências
            </p>

            <div className="flex flex-col gap-1 text-[#787891]">
              <Link
                to="/dashboard"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 pointer-events-none"
              >
                <Settings />
                Configurações
              </Link>
              <Link
                to="/notifications"
                className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 pointer-events-none"
              >
                <MailOpen />
                Notificações
              </Link>
            </div>
          </div>

          <div className="mt-3 w-full ">
            {(isAdmin || isSupervisor) && (
              <div>
                <p className="text-base font-normal mb-2 text-[#4B4B62] ">
                  Colaboradores
                </p>

                <div className="flex flex-col gap-1 text-[#787891]">
                  <Link
                    to="/teammanagement"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 "
                  >
                    <MailOpen />
                    Gestão de Equipes
                  </Link>
                </div>

                <div className="flex flex-col gap-1 text-[#787891]">
                  <Link
                    to="/logs"
                    className="flex gap-2 items-center py-1.5 px-2 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 "
                  >
                    <Logs />
                    Auditoria
                  </Link>
                </div>
              </div>
            )}
          </div>
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

            {/*celular*/}

      <div className="sm:hidden flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center px-4 border-b bg-background gap-4 sm:static sm:h-auto  sm:border-0 sm:bg-transparent sm:px-6 ">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="sm:hidden border-0"
              >
                <PanelLeftClose size={24} />
                <span className="sr-only">Abrir / Fechar menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="sm:max-w-xs flex flex-col max-w-80"
            >
              <nav className="grid gap-8 text-lg font-medium">
                <div>
                  <p className="text-base font-normal mb-3 text-[#4B4B62]">
                    Dashboard
                  </p>

                  <div className="flex flex-col gap-1 text-[#787891] border-b pb-5">
                    {(isAdmin || isSupervisor) && (
                      <Link
                        to="/"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <HomeIcon />
                        Dashboard
                      </Link>
                    )}
                    {isAnalyst && (
                      <Link
                        to="/analysis"
                        className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                      >
                        <ChartColumn />
                        Análises
                      </Link>
                    )}
                    <Link
                      to="/occurrencest"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <Building2 />
                      Mapeamento Terrestre
                    </Link>
                    <Link
                      to="/occurrencesa"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <Send />
                      Mapeamento Aéreo
                    </Link>
                    <Link
                      to="/routemap"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <Map />
                      Mapa de Percurso
                    </Link>
                    <Link
                      to="/serviceorder"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <Database />
                      O.S.
                    </Link>
                    <Link
                      to="/reports"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <ChartColumn />
                      Relatórios
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="text-base font-normal mb-3 text-[#4B4B62] ">
                    Preferências
                  </p>

                  <div className="flex flex-col gap-1 text-[#787891]">
                    <div className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900">
                      <Settings />
                      Configurações
                    </div>
                    <Link
                      to="/notifications"
                      className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900"
                    >
                      <MailOpen />
                      Notificações
                    </Link>
                  </div>

                  {(isAdmin || isSupervisor) && (
                    <div>
                      <p className="text-base font-normal mb-3 text-[#4B4B62] ">
                        Colaboradores
                      </p>

                      <div className="flex flex-col gap-1 text-[#787891]">
                        <Link
                          to="/teammanagement"
                          className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 "
                        >
                          <MailOpen />
                          Gestão de Equipes
                        </Link>
                      </div>

                      <div className="flex flex-col gap-1 text-[#787891]">
                        <Link
                          to="/logs"
                          className="flex gap-2 items-center py-2 px-3 rounded-lg hover:bg-[#EDEDEE] hover:text-gray-900 "
                        >
                          <Logs />
                          Auditoria
                        </Link>
                      </div>
                    </div>
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
