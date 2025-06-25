// ExpandedRowA.jsx
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleMaps } from "@/components/googleMaps";
import { FileText, FileDown, Share2, FileCheck2 } from "lucide-react";
import { Timeline } from "./Timeline";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CloudShare from "@/assets/icons/cloudShare.svg?react";
import FilePdf from "@/assets/icons/filePdf.svg?react";
import Vector from "@/assets/icons/vector.svg?react";
import CloudUploadAlt from "@/assets/icons/cloudUploadAlt.svg?react";

export function ExpandedRowA({ occurrence }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const timeline = [
    { label: "Solicitação", date: occurrence.requestedAt },
    { label: "Aceito", date: occurrence.acceptedAt },
    { label: "Verificado", date: occurrence.verifiedAt },
  ];

  const photoUrl = occurrence?.result?.photos?.[0]?.url;
  const videoUrl = occurrence?.result?.videos?.[0]?.url;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-4 rounded-lg shadow-sm text-sm items-stretch">
      {/* Coluna 1 - Informações */}
      <div className="space-y-4 col-span-1 h-full">
        <div>
          <h3 className="font-semibold text-[#787891] mb-2 pb-1">
            Informações sobre a ocorrência
          </h3>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <p>
              <strong>Solicitado por:</strong>{" "}
              {occurrence.requester?.name || "—"}
            </p>
            <p>
              <strong>Ocorrência:</strong> {occurrence.type || "—"}
            </p>
            <p>
              <strong>Data:</strong>{" "}
              {format(
                new Date(occurrence.requestedAt),
                "dd/MM/yyyy 'às' HH:mm"
              )}
            </p>
            <p>
              <strong>Setor:</strong> Mapeamento
            </p>
            <p className="col-span-2">
              <strong>Local:</strong> {occurrence.address?.street || "—"}
            </p>
            <p>
              <strong>CEP:</strong> {occurrence.address?.zipCode || "—"}
            </p>
            <p>
              <strong>Bairro:</strong> {occurrence.address?.neighborhood || "—"}
            </p>
            <p>
              <strong>Região:</strong> Sul
            </p>
            {occurrence.result && (
              <>
                <p>
                  <strong>Comprimento:</strong>{" "}
                  {occurrence.result.length ?? "—"} m
                </p>
                <p>
                  <strong>Largura:</strong> {occurrence.result.width ?? "—"} m
                </p>
                <p>
                  <strong>Distância:</strong>{" "}
                  {occurrence.result.distance ?? "—"} m
                </p>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-[#787891] font-semibold mb-2 border-b pb-1">
            Anotações da ocorrência
          </h3>
          <div className="bg-[#F8F8F8] rounded-xl px-4 py-2 min-h-[119px] text-gray-700">
            {occurrence?.observation || "Sem anotações."}
          </div>
          {occurrence.result?.notes && (
            <div className="mt-2 text-gray-700 text-sm">
              <strong>Notas da verificação:</strong> {occurrence.result.notes}
            </div>
          )}
        </div>
      </div>

      {/* Coluna 2 - Ações e timeline */}
      <div className="col-span-1 h-full flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-semibold text-[#787891] mb-2">Ações</h3>
          <div className="bg-[#ECECEC] rounded-xl grid grid-cols-4 gap-2 p-2">
            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <Vector className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Ver notas</span>
            </Button>

            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <FilePdf className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Gerar PDF</span>
            </Button>

            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <CloudUploadAlt className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Upload</span>
            </Button>

            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <CloudShare className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Compartilhar</span>
            </Button>
          </div>

          <Timeline timeline={timeline} />
        </div>
      </div>

      {/* Coluna 3 - Mídia e mapa */}
      <div className="col-span-1 h-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          {/* Foto */}
          <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
            <DialogTrigger asChild>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Foto da inspeção"
                  className="rounded-md border h-1/2 object-cover cursor-pointer"
                />
              ) : (
                <div className="h-1/2 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                  Sem foto
                </div>
              )}
            </DialogTrigger>
            {photoUrl && (
              <DialogContent className="max-w-4xl w-full">
                <img
                  src={photoUrl}
                  alt="Foto expandida"
                  className="w-full max-h-[80vh] object-contain"
                />
              </DialogContent>
            )}
          </Dialog>

          {/* Vídeo */}
          <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
            <DialogTrigger asChild>
              {videoUrl ? (
                <video
                  controls
                  className="rounded-md border h-1/2 object-cover cursor-pointer"
                  src={videoUrl}
                />
              ) : (
                <div className="h-1/2 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                  Sem vídeo
                </div>
              )}
            </DialogTrigger>
            {videoUrl && (
              <DialogContent className="max-w-4xl w-full">
                <video
                  controls
                  src={videoUrl}
                  className="w-full max-h-[80vh] rounded"
                />
              </DialogContent>
            )}
          </Dialog>
        </div>

        {/* Mapa */}
        <Dialog open={mapOpen} onOpenChange={setMapOpen}>
          <DialogTrigger asChild>
            <div className="cursor-pointer">
              <GoogleMaps
                position={{
                  lat: parseFloat(occurrence.address?.latitude ?? 0),
                  lng: parseFloat(occurrence.address?.longitude ?? 0),
                }}
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-full h-[80vh]">
            <GoogleMaps
              position={{
                lat: parseFloat(occurrence.address?.latitude ?? 0),
                lng: parseFloat(occurrence.address?.longitude ?? 0),
              }}
              fullHeight
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
