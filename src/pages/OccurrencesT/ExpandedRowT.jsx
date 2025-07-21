import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { SelectField } from "./selectField";
import { DatePicker } from "./datePicker";
import { MediaMapSection } from "@/components/MediaMapSection";

import ThumbsUp from "@/assets/icons/thumbs-up.svg?react";
import ThumbsDown from "@/assets/icons/thumbs-down.svg?react";

export function ExpandedRowT({
  occurrence,
  selectedValues,
  setSelectedValues,
  selectOptions,
  onGenerateOS,
  onOpenReturnModal,
}) {
  const values = selectedValues[occurrence.id] || {};
  const lat = parseFloat(occurrence.address?.latitude || 0);
  const lng = parseFloat(occurrence.address?.longitude || 0);

  const firstInitialPhoto = occurrence?.photos?.initial?.[0];
  const photoUrl = firstInitialPhoto
    ? `https://mapsync-media.s3.sa-east-1.amazonaws.com/${firstInitialPhoto}`
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#F7F7F7] rounded-lg text-sm">
      {/* Coluna 1 - Informações */}
      <div className="flex flex-col bg-[#F7F7F7] justify-between space-y-4 h-full">
        <div className="space-y-3 pr-2">
          <h3 className="font-semibold text-[#787891] text-base mb-2 pb-1">
            Informações sobre a ocorrência
          </h3>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col items-start space-y-2 flex-1">
              <p>
                <span className="font-bold">Enviado por:</span>{" "}
                {occurrence.author.name || "—"}
              </p>
              <p>
                <span className="font-bold">Data:</span>{" "}
                {format(new Date(occurrence.createdAt), "dd/MM/yyyy HH:mm")}
              </p>
            </div>
            <div className="flex flex-col items-start space-y-2 flex-1">
              <p>
                <span className="font-bold">Ocorrência:</span>{" "}
                {occurrence.type || "—"}
              </p>
              <p>
                <span className="font-bold">Aprovado por:</span>{" "}
                {occurrence.approvedBy?.name || "—"}
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

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col space-y-2 flex-1">
              <p>
                <span className="font-bold">CEP:</span>{" "}
                {occurrence.address?.zipCode || "—"}
              </p>
              <p>
                <span className="font-bold">Latitude:</span>{" "}
                {occurrence.address.latitude}
              </p>
            </div>
            <div className="flex flex-col space-y-2 flex-1">
              <p>
                <span className="font-bold">Região:</span>{" "}
                {occurrence.address?.state || "—"}
              </p>
              <p>
                <span className="font-bold">Longitude:</span>{" "}
                {occurrence.address.longitude}
              </p>
            </div>
          </div>

          <p>
            <span className="font-bold">Setor atual:</span>{" "}
            {occurrence.sector?.name || "—"}
          </p>
        </div>

        {occurrence.status !== "os_gerada" && (
          <Button
            className="w-full h-12 bg-[#FFE8E8] hover:bg-red-200 text-[#9D0000]"
            onClick={() => onOpenReturnModal(occurrence.id)}
          >
            Devolver
            <ThumbsDown />
          </Button>
        )}
      </div>

      {/* Coluna 2 - Geração de OS */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-2 h-full">
          {occurrence.status !== "os_gerada" ? (
            <>
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
                className="h-[55px]"
                date={values.scheduledDate || null}
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
            </>
          ) : (
            <p className="text-gray-500 italic">
              Esta ocorrência já possui uma O.S. gerada.
            </p>
          )}
        </div>

        {occurrence.status !== "os_gerada" && (
          <Button
            className="w-full h-12 bg-[#C9F2E9] hover:bg-green-200 text-[#1C7551] items-center justify-center"
            onClick={() => onGenerateOS(occurrence.id)}
          >
            Gerar O.S.
            <ThumbsUp />
          </Button>
        )}
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
        lat={lat}
        lng={lng}
      />
    </div>
  );
}
