import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { GoogleMaps } from "@/components/googleMaps";
import { Timeline } from "./TimeLine";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CloudShare from "@/assets/icons/cloudShare.svg?react";
import FilePdf from "@/assets/icons/filePdf.svg?react";
import Vector from "@/assets/icons/vector.svg?react";
import CloudUploadAlt from "@/assets/icons/cloudUploadAlt.svg?react";
import { MediaMapSection } from "@/components/MediaMapSection";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { ServiceOrderPdf } from "./ServiceOrderPdf";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

import { api } from "@/services/api";

export function ExpandedRowServiceOrder({ occurrence }) {
  const timeline = [
    { label: "Solicitação", date: occurrence.createdAt },
    { label: "Aceito", date: occurrence.updatedAt },
    { label: "Iniciado", date: occurrence.startedAt },
    { label: "Finalizado", date: occurrence.finishedAt },
  ];

  const [photoOpen, setPhotoOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const { toast } = useToast();

  const photoUrl = occurrence?.result?.photos?.[0]?.url;
  const lat = parseFloat(occurrence.occurrence?.address?.latitude ?? 0);
  const lng = parseFloat(occurrence.occurrence?.address?.longitude ?? 0);

  const [isModalOpen, setIsModalOpen] = useState(false); // modal iniciar
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false); // modal finalizar
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

  const [isRescheduleHistoryModalOpen, setIsRescheduleHistoryModalOpen] =
    useState(false);

  // Abre o pdf
  const handleOpenPdfInNewTab = async () => {
    let base64Image = null;

    try {
      const photoPath = occurrence.occurrence?.photos?.initial?.[0];

      if (photoPath) {
        const url = `https://mapsync-media.s3.sa-east-1.amazonaws.com/${photoPath}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Erro ao buscar imagem");

        const blob = await response.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
    } catch (err) {
      console.warn("⚠️ Imagem não pôde ser carregada. Continuando sem imagem.");
      base64Image = null;
    }

    const pdfBlob = await pdf(
      <ServiceOrderPdf occurrence={occurrence} imageBase64={base64Image} />
    ).toBlob();

    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  };

  //Baixa o pdf
  const handleDownloadPdf = async () => {
    let base64Image = null;

    try {
      const photoPath = occurrence.occurrence?.photos?.initial?.[0];
      console.log("📸 Caminho da imagem:", photoPath);

      if (photoPath) {
        const url = `https://mapsync-media.s3.sa-east-1.amazonaws.com/${photoPath}`;
        console.log("🌐 URL da imagem:", url);

        const response = await fetch(url);
        console.log("📡 Status da requisição:", response.status);

        if (!response.ok) throw new Error("Erro ao buscar imagem");

        const blob = await response.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            console.log("✅ Base64 gerado:", reader.result?.slice(0, 100));
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        });
      }
    } catch (err) {
      console.warn("⚠️ Imagem não pôde ser carregada. Continuando sem imagem.");
      base64Image = null;
    }

    const blob = await pdf(
      <ServiceOrderPdf occurrence={occurrence} imageBase64={base64Image} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${occurrence.protocolNumber || "ordem-servico"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Converte a imagem
  const toBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

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

  // Finaliza a ocorrencia
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

      // Replica a imagem final da ocorrência original
      const replicateResponse = await api.post(
        "/occurrences/attachments/replicate-from-occurrence",
        {
          occurrenceId,
        }
      );

      const novoAttachmentId = replicateResponse?.data?.attachmentId;

      // Armazena o ID do novo anexo para ser usado como imagem inicial
      setFormFotoId(novoAttachmentId || "");

      // Se for do setor de drenagem, pergunta se quer criar nova ocorrência
      if (occurrence?.sector?.name?.toLowerCase().includes("drenagem")) {
        setIsCreatePavingModalOpen(true);
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

  // cria nova ocorrencia
  const handleCreatePavingOccurrence = async () => {
    try {
      const address = occurrence?.occurrence?.address;
      const setorAtualId = occurrence?.sector?.id;

      if (!address || !setorAtualId) {
        throw new Error("Endereço ou setor não encontrado.");
      }

      // corpo da ocorrência
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

      console.log("📦 Enviando:", body);

      const response = await api.post("/occurrences/employee", body);

      if (response?.status === 201 && response.data?.data) {
        const novaOcorrenciaId = response.data.data;

        // Aprova para setor de pavimentação
        const setorPavimentacaoId = "3500cd38-d37c-44dc-9e85-f94290a7881a"; // ID fixo

        await api.post("/occurrences/approve", {
          occurrenceId: novaOcorrenciaId,
          sectorId: setorPavimentacaoId,
        });

        toast({
          title: "Ocorrência criada e encaminhada com sucesso!",
          description:
            "A nova ocorrência foi enviada ao setor de pavimentação.",
        });
      } else {
        throw new Error("Falha inesperada ao criar a ocorrência.");
      }
    } catch (error) {
      console.error("❌ Erro ao criar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar ocorrência",
        description: error?.message || "Erro inesperado.",
      });
    } finally {
      setIsCreatePavingModalOpen(false);
      setFormFotoId("");
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-4 rounded-lg shadow-sm text-sm items-stretch">
      {/* Coluna 1 - Informações */}
      <div className="space-y-4 col-span-1 h-full">
        <div>
          <h3 className="font-semibold text-[#787891] mb-2 pb-1">
            Informações sobre a ocorrência
          </h3>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <p>
              <strong>Solicitado por:</strong>{" "}
              {occurrence.occurrence?.author?.name || "—"}
            </p>
            <p>
              <strong>Ocorrência:</strong>{" "}
              {typeLabels[occurrence.occurrence?.type] ||
                occurrence.occurrence?.type ||
                "—"}
            </p>

            <p>
              <strong>Data:</strong>{" "}
              {format(new Date(occurrence.createdAt), "dd/MM/yyyy 'às' HH:mm")}
            </p>
            {/* Data agendada estilizada como botão */}
            <div>
              <label className="text-sm text-[#787891] font-semibold mb-1 block">
                Data agendada:
              </label>
              <button
                onClick={() => setIsRescheduleHistoryModalOpen(true)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-left bg-[#F8F8F8] hover:bg-gray-200 transition"
              >
                {occurrence.scheduledDate
                  ? format(
                      new Date(occurrence.scheduledDate),
                      "dd/MM/yyyy 'às' HH:mm"
                    )
                  : "—"}
              </button>
            </div>
            <p>
              <strong>Protocolo:</strong> {occurrence.protocolNumber || "—"}
            </p>

            <p>
              <strong>Enviado por:</strong>{" "}
              {occurrence.occurrence?.author?.name || "—"}
            </p>
            <p>
              <strong>Setor:</strong> {occurrence.sector?.name || "—"}
            </p>
            <p>
              <strong>Responsável:</strong>{" "}
              {occurrence.occurrence?.approvedBy?.name || "—"}
            </p>
            <p>
              <strong>Técnico:</strong> {occurrence.inspector?.name || "—"}
            </p>
            <p>
              <strong>Encarregado:</strong> {occurrence.foreman?.name || "—"}
            </p>
            <p>
              <strong>Equipe:</strong> {occurrence.team?.name || "—"}
            </p>
            <p>
              <strong>Natureza:</strong> {occurrence.serviceNature?.name || "—"}
            </p>
            <p className="col-span-2">
              <strong>Local:</strong>{" "}
              {occurrence.occurrence?.address?.street || ""},{" "}
              {occurrence.occurrence?.address?.number || ""}
            </p>
            <p>
              <strong>CEP:</strong>{" "}
              {occurrence.occurrence?.address?.zipCode || "—"}
            </p>
            <p>
              <strong>Região:</strong> {occurrence.occurrence?.zone || "—"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-[#787891] font-semibold mb-2 border-b pb-1">
            Anotações da ocorrência
          </h3>
          <div className="bg-[#F8F8F8] rounded-xl px-4 py-2 min-h-[172px] text-gray-700">
            {occurrence?.occurrence?.description || "Sem anotações."}
          </div>
        </div>
      </div>

      {/* Coluna 2 - Ações e botão final */}
      <div className="col-span-1 h-full flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-semibold text-[#787891] mb-2">Ações</h3>
          <div className="bg-[#ECECEC] rounded-xl grid grid-cols-4 gap-2 p-2">
            <Button
              onClick={() => setIsRescheduleModalOpen(true)}
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Reagendar</span>
            </Button>

            <Button
              onClick={handleOpenPdfInNewTab}
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <FilePdf className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Gerar PDF</span>
            </Button>

            <Button
              onClick={handleDownloadPdf}
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

        {/* BOTÃO DINÂMICO */}
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
      <MediaMapSection
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-lg space-y-5 text-left">
            <h2 className="text-xl font-semibold text-gray-900">
              Criar ocorrência de pavimentação
            </h2>

            {/* Formulário */}
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
                className="bg-black hover:bg-gray-900 text-white py-3 rounded-2xl font-medium text-sm"
              >
                Criar ocorrência
              </button>
              <button
                onClick={() => setIsCreatePavingModalOpen(false)}
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