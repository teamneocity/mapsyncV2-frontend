import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { GoogleMaps } from "@/components/googleMaps";
import { Timeline } from "./TimeLine";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CloudShare from "@/assets/icons/cloudShare.svg?react";
import FilePdf from "@/assets/icons/filePdf.svg?react";
import Vector from "@/assets/icons/vector.svg?react";
import CloudUploadAlt from "@/assets/icons/cloudUploadAlt.svg?react";
import { MediaMapSection } from "@/components/MediaMapSection";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { ServiceOrderPdf } from "./ServiceOrderPdf";
import { useToast } from "@/hooks/use-toast";

import { api } from "@/services/api";

export function ExpandedRowServiceOrder({ occurrence }) {
  const timeline = [
    { label: "Solicitação", date: occurrence.createdAt },
    { label: "Aceito", date: occurrence.updatedAt },
    { label: "Iniciado", date: occurrence.startedAt },
    { label: "Finalizado", date: occurrence.finishedAt },
  ];

  const [photoOpen, setPhotoOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const { toast } = useToast();

  const photoUrl = occurrence?.result?.photos?.[0]?.url;
  const lat = parseFloat(occurrence.occurrence?.address?.latitude ?? 0);
  const lng = parseFloat(occurrence.occurrence?.address?.longitude ?? 0);

  const [isModalOpen, setIsModalOpen] = useState(false); // modal iniciar
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false); // modal finalizar
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Abre o pdf
  const handleOpenPdfInNewTab = async () => {
    let base64Image = null;

    try {
      const photoPath = occurrence.occurrence?.photos?.initial?.[0];

      if (photoPath) {
        const url = `https://mapsync-media.s3.sa-east-1.amazonaws.com/${photoPath}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Erro ao buscar imagem");

        const blob = await response.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
    } catch (err) {
      console.warn("⚠️ Imagem não pôde ser carregada. Continuando sem imagem.");
      base64Image = null;
    }

    const pdfBlob = await pdf(
      <ServiceOrderPdf occurrence={occurrence} imageBase64={base64Image} />
    ).toBlob();

    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  };

  //Baixa o pdf
  const handleDownloadPdf = async () => {
    let base64Image = null;

    try {
      const photoPath = occurrence.occurrence?.photos?.initial?.[0];
      console.log("📸 Caminho da imagem:", photoPath);

      if (photoPath) {
        const url = `https://mapsync-media.s3.sa-east-1.amazonaws.com/${photoPath}`;
        console.log("🌐 URL da imagem:", url);

        const response = await fetch(url);
        console.log("📡 Status da requisição:", response.status);

        if (!response.ok) throw new Error("Erro ao buscar imagem");

        const blob = await response.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            console.log("✅ Base64 gerado:", reader.result?.slice(0, 100));
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        });
      }
    } catch (err) {
      console.warn("⚠️ Imagem não pôde ser carregada. Continuando sem imagem.");
      base64Image = null;
    }

    const blob = await pdf(
      <ServiceOrderPdf occurrence={occurrence} imageBase64={base64Image} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${occurrence.protocolNumber || "ordem-servico"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Converte a imagem
  const toBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  // Inicia a ocorrencia 
  const handleStartExecution = async () => {
    const occurrenceId = occurrence?.occurrence?.id;

    if (!occurrenceId || !selectedPhoto) {
      alert("ID da ocorrência ou imagem ausente.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("occurrenceId", occurrenceId);
      formData.append("photos", selectedPhoto); // ← agora vai sua imagem selecionada

      await api.post("/service-orders/start-execution", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({ title: "Execução iniciada com sucesso!" });
      setSelectedPhoto(null);
    } catch (err) {
      console.error("Erro ao iniciar execução:", err);
      toast({
        variant: "destructive",
        title: "Erro ao iniciar execução",
        description: err.message || "Falha ao iniciar execução da OS.",
      });
    }
  };

  // Finaliza a ocorrencia 
  const handleFinalizeExecution = async () => {
    const serviceOrderId = occurrence?.id; // ou occurrence.serviceOrderId, dependendo da estrutura

    if (!serviceOrderId || !selectedPhoto) {
      alert("ID da OS ou imagem ausente.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("serviceOrderId", serviceOrderId);
      formData.append("photos", selectedPhoto);

      await api.post("/service-orders/finalize", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({ title: "Execução finalizada com sucesso!" });
      setSelectedPhoto(null);
    } catch (err) {
      console.error("Erro ao finalizar execução:", err);
      toast({
        variant: "destructive",
        title: "Erro ao finalizar execução",
        description: err.message || "Falha ao finalizar execução da OS.",
      });
    }
  };

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
              {occurrence.occurrence?.author?.name || "—"}
            </p>
            <p>
              <strong>Ocorrência:</strong> {occurrence.occurrence?.type || "—"}
            </p>
            <p>
              <strong>Data:</strong>{" "}
              {format(new Date(occurrence.createdAt), "dd/MM/yyyy 'às' HH:mm")}
            </p>
            <p>
              <strong>Enviado por:</strong>{" "}
              {occurrence.occurrence?.author?.name || "—"}
            </p>
            <p>
              <strong>Setor:</strong> {occurrence.sector?.name || "—"}
            </p>
            <p>
              <strong>Responsável:</strong>{" "}
              {occurrence.occurrence?.approvedBy?.name || "—"}
            </p>
            <p>
              <strong>Técnico:</strong> {occurrence.inspector?.name || "—"}
            </p>
            <p>
              <strong>Encarregado:</strong> {occurrence.foreman?.name || "—"}
            </p>
            <p>
              <strong>Equipe:</strong> {occurrence.team?.name || "—"}
            </p>
            <p>
              <strong>Natureza:</strong> {occurrence.serviceNature?.name || "—"}
            </p>
            <p className="col-span-2">
              <strong>Local:</strong>{" "}
              {occurrence.occurrence?.address?.street || ""},{" "}
              {occurrence.occurrence?.address?.number || ""}
            </p>
            <p>
              <strong>CEP:</strong>{" "}
              {occurrence.occurrence?.address?.zipCode || "—"}
            </p>
            <p>
              <strong>Região:</strong> {occurrence.occurrence?.zone || "—"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-[#787891] font-semibold mb-2 border-b pb-1">
            Anotações da ocorrência
          </h3>
          <div className="bg-[#F8F8F8] rounded-xl px-4 py-2 min-h-[172px] text-gray-700">
            {occurrence?.occurrence?.description || "Sem anotações."}
          </div>
        </div>
      </div>

      {/* Coluna 2 - Ações e botão final */}
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
              onClick={handleOpenPdfInNewTab}
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <FilePdf className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Gerar PDF</span>
            </Button>

            <Button
              onClick={handleDownloadPdf}
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

        {/* BOTÃO DINÂMICO */}
        {!occurrence.startedAt ? (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full h-[64px] bg-[#D1F0FA] hover:bg-blue-300 text-[#116B97] mt-6"
          >
            Iniciar
          </Button>
        ) : (
          <Button
            onClick={() => setIsFinalizeModalOpen(true)}
            disabled={!!occurrence.finishedAt}
            className={`w-full h-[64px] mt-6 ${
              occurrence.finishedAt
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#C9F2E9] hover:bg-green-300 text-[#1C7551]"
            }`}
          >
            Finalizar
          </Button>
        )}
      </div>

      {/* Coluna 3 - Imagem e mapa com modal */}
      <MediaMapSection
        photoUrls={[
          {
            label: "Inicial",
            url:
              occurrence?.occurrence?.photos?.initial?.[0] &&
              `https://mapsync-media.s3.sa-east-1.amazonaws.com/${occurrence.occurrence.photos.initial[0]}`,
          },
          {
            label: "Em andamento",
            url:
              occurrence?.occurrence?.photos?.progress?.[0] &&
              `https://mapsync-media.s3.sa-east-1.amazonaws.com/${occurrence.occurrence.photos.progress[0]}`,
          },
          {
            label: "Finalizada",
            url:
              occurrence?.occurrence?.photos?.final?.[0] &&
              `https://mapsync-media.s3.sa-east-1.amazonaws.com/${occurrence.occurrence.photos.final[0]}`,
          },
        ]}
        lat={parseFloat(occurrence.occurrence?.address?.latitude ?? 0)}
        lng={parseFloat(occurrence.occurrence?.address?.longitude ?? 0)}
      />
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-lg space-y-5 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Anexar foto da execução
            </h2>

            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setSelectedPhoto(file);
              }}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white"
            />

            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  await handleStartExecution();
                  setIsModalOpen(false);
                }}
                disabled={!selectedPhoto}
                className={`flex items-center justify-center gap-2 w-full rounded-2xl ${
                  selectedPhoto ? "bg-black hover:bg-gray-900" : "bg-gray-300"
                } text-white py-3 font-medium text-sm transition`}
              >
                Confirmar e Enviar
              </button>

              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPhoto(null);
                }}
                className="text-sm text-gray-500 underline hover:text-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-lg space-y-5 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Anexar foto final
            </h2>

            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setSelectedPhoto(file);
              }}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white"
            />

            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  await handleFinalizeExecution();
                  setIsFinalizeModalOpen(false);
                }}
                disabled={!selectedPhoto}
                className={`flex items-center justify-center gap-2 w-full rounded-2xl ${
                  selectedPhoto ? "bg-black hover:bg-gray-900" : "bg-gray-300"
                } text-white py-3 font-medium text-sm transition`}
              >
                Confirmar Finalização
              </button>

              <button
                onClick={() => {
                  setIsFinalizeModalOpen(false);
                  setSelectedPhoto(null);
                }}
                className="text-sm text-gray-500 underline hover:text-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
