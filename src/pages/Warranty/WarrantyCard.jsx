import { useMemo, useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Timeline } from "./Timeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { api } from "@/services/api";
import AlertPColor from "@/assets/icons/AlertPColor.svg?react";
import { useQuery } from "@tanstack/react-query";

const BASE_MEDIA_URL = (
  import.meta.env.VITE_MEDIA_CDN ||
  import.meta.env.VITE_FILES_CDN ||
  import.meta.env.VITE_S3_BUCKET_URL ||
  "https://mapsync-media.s3.sa-east-1.amazonaws.com"
).replace(/\/$/, "");

const sanitizeKey = (key) =>
  String(key)
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");

const resolveMediaUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${BASE_MEDIA_URL}/${sanitizeKey(u)}`;
};

// Hook para buscar possíveis duplicatas
function useNearbyOccurrences(occurrenceId, enabled) {
  return useQuery({
    queryKey: ["occurrence-nearby", occurrenceId],
    queryFn: async () => {
      const { data } = await api.get(`/occurrences/${occurrenceId}/nearby`);
      const baseId = data?.baseId ?? null;
      const items = Array.isArray(data?.occurrences) ? data.occurrences : [];
      return { baseId, items };
    },
    enabled: !!(enabled && occurrenceId),
  });
}

export function WarrantyCard({ occurrence }) {
  const { toast } = useToast();

  const photos = useMemo(() => {
    const p = occurrence?.photos || {};
    const stageOrder = ["ninetyDaysWarranty", "final", "progress", "initial"];

    const rawList = stageOrder.flatMap((stage) =>
      Array.isArray(p[stage]) ? p[stage] : []
    );

    const urls = rawList
      .map((x) => (typeof x === "string" ? x : x?.url))
      .filter(Boolean)
      .map((u) => resolveMediaUrl(u));

    const unique = Array.from(new Set(urls));

    return unique.length
      ? unique
      : ["https://placehold.co/1024x576?text=Sem+Foto"];
  }, [occurrence?.photos]);

  const photosCount = photos.length;
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    setActiveIdx((i) => (photosCount ? Math.min(i, photosCount - 1) : 0));
  }, [photosCount]);

  // modal duplicatas
  const [isPossibleDuplicateOpen, setIsPossibleDuplicateOpen] = useState(false);

  const {
    data: nearbyData,
    isLoading: nearbyLoading,
    error: nearbyErrorRaw,
  } = useNearbyOccurrences(occurrence?.id, isPossibleDuplicateOpen);

  const nearbyBaseId = nearbyData?.baseId ?? null;
  const nearbyItems = nearbyData?.items ?? [];
  const nearbyError = nearbyErrorRaw
    ? nearbyErrorRaw?.response?.data?.message ||
      nearbyErrorRaw.message ||
      "Não foi possível carregar possíveis duplicatas."
    : "";

  const street = occurrence?.address?.street ?? "—";
  const number = occurrence?.address?.number ?? "—";
  const neighborhood =
    occurrence?.address?.neighborhoodName ??
    occurrence?.address?.neighborhood ??
    "—";
  const zone = occurrence?.address?.region ?? "—";
  const zip = occurrence?.address?.zipCode ?? "—";
  const lon =
    typeof occurrence?.address?.longitude === "number"
      ? occurrence.address.longitude
      : "—";
  const lat =
    typeof occurrence?.address?.latitude === "number"
      ? occurrence.address.latitude
      : "—";

  const solicitadoPor = occurrence?.author?.name ?? "—";

  const tipoOcorrencia =
    occurrence?.type === "DESOBSTRUCAO"
      ? "Drenagem"
      : occurrence?.type === "TAPA_BURACO"
      ? "Asfalto"
      : occurrence?.type ?? "—";

  const osCode = occurrence?.protocolNumber || occurrence?.id || "—";

  const timelineSteps = [
    { label: "Solicitação", date: occurrence?.createdAt },
    { label: "Aceito", date: occurrence?.updatedAt },
  ];

  function handleCopyProtocol() {
    const value = osCode && String(osCode).trim();
    if (!value || value === "—") {
      toast({
        title: "Nada para copiar",
        description: "Esta ocorrência não possui protocolo.",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: "Copiado!",
        description: "Protocolo copiado para a área de transferência.",
      });
    });
  }

  return (
    <div className="rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-sm">
      {/* imagem */}
      <div className="relative w-full aspect-[16/9] bg-white p-2 rounded-2xl">
        <img
          src={photos[activeIdx]}
          alt={`Imagem ${activeIdx + 1}/${photos.length}`}
          className="w-full h-full rounded-2xl object-cover"
          loading="lazy"
        />

        {/* legenda/contador */}
        <div className="absolute left-3 bottom-3 rounded-full bg-black/60 text-white text-xs px-2 py-1">
          Imagem {activeIdx + 1}/{photos.length}
        </div>

        {photos.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) =>
                  prev === 0 ? photos.length - 1 : prev - 1
                );
              }}
              className="bg-black/50 text-white rounded-full px-3 py-1 text-xs"
            >
              ◀ Anterior
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) =>
                  prev === photos.length - 1 ? 0 : prev + 1
                );
              }}
              className="bg-black/50 text-white rounded-full px-3 py-1 text-xs"
            >
              Próxima ▶
            </button>
          </div>
        )}
      </div>

      {/* alerta duplicata */}
      <div className="flex items-center gap-3 px-4 py-3 w-full">
        <div className="w-full">
          <Button
            onClick={() => setIsPossibleDuplicateOpen(true)}
            className="w-full h-[44px] sm:h-auto bg-yellow-50 border border-yellow-300 text-yellow-800 hover:bg-yellow-100 flex items-center justify-between"
          >
            <div className="flex-1 min-w-0 flex items-center justify-center sm:justify-between text-center sm:text-left">
              <span className="whitespace-normal break-words">
                Ocorrência para verificação de garantia
              </span>

              <div className="hidden sm:block">
                <AlertPColor />
              </div>
            </div>
          </Button>
        </div>
      </div>
      <div className="p-4 sm:p-5 border-t border-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Informações */}
          <div>
            <ul className="space-y-1.5 text-sm">
              <button
                type="button"
                onClick={handleCopyProtocol}
                className="w-full h-[60px] text-left text-black flex items-center justify-between gap-1 rounded-lg border px-3 py-2 bg-[#D9DCE2] hover:bg-gray-300 "
                aria-label="Copiar protocolo"
              >
                <span className="truncate ">O.S.: {osCode}</span>
                <Copy className="w-4 h-4 shrink-0 opacity-70" />
              </button>

              <li className="text-zinc-500">
                <span className="font-semibold text-zinc-700">
                  Solicitado por:{" "}
                </span>
                <span className="text-zinc-700">{solicitadoPor}</span>
              </li>
              <li className="text-zinc-500">
                <span className="font-semibold text-zinc-700">
                  Ocorrência:{" "}
                </span>
                <span className="text-zinc-700">{tipoOcorrencia}</span>
              </li>
              <li className="text-zinc-500">
                <span className="font-semibold text-zinc-700">Endereço: </span>
                <span className="text-zinc-700">
                  {street}, {number}
                </span>
              </li>
              <li className="text-zinc-500">
                <span className="font-semibold text-zinc-700">Bairro: </span>
                <span className="text-zinc-700">{neighborhood}</span>
              </li>
              <li className="text-zinc-500">
                <span className="font-semibold text-zinc-700">Zona: </span>
                <span className="text-zinc-700">{zone}</span>
              </li>
              <li className="text-zinc-500">
                <span className="font-semibold text-zinc-700">CEP: </span>
                <span className="text-zinc-700">{zip}</span>
              </li>
              <li className="text-zinc-500">
                <span className="font-semibold text-zinc-700">Longitude: </span>
                <span className="text-zinc-700">{lon}</span>
              </li>
              <li className="text-zinc-500">
                <span className="font-semibold text-zinc-700">Latitude: </span>
                <span className="text-zinc-700">{lat}</span>
              </li>
            </ul>
          </div>

          {/* Timeline */}
          <div className="relative z-0">
            <Timeline timeline={timelineSteps} />
          </div>
        </div>
      </div>

      {/* Modal de possíveis duplicatas */}
      <Dialog
        open={isPossibleDuplicateOpen}
        onOpenChange={setIsPossibleDuplicateOpen}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Possível duplicata</DialogTitle>
            <DialogDescription>
              Esta ocorrência pode ter registros muito próximos (mesmo
              local/tempo).
            </DialogDescription>
          </DialogHeader>

          {nearbyLoading && (
            <p className="text-sm text-gray-600">
              Carregando possíveis duplicatas...
            </p>
          )}

          {!nearbyLoading && nearbyError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {nearbyError}
            </div>
          )}

          {!nearbyLoading && !nearbyError && (
            <>
              {Array.isArray(nearbyItems) && nearbyItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      {nearbyItems.length} possível(is) duplicata(s)
                    </span>
                  </div>

                  <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {nearbyItems.map((o) => {
                      const created = o?.createdAt
                        ? format(new Date(o.createdAt), "dd/MM/yyyy HH:mm")
                        : "—";
                      const rua = o?.address?.street ?? "Rua não informada";
                      const num = o?.address?.number ?? "s/n";
                      const bairro = o?.address?.neighborhoodName ?? "—";
                      const protocolo = o?.protocolNumber ?? "—";
                      const status = o?.status ?? "—";

                      return (
                        <li
                          key={o.id}
                          className="border rounded-lg p-3 bg-[#F8F8F8] text-sm text-gray-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {o.type ?? "Ocorrência"}
                              </p>
                              <p className="text-gray-700 truncate">
                                {rua}, {num} — {bairro}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Criada em: {created}
                              </p>
                              <p className="text-xs text-gray-500">
                                Protocolo:{" "}
                                <span className="font-mono">{protocolo}</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {status}
                              </p>
                            </div>

                            <div className="shrink-0 flex flex-col gap-2">
                              <Button
                                variant="outline"
                                className="h-8 px-2 text-xs"
                                onClick={() => {
                                  if (
                                    protocolo &&
                                    typeof navigator !== "undefined"
                                  ) {
                                    navigator.clipboard?.writeText(protocolo);
                                  }
                                }}
                                title="Copiar protocolo"
                              >
                                Copiar protocolo
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Nenhuma possível duplicata encontrada para esta ocorrência.
                </p>
              )}
            </>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPossibleDuplicateOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
