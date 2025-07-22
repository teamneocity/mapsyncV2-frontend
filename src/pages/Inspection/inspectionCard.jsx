import { useState } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

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
      label: "Em andamento",
      url:
        occurrence.photos?.progress?.[0] &&
        `${baseURL}${occurrence.photos.progress[0]}`,
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
    aguardando_execucao: "bg-[#E5E5E5] text-[#777]",
    finalizada: "bg-[#DDF2EE] text-[#40C4AA]",
    aguardando_execucao: "bg-[#EFFBFF] text-[#33CFFF]"
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

  const hasImage = occurrence.photos?.initial?.[0];
  const imageUrl = hasImage
    ? `https://mapsync-media.s3.sa-east-1.amazonaws.com/${hasImage}`
    : "https://via.placeholder.com/500x200.png?text=Sem+imagem";

  const timeline = {
    requested: occurrence.createdAt,
    accepted: serviceorder.createdAt,
    started: serviceorder.startedAt,
    finished: serviceorder.finishedAt,
  };

  return (
    <div className="bg-[#F7F7F7] rounded-[12px] shadow-sm overflow-hidden flex-shrink-0 w-full max-w-[525px] border border-gray-200 min-h-[650px] sm:min-h-[auto]">
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

      <div className="flex justify-end p-2 border-b border-dotted border-gray-300 pb-4 mb-4">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass}`}
        >
          {status}
        </span>
      </div>

      <div className="px-4 pb-4 text-sm text-[#787891] grid grid-cols-12 gap-2 min-h-[400px] sm:min-h-[auto]">
        <div className="col-span-7 space-y-1">
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
            <strong>Ocorrência:</strong> {occurrence.type}
          </p>
        </div>

        <div className="col-span-5">
          {Object.entries(timeline).map(([key, date], i, arr) => (
            <div className="flex items-start gap-2 mb-3" key={i}>
              <div className="flex flex-col items-center">
                <div className="h-4 w-4 bg-[#33C083] rounded-full border border-white" />
                {arr[i + 1]?.[1] && (
                  <div className="h-8 border-l-2 border-dotted border-green-300" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold capitalize">
                  {
                    {
                      requested: "Solicitação",
                      accepted: "Aceito",
                      started: "Iniciado",
                      finished: "Finalizado",
                    }[key]
                  }
                </p>
                <p className="text-xs text-gray-600">
                  <Clock className="inline-block h-3 w-3 mr-1" />
                  {date ? format(new Date(date), "dd/MM/yy, HH:mm") : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
