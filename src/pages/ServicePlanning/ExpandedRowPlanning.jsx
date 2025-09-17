"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ExpandedRowPlanning({ occurrence }) {
  const protocol =
    occurrence?.protocol ??
    occurrence?.protocolNumber ??
    occurrence?.protocol_number ??
    "—";

  const { toast } = useToast();
  const [copying, setCopying] = useState(false);

  async function handleCopy() {
    if (!protocol || protocol === "—") return;
    try {
      setCopying(true);
      await navigator.clipboard.writeText(String(protocol));
      toast({ title: "Protocolo copiado!", description: protocol });
    } catch {
      window.prompt(
        "Copie manualmente com ⌘/Ctrl + C e confirme:",
        String(protocol)
      );
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="w-full rounded-lg  p-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!protocol || protocol === "—" || copying}
          className="h-[56px] px-4 rounded-xl border bg-[#D9DCE2] hover:bg-gray-300 disabled:opacity-60 flex items-center gap-2"
          aria-label="Copiar protocolo"
          title="Copiar protocolo"
        >
          <span className="truncate text-sm">
            Protocolo : {protocol && protocol !== "—" ? protocol : "Sem protocolo"}
          </span>
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
