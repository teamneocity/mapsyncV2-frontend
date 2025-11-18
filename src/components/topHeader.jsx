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

export function TopHeader() {
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
    <header className="flex justify-between items-center py-3 px-4 sm:px-8 bg-[#EBEBEB] sticky top-0 z-10">
      {/* Logo */}
      <div className="flex items-center px-2 py-4 gap-5">
        <Link to="/">
          <img
            src={NewAju}
            alt="Logo Aju"
            className="h-[45px] w-auto rounded-md"
          />
        </Link>
        <Link to="/">
          <img src={Bar} alt="Barra" className="h-[30px] w-auto rounded-md" />
        </Link>
        <Link to="/">
          <img
            src={NewEmurb}
            alt="Logo EMURB"
            className="h-[35px] w-auto rounded-md"
          />
        </Link>
      </div>

      {/* Botões do lado direito */}
      <div className="flex items-center gap-4">
        {/* Botão Abrir Chamado */}
        <button
          onClick={() => navigate("/open-call")}
          className="flex items-center justify-center gap-2 w-[174px] h-[48px] rounded-3xl bg-[#FFC3C3] hover:bg-[#ffb2b2] transition"
        >
          <RedChat className="w-5 h-5 text-[#96132C]" />
          <span className="text-[#96132C] font-medium">Abrir chamado</span>
        </button>

        {/* Botão de notificações + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenNotif((v) => !v)}
            className="flex rounded-full h-[48px] w-[48px] items-center justify-center bg-white  hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300"
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
          className="flex rounded-full h-[48px] w-[48px] items-center justify-center bg-white p-2 hover:bg-zinc-100"
        >
          <Leave className="w-5 h-5 shrink-0 text-zinc-600" />
        </Link>
      </div>
    </header>
  );
}
