// src/pages/Analysis/ExpandedRowAnalysis.jsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { GoogleMaps } from "@/components/googleMaps";
import { api } from "@/services/api";
import { MediaMapSection } from "@/components/MediaMapSection";
import { SelectStreetDialog } from "@/components/SelectStreetDialog";

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
  const [isEmergencialSelection, setIsEmergencialSelection] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [editableNeighborhoodId, setEditableNeighborhoodId] = useState(
    occurrence.address?.neighborhoodId || ""
  );

  useEffect(() => {
    async function fetchSectors() {
      try {
        const response = await api.get("/sectors/names");
        setSectors(response.data.sectors);
      } catch (error) {
        console.error("Erro ao buscar setores:", error);
      }
    }

    async function fetchNeighborhoods() {
      try {
        const response = await api.get("/neighborhoods");
        setNeighborhoods(response.data.neighborhoods); // corrigido aqui
      } catch (error) {
        console.error("Erro ao buscar bairros:", error);
      }
    }

    fetchSectors();
    fetchNeighborhoods();
  }, []);

  useEffect(() => {
    if (typeof occurrence.isEmergencial === "boolean") {
      setIsEmergencialSelection(occurrence.isEmergencial);
    }
  }, [occurrence]);

  const createdAt = occurrence.createdAt
    ? format(new Date(occurrence.createdAt), "dd/MM/yyyy HH:mm")
    : "Data não informada";

  const address = occurrence.address?.street
    ? `${occurrence.address.street}, ${occurrence.address.number || "s/n"} - ${
        occurrence.address.city || "Cidade não informada"
      }`
    : "Endereço não informado";

  const zip = occurrence.address?.zipCode || "Não informado";
  const bairro = occurrence.address?.neighborhoodName || "Não informado";
  const regiao = occurrence.address?.state || "Não informado";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-[#F7F7F7] p-4 rounded-lg shadow-sm text-sm">
      {/* Coluna 1 - Informações */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-1 text-[#787891]">
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
            <span className="text-gray-500 font-medium">Protocolo:</span>{" "}
            {occurrence.protocolNumber}
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
          className="w-full bg-[#FFE8E8] hover:bg-red-200 h-[64px] flex items-center justify-center gap-2"
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
          {/* Setor responsável */}
          <div>
            <label className="font-semibold block mb-1 text-[#787891]">
              Setor responsável
            </label>
            <select
              value={editableSectorId ?? ""}
              onChange={(e) => setEditableSectorId(e.target.value)}
              className="w-full p-2 rounded h-[55px] text-[#787891]"
            >
              <option value="">Selecione o setor</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bairro da ocorrência */}
          <div>
            <label className="font-semibold block mb-1 text-[#787891]">
              Bairro da ocorrência
            </label>
            <select
              value={editableNeighborhoodId}
              onChange={(e) => setEditableNeighborhoodId(e.target.value)}
              className="w-full p-2 rounded h-[55px] text-[#787891]"
            >
              <option value="">Selecione o bairro</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood.id} value={neighborhood.id}>
                  {neighborhood.name}
                </option>
              ))}
            </select>
          </div>
          <SelectStreetDialog
            occurrenceId={occurrence.id}
            lat={parseFloat(occurrence.address?.latitude || 0)}
            lng={parseFloat(occurrence.address?.longitude || 0)}
            onSuccess={() => window.location.reload()} // ou set algum state se preferir
          />

          {/* Classificação */}
          <div>
            <label className="font-semibold block mb-1 text-[#787891]">
              Classificação
            </label>
            <select
              value={isEmergencialSelection ? "true" : "false"}
              onChange={(e) =>
                setIsEmergencialSelection(e.target.value === "true")
              }
              className={`w-full p-2 rounded text-sm h-[55px] ${
                isEmergencialSelection
                  ? "text-red-600 font-semibold"
                  : "text-[#787891]"
              }`}
            >
              <option value="false">Não emergencial</option>
              <option value="true">Emergencial</option>
            </select>
          </div>

          {/* Anotações da ocorrência */}
          <div>
            <label className="font-semibold block mb-1">
              Anotações da ocorrência
            </label>
            <textarea
              rows={4}
              value={editableDescription}
              onChange={(e) => setEditableDescription(e.target.value)}
              className="w-full p-2 rounded min-h-[55px]"
              placeholder={occurrence.description}
            />
          </div>
        </div>

        {/* Botão encaminhar */}
        <Button
          className="w-full bg-[#FFF0E6] h-[64px] hover:bg-orange-200 text-[#FF7A21] flex items-center justify-center gap-2"
          onClick={async () => {
            if (
              editableNeighborhoodId !== occurrence.address?.neighborhoodId &&
              occurrence.status === "em_analise"
            ) {
              try {
                await api.patch(`/occurrences/${occurrence.id}/neighborhood`, {
                  neighborhoodId: editableNeighborhoodId,
                });
              } catch (error) {
                alert("Erro ao atualizar bairro: " + error.message);
                return;
              }
            }

            handleForwardOccurrence(occurrence.id, isEmergencialSelection);
          }}
        >
          Encaminhar
          <ThumbsUp className="w-4 h-4" />
        </Button>
      </div>

      {/* Coluna 3 - Imagem e Mapa */}
      <MediaMapSection
        photoUrls={[
          {
            label: "Inicial",
            url: occurrence.photos?.initial?.[0]
              ? `https://mapsync-media.s3.sa-east-1.amazonaws.com/${occurrence.photos.initial[0]}`
              : null,
          },
        ]}
        lat={parseFloat(occurrence.address?.latitude || 0)}
        lng={parseFloat(occurrence.address?.longitude || 0)}
      />
    </div>
  );
}
