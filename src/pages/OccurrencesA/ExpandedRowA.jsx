// ExpandedRowA.jsx
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleMaps } from "@/components/googleMaps";
import { FileText, FileDown, Share2, FileCheck2 } from "lucide-react";
import { Timeline } from "./Timeline";
import CloudShare from "@/assets/icons/cloudShare.svg?react";
import FilePdf from "@/assets/icons/filePdf.svg?react";
import Vector from "@/assets/icons/vector.svg?react";
import CloudUploadAlt from "@/assets/icons/cloudUploadAlt.svg?react";

import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsDown } from "lucide-react";
import { useAuth } from "@/hooks/auth";

export function ExpandedRowA({ occurrence }) {
  const { user } = useAuth();
  const [mapOpen, setMapOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const { toast } = useToast();

  const [refuseOpen, setRefuseOpen] = useState(false);
  const [reason, setReason] = useState("");

  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [finalData, setFinalData] = useState({
    length: "",
    width: "",
    distance: "",
    notes: "",
    photoUrl: "",
    videoUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const timeline = [
    { label: "Solicitação", date: occurrence.requestedAt },
    { label: "Aceito", date: occurrence.acceptedAt },
    { label: "Verificado", date: occurrence.verifiedAt },
  ];

  const photoUrl = occurrence?.result?.photos?.[0]?.url;
  const videoUrl = occurrence?.result?.videos?.[0]?.url;

  //aceita as inspeções
  async function handleAcceptInspection(id) {
    try {
      await api.patch("/aerial-inspections/accept", { inspectionId: id });
      toast({ title: "Inspeção aceita com sucesso!" });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Erro ao aceitar inspeção:", err);
      toast({
        variant: "destructive",
        title: "Erro ao aceitar inspeção",
        description: err?.response?.data?.message || "Erro desconhecido.",
      });
    }
  }

  // recusa solicitação
  async function handleRefuseInspection(id) {
    try {
      await api.patch("/aerial-inspections/refuse", {
        inspectionId: id,
        reason,
      });
      toast({ title: "Inspeção recusada com sucesso!" });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Erro ao recusar inspeção:", err);
      toast({
        variant: "destructive",
        title: "Erro ao recusar inspeção",
        description: err?.response?.data?.message || "Erro desconhecido.",
      });
    }
  }

  //finaliza
  async function handleFinalizeInspection(id) {
  if (isSubmitting) return; // evita envio duplo

  try {
    setIsSubmitting(true);

    const payload = {
      inspectionId: id,
      length: parseFloat(finalData.length),
      width: parseFloat(finalData.width),
      distance: parseFloat(finalData.distance),
      notes: finalData.notes,
      photos: [
        {
          url: finalData.photoUrl.trim(),
          uploadedAt: new Date().toISOString(),
          uploadedById: user.id,
        },
      ],
      videos: [
        {
          url: finalData.videoUrl.trim(),
          uploadedAt: new Date().toISOString(),
          uploadedById: user.id,
        },
      ],
    };

    await api.post("/aerial-inspections/result", payload);
    toast({ title: "Inspeção finalizada com sucesso!" });
    setTimeout(() => window.location.reload(), 1000);
  } catch (err) {
    console.error("Erro ao finalizar inspeção:", err);
    toast({
      variant: "destructive",
      title: "Erro ao finalizar inspeção",
      description: err?.response?.data?.message || "Erro desconhecido.",
    });
  } finally {
    setIsSubmitting(false);
  }
}


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
        {!occurrence.acceptedAt && (
          <>
            <Button
              className="w-full h-[64px] bg-[#FFE8E8] hover:bg-red-200 text-[#9D0000] mt-4"
              onClick={() => setRefuseOpen(true)}
            >
              Cancelar
              <ThumbsDown className="ml-2 h-4 w-4" />
            </Button>

            {refuseOpen && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
                <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-lg space-y-5 text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Motivo da recusa
                  </h2>

                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Descreva aqui..."
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 resize-none outline-none"
                    rows={4}
                  />

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleRefuseInspection(occurrence.id)}
                      className="flex items-center justify-center gap-2 w-full rounded-2xl bg-black text-white py-3 font-medium text-sm hover:bg-gray-900 transition"
                    >
                      <span className="text-lg">↩</span>
                      Confirmar recusa
                    </button>

                    <button
                      onClick={() => {
                        setRefuseOpen(false);
                        setReason("");
                      }}
                      className="text-sm text-gray-500 underline hover:text-gray-700 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
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
        {!occurrence.acceptedAt ? (
          <Button
            onClick={() => handleAcceptInspection(occurrence.id)}
            className="w-full h-[64px] bg-[#A6E0FF] hover:bg-blue-300 text-[#00679D]"
          >
            Aceitar 
          </Button>
        ) : (
          <>
            <Button
              onClick={() => setFinalizeOpen(true)}
              disabled={!!occurrence.verifiedAt}
              className="w-full h-[64px] bg-[#C9F2E9] hover:bg-green-300 text-[#1C7551]"
            >
              Finalizar 
            </Button>

            {finalizeOpen && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
                <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-lg space-y-5 text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Finalizar inspeção aérea
                  </h2>

                  <input
                    type="number"
                    placeholder="Comprimento (m)"
                    value={finalData.length}
                    onChange={(e) =>
                      setFinalData((prev) => ({
                        ...prev,
                        length: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Largura (m)"
                    value={finalData.width}
                    onChange={(e) =>
                      setFinalData((prev) => ({
                        ...prev,
                        width: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Distância (m)"
                    value={finalData.distance}
                    onChange={(e) =>
                      setFinalData((prev) => ({
                        ...prev,
                        distance: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 outline-none"
                  />

                  <textarea
                    placeholder="Notas da verificação"
                    value={finalData.notes}
                    onChange={(e) =>
                      setFinalData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 resize-none outline-none"
                    rows={3}
                  />

                  <input
                    type="text"
                    placeholder="URL da foto"
                    value={finalData.photoUrl}
                    onChange={(e) =>
                      setFinalData((prev) => ({
                        ...prev,
                        photoUrl: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="URL do vídeo"
                    value={finalData.videoUrl}
                    onChange={(e) =>
                      setFinalData((prev) => ({
                        ...prev,
                        videoUrl: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 outline-none"
                  />

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={() => handleFinalizeInspection(occurrence.id)}
                      className="flex items-center justify-center gap-2 w-full rounded-2xl bg-black text-white py-3 font-medium text-sm hover:bg-gray-900 transition"
                    >
                      <span className="text-lg">✔</span>
                      Confirmar finalização
                    </button>

                    <button
                      onClick={() => {
                        setFinalizeOpen(false);
                        setFinalData({
                          length: "",
                          width: "",
                          distance: "",
                          notes: "",
                          photoUrl: "",
                          videoUrl: "",
                        });
                      }}
                      className="text-sm text-gray-500 underline hover:text-gray-700 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
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
                lat: parseFloat(occurrence.address?.latitude) || 0,
                lng: parseFloat(occurrence.address?.longitude) || 0,
              }}
              fullHeight
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
