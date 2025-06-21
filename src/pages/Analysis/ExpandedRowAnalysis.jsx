// src/pages/Analysis/ExpandedRowAnalysis.jsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { GoogleMaps } from "@/components/googleMaps";
import { ImageCarousel } from "@/pages/OccurrencesT/imagecarousel";
import { api } from "@/services/api";
import { oc } from "date-fns/locale";


export function ExpandedRowAnalysis({
  occurrence,
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
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
  async function fetchSectors() {
    try {
      const response = await api.get("/sectors/names");
      console.log("Setores carregados:", response.data.sectors);
      setSectors(response.data.sectors);
    } catch (error) {
      console.error("Erro ao buscar setores:", error);
    }
  }

  fetchSectors();
}, []);


  const createdAt = occurrence.createdAt
    ? format(new Date(occurrence.createdAt), "dd/MM/yyyy HH:mm")
    : "Data não informada";

  const address = occurrence.address?.street
    ? `${occurrence.address.street}, ${occurrence.address.number || "s/n"} - ${
        occurrence.address.city || "Cidade não informada"
      }`
    : "Endereço não informado";

  const zip = occurrence.address?.zipCode || "Não informado";
  const bairro = occurrence.address?.neighborhoodName|| "Não informado";
  const regiao = occurrence.address?.state || "Não informado";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm text-sm">
      {/* Coluna 1 - Informações */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-1">
          <h3 className="font-semibold text-base mb-2 border-b pb-1">
            Informações sobre a ocorrência
          </h3>
          <p>
            <span className="text-gray-500 font-medium">Data:</span> {createdAt}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Local:</span> {address}
          </p>
          <p>
            <span className="text-gray-500 font-medium">CEP:</span> {zip}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Bairro:</span> {bairro}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Região:</span> {regiao}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Tipo:</span>{" "}
            {occurrence.type}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Latitude:</span>{" "}
            {occurrence.address.latitude}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Longitude:</span>{" "}
            {occurrence.address.longitude}
          </p>
          
        </div>
        <Button
          className="w-full bg-[#FFE8E8] hover:bg-red-200 flex items-center justify-center gap-2"
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
            <label className="font-semibold block mb-1">
              Setor responsável
            </label>
            <select
              value={editableSectorId ?? ""}
              onChange={(e) => setEditableSectorId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione o setor</option>
              {sectors.map((sector) => (
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
              placeholder={occurrence.description}
            />
          </div>
        </div>
        <Button
          className="w-full bg-[#FFF0E6] hover:bg-orange-200 text-[#FF7A21] flex items-center justify-center gap-2"
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
                lat: Number.parseFloat(occurrence.address?.latitude),
                lng: Number.parseFloat(occurrence.address?.longitude),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
