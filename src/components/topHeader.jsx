import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import emurb from "@/assets/emurb.svg"; // ajuste o caminho se necessário

import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import Leave from "@/assets/icons/leave.svg?react";
import Bell from "@/assets/icons/bell.svg?react";
import { useState } from "react";

export function TopHeader() {
  const { signOut } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

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
        

        {/* Botão de notificações */}

        {/* Botão de notificações com tooltip (sem link) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTooltip(true);
              setTimeout(() => setShowTooltip(false), 2000);
            }}
            className="rounded-full bg-white p-2 hover:bg-zinc-100"
          >
            <Bell className="w-5 h-5 shrink-0" />
          </button>

          {showTooltip && (
            <div className="absolute right-0 mt-2 w-max text-xs bg-gray-800 text-white px-3 py-1 rounded shadow z-50">
              Sem notificações no momento
            </div>
          )}
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
