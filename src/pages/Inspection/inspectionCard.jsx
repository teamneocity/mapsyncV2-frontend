import { useState } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import Copy from "@/assets/icons/Copy.svg?react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import Start from "@/assets/timeline/Start.svg?react";
import During from "@/assets/timeline/During.svg?react";
import End from "@/assets/timeline/End.svg?react";

export function InspectionCard({ serviceorder }) {
  const occurrence = serviceorder.occurrence;
  const { toast } = useToast();

  const baseURL = "https://mapsync-media.s3.sa-east-1.amazonaws.com/";

  const photoUrls = [
    {
      label: "Inicial",
      url:
        occurrence.photos?.initial?.[0] &&
        `${baseURL}${occurrence.photos.initial[0]}`,
    },
    {
      label: "Finalizada",
      url:
        occurrence.photos?.final?.[0] &&
        `${baseURL}${occurrence.photos.final[0]}`,
    },
  ];

  const [photoIndex, setPhotoIndex] = useState(0);
  const currentPhoto = photoUrls[photoIndex];

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
    encaminhada_externa: "Arquivada",
  };

  const statusColors = {
    em_execucao: "bg-[#FFF1CB] text-[#845B00]",
    aguardando_execucao: "bg-[#EBD4EA] text-[#5D2A61]",
    finalizada: "bg-[#C9F2E9] text-[#1C7551]",
  };

  const rawStatus = serviceorder.status;
  const status = statusLabels[rawStatus] || "Status";
  const statusClass = statusColors[rawStatus] || "bg-gray-200 text-gray-600";

  const timeline = {
    requested: occurrence.createdAt,
    accepted: serviceorder.createdAt,
    started: serviceorder.startedAt,
    finished: serviceorder.finishedAt,
  };

  const timelineLabels = {
    requested: "Solicitação",
    accepted: "Aceito",
    started: "Iniciado",
    finished: "Finalizado",
  };

  const timelineIcons = [Start, During, During, End];
  const timelineEntries = Object.entries(timeline);

  const typeLabels = {
    TAPA_BURACO: "Asfalto",
    AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
    MEIO_FIO: "Meio fio",
    DESOBSTRUCAO: "Drenagem",
    LIMPA_FOSSA: "Limpa fossa",
    DESOBSTRUÇÃO_CAMINHÃO: "Desob. caminhão",
  };

  function handleCopyProtocol() {
    const value = serviceorder.protocolNumber;
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

  return (
    <div className="bg-[#F7F7F7] rounded-[12px] shadow-sm overflow-hidden flex-shrink-0 w-full max-w-[525px] border border-gray-200 h-[650px] flex flex-col">
      {/* Imagem principal */}
      <div className="relative">
        <Dialog>
          <DialogTrigger asChild>
            <div className="m-2 rounded-[12px] border border-gray-200 bg-white overflow-hidden cursor-pointer relative">
              <div className="h-[270px] w-full bg-gray-100 flex items-center justify-center relative">
                {/* Legenda da etapa */}
                <div className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded shadow">
                  {currentPhoto.label}
                </div>

                {currentPhoto.url ? (
                  <img
                    src={currentPhoto.url}
                    alt={`Imagem ${photoIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm px-4 text-center">
                    Foto não anexada ainda
                  </span>
                )}

                {/* Navegação */}
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
              </div>
            </div>
          </DialogTrigger>

          {currentPhoto.url && (
            <DialogContent className="max-w-4xl w-full">
              <img
                src={currentPhoto.url}
                alt={`Imagem expandida ${photoIndex + 1}`}
                className="w-full max-h-[80vh] object-contain rounded-[12px] border border-gray-200 bg-white p-1"
              />
            </DialogContent>
          )}
        </Dialog>
      </div>

      {/* Status */}
      <div className="flex justify-end p-2 border-b border-dotted border-gray-300 pb-4 mb-4">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass}`}
        >
          {status}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="px-4 pb-4 text-sm text-black grid grid-cols-12 gap-2 flex-1 overflow-y-auto">
        {/* Coluna 1 */}
        <div className="col-span-6 space-y-1">
          <button
            type="button"
            onClick={handleCopyProtocol}
            disabled={!serviceorder.protocolNumber}
            className="w-full h-[58px] text-left flex items-center justify-between gap-3 rounded-lg border px-3 py-2 bg-[#D9DCE2] hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Copiar protocolo"
          >
            <span className="truncate">
              Protocolo : {serviceorder.protocolNumber}
            </span>
            <Copy className="w-5 h-5 shrink-0 opacity-70" />
          </button>
          <p>
            <strong>Companhia:</strong> {occurrence.externalCompany || "EMURB"}
          </p>
          <p>
            <strong>Solicitado por:</strong> {occurrence.author?.name || "—"}
          </p>
          <p>
            <strong>Tipo:</strong>{" "}
            {typeLabels[occurrence?.type] || occurrence?.type || "—"}
          </p>
          <p>
            <strong>Endereço:</strong> {occurrence.address?.street},{" "}
            {occurrence.address?.number}
          </p>
          <p>
            <strong>Bairro:</strong>{" "}
            {occurrence.address?.neighborhoodName || "—"}
          </p>
          <p>
            <strong>Zona:</strong> {occurrence.address?.zone || "—"}
          </p>
          <p>
            <strong>CEP:</strong> {occurrence.address?.zipCode || "—"}
          </p>
          <p>
            <strong>Longitude:</strong> {occurrence.address?.longitude || "—"}
          </p>
          <p>
            <strong>Latitude:</strong> {occurrence.address?.latitude || "—"}
          </p>
        </div>

        {/* Coluna 2  */}
        <div className="col-span-6 relative z-0">
          <div className="relative">
            <ul className="space-y-6 mt-1 pl-6">
              {timelineEntries.map(([key, date], index) => {
                let Icon;
                if (index === 0) Icon = Start;
                else if (index === timelineEntries.length - 1) Icon = End;
                else Icon = During;

                const showLine = index < timelineEntries.length - 1;

                return (
                  <li key={index} className="relative flex items-start gap-3">
                    {/* Ícone + linha */}
                    <div className="absolute -left-6 top-1 flex flex-col items-center z-10">
                      <Icon className="w-5 h-5" />
                      {showLine && (
                        <div className="h-8 border-l-2 border-dotted border-[#33C083]" />
                      )}
                    </div>

                    {/* Texto */}
                    <div className="ml-1 text-sm text-gray-700">
                      <p className="text-xs font-semibold capitalize">
                        {timelineLabels[key]}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="inline-block h-3 w-3" />
                        {date ? format(new Date(date), "dd/MM/yy, HH:mm") : "—"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
