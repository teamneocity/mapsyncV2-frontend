// src/pages/OccurrencesT/ExpandedRowT.jsx
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { SelectField } from "./selectField";
import { DatePicker } from "./datePicker";
import { GoogleMaps } from "@/components/googleMaps";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

import ThumbsUp from "@/assets/icons/thumbs-up.svg?react";
import ThumbsDown from "@/assets/icons/thumbs-down.svg?react";

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
  const [photoOpen, setPhotoOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const photoUrl = occurrence?.photos?.[0]?.url || occurrence?.photos?.[0]; // ajuste conforme estrutura
  const lat = parseFloat(occurrence.address?.latitude || 0);
  const lng = parseFloat(occurrence.address?.longitude || 0);

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

      {/* Coluna 2 */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-2 h-full">
          {occurrence.status === "os_gerada" ? (
            <>
              {/* Imagem */}
              <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
                <DialogTrigger asChild>
                  <div className="h-64 w-full md:h-full">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Imagem da ocorrência"
                        className="rounded-md border h-full w-full object-cover cursor-pointer"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        Sem imagem
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                {photoUrl && (
                  <DialogContent className="max-w-4xl w-full">
                    <img
                      src={photoUrl}
                      alt="Imagem expandida"
                      className="w-full max-h-[80vh] object-contain"
                    />
                  </DialogContent>
                )}
              </Dialog>

              {/* Mapa - só exibe no mobile, no desktop ele vai pra coluna 3 */}
              <div className="block lg:hidden">
                <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer h-64 w-full rounded-md border overflow-hidden">
                      <GoogleMaps position={{ lat, lng }} label="ocorrencia" />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-full h-[80vh]">
                    <GoogleMaps
                      position={{ lat, lng }}
                      fullHeight
                      label="ocorrencia"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </>
          ) : (
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
          )}
        </div>

        {/* Botão só aparece se OS ainda não foi gerada */}
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

      {/* Mobile: mostrar imagem e mapa quando OS ainda não foi gerada */}
      {occurrence.status !== "os_gerada" && (
        <div className="lg:hidden flex flex-col gap-4">
          {/* Imagem */}
          <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
            <DialogTrigger asChild>
              <div className="w-full h-52 rounded-md border overflow-hidden">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Imagem da ocorrência"
                    className="w-full h-full object-cover cursor-pointer"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                    Sem imagem
                  </div>
                )}
              </div>
            </DialogTrigger>
            {photoUrl && (
              <DialogContent className="max-w-4xl w-full">
                <img
                  src={photoUrl}
                  alt="Imagem expandida"
                  className="w-full max-h-[80vh] object-contain"
                />
              </DialogContent>
            )}
          </Dialog>

          {/* Mapa */}
          <Dialog open={mapOpen} onOpenChange={setMapOpen}>
            <DialogTrigger asChild>
              <div className="w-full h-52 rounded-md border overflow-hidden">
                <GoogleMaps position={{ lat, lng }} label="ocorrencia" />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-full h-[80vh]">
              <GoogleMaps
                position={{ lat, lng }}
                fullHeight
                label="ocorrencia"
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Coluna 3 - Imagem + Mapa  */}
      <div
        className={`h-full w-full ${
          occurrence.status !== "os_gerada" ? "grid md:grid-cols-2 gap-4" : ""
        }`}
      >
        {occurrence.status !== "os_gerada" && (
          <div className="hidden lg:block">
            <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
              <DialogTrigger asChild>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Imagem da ocorrência"
                    className="rounded-md border h-full w-full object-cover cursor-pointer"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                    Sem imagem
                  </div>
                )}
              </DialogTrigger>
              {photoUrl && (
                <DialogContent className="max-w-4xl w-full">
                  <img
                    src={photoUrl}
                    alt="Imagem expandida"
                    className="w-full max-h-[80vh] object-contain"
                  />
                </DialogContent>
              )}
            </Dialog>
          </div>
        )}

        {/* Mapa - sempre aparece */}
        <Dialog open={mapOpen} onOpenChange={setMapOpen}>
          <DialogTrigger asChild>
            <div className="cursor-pointer h-full w-full rounded-md border overflow-hidden">
              <GoogleMaps position={{ lat, lng }} label="ocorrencia" />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-full h-[80vh]">
            <GoogleMaps position={{ lat, lng }} fullHeight label="ocorrencia" />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
