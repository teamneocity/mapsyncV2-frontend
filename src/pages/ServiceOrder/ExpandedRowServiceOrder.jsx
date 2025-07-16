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

export function ExpandedRowServiceOrder({ occurrence }) {
  const timeline = [
    { label: "Solicitação", date: occurrence.createdAt },
    { label: "Aceito", date: occurrence.updatedAt },
    { label: "Iniciado", date: occurrence.startedAt },
    { label: "Finalizado", date: occurrence.finishedAt },
  ];

  const [photoOpen, setPhotoOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const photoUrl = occurrence?.result?.photos?.[0]?.url;
  const lat = parseFloat(occurrence.occurrence?.address?.latitude ?? 0);
  const lng = parseFloat(occurrence.occurrence?.address?.longitude ?? 0);

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

  const handleDownloadPdf = async () => {
    const blob = await pdf(
      <ServiceOrderPdf occurrence={occurrence} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${occurrence.protocolNumber || "ordem-servico"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
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

        <Button className="w-full h-[64px] bg-green-100 hover:bg-green-200 text-green-700 mt-6">
          Finalizar
        </Button>
      </div>

      {/* Coluna 3 - Imagem e mapa com modal */}
      <MediaMapSection
        photoUrl={
          occurrence?.occurrence?.photos?.initial?.[0]
            ? `https://mapsync-media.s3.sa-east-1.amazonaws.com/${occurrence.occurrence.photos.initial[0]}`
            : null
        }
        lat={parseFloat(occurrence.occurrence?.address?.latitude ?? 0)}
        lng={parseFloat(occurrence.occurrence?.address?.longitude ?? 0)}
      />
    </div>
  );
}
