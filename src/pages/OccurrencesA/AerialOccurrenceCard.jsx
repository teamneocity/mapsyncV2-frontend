import { useEffect, useMemo, useState } from "react";
import { ExpandedRowA } from "./ExpandedRowA";
import { Timeline } from "./Timeline";
import { Copy } from "lucide-react";
import Video from "@/assets/icons/Video.svg?react";
import Image from "@/assets/icons/Image.svg?react";
import { useToast } from "@/hooks/use-toast";

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

function StatusBadge({
  status,
  isEmergencial,
  isDelayed,
  labelOverrides = {},
}) {
  const getStatusClasses = (status, emerg) => {
    if (emerg) return "bg-red-600 text-white";
    const map = {
      em_analise: "bg-[#D0E4FC] text-[#1678F2]",
      emergencial: "bg-[#FFE8E8] text-[#FF2222]",
      aprovada: "bg-[#F6FFC6] text-[#79811C]",
      os_gerada: "bg-[#f0ddee] text-[#733B73]",
      aguardando_execucao: "bg-[#EBD4EA] text-[#5D2A61]",
      em_execucao: "bg-[#FFF1CB] text-[#845B00]",
      finalizada: "bg-[#C9F2E9] text-[#1C7551]",
      pendente: "bg-[#FFE8DC] text-[#824F24]",
      aceita: "bg-[#FFF4D6] text-[#986F00]",
      verificada: "bg-[#DDF2EE] text-[#40C4AA]",
      rejeitada: "bg-[#FFE8E8] text-[#9D0000]",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  const statusLabels = {
    em_analise: "Em análise",
    emergencial: "Emergencial",
    aprovada: "Aprovada",
    os_gerada: "O.S. gerada",
    aguardando_execucao: "Agendada",
    em_execucao: "Andamento",
    finalizada: "Finalizada",
    pendente: "Pendente",
    aceita: "Aceita",
    verificada: "Verificada",
    rejeitada: "Rejeitada",
  };

  const label = labelOverrides[status] || statusLabels[status] || status || "—";
  const classes = getStatusClasses(status, isEmergencial === true);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

export function AerialOccurrenceCard({ occurrence, expanded, onToggle }) {
  const { toast } = useToast();

  const photos = useMemo(() => {
    const source =
      (Array.isArray(occurrence?.result?.photos) && occurrence.result.photos) ||
      (Array.isArray(occurrence?.photos) && occurrence.photos) ||
      [];
    const urls = source
      .map((p) => (typeof p === "string" ? p : p?.url))
      .filter(Boolean)
      .map((u) => resolveMediaUrl(u));

    return urls.length ? urls : ["https://placehold.co/1024x576?text=Sem+Foto"];
  }, [occurrence?.result?.photos, occurrence?.photos]);

  const photosCount = photos.length;
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    setActiveIdx((i) => (photosCount ? Math.min(i, photosCount - 1) : 0));
  }, [photosCount]);

  const street = occurrence?.address?.street ?? "—";
  const number = occurrence?.address?.number ?? "—";
  const neighborhood = occurrence?.address?.neighborhood ?? "—";
  const zone =
    occurrence?.address?.zone ?? occurrence?.address?.zoneName ?? "—";
  const zip = occurrence?.address?.zipCode ?? "—";
  const lon = occurrence?.address?.longitude ?? "—";
  const lat = occurrence?.address?.latitude ?? "—";

  const status = occurrence?.status ?? "—";
  const tipoOcorrencia = occurrence?.type ?? "—";
  const solicitadoPor = occurrence?.requester?.name ?? "—";
  const osCode = occurrence?.id || "—";

  const imageUrls = photos;

  const videoUrls = useMemo(() => {
    const source =
      (Array.isArray(occurrence?.result?.videos) && occurrence.result.videos) ||
      (Array.isArray(occurrence?.videos) && occurrence.videos) ||
      [];
    return source
      .map((v) => (typeof v === "string" ? v : v?.url))
      .filter(Boolean)
      .map((u) => resolveMediaUrl(u));
  }, [occurrence?.result?.videos, occurrence?.videos]);

  const handleDownloadImages = () =>
    imageUrls.forEach((u) => window.open(u, "_blank", "noopener"));

  const handleDownloadVideos = () =>
    videoUrls.forEach((u) => window.open(u, "_blank", "noopener"));

  const t = occurrence?.timeline || {};
  const timelineSteps = [
    { label: "Solicitação", date: t?.requestedAt || occurrence?.requestedAt },
    { label: "Aceito", date: t?.acceptedAt || occurrence?.acceptedAt },
    { label: "Verificado", date: t?.verifiedAt || occurrence?.verifiedAt },
  ];

  function handleCopyProtocol() {
    const value = occurrence?.id;
    if (!value) {
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

  const isEmerg = (occurrence?.isEmergency ?? occurrence?.isEmergencial ?? false) === true;

  return (
    <div className="rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-sm">
      <div className="relative w-full aspect-[16/9] bg-white p-2 rounded-2xl">
        <img
          src={photos[activeIdx]}
          alt={`Imagem ${activeIdx + 1}/${photos.length}`}
          className="w-full h-full rounded-2xl object-cover"
          loading="lazy"
        />

        <div className="absolute left-3 bottom-3 rounded-full bg-black/60 text-white text-xs px-2 py-1">
          Imagem {activeIdx + 1}/{photos.length}
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveIdx((i) => (i - 1 + photos.length) % photos.length)
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              onClick={() => setActiveIdx((i) => (i + 1) % photos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60"
              aria-label="Próxima"
            >
              ›
            </button>

            <div className="absolute right-3 bottom-3 flex gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i === activeIdx ? "bg-white" : "bg-white/60"
                  }`}
                  aria-label={`Ir para imagem ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center px-1 sm:px-2 py-3 border-b border-zinc-200">
        <button
          onClick={handleDownloadVideos}
          disabled={videoUrls.length === 0}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 ${
            videoUrls.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Video />
          Downloads Vídeos {videoUrls.length ? `(${videoUrls.length})` : ""}
        </button>

        <button
          onClick={handleDownloadImages}
          disabled={photosCount === 0}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 ${
            photosCount === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Image />
          Download imagens ({photosCount})
        </button>

        <div className="ml-auto">
          <StatusBadge status={status} isEmergencial={isEmerg} />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <ul className="space-y-1.5 text-sm">
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

          <div>
            <Timeline timeline={timelineSteps} />
          </div>
        </div>
      </div>
    </div>
  );
}
