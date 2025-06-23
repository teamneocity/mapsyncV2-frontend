// src/pages/OccurrencesT/ExpandedRowT.jsx
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { SelectField } from "./selectField";
import { DatePicker } from "./datePicker";
import { GoogleMaps } from "@/components/googleMaps";
import { ImageCarousel } from "./imagecarousel";

export function ExpandedRowT({
  occurrence,
  selectedValues,
  setSelectedValues,
  selectOptions,
  onGenerateOS,
  onOpenReturnModal,
  onDeleteImage,
}) {
  const values = selectedValues[occurrence.id] || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-[#F7F7F7] p-4 rounded-lg  text-sm">
      {/* Coluna 1 - Info */}
      <div className="flex flex-col bg-[#F7F7F7] justify-between space-y-4 h-full">
        <div className="space-y-1 bg-[#F7F7F7]">
          <h3 className="font-semibold text-[#787891] text-base mb-2  pb-1">
            Informações sobre a ocorrência
          </h3>
          <p>
            <span className="text-gray-500 font-medium">Data:</span>{" "}
            {format(new Date(occurrence.createdAt), "dd/MM/yyyy HH:mm")}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Descrição:</span>{" "}
            {occurrence.description || "—"}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Endereço:</span>{" "}
            {occurrence.address?.street || "—"}
          </p>
          <p>
            <span className="text-gray-500 font-medium">CEP:</span>{" "}
            {occurrence.address?.zipCode || "—"}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Bairro:</span>{" "}
            {occurrence.address?.neighborhoodName || "—"}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Região:</span>{" "}
            {occurrence.address?.state || "—"}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Tipo:</span>{" "}
            {occurrence.type || "—"}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Latitude:</span>{" "}
            {occurrence.address.latitude}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Longitude:</span>{" "}
            {occurrence.address.longitude}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Setor atual:</span>{" "}
            {occurrence.sector?.name || "Não informado"}
          </p>
        </div>
        {/* Botão para abrir modal */}
        <Button
          className="w-full h-12 bg-[#FFE8E8] hover:bg-red-200 text-[#9D0000]"
          onClick={() => onOpenReturnModal(occurrence.id)}
        >
          Devolver
        </Button>
      </div>

      {/* Coluna 2 - Encaminhamento */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-2">
          <h3 className="font-semibold text-[#787891] text-base mb-2 pb-1">
            Programar e gerar O.S
          </h3>

          <SelectField
            placeholder="Natureza do serviço"
            value={values.serviceNatureId || ""}
            options={selectOptions[occurrence.id]?.natures || []}
            onChange={(value) =>
              setSelectedValues((prev) => ({
                ...prev,
                [occurrence.id]: {
                  ...prev[occurrence.id],
                  serviceNatureId: value,
                },
              }))
            }
          />
          <SelectField
            placeholder="Inspetor responsável"
            value={values.inspectorId || ""}
            options={selectOptions[occurrence.id]?.inspectors || []}
            onChange={(value) =>
              setSelectedValues((prev) => ({
                ...prev,
                [occurrence.id]: {
                  ...prev[occurrence.id],
                  inspectorId: value,
                },
              }))
            }
          />
          <SelectField
            placeholder="Encarregado"
            value={values.foremanId || ""}
            options={selectOptions[occurrence.id]?.supervisors || []}
            onChange={(value) =>
              setSelectedValues((prev) => ({
                ...prev,
                [occurrence.id]: {
                  ...prev[occurrence.id],
                  foremanId: value,
                },
              }))
            }
          />
          <SelectField
            placeholder="Equipe"
            value={values.teamId || ""}
            options={selectOptions[occurrence.id]?.teams || []}
            onChange={(value) =>
              setSelectedValues((prev) => ({
                ...prev,
                [occurrence.id]: {
                  ...prev[occurrence.id],
                  teamId: value,
                },
              }))
            }
          />
          <DatePicker
            selectedDate={values.scheduledDate || null}
            onChange={(date) =>
              setSelectedValues((prev) => ({
                ...prev,
                [occurrence.id]: {
                  ...prev[occurrence.id],
                  scheduledDate: date,
                },
              }))
            }
          />
        </div>
        <Button
          className="w-full h-12 bg-[#C9F2E9] hover:bg-green-200 text-[#1C7551]"
          onClick={() => onGenerateOS(occurrence.id)}
          disabled={occurrence.status === "os_gerada"}
        >
          {occurrence.status === "os_gerada" ? "O.S. já gerada" : "Gerar O.S."}
        </Button>
      </div>

      {/* Coluna 3 - Imagem e Mapa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <ImageCarousel occurrence={occurrence} onDeleteImage={onDeleteImage} />
        <GoogleMaps
          position={{
            lat: parseFloat(occurrence.address?.latitude || 0),
            lng: parseFloat(occurrence.address?.longitude || 0),
          }}
          label="ocorrencia"
        />
      </div>
    </div>
  );
}
