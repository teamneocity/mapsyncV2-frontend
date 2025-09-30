import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { SelectField } from "../../components/selectField";
import { DatePicker } from "./datePicker";
import { DateRangePicker } from "./DateRangePicker";
import { MediaMapSection } from "@/components/MediaMapSection";

import ThumbsUp from "@/assets/icons/thumbs-up.svg?react";
import ThumbsDown from "@/assets/icons/thumbs-down.svg?react";

import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const { toast } = useToast();

  function handleCopyProtocol() {
    const value = occurrence?.protocolNumber;
    if (!value) {
      toast({
        title: "Nada para copiar",
        description: "Esta ocorrência não possui protocolo.",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: "Copiado!",
        description: "Protocolo copiado para a área de transferência.",
      });
    });
  }

  function setWindowPart(part, date) {
    setSelectedValues((prev) => {
      const current = prev[occurrence.id] || {};
      const window = current.scheduledWindow || {};
      return {
        ...prev,
        [occurrence.id]: {
          ...current,
          scheduledWindow: {
            ...window,
            [part]: date,
          },
        },
      };
    });
  }

  const firstInitialPhoto = occurrence?.photos?.initial?.[0];
  const photoUrl = firstInitialPhoto
    ? `https://mapsync-media.s3.sa-east-1.amazonaws.com/${firstInitialPhoto}`
    : null;

  const typeLabels = {
    TAPA_BURACO: "Buraco",
    AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
    MEIO_FIO: "Meio fio",
    DESOBSTRUCAO: "Desobstrução",
    LIMPA_FOSSA: "Limpa fossa",
  };

  const canGenerate =
    occurrence.status !== "os_gerada" &&
    occurrence.status !== "em_execucao" &&
    occurrence.status !== "finalizada";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#F7F7F7] rounded-lg text-sm">
      {/* Coluna 1 - Informações */}
      <div className="flex flex-col bg-[#F7F7F7] justify-between space-y-4 h-full">
        <div className="space-y-3 pr-2">
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleCopyProtocol}
              className="w-full h-[58px] text-left flex items-center justify-between gap-3 rounded-lg border px-3 py-2 bg-[#D9DCE2] hover:bg-gray-300"
              aria-label="Copiar protocolo"
            >
              <span className="truncate">
                Protocolo : {occurrence?.protocolNumber || "—"}
              </span>
              <Copy className="w-4 h-4 shrink-0 opacity-70" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col items-start space-y-2 flex-1">
              <h3 className="font-semibold text-[#787891] text-base mb-1 pb-0">
                Informações sobre a ocorrência
              </h3>
              <p>
                <span className="font-bold">Data:</span>{" "}
                {format(new Date(occurrence.createdAt), "dd/MM/yyyy HH:mm")}
              </p>
              <p>
                <span className="font-bold">Ocorrência:</span>{" "}
                {typeLabels[occurrence.type] || occurrence.type || "—"}
              </p>
              <p>
                <span className="font-bold">Enviado por:</span>{" "}
                {occurrence.author?.name || "—"}
              </p>
              <p>
                <span className="font-bold">Aprovado por:</span>{" "}
                {occurrence.approvedBy?.name || "—"}
              </p>
              <p>
                <span className="font-bold">Setor atual:</span>{" "}
                {occurrence.sector?.name || "—"}
              </p>
              <p>
                <span className="font-bold">Endereço:</span>{" "}
                {occurrence.address?.street || "—"}
              </p>
              <p>
                <span className="font-bold">Bairro:</span>{" "}
                {occurrence.address?.neighborhoodName || "—"}
              </p>
              <p>
                <span className="font-bold">CEP:</span>{" "}
                {occurrence.address?.zipCode || "—"}
              </p>
              <p>
                <span className="font-bold">Região:</span>{" "}
                {occurrence.address?.state || "—"}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col space-y-2 flex-1">
              <p>
                <span className="font-bold">Latitude:</span>{" "}
                {occurrence.address?.latitude}
              </p>
            </div>
            <div className="flex flex-col space-y-2 flex-1">
              <p>
                <span className="font-bold">Longitude:</span>{" "}
                {occurrence.address?.longitude}
              </p>
            </div>
          </div>
        </div>

        {/* Devolver */}
        {occurrence.status == "aprovada" && (
          <Button
            className="w-full h-[64px] min-h-[58px] py-0 flex items-center justify-center gap-2 bg-[#FFE8E8] hover:bg-red-200 text-[#9D0000]"
            onClick={() => onOpenReturnModal(occurrence.id)}
          >
            Devolver
            <ThumbsDown className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Coluna 2 - Geração de OS */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-2 h-full">
          {canGenerate ? (
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
                className="h-[55px] border border-[#FFFFFF]"
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
                className="h-[55px] border border-[#FFFFFF]"
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
                className="h-[55px] border border-[#FFFFFF]"
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
                className="h-[55px] border border-[#FFFFFF]"
              />

              
              <div className="grid grid-cols-1 gap-2">
                {/* ALTERAÇÃO: campo para período (início e fim) */}
                <DateRangePicker
                  className="h-[55px]"
                  placeholder="Selecione um período de execução"
                  value={values.scheduledWindow || { start: null, end: null }}
                  onChange={(range) =>
                    setSelectedValues((prev) => ({
                      ...prev,
                      [occurrence.id]: {
                        ...prev[occurrence.id],
                        scheduledWindow: { start: range.start, end: range.end },
                      },
                    }))
                  }
                />
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">
              Esta ocorrência já possui uma O.S. gerada.
            </p>
          )}
        </div>

        {/* Gerar O.S. */}
        {canGenerate && (
          <Button
            style={{
              height: 64,
              minHeight: 64,
              maxHeight: 64,
              lineHeight: "64px",
            }}
            className="w-full !py-0 flex items-center justify-center gap-2 bg-[#C9F2E9] hover:bg-green-200 text-[#1C7551]"
            onClick={() => {
              const start = values.scheduledWindow?.start;
              const end = values.scheduledWindow?.end;

              if (!start || !end) {
                toast({
                  title: "Período incompleto",
                  description: "Selecione o início e o fim do período.",
                  variant: "destructive",
                });
                return;
              }

              // Mantive a assinatura original:
              onGenerateOS(occurrence.id);
            }}
          >
            Gerar O.S.
            <ThumbsUp className="w-5 h-5" />
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
