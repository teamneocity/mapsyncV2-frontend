import { useMemo, useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Timeline } from "./Timeline";

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

// Badge simples para status (idêntico ao exemplo)
function StatusBadge({
  status,
  isEmergencial,
  isDelayed,
  labelOverrides = {},
}) {
  const getStatusClasses = (status) => {
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
  const classes = getStatusClasses(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

export function WarrantyCard({ occurrence, expanded, onToggle }) {
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

  const status = occurrence?.status ?? "—";
  const tipoOcorrencia = occurrence?.type ?? "—";
  const solicitadoPor = occurrence?.author?.name ?? "—";

  const osCode = occurrence?.protocolNumber || occurrence?.id || "—";

  const timelineSteps = [
    { label: "Solicitação", date: occurrence?.createdAt },
    { label: "Aceito", date: occurrence?.acceptedAt },
    { label: "Verificado", date: occurrence?.updatedAt },
    { label: "Iniciada", date: occurrence?.startedAt },
    { label: "Finalizada", date: occurrence?.finishedAt },
    
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

        {/* === NAV BOTTOM IGUAL AO InspectionCard === */}
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

      {/* status */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-zinc-200">
        <div className="ml-auto">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* info + timeline */}
      <div className="p-4 sm:p-5 border-t border-zinc-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Informações */}
          <div>
            <ul className="space-y-1.5 text-sm">
              <button
                type="button"
                onClick={handleCopyProtocol}
                className="w-full h-[58px] text-left text-black flex items-center justify-between gap-1 rounded-lg border px-3 py-2 bg-[#D9DCE2] hover:bg-gray-300 "
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
    </div>
  );
}
