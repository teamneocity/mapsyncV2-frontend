import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { GoogleMaps } from "@/components/googleMaps";
import { ImageCarousel } from "../OccurrencesT/imagecarousel";
import { FileText, FileDown, Share2, FileCheck2 } from "lucide-react";
import { Timeline } from "./TimeLine";

export function ExpandedRowServiceOrder({ occurrence }) {
  const timeline = [
    { label: "Solicitação", date: occurrence.createdAt },
    { label: "Aceito", date: occurrence.updatedAt },
    { label: "Iniciado", date: occurrence.startedAt },
    { label: "Finalizado", date: occurrence.finishedAt },
  ];

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
          <div className="bg-[#F8F8F8] rounded-xl px-4 py-2 min-h-[119px] text-gray-700">
            {occurrence?.occurrence?.description || "Sem anotações."}
          </div>
        </div>
      </div>

      {/* Coluna 2 - Ações e botão final */}
      <div className="col-span-1 h-full flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-semibold text-[#787891] mb-2">Ações</h3>
          <div className="grid grid-cols-4 h-16 gap-2">
            <Button
              variant="outline"
              className="flex flex-col border-none items-center gap-1 py-8 bg-[#ECECEC]"
            >
              <FileText size={18} /> <span className="text-xs">Ver notas</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col border-none items-center gap-1 py-8 bg-[#ECECEC]"
            >
              <FileCheck2 size={18} />{" "}
              <span className="text-xs">Gerar PDF</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col border-none items-center gap-1 py-8 bg-[#ECECEC]"
            >
              <FileDown size={18} /> <span className="text-xs">Download</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col border-none items-center gap-1 py-8 bg-[#ECECEC]"
            >
              <Share2 size={18} /> <span className="text-xs">Compartilhar</span>
            </Button>
          </div>

          <Timeline timeline={timeline} />
        </div>

        <Button className="w-full h-[64px] bg-green-100 hover:bg-green-200 text-green-700 mt-6">
          Finalizar
        </Button>
      </div>

      {/* Coluna 3 - Imagem e mapa */}
      <div className="col-span-1 h-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageCarousel occurrence={occurrence} />
        <GoogleMaps
          position={{
            lat: parseFloat(occurrence.occurrence?.address?.latitude ?? 0),
            lng: parseFloat(occurrence.occurrence?.address?.longitude ?? 0),
          }}
        />
      </div>
    </div>
  );
}
