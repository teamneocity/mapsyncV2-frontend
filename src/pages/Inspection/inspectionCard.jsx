import { useState } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

// Importando os ícones do Figma
import Start from "@/assets/timeline/Start.svg?react";
import During from "@/assets/timeline/During.svg?react";
import End from "@/assets/timeline/End.svg?react";

export function InspectionCard({ serviceorder }) {
  const occurrence = serviceorder.occurrence;

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

  const statusColors = {
    em_execucao: "bg-[#FFF6E0] text-[#FFBD4C]",
    aguardando_execucao: "bg-[#EFFBFF] text-[#33CFFF]",
    finalizada: "bg-[#DDF2EE] text-[#40C4AA]",
  };

  const statusLabel = {
    os_gerada: "Solicitado",
    aguardando_execucao: "Solicitada",
    em_execucao: "Andamento",
    finalizada: "Finalizada",
  };

  const status = statusLabel[serviceorder.status] || "Status";
  const statusClass =
    statusColors[serviceorder.status] || "bg-gray-200 text-gray-600";

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
    TAPA_BURACO: "Buraco",
    AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
    MEIO_FIO: "Meio fio",
    DESOBSTRUCAO: "Desobstrução",
    LIMPA_FOSSA: "Limpa fossa",
  };

  return (
    <div className="bg-[#F7F7F7] rounded-[12px] shadow-sm overflow-hidden flex-shrink-0 w-full max-w-[525px] border border-gray-200 min-h-[650px] sm:min-h-[auto]">
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
      <div className="px-4 pb-4 text-sm text-[#787891] grid grid-cols-12 gap-2 min-h-[400px] sm:min-h-[auto]">
        {/* Coluna 1 */}
        <div className="col-span-6 space-y-1">
          <p>
            <strong>O.S.:</strong> {serviceorder.protocolNumber}
          </p>
          <p>
            <strong>Zona:</strong> {occurrence.address?.zone || "—"}
          </p>
          <p>
            <strong>Setor:</strong> {occurrence.sector?.name || "—"}
          </p>
          <p>
            <strong>Enviado por:</strong> {occurrence.author?.name || "—"}
          </p>
          <p>
            <strong>Revisado por:</strong> {occurrence.approvedBy?.name || "—"}
          </p>
          <p>
            <strong>Bairro:</strong>{" "}
            {occurrence.address?.neighborhoodName || "—"}
          </p>
          <p>
            <strong>Endereço:</strong> {occurrence.address?.street},{" "}
            {occurrence.address?.number}
          </p>
          <p>
            <strong>CEP:</strong> {occurrence.address?.zipCode}
          </p>
          <p>
            <strong>Longitude:</strong> {occurrence.address?.longitude}
          </p>
          <p>
            <strong>Latitude:</strong> {occurrence.address?.latitude}
          </p>
          <p>
            <strong>Ocorrência:</strong>{" "}
            {typeLabels[occurrence?.type] ||
              occurrence?.type ||
              "—"}
          </p>
        </div>

        {/* Coluna 2  */}
        <div className="col-span-6 relative z-0">
          <div className="relative">
            <ul className="space-y-6 mt-1 pl-6">
              {timelineEntries.map(([key, date], index) => {
                // Ícone por posição
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
