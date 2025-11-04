"use client";

import { useState } from "react";
import { Copy, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TYPE_TO_SECTOR_MAP = {
  TAPA_BURACO: "Pavimentação",
  DESOBSTRUCAO: "Drenagem",
  LIMPA_FOSSA: "Drenagem",
  ILUMINACAO_PUBLICA: "Iluminação Pública",
  PODA_ARVORE: "Meio Ambiente",
};

function normalizeKey(s) {
  if (!s) return "";
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, "_");
}

export function ExpandedRowPlanning({ occurrence }) {
  const protocol =
    occurrence?.protocol ??
    occurrence?.protocolNumber ??
    occurrence?.protocol_number ??
    "—";

  // 3) se ainda vier vazio, deduz pelo type ou serviceNature.name
  const directSectorName =
    occurrence?.sector?.name ??
    occurrence?.sector?.title ??
    occurrence?.sector?.label ??
    occurrence?.sectorName ??
    occurrence?.sector_name ??
    (typeof occurrence?.sector === "string" ? occurrence.sector : null) ??
    occurrence?.sector?.name ??
    occurrence?.sector_name ??
    null;

  const typeKey =
    normalizeKey(occurrence?.type) ||
    normalizeKey(occurrence?.serviceNature?.name);

  const deducedSectorName = TYPE_TO_SECTOR_MAP[typeKey] ?? null;

  const sectorName = directSectorName ?? deducedSectorName ?? "—";

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
    <div className="w-full rounded-lg p-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* botão protocolo (igual) */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!protocol || protocol === "—" || copying}
          className="h-[56px] px-4 rounded-xl border bg-[#D9DCE2] hover:bg-gray-300 disabled:opacity-60 flex items-center gap-2"
          aria-label="Copiar protocolo"
          title="Copiar protocolo"
        >
          <span className="truncate text-sm">
            Protocolo:{" "}
            {protocol && protocol !== "—" ? protocol : "Sem protocolo"}
          </span>
          <Copy className="w-4 h-4" />
        </button>

        {/* badge de setor (agora com fallback por tipo) */}
        <div
          className="h-[56px] px-4 rounded-xl border bg-gray-100 text-gray-800 flex items-center gap-2"
          aria-label="Setor da ocorrência"
          title={
            directSectorName
              ? "Setor vindo da API"
              : deducedSectorName
              ? "Setor deduzido pelo tipo"
              : "Sem setor"
          }
        >
          <Building2 className="w-4 h-4" />
          <span className="truncate text-sm">Setor: {sectorName}</span>
        </div>
      </div>
    </div>
  );
}
