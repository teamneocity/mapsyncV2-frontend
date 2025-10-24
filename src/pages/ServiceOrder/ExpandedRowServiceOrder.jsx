import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { GoogleMaps } from "@/components/googleMaps";
import { Timeline } from "./TimeLine";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CloudShare from "@/assets/icons/cloudShare.svg?react";
import FilePdf from "@/assets/icons/filePdf.svg?react";
import CloudUploadAlt from "@/assets/icons/cloudUploadAlt.svg?react";
import { MediaMapSection } from "@/components/MediaMapSection";

import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { api } from "@/services/api";

// serve pare evitar erro caso a foto ainda não esteja anexada na ocorrência replicada
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function replicateWithRetry(
  api,
  occurrenceId,
  { tries = 5, baseDelay = 600 } = {}
) {
  let lastError;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await api.post(
        "/occurrences/attachments/replicate-from-occurrence",
        { occurrenceId }
      );
      const id = res?.data?.attachmentId;
      if (id) return id;
      lastError = new Error("attachmentId ausente na resposta");
    } catch (err) {
      lastError = err;
      const msg = err?.response?.data?.message || err?.message || "";
      const notReady =
        err?.response?.status === 404 &&
        typeof msg === "string" &&
        msg.toLowerCase().includes("no final attachments found");
      if (!notReady) {
        throw err;
      }
    }
    const wait = baseDelay + (attempt - 1) * 300;
    await sleep(wait);
  }
  throw lastError || new Error("Falha ao replicar após tentativas");
}

function normalize(str = "") {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function getPavSectorId(sectors = []) {
  const alvo = ["pavimentação", "pavimentacao"];
  const found = sectors.find((s) => alvo.includes(normalize(s?.name)));
  return found?.id || "";
}

export function ExpandedRowServiceOrder({ occurrence }) {
  const rescheduleSteps =
    Array.isArray(occurrence?.rescheduleHistory) &&
    occurrence.rescheduleHistory.length > 0
      ? occurrence.rescheduleHistory.map((item) => ({
          label: `Reagendado `,

          date: item.newScheduledDate,
        }))
      : [];

  const timeline = [
    { label: "Solicitação", date: occurrence.acceptedAt },
    { label: "Aceito", date: occurrence.createdAt },
    ...rescheduleSteps,
    { label: "Iniciado", date: occurrence.startedAt },
    { label: "Finalizado", date: occurrence.finishedAt },
  ];

  const scheduledStart =
    occurrence?.scheduledStart || occurrence?.scheduledDate || null;

  const scheduledEnd = occurrence?.scheduledEnd || null;

  const [photoOpen, setPhotoOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const { toast } = useToast();

  const photoUrl = occurrence?.result?.photos?.[0]?.url;
  const lat = parseFloat(occurrence.occurrence?.address?.latitude ?? 0);
  const lng = parseFloat(occurrence.occurrence?.address?.longitude ?? 0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [isCreatePavingModalOpen, setIsCreatePavingModalOpen] = useState(false);

  const [initialPhoto, setInitialPhoto] = useState(null);
  const [selectedUploadPhoto, setSelectedUploadPhoto] = useState(null);

  const [formTipo, setFormTipo] = useState("TAPA_BURACO");
  const [formDescricao, setFormDescricao] = useState(
    "Ocorrência gerada após drenagem"
  );
  const [formEmergencial, setFormEmergencial] = useState(true);
  const [formFotoId, setFormFotoId] = useState("");

  const [newScheduledDate, setNewScheduledDate] = useState(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  const [sectors, setSectors] = useState([]);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [sectorsLoading, setSectorsLoading] = useState(false);
  const [sectorsError, setSectorsError] = useState("");

  const navigate = useNavigate();

  const [pavSectorId, setPavSectorId] = useState("");
  const [pavLookupError, setPavLookupError] = useState("");

  const [isRescheduleHistoryModalOpen, setIsRescheduleHistoryModalOpen] =
    useState(false);

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

  // Inicia a ocorrencia
  const handleStartExecution = async () => {
    const occurrenceId = occurrence?.occurrence?.id;

    if (!occurrenceId) {
      alert("ID da ocorrência ausente.");
      return;
    }

    try {
      await api.post("/service-orders/start-execution", {
        occurrenceId,
      });

      toast({ title: "Execução iniciada com sucesso!" });
    } catch (err) {
      console.error("Erro ao iniciar execução:", err);
      toast({
        variant: "destructive",
        title: "Erro ao iniciar execução",
        description: err.message || "Falha ao iniciar execução da OS.",
      });
    }
  };

  // Finaliza a ocorrência
  const handleFinalizeExecution = async () => {
    const serviceOrderId = occurrence?.id;
    const occurrenceId = occurrence?.occurrence?.id;

    if (!serviceOrderId || !selectedPhoto || !occurrenceId) {
      alert("ID da OS, ocorrência ou imagem ausente.");
      return;
    }

    try {
      // Envia a imagem final e finaliza a OS
      const formData = new FormData();
      formData.append("serviceOrderId", serviceOrderId);
      formData.append("photos", selectedPhoto);

      await api.post("/service-orders/finalize", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({ title: "Execução finalizada com sucesso!" });
      setSelectedPhoto(null);
      setIsFinalizeModalOpen(false);

      // Tenta replicar a foto final para usar na criação da ocorrência de pavimentação
      try {
        const novoAttachmentId = await replicateWithRetry(api, occurrenceId, {
          tries: 5,
          baseDelay: 600,
        });

        setFormFotoId(novoAttachmentId || "");
        console.log("Replicação concluída:", novoAttachmentId);
      } catch (repErr) {
        console.warn("Replicação não disponível agora:", repErr);
        toast({
          title: "Observação",
          description:
            "Finalizamos a OS, mas a foto final ainda não ficou disponível para replicação. Você pode prosseguir sem a foto ou tentar novamente mais tarde.",
        });
      }

      // Se for do setor de drenagem, abre o modal para criar ocorrência de pavimentação
      if (
        occurrence?.sector?.name &&
        normalize(occurrence.sector.name).includes("drenagem")
      ) {
        try {
          setPavLookupError("");
          const res = await api.get("/sectors/details");
          const list = res?.data?.sectors ?? res?.data ?? [];
          const pavId = getPavSectorId(list);

          if (pavId) {
            setPavSectorId(pavId);
          } else {
            setPavSectorId("");
            setPavLookupError(
              "Setor 'Pavimentação' não encontrado para este usuário."
            );
          }
        } catch (e) {
          setPavSectorId("");
          setPavLookupError(
            "Falha ao buscar setores. Tente novamente mais tarde."
          );
        }

        // Abre modal de criação/encaminhamento (refresh só após confirmar/cancelar no modal)
        setIsCreatePavingModalOpen(true);
      } else {
        // NÃO é drenagem faz refresh logo após finalizar
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      console.error("Erro ao finalizar execução:", err);
      toast({
        variant: "destructive",
        title: "Erro ao finalizar execução",
        description: err.message || "Falha ao finalizar execução da OS.",
      });
    }
  };

  //Carrega os setores quando modal abre
  useEffect(() => {
    if (!isCreatePavingModalOpen) return;

    let mounted = true;
    async function fetchSectors() {
      setSectorsLoading(true);
      setSectorsError("");
      try {
        const res = await api.get("/sectors/details");
        const list = res?.data?.sectors ?? res?.data ?? [];

        if (mounted) {
          setSectors(list);
          const pav = list.find((s) =>
            s?.name?.toLowerCase().includes("paviment")
          );
          setSelectedSectorId(pav?.id ?? "");
        }
      } catch (err) {
        console.warn("Falha ao carregar setores:", err);
        if (mounted) {
          setSectorsError(
            err?.response?.data?.message ||
              "Não foi possível carregar os setores."
          );
        }
      } finally {
        if (mounted) setSectorsLoading(false);
      }
    }

    fetchSectors();

    return () => {
      mounted = false;
    };
  }, [isCreatePavingModalOpen]);

  // cria nova ocorrencia
  const handleCreatePavingOccurrence = async () => {
    try {
      const address = occurrence?.occurrence?.address;

      if (!address) {
        throw new Error("Endereço não encontrado.");
      }

      const targetSectorId = pavSectorId;
      if (!targetSectorId) {
        throw new Error("Setor 'Pavimentação' não disponível no momento.");
      }

      const body = {
        type: formTipo,
        description: formDescricao,
        street: address.street,
        number: address.number,
        zipCode: address.zipCode,
        neighborhoodId: address.neighborhoodId,
        latitude: parseFloat(address.latitude),
        longitude: parseFloat(address.longitude),
        isEmergencial: formEmergencial,
        initialPhotosUrls: formFotoId ? [formFotoId] : [],
      };

      const response = await api.post("/occurrences/employee", body);

      const novaOcorrenciaId =
        response?.data?.data ??
        response?.data?.occurrenceId ??
        response?.data?.id ??
        null;

      if (!(response?.status === 201) || !novaOcorrenciaId) {
        console.error("Criação sem ID:", response?.data);
        throw new Error("Falha ao criar ocorrência (ID não retornado).");
      }

      await api.post("/occurrences/approve", {
        occurrenceId: novaOcorrenciaId,
        sectorId: targetSectorId,
      });

      toast({
        title: "Ocorrência criada e encaminhada",
        description: "Encaminhada para Pavimentação com sucesso.",
      });

      // 🔄 reload após sucesso (espera 1,2s pro toast aparecer)
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (error) {
      console.error(" Erro ao criar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar/encaminhar",
        description: error?.message || "Erro inesperado.",
      });
    } finally {
      setIsCreatePavingModalOpen(false);
      setFormFotoId("");
      setPavSectorId("");
      setPavLookupError("");
    }
  };

  const typeLabels = {
    TAPA_BURACO: "Buraco",
    AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
    MEIO_FIO: "Meio fio",
    DESOBSTRUCAO: "Desobstrução",
    LIMPA_FOSSA: "Limpa fossa",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6  p-4  text-sm items-stretch">
      {/* Coluna 1 - Informações */}
      <div className="col-span-1 self-stretch h-full flex flex-col">
        <div className="flex-1 flex flex-col space-y-4 pr-2">
          {/* bloco de informações */}
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col space-y-3 pr-2">
              <h3 className="font-semibold text-[#787891] mb-2 pb-1">
                Informações sobre a ocorrência
              </h3>

              {/* Botão copiar protocolo */}
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
              <p>
                <strong>Companhia:</strong>{" "}
                {occurrence.occurrence?.externalCompany || "EMURB"}
              </p>
              {/* Data e Ocorrência lado a lado */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>Data:</strong>{" "}
                  {format(
                    new Date(occurrence.createdAt),
                    "dd/MM/yyyy 'às' HH:mm"
                  )}
                </p>
                <p>
                  <strong>Ocorrência:</strong>{" "}
                  {typeLabels[occurrence.occurrence?.type] ||
                    occurrence.occurrence?.type ||
                    "—"}
                </p>
              </div>

              {/* Restante em coluna única */}
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Enviado por:</strong>{" "}
                  {occurrence.occurrence?.author?.name || "—"}
                </p>
                <p>
                  <strong>Setor:</strong> {occurrence.sector?.name || "—"}
                </p>
                <p>
                  <strong>Chefe de Setor:</strong>{" "}
                  {occurrence.sector?.chiefs &&
                  occurrence.sector.chiefs.length > 0
                    ? occurrence.sector.chiefs
                        .map((chief) => chief.name)
                        .join(", ")
                    : "—"}
                </p>

                <p>
                  <strong>Natureza:</strong>{" "}
                  {occurrence.serviceNature?.name || "—"}
                </p>
                <p>
                  <strong>Técnico:</strong> {occurrence.inspector?.name || "—"}
                </p>
                <p>
                  <strong>Encarregado:</strong>{" "}
                  {occurrence.foreman?.name || "—"}
                </p>
                <p>
                  <strong>Equipe:</strong> {occurrence.team?.name || "—"}
                </p>
                <p>
                  <strong>Local:</strong>{" "}
                  {occurrence.occurrence?.address?.street || ""},{" "}
                  {occurrence.occurrence?.address?.number || ""}
                </p>
                <p>
                  <strong>Período agendado:</strong>{" "}
                  {scheduledStart
                    ? format(new Date(scheduledStart), "dd/MM/yyyy 'às' HH:mm")
                    : "—"}
                  {scheduledStart && scheduledEnd ? " até " : ""}
                  {scheduledEnd
                    ? format(new Date(scheduledEnd), "dd/MM/yyyy 'às' HH:mm")
                    : ""}
                </p>
              </div>

              {/* CEP e Região lado a lado */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>CEP:</strong>{" "}
                  {occurrence.occurrence?.address?.zipCode || "—"}
                </p>
                <p>
                  <strong>Região:</strong> {occurrence.occurrence?.zone || "—"}
                </p>
              </div>

              {/* Latitude e Longitude lado a lado */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>Latitude:</strong>{" "}
                  {occurrence.occurrence?.address?.latitude || "—"}
                </p>
                <p>
                  <strong>Longitude:</strong>{" "}
                  {occurrence.occurrence?.address?.longitude || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna 2 - Ações e botão final */}
      <div className="col-span-1 self-stretch h-full flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-semibold text-[#787891] mb-2">Ações</h3>
          <div className="bg-[#ECECEC] rounded-xl grid grid-cols-4 gap-2 p-2">
            <Button
              onClick={() => setIsRescheduleModalOpen(true)}
              variant="ghost"
              disabled
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Reagendar</span>
            </Button>

            <Button
              onClick={() => {
                try {
                  sessionStorage.removeItem("print:auto");
                  sessionStorage.setItem(
                    `print:order:${occurrence.id}`,
                    JSON.stringify(occurrence)
                  );
                } catch (e) {
                  console.warn("sessionStorage falhou", e);
                }
                navigate(`/service-orders/print/${occurrence.id}`);
              }}
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <FilePdf className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Imprimir</span>
            </Button>

            <Button
              onClick={() => {
                try {
                  sessionStorage.setItem("print:auto", "1");
                  sessionStorage.setItem(
                    `print:order:${occurrence.id}`,
                    JSON.stringify(occurrence)
                  );
                } catch (e) {
                  console.warn("sessionStorage falhou", e);
                }
                const url = `/service-orders/print/${occurrence.id}`;
                window.open(url, "_blank");
              }}
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <CloudUploadAlt className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Download</span>
            </Button>

            <Button
              variant="ghost"
              disabled
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <CloudShare className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Compartilhar</span>
            </Button>
          </div>

          <Timeline timeline={timeline} />
        </div>

        {!occurrence.startedAt ? (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full h-[64px] bg-[#D1F0FA] hover:bg-blue-300 text-[#116B97] mt-6"
          >
            Iniciar
          </Button>
        ) : (
          <Button
            onClick={() => setIsFinalizeModalOpen(true)}
            disabled={!!occurrence.finishedAt}
            className={`w-full h-[64px] mt-6 ${
              occurrence.finishedAt
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#C9F2E9] hover:bg-green-300 text-[#1C7551]"
            }`}
          >
            Finalizar
          </Button>
        )}
      </div>

      {/* Coluna 3 - Imagem e mapa com modal */}
      <div className="col-span-1 h-full">
        <MediaMapSection
          className="h-full"
          photoUrls={[
            {
              label: "Inicial",
              url:
                occurrence?.occurrence?.photos?.initial?.[0] &&
                `https://mapsync-media.s3.sa-east-1.amazonaws.com/${occurrence.occurrence.photos.initial[0]}`,
            },
            {
              label: "Finalizada",
              url:
                occurrence?.occurrence?.photos?.final?.[0] &&
                `https://mapsync-media.s3.sa-east-1.amazonaws.com/${occurrence.occurrence.photos.final[0]}`,
            },
          ]}
          lat={parseFloat(occurrence.occurrence?.address?.latitude ?? 0)}
          lng={parseFloat(occurrence.occurrence?.address?.longitude ?? 0)}
        />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-lg space-y-5 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Deseja iniciar a execução da ordem de serviço?
            </h2>
            <p className="text-sm text-gray-600">
              Ao confirmar, a execução será iniciada sem necessidade de foto.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={async () => {
                  await handleStartExecution();
                  setIsModalOpen(false);
                  window.location.reload();
                }}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-black hover:bg-gray-900 text-white py-3 font-medium text-sm transition"
              >
                Confirmar Início
              </button>

              <button
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="text-sm text-gray-500 underline hover:text-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-lg space-y-5 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Anexar foto final
            </h2>

            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setSelectedPhoto(file);
              }}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white"
            />

            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  await handleFinalizeExecution();
                  setIsFinalizeModalOpen(false);
                }}
                disabled={!selectedPhoto}
                className={`flex items-center justify-center gap-2 w-full rounded-2xl ${
                  selectedPhoto ? "bg-black hover:bg-gray-900" : "bg-gray-300"
                } text-white py-3 font-medium text-sm transition`}
              >
                Confirmar Finalização
              </button>

              <button
                onClick={() => {
                  setIsFinalizeModalOpen(false);
                  setSelectedPhoto(null);
                }}
                className="text-sm text-gray-500 underline hover:text-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {isCreatePavingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-lg space-y-5 text-left">
            <h2 className="text-xl font-semibold text-gray-900">
              Criar ocorrência de pavimentação
            </h2>

            {/* Formulário (sem select) */}
            <div className="flex flex-col gap-4">
              {/* Tipo */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                >
                  <option value="TAPA_BURACO">TAPA_BURACO</option>
                  <option value="DESOBSTRUCAO">DESOBSTRUCAO</option>
                  <option value="MEIO_FIO">MEIO_FIO</option>
                  <option value="LIMPA_FOSSA">LIMPA_FOSSA</option>
                  <option value="AUSENCIA_DE_MEIO_FIO">
                    AUSENCIA_DE_MEIO_FIO
                  </option>
                </select>
              </div>

              {/* Info: setor destino fixo */}
              <div className="rounded-lg border p-3 bg-[#F8F8F8]">
                <p className="text-sm text-gray-700">
                  <strong>Setor de destino:</strong> Pavimentação
                </p>
                {pavLookupError ? (
                  <p className="mt-2 text-xs text-red-600">{pavLookupError}</p>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    Esta ação irá encaminhar a nova ocorrência diretamente para
                    o setor de Pavimentação.
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  rows={3}
                />
              </div>

              {/* Emergencial */}
              <div className="flex items-center gap-2">
                <input
                  id="emergencial"
                  type="checkbox"
                  checked={formEmergencial}
                  onChange={(e) => setFormEmergencial(e.target.checked)}
                />
                <label htmlFor="emergencial" className="text-sm text-gray-700">
                  É emergencial?
                </label>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleCreatePavingOccurrence}
                disabled={!pavSectorId || !!pavLookupError}
                className={`py-3 rounded-2xl font-medium text-sm text-white ${
                  !pavSectorId || pavLookupError
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-black hover:bg-gray-900"
                }`}
              >
                Confirmar criação e encaminhar
              </button>
              <button
                onClick={() => {
                  setIsCreatePavingModalOpen(false);
                  setPavSectorId("");
                  setPavLookupError("");

                  setTimeout(() => {
                    window.location.reload();
                  }, 400);
                }}
                className="text-sm text-gray-500 underline hover:text-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-lg space-y-5 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Reagendar execução
            </h2>
            <p className="text-sm text-gray-600">
              Selecione uma nova data e hora para a execução da O.S.
            </p>

            <input
              type="datetime-local"
              value={newScheduledDate || ""}
              onChange={(e) => setNewScheduledDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            />

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={async () => {
                  try {
                    await api.put("/service-orders/reschedule", {
                      serviceOrderId: occurrence.id,
                      newScheduledDate: newScheduledDate
                        ? new Date(newScheduledDate).toISOString()
                        : null,
                    });

                    toast({ title: "Data reagendada com sucesso!" });
                    setIsRescheduleModalOpen(false);
                  } catch (err) {
                    console.error("Erro ao reagendar:", err);
                    toast({
                      variant: "destructive",
                      title: "Erro ao reagendar",
                      description:
                        err.message || "Falha no reagendamento da OS.",
                    });
                  }
                }}
                disabled={!newScheduledDate}
                className="bg-black hover:bg-gray-900 text-white py-3 rounded-2xl font-medium text-sm"
              >
                Confirmar reagendamento
              </button>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="text-sm text-gray-500 underline hover:text-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isRescheduleHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-lg space-y-5 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Histórico de reagendamentos
            </h2>

            {occurrence?.rescheduleHistory?.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {occurrence.rescheduleHistory.map((item, index) => (
                  <li
                    key={index}
                    className="border rounded-lg p-3 bg-[#F8F8F8] text-sm text-gray-800"
                  >
                    <p>
                      <strong>Data anterior:</strong>{" "}
                      {format(
                        new Date(item.previousScheduledDate),
                        "dd/MM/yyyy 'às' HH:mm"
                      )}
                    </p>
                    <p>
                      <strong>Nova data:</strong>{" "}
                      {format(
                        new Date(item.newScheduledDate),
                        "dd/MM/yyyy 'às' HH:mm"
                      )}
                    </p>
                    <p>
                      <strong>Reagendado por:</strong>{" "}
                      {item.rescheduledBy?.name || "—"}
                    </p>
                    <p>
                      <strong>Data do reagendamento:</strong>{" "}
                      {format(
                        new Date(item.rescheduledAt),
                        "dd/MM/yyyy 'às' HH:mm"
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Nenhum reagendamento registrado.</p>
            )}

            <div className="pt-4">
              <button
                onClick={() => setIsRescheduleHistoryModalOpen(false)}
                className="text-sm text-gray-500 underline hover:text-gray-700 transition w-full"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
