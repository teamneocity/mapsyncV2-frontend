import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import emurb from "@/assets/emurb.svg"; // ajuste o caminho se necessário
import { LiveActionButton } from "@/components/live-action-button";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";

export function TopHeader() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = (e) => {
    e.preventDefault();
    signOut();
    navigate("/");
  };

  return (
    <header className="flex justify-between items-center py-4 px-4 sm:px-8 bg-[#EBEBEB] sticky top-0 z-10">
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
        <LiveActionButton />
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="rounded-full h- bg-white p-2 hover:bg-zinc-100"
        >
          <LogOut className="w-5 h-5 text-zinc-600" />
        </Button>
      </div>
    </header>
  );
}
