"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoogleMaps } from "@/components/googleMaps";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function ExpandedRowPlanning(props) {
  const serviceorder = props.serviceorder || props.occurrence || {};

  const fmt = (d, withTime = true) => {
    if (!d) return "-";
    try {
      const dd = d instanceof Date ? d : new Date(d);
      if (Number.isNaN(+dd)) return "-";
      return format(dd, withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");
    } catch {
      return "-";
    }
  };

  const period = (start, end) => {
    const s = fmt(start, true);
    const e = fmt(end, true);
    if (s !== "-" && e !== "-") return `${s} - ${e}`;
    if (s !== "-") return s;
    if (e !== "-") return e;
    return "-";
  };

  const typeLabels = {
    TAPA_BURACO: "Asfalto",
    AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
    MEIO_FIO: "Meio fio",
    DESOBSTRUCAO: "Drenagem",
    LIMPA_FOSSA: "Limpa fossa",
  };

 // campos principais
  const protocol =
    serviceorder?.protocol ??
    serviceorder?.protocolNumber ??
    serviceorder?.protocol_number ??
    "—";

  const sector = serviceorder?.sector?.name ?? "-";
  const company =
    serviceorder?.externalCompany ??
    serviceorder?.company?.name ??
    serviceorder?.occurrence?.externalCompany ??
    "-";
  const technician =
    serviceorder?.technician?.name ||
    serviceorder?.inspector?.name ||
    serviceorder?.pilot?.name ||
    "-";
  const foreman = serviceorder?.foreman?.name || "-";
  const status = serviceorder?.status ?? "-";

  const occ = serviceorder?.occurrence || {};
  const tipoRaw = serviceorder?.type || occ?.type || serviceorder?.serviceNature?.name;
  const tipo = (tipoRaw && typeLabels[tipoRaw]) || tipoRaw || "-";

  const addr = occ?.address || serviceorder?.address || {};
  const street = addr?.street || "-";
  const number = addr?.number || "";
  const complement = addr?.complement || "";
  const neighborhood = addr?.neighborhoodName || "-";
  const city = addr?.city || "-";
  const state = addr?.state || addr?.uf || "-";
  const zip = addr?.zipCode || addr?.cep || "";
  const lat = parseFloat(addr?.latitude || 0);
  const lng = parseFloat(addr?.longitude || 0);

  const startDate = serviceorder?.scheduledStart || serviceorder?.scheduledDate;
  const endDate = serviceorder?.scheduledEnd;
  const createdAt = serviceorder?.acceptedAt;
  const acceptedAt = serviceorder?.createdAt;
  const startedAt = serviceorder?.startedAt;
  const finishedAt = serviceorder?.finishedAt;

  // copiar protocolo
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);
  async function handleCopy() {
    if (!protocol || protocol === "—") return;
    try {
      setCopying(true);
      await navigator.clipboard.writeText(String(protocol));
      toast({ title: "Protocolo copiado!", description: protocol });
    } catch {
      window.prompt("Copie manualmente:", String(protocol));
    } finally {
      setCopying(false);
    }
  }

  const Line = ({ label, children }) => (
    <p className="text-sm text-zinc-800">
      <span className="font-medium">{label}</span>
      {" : "}
      {children}
    </p>
  );

  // rota das fotos
  const baseURL = "https://mapsync-media.s3.sa-east-1.amazonaws.com/"; 
  const photos = occ?.photos || { initial: [], progress: [], final: [] };

  //monsta as imagens
  const photoUrls = [
    {
      label: "Inicial",
      url: photos.initial?.[0] && `${baseURL}${photos.initial[0]}`,
    },
    {
      label: "Progresso",
      url: photos.progress?.[0] && `${baseURL}${photos.progress[0]}`,
    },
    {
      label: "Finalizada",
      url: photos.final?.[0] && `${baseURL}${photos.final[0]}`,
    },
  ].filter(Boolean);

  const [photoIndex, setPhotoIndex] = useState(0);
  const currentPhoto = photoUrls[photoIndex] || { label: "Imagem", url: "" };

  // mapa
  const [mapOpen, setMapOpen] = useState(false);
  const [ruaClicada, setRuaClicada] = useState(null);

  

  return (
    <div className="w-full rounded-lg p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coluna esquerda */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!protocol || protocol === "—" || copying}
            className="h-[64px] w-fit px-3 rounded-lg bg-[#D9DCE2] hover:bg-gray-300 disabled:opacity-60 flex items-center gap-2 text-sm text-zinc-800"
          >
            <span>
              Protocolo : {protocol && protocol !== "—" ? protocol : "Sem protocolo"}
            </span>
            <Copy className="w-4 h-4" />
          </button>

          <Line label="Setor">{sector}</Line>
          <Line label="Companhia externa">{company}</Line>
          <Line label="Técnico">{technician}</Line>
          <Line label="Encarregado">{foreman}</Line>
          <Line label="Status">{status}</Line>
          <Line label="Tipo">{tipo}</Line>
          <Line label="Endereço">
            {street}
            {number ? `, ${number}` : ""}
            {complement ? ` (${complement})` : ""}
          </Line>
          <Line label="Bairro">{neighborhood}</Line>
          <Line label="Cidade/UF">
            {city}
            {state && state !== "-" ? `/${state}` : ""}
          </Line>
          {zip ? <Line label="CEP">{zip}</Line> : null}
          <Line label="Período de execução">{period(startDate, endDate)}</Line>
          {createdAt ? <Line label="Criada em">{fmt(createdAt)}</Line> : null}
          {acceptedAt ? <Line label="Aceita em">{fmt(acceptedAt)}</Line> : null}
          {startedAt ? <Line label="Início da execução">{fmt(startedAt)}</Line> : null}
          {finishedAt ? <Line label="Finalizada em">{fmt(finishedAt)}</Line> : null}
        </div>

        <div className="min-h-[360px]">
          <div className="relative m-0 rounded-md border border-gray-200 bg-white overflow-hidden">
            <div className="h-[360px] md:h-[420px] w-full bg-gray-100 flex items-center justify-center relative">
              <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded shadow">
                {currentPhoto.label}
              </div>

              {/* Imagem principal  */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="w-full h-full cursor-pointer">
                    {currentPhoto.url ? (
                      <img
                        src={currentPhoto.url}
                        alt={`Imagem ${photoIndex + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const el = e.currentTarget;
                          el.style.display = "none";
                          const holder = el.parentElement?.querySelector("[data-fallback]");
                          if (holder) holder.style.display = "flex";
                        }}
                      />
                    ) : (
                      <span className="text-gray-500 text-sm px-4 text-center">
                        Foto não anexada ainda
                      </span>
                    )}

                    <div
                      data-fallback
                      className="hidden w-full h-full items-center justify-center text-gray-400 px-4 text-sm"
                    >
                      Não foi possível carregar a imagem
                    </div>
                  </div>
                </DialogTrigger>

                {currentPhoto.url && (
                  <DialogContent className="max-w-4xl w-full">
                    <VisuallyHidden>
                      <DialogTitle>Visualização da Imagem</DialogTitle>
                      <DialogDescription>Imagem expandida</DialogDescription>
                    </VisuallyHidden>
                    <img
                      src={currentPhoto.url}
                      alt={`Imagem expandida ${photoIndex + 1}`}
                      className="w-full max-h-[80vh] object-contain rounded-[12px] border border-gray-200 bg-white p-1"
                    />
                  </DialogContent>
                )}
              </Dialog>

              {/* Navegação  */}
              {photoUrls.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoIndex((prev) =>
                        prev === 0 ? photoUrls.length - 1 : prev - 1
                      );
                    }}
                    className="bg-black/50 text-white rounded-full px-3 py-1 text-xs"
                  >
                    ◀ Anterior
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoIndex((prev) =>
                        prev === photoUrls.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="bg-black/50 text-white rounded-full px-3 py-1 text-xs"
                  >
                    Próxima ▶
                  </button>
                </div>
              )}

              {/* Botão para abrir mapa */}
              <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 z-10 bg-white text-gray-700 border rounded-xl px-3 py-1 text-xs font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Abrir mapa
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-5xl w-full h-[80vh]">
                  <VisuallyHidden>
                    <DialogTitle>Mapa de localização</DialogTitle>
                    <DialogDescription>Local da ocorrência</DialogDescription>
                  </VisuallyHidden>

                  <div className="relative w-full h-full">
                    <GoogleMaps
                      position={{ lat, lng }}
                      fullHeight
                      label="ocorrencia"
                      onMapClick={async ({ lat, lng }) => {
                        try {
                          const res = await fetch(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
                          );
                          const data = await res.json();
                          const rua =
                            data.results?.[0]?.formatted_address ??
                            "Rua não encontrada";
                          setRuaClicada(rua);
                        } catch {
                          setRuaClicada("Erro ao buscar endereço");
                        }
                      }}
                    />

                    {ruaClicada && (
                      <div className="absolute bottom-1 left-1 bg-white text-xs px-2 py-[2px] rounded shadow-sm text-gray-500 z-20 max-w-[75%]">
                        Rua clicada: {ruaClicada}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
