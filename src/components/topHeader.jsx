import { useEffect, useState } from "react"; // ⬅️ precisa do useEffect
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import NewEmurb from "@/assets/NewEmurb.svg";
import Leave from "@/assets/icons/leave.svg?react";
import Bell from "@/assets/icons/bell.svg?react";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { api } from "@/services/api"; 

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
      <div className="px-2 py-4">
        <Link to="/">
          <img
            src={NewEmurb}
            alt="Logo EMURB"
            className="h-[45px] w-auto rounded-md"
          />
        </Link>
      </div>

      {/* Botões do lado direito */}
      <div className="flex items-center gap-4">
        {/* Botão de notificações + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenNotif((v) => !v)}
            className="rounded-full bg-white p-2 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300"
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
          className="rounded-full bg-white p-2 hover:bg-zinc-100"
        >
          <Leave className="w-5 h-5 shrink-0 text-zinc-600" />
        </Link>
      </div>
    </header>
  );
}
