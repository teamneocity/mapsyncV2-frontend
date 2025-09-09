import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import emurb from "@/assets/emurb.svg";
import Leave from "@/assets/icons/leave.svg?react";
import Bell from "@/assets/icons/bell.svg?react";
import { useState } from "react";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";

export function TopHeader() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [openNotif, setOpenNotif] = useState(false);

  const handleSignOut = (e) => {
    e.preventDefault();
    signOut();
    navigate("/");
  };

  return (
    <header className="flex justify-between items-center py-3 px-4 sm:px-8 bg-[#EBEBEB] sticky top-0 z-10">
      {/* Logo */}
      <div className="px-2 py-2">
        <Link to="/">
          <img
            src={emurb}
            alt="Logo EMURB"
            className="h-[55px] w-auto rounded-md"
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
