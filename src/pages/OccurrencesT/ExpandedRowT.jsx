// src/pages/OccurrencesT/ExpandedRowT.jsx
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { SelectField } from "./SelectField";
import { DatePicker } from "./DatePicker";
import { GoogleMaps } from "@/components/googleMaps";
import { ImageCarousel } from "./imagecarousel";

export function ExpandedRowT({
  occurrence,
  selectedValues,
  setSelectedValues,
  selectOptions,
  onGenerateOS,
  onIgnore,
  onDeleteImage,
}) {
  const values = selectedValues[occurrence.id] || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm text-sm">
      {/* Coluna 1 - Info */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-1">
          <h3 className="font-semibold text-base mb-2 border-b pb-1">
            Informações sobre a ocorrência
          </h3>
          <p><span className="text-gray-500 font-medium">Data:</span> {format(new Date(occurrence.date_time), "dd/MM/yyyy HH:mm")}</p>
          <p><span className="text-gray-500 font-medium">Piloto:</span> {occurrence.data[0]?.pilot?.name}</p>
          <p><span className="text-gray-500 font-medium">Endereço:</span> {occurrence.address}</p>
          <p><span className="text-gray-500 font-medium">CEP:</span> {occurrence.zip_code}</p>
          <p><span className="text-gray-500 font-medium">Bairro:</span> {occurrence.neighborhood}</p>
          <p><span className="text-gray-500 font-medium">Região:</span> {occurrence.zone}</p>
          <p><span className="text-gray-500 font-medium">Tipo:</span> {occurrence.type}</p>
          <p><span className="text-gray-500 font-medium">Setor atual:</span> {occurrence.sector?.name || "Não informado"}</p>
        </div>
        <Button
          className="w-full h-12 bg-[#FFE8E8] hover:bg-[#E03131] text-[#9D0000]"
          onClick={() => onIgnore(occurrence.id, occurrence.status)}
        >
          Devolver
        </Button>
      </div>

      {/* Coluna 2 - Encaminhamento */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-2">
          <h3 className="font-semibold text-base mb-2 border-b pb-1">
            Encaminhamento para O.S.
          </h3>

          <SelectField
            label="Natureza do serviço"
            value={values.nature || ""}
            options={selectOptions[occurrence.id]?.natures || []}
            onChange={(value) =>
              setSelectedValues((prev) => ({
                ...prev,
                [occurrence.id]: { ...prev[occurrence.id], nature: value },
              }))
            }
          />
          <SelectField
            label="Técnico responsável"
            value={values.technician || ""}
            options={selectOptions[occurrence.id]?.technicians || []}
            onChange={(value) =>
              setSelectedValues((prev) => ({
                ...prev,
                [occurrence.id]: { ...prev[occurrence.id], technician: value },
              }))
            }
          />
          <SelectField
            label="Encarregado"
            value={values.supervisor || ""}
            options={selectOptions[occurrence.id]?.supervisors || []}
            onChange={(value) =>
              setSelectedValues((prev) => ({
                ...prev,
                [occurrence.id]: { ...prev[occurrence.id], supervisor: value },
              }))
            }
          />
          <SelectField
            label="Equipe"
            value={values.team || ""}
            options={selectOptions[occurrence.id]?.teams || []}
            onChange={(value) =>
              setSelectedValues((prev) => ({
                ...prev,
                [occurrence.id]: { ...prev[occurrence.id], team: value },
              }))
            }
          />
          <DatePicker
            selectedDate={values.date || null}
            onChange={(date) =>
              setSelectedValues((prev) => ({
                ...prev,
                [occurrence.id]: { ...prev[occurrence.id], date },
              }))
            }
          />
        </div>
        <Button
          className="w-full h-12 bg-green-100 hover:bg-green-200 text-green-800"
          onClick={() => onGenerateOS(occurrence.id, occurrence.status)}
        >
          Gerar O.S.
        </Button>
      </div>

      {/* Coluna 3 - Imagem e Mapa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <ImageCarousel
          occurrence={occurrence}
          onDeleteImage={onDeleteImage}
        />
        <GoogleMaps
          position={{
            lat: parseFloat(occurrence.latitude_coordinate),
            lng: parseFloat(occurrence.longitude_coordinate),
          }}
          label={occurrence.description}
        />
      </div>
    </div>
  );
}
