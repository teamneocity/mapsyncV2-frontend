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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#F7F7F7] rounded-lg text-sm">
      {/* Coluna 1 - Info */}
      <div className="flex flex-col bg-[#F7F7F7] justify-between space-y-4 h-full">
        <div className="space-y-3 bg-[#F7F7F7] pr-2">
          <h3 className="font-semibold text-[#787891] text-base mb-2 pb-1">
            Informações sobre a ocorrência
          </h3>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col items-start justify-between space-y-2 flex-1">
              <p>
                <span className="font-bold">Enviado por:</span>{" "}
                {occurrence.author.name || "—"}
              </p>
              <p>
                <span className="font-bold">Data:</span>{" "}
                {format(new Date(occurrence.createdAt), "dd/MM/yyyy HH:mm")}
              </p>
            </div>
            <div className="flex flex-col items-start justify-between space-y-2 flex-1">
              <p>
                <span className="font-bold">Ocorrência:</span>{" "}
                {occurrence.type || "—"}
              </p>
              <p>
                <span className="font-bold">Aprovado por:</span>{" "}
                {occurrence.approvedBy.name || "—"}
              </p>
            </div>
          </div>
          <p>
            <span className="font-bold">Descrição:</span>{" "}
            {occurrence.description || "—"}
          </p>
          <p>
            <span className="font-bold">Endereço:</span>{" "}
            {occurrence.address?.street || "—"}
          </p>

          <p>
            <span className="font-bold">Bairro:</span>{" "}
            {occurrence.address?.neighborhoodName || "—"}
          </p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="lex-col items-start justify-between space-y-2 flex-1">
              <p>
                <span className="font-bold">CEP:</span>
                {occurrence.address?.zipCode || "—"}
              </p>
              <p>
                <span className="font-bold">Latitude:</span>{" "}
                {occurrence.address.latitude}
              </p>
            </div>
            <div className="lex-col items-start justify-between space-y-2 flex-1">
              <p>
                <span className="font-bold">Região: </span>
                {occurrence.address?.state || "Não informada"}
              </p>
              <p>
                <span className="font-bold">Longitude:</span>{" "}
                {occurrence.address.longitude}
              </p>
            </div>
          </div>
          <p>
            <span className="font-bold">Setor atual:</span>{" "}
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
          className={"h-[55px]"}
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
