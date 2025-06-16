// src/pages/Analysis/ExpandedRowAnalysis.jsx
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { GoogleMaps } from "@/components/googleMaps";
import { ImageCarousel } from "@/pages/OccurrencesT/imagecarousel";

export function ExpandedRowAnalysis({
  occurrence,
  allSectors,
  editableSectorId,
  editableDescription,
  setEditableSectorId,
  setEditableDescription,
  setSelectedOccurrenceId,
  setIsIgnoreOcurrenceModalOpen,
  setSelectedOccurrenceStatus,
  handleForwardOccurrence,
  handleDeleteImage,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm text-sm">
      {/* Coluna 1 - Informações */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-1">
          <h3 className="font-semibold text-base mb-2 border-b pb-1">
            Informações sobre a ocorrência
          </h3>
          <p>
            <span className="text-gray-500 font-medium">Data:</span>{" "}
            {format(new Date(occurrence.date_time), "dd/MM/yyyy HH:mm")}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Piloto:</span>{" "}
            {occurrence.data[0]?.pilot?.name}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Local:</span>{" "}
            {occurrence.address}
          </p>
          <p>
            <span className="text-gray-500 font-medium">CEP:</span>{" "}
            {occurrence.zip_code}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Bairro:</span>{" "}
            {occurrence.neighborhood}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Região:</span>{" "}
            {occurrence.zone}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Tipo:</span>{" "}
            {occurrence.type}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Setor atual:</span>{" "}
            {occurrence.sector?.name || "Não informado"}
          </p>
        </div>
        <Button
          className="w-full bg-[#ffc8c8] hover:bg-[#ffadae] flex items-center justify-center gap-2"
          style={{ color: "#9D0000" }}
          onClick={() => {
            setSelectedOccurrenceId(occurrence.id);
            setIsIgnoreOcurrenceModalOpen(true);
            setSelectedOccurrenceStatus(occurrence.status);
          }}
        >
          Ignorar
          <ThumbsDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Coluna 2 - Edição */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-4">
          <div>
            <label className="font-semibold block mb-1">Setor responsável</label>
            <select
              value={editableSectorId ?? ""}
              onChange={(e) => setEditableSectorId(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione o setor</option>
              {allSectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">
              Anotações da ocorrência
            </label>
            <textarea
              rows={4}
              value={editableDescription}
              onChange={(e) => setEditableDescription(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Descrição do Serviço"
            />
          </div>
        </div>
        <Button
          className="w-full bg-[#FFF0E6] hover:bg-[#FFE0CC] text-orange-700 flex items-center justify-center gap-2"
          onClick={() => handleForwardOccurrence(occurrence.id)}
        >
          Encaminhar
          <ThumbsUp className="w-4 h-4" />
        </Button>
      </div>

      {/* Coluna 3 - Imagem e Mapa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <div className="h-full rounded-lg overflow-hidden shadow bg-white flex items-center justify-center">
          <div className="w-full h-full">
            <ImageCarousel
              occurrence={occurrence}
              onDeleteImage={(img) => handleDeleteImage(img, occurrence.id)}
            />
          </div>
        </div>
        <div className="h-full rounded-lg overflow-hidden shadow bg-white flex items-center justify-center">
          <div className="w-full h-full">
            <GoogleMaps
              position={{
                lat: Number.parseFloat(occurrence.latitude_coordinate),
                lng: Number.parseFloat(occurrence.longitude_coordinate),
              }}
              label={occurrence.description}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
