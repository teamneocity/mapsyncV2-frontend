import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import NewEmurb from "@/assets/NewEmurb.svg";
import Leave from "@/assets/icons/leave.svg?react";
import Bell from "@/assets/icons/bell.svg?react";
import RedChat from "@/assets/icons/RedChat.svg?react";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { api } from "@/services/api";
import NewAju from "@/assets/NewAju.svg";
import Bar from "@/assets/Bar.svg";
import { ChevronRight } from "lucide-react";

export function TopHeader({ title, subtitle }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [openNotif, setOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!openNotif) return;
    (async () => {
      try {
        const resp = await api.get("/notifications");
        setNotifications(resp.data?.items ?? []);
      } catch (err) {
        console.error("Erro ao buscar notificações:", err);
      }
    })();
  }, [openNotif]);

  const handleSignOut = (e) => {
    e.preventDefault();
    signOut();
    navigate("/");
  };

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center py-3 px-4 sm:px-8 bg-[#EBEBEB] sticky top-0 z-10">
      {/* Logo  */}
      <div className="flex flex-wrap items-center px-2 py-2 sm:py-4 gap-1 min-w-0">
        <Link to="/">
          <img
            src={NewAju}
            alt="Logo Aju"
            className="h-[40px] sm:h-[45px] w-auto rounded-md"
          />
        </Link>

        <Link to="/">
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </Link>

        <Link to="/">
          <p className="font-bold text-sm sm:text-base">Emurb</p>
        </Link>

        <Link to="/">
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </Link>

        {title && (
          <div className="flex flex-wrap text-sm sm:text-lg text-black ml-1 min-w-0">
            <p className="truncate max-w-[140px] sm:max-w-none">{title}</p>
            {subtitle && (
              <p className="font-bold ml-2 truncate max-w-[160px] sm:max-w-none">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Botões do lado direito */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end">
        {/* Botão Abrir Chamado */}
        <button
          onClick={() => navigate("/open-call")}
          className="flex items-center justify-center gap-2 w-full sm:w-[174px] h-10 sm:h-[48px] rounded-3xl bg-[#FFC3C3] hover:bg-[#ffb2b2] transition"
        >
          <RedChat className="w-5 h-5 text-[#96132C]" />
          <span className="text-[#96132C] font-medium text-sm sm:text-base">
            Abrir chamado
          </span>
        </button>

        {/* Botão de notificações + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenNotif((v) => !v)}
            className="flex rounded-full h-10 w-10 sm:h-[48px] sm:w-[48px] items-center justify-center bg-white hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            aria-haspopup="dialog"
            aria-expanded={openNotif}
            aria-controls="notifications-dropdown"
          >
            <Bell className="w-5 h-5 shrink-0" />
          </button>

          <div id="notifications-dropdown">
            <NotificationsDropdown
              open={openNotif}
              onClose={() => setOpenNotif(false)}
              notifications={notifications}
            />
          </div>
        </div>

        {/* Botão de sair */}
        <Link
          to="/"
          onClick={(e) => {
            e.preventDefault();
            handleSignOut(e);
          }}
          className="flex rounded-full h-10 w-10 sm:h-[48px] sm:w-[48px] items-center justify-center bg-white p-2 hover:bg-zinc-100"
        >
          <Leave className="w-5 h-5 shrink-0 text-zinc-600" />
        </Link>
      </div>
    </header>
  );
}
