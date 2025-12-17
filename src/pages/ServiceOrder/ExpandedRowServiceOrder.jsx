import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { GoogleMaps } from "@/components/googleMaps";
import { Timeline } from "./TimeLine";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CloudShare from "@/assets/icons/cloudShare.svg?react";
import FilePdf from "@/assets/icons/filePdf.svg?react";
import CloudUploadAlt from "@/assets/icons/cloudUploadAlt.svg?react";
import Image from "@/assets/icons/Image.svg?react";
import Notes from "@/assets/icons/Notes.svg?react";
import { MediaMapSection } from "@/components/MediaMapSection";

import { useToast } from "@/hooks/use-toast";
import Copy from "@/assets/icons/Copy.svg?react";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { usePermissions } from "@/hooks/usePermissions";

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
// encontra setor Pavimentação
function getPavSectorId(sectors = []) {
  const alvo = ["pavimentação", "pavimentacao"];
  const found = sectors.find((s) => alvo.includes(normalize(s?.name)));
  return found?.id || "";
}
// encontra setor Desobstrução
function getDrainSectorId(sectors = []) {
  const aliases = ["desobstrução", "desobstrucao"];
  const normalized = sectors.map((s) => ({ id: s?.id, n: normalize(s?.name) }));
  const found = normalized.find((s) => aliases.includes(s.n));
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

  // timeline
  const timeline = [
    { label: "Solicitação", date: occurrence.acceptedAt },
    { label: "Aceito", date: occurrence.createdAt },
    ...rescheduleSteps,
    { label: "Iniciado", date: occurrence.startedAt },
    { label: "Finalizado", date: occurrence.finishedAt },
  ];

  // período
  const scheduledStart =
    occurrence?.scheduledStart || occurrence?.scheduledDate || null;
  const scheduledEnd = occurrence?.scheduledEnd || null;

  const [photoOpen, setPhotoOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const { toast } = useToast();

  const photoUrl = occurrence?.result?.photos?.[0]?.url;
  const lat = parseFloat(occurrence.occurrence?.address?.latitude ?? 0);
  const lng = parseFloat(occurrence.occurrence?.address?.longitude ?? 0);

  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [inProgressFiles, setInProgressFiles] = useState([]); // File[]
  const [inProgressObs, setInProgressObs] = useState("");

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

  const { isCallCenter } = usePermissions();

  const [pavSectorId, setPavSectorId] = useState("");
  const [pavLookupError, setPavLookupError] = useState("");

  const [isCreateDrainModalOpen, setIsCreateDrainModalOpen] = useState(false);
  const [drainSectorId, setDrainSectorId] = useState("");
  const [drainLookupError, setDrainLookupError] = useState("");

  const [formTipoDrain, setFormTipoDrain] = useState("DESOBSTRUCAO");
  const [formDescricaoDrain, setFormDescricaoDrain] = useState(
    "Ocorrência gerada após limpa fossa"
  );
  const [formEmergencialDrain, setFormEmergencialDrain] = useState(true);

  const [noteContent, setNoteContent] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  // Ver notas
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  // Notas ordenadas pelo createdAt
  const occurrenceNotes = Array.isArray(occurrence?.occurrence?.notes)
    ? [...occurrence.occurrence.notes].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )
    : [];

  // verifica se é de limpa fossa
  const isLimpaFossa =
    typeof occurrence?.sector?.name === "string" &&
    normalize(occurrence.sector.name) === "limpa fossa";

  const [isRescheduleHistoryModalOpen, setIsRescheduleHistoryModalOpen] =
    useState(false);

  // auto-scroll no modal de notas
  const notesScrollRef = useRef(null);
  useEffect(() => {
    if (isNotesModalOpen && notesScrollRef.current) {
      notesScrollRef.current.scrollTop = notesScrollRef.current.scrollHeight;
    }
  }, [isNotesModalOpen, occurrenceNotes, noteLoading]);

  // copiar protocolo
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

  // enviar fotos em andamento
  const handleAddInProgressPhotos = async () => {
    const serviceOrderId = occurrence?.id;
    if (!serviceOrderId) {
      toast({
        variant: "destructive",
        title: "ID ausente",
        description: "Não foi possível identificar a OS.",
      });
      return;
    }
    if (!inProgressFiles || inProgressFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhuma imagem selecionada",
        description: "Selecione ao menos uma imagem para enviar.",
      });
      return;
    }

    try {
      const form = new FormData();
      form.append("serviceOrderId", serviceOrderId);
      form.append("observation", inProgressObs || "");

      // aceita várias fotos
      for (const f of inProgressFiles) {
        form.append("photos", f);
      }

      await api.post("/service-orders/in-progress/photos", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "Fotos de andamento adicionadas com sucesso!" });
      setInProgressFiles([]);
      setInProgressObs("");
      setIsAddPhotoModalOpen(false);

      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Falha ao enviar imagens",
        description:
          err?.response?.data?.message || err?.message || "Tente novamente.",
      });
    }
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

  // Finaliza a ocorrência
  const handleFinalizeExecution = async () => {
    const serviceOrderId = occurrence?.id;
    const occurrenceId = occurrence?.occurrence?.id;

    if (!serviceOrderId || !occurrenceId) {
      alert("ID da OS ou ocorrência ausente.");
      return;
    }

    // Só exige foto se não for Limpa Fossa
    if (!selectedPhoto && !isLimpaFossa) {
      alert("É necessário anexar a foto final para finalizar esta OS.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("serviceOrderId", serviceOrderId);

      if (selectedPhoto) {
        formData.append("photos", selectedPhoto);
      }

      await api.post("/service-orders/finalize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "Execução finalizada com sucesso!" });
      setSelectedPhoto(null);
      setIsFinalizeModalOpen(false);

      //  Tenta replicar foto final para usar como foto inicial da nova ocorrência
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

      // Encaminhamentos automáticos pós-finalização
      if (
        occurrence?.sector?.name &&
        normalize(occurrence.sector.name).includes("drenagem")
      ) {
        try {
          setPavLookupError("");
          const res = await api.get("/sectors/names");
          const list = Array.isArray(res?.data?.sectors)
            ? res.data.sectors
            : [];

          const pavId = getPavSectorId(list);

          if (pavId) setPavSectorId(pavId);
          else {
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
        setIsCreatePavingModalOpen(true);
      } else if (isLimpaFossa) {
        try {
          setDrainLookupError("");
          const res = await api.get("/sectors/names");
          const list = Array.isArray(res?.data?.sectors)
            ? res.data.sectors
            : [];

          const desobId = getDrainSectorId(list);
          if (desobId) {
            setDrainSectorId(desobId);
          } else {
            setDrainSectorId("");
            setDrainLookupError(
              "Setor 'Desobstrução' não encontrado para este usuário."
            );
          }
        } catch (e) {
          setDrainSectorId("");
          setDrainLookupError(
            "Falha ao buscar setores. Tente novamente mais tarde."
          );
        }
        setIsCreateDrainModalOpen(true);

        // Caso não tenha nenhum encaminhamento, apenas recarrega
      } else {
        setTimeout(() => window.location.reload(), 1200);
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

  // criar nota
  async function handleCreateNote() {
    const occurrenceId = occurrence?.occurrence?.id;
    if (!occurrenceId) {
      toast({
        variant: "destructive",
        title: "ID ausente",
        description: "Não foi possível identificar a ocorrência.",
      });
      return;
    }
    if (!noteContent.trim()) {
      toast({
        variant: "destructive",
        title: "Texto vazio",
        description: "Escreva algo antes de enviar a nota.",
      });
      return;
    }

    try {
      setNoteLoading(true);
      await api.post(`/occurrences/${occurrenceId}/notes`, {
        content: noteContent.trim(),
      });
      setNoteContent("");
      toast({ title: "Nota adicionada com sucesso!" });
      setIsNotesModalOpen(false);
      setTimeout(() => window.location.reload(), 300);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Falha ao criar nota",
        description:
          err?.response?.data?.message || err?.message || "Tente novamente.",
      });
    } finally {
      setNoteLoading(false);
    }
  }

  // enviar com Ctrl+Enter
  function onNoteKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!noteLoading) handleCreateNote();
    }
  }

  //Carrega os setores quando modal abre
  useEffect(() => {
    if (!isCreatePavingModalOpen) return;

    let mounted = true;
    async function fetchSectors() {
      setSectorsLoading(true);
      setSectorsError("");
      try {
        const res = await api.get("/sectors/names");
        const list = Array.isArray(res?.data?.sectors) ? res.data.sectors : [];

        if (mounted) {
          setSectors(list);
          const pav = list.find((s) => normalize(s?.name) === "pavimentacao");
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

      const targetSectorId = (pavSectorId || selectedSectorId || "").trim();
      if (!targetSectorId) {
        throw new Error(
          "Setor de destino 'Pavimentação' não disponível. Informe o ID do setor."
        );
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
        isEmergencial: !!formEmergencial,
      });

      toast({
        title: "Ocorrência criada e encaminhada",
        description: "Encaminhada para Pavimentação com sucesso.",
      });

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

  // cria ocorrência e encaminha para Drenagem
  const handleCreateDrainOccurrence = async () => {
    try {
      const address = occurrence?.occurrence?.address;
      if (!address) throw new Error("Endereço não encontrado.");

      const targetSectorId = (drainSectorId || "").trim();
      if (!targetSectorId) {
        throw new Error(
          "Setor de destino 'Desobstrução' não disponível. Informe o ID do setor."
        );
      }

      const body = {
        type: formTipoDrain,
        description: formDescricaoDrain,
        street: address.street,
        number: address.number,
        zipCode: address.zipCode,
        neighborhoodId: address.neighborhoodId,
        latitude: parseFloat(address.latitude),
        longitude: parseFloat(address.longitude),
        isEmergencial: formEmergencialDrain,
        initialPhotosUrls: formFotoId ? [formFotoId] : [], // usa a foto replicada se existir
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
        isEmergencial: !!formEmergencial,
      });

      toast({
        title: "Ocorrência criada e encaminhada",
        description: "Encaminhada para Desobstrução com sucesso.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (error) {
      console.error("Erro ao criar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar/encaminhar",
        description: error?.message || "Erro inesperado.",
      });
    } finally {
      setIsCreateDrainModalOpen(false);
      setDrainSectorId("");
      setDrainLookupError("");
    }
  };

  const typeLabels = {
    TAPA_BURACO: "Asfalto",
    AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
    MEIO_FIO: "Meio fio",
    DESOBSTRUCAO: "Drenagem",
    LIMPA_FOSSA: "Limpa fossa",
  };

  //Monta as imagens
  const BUCKET = "https://mapsync-media.s3.sa-east-1.amazonaws.com/";

  const initialArr = Array.isArray(occurrence?.occurrence?.photos?.initial)
    ? occurrence.occurrence.photos.initial.filter(Boolean).map((key, i) => ({
        label: `Inicial ${
          occurrence.occurrence.photos.initial.length > 1 ? i + 1 : ""
        }`.trim(),
        url: `${BUCKET}${key}`,
      }))
    : [];

  const progressArr = Array.isArray(occurrence?.occurrence?.photos?.progress)
    ? occurrence.occurrence.photos.progress
        .filter((p) => p?.filename)
        .map((p, i) => ({
          label: `Andamento ${i + 1}${p?.notes ? ` — ${p.notes}` : ""}`,
          url: `${BUCKET}${p.filename}`,
        }))
    : [];

  const finalArr = Array.isArray(occurrence?.occurrence?.photos?.final)
    ? occurrence.occurrence.photos.final.filter(Boolean).map((key, i) => ({
        label: `Final ${
          occurrence.occurrence.photos.final.length > 1 ? i + 1 : ""
        }`.trim(),
        url: `${BUCKET}${key}`,
      }))
    : [];

  const allPhotos = [...initialArr, ...progressArr, ...finalArr];
  // fallback para o componente não quebrar quando não houver nenhuma foto
  const photoUrlsForSection = allPhotos.length
    ? allPhotos
    : [{ label: "", url: null }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6  p-4  text-sm items-stretch">
      {/* Informações */}
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
                  <Copy className="w-5 h-5 shrink-0 opacity-70" />
                </button>
              </div>
              <p>
                <strong>Companhia:</strong>{" "}
                {occurrence.occurrence?.externalCompany || "EMURB"}
              </p>
              {/* Data e Ocorrência */}
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
                  <span className="font-bold">Tipo:</span>{" "}
                  {typeLabels[occurrence.occurrence.type] ||
                    occurrence.occurrence.type ||
                    "—"}
                </p>
                <p>
                  <strong>Setor:</strong> {occurrence.sector?.name || "—"}
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

              {/* CEP e Região */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>CEP:</strong>{" "}
                  {occurrence.occurrence?.address?.zipCode || "—"}
                </p>
                <p>
                  <strong>Região:</strong> {occurrence.occurrence?.zone || "—"}
                </p>
              </div>

              {/* Latitude e Longitude */}
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

      {/* Ações e botão final */}
      <div className="col-span-1 self-stretch h-full flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-semibold text-[#787891] mb-2">Ações</h3>
          <div className="bg-[#ECECEC] rounded-xl grid grid-cols-4 gap-2 p-2">
            <Button
              onClick={() => setIsNotesModalOpen(true)}
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <Notes className="w-5 h-5" />
              <span className="text-[#787891] text-xs">Ver notas</span>
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
              onClick={() => setIsAddPhotoModalOpen(true)}
              variant="ghost"
              className="flex flex-col items-center justify-center gap-1 h-[60px] hover:bg-[#DCDCDC] rounded-md"
            >
              <Image className="w-5 h-5" />
              <span className="text-[#787891] text-xs">+ imagens</span>
            </Button>
          </div>

          <Timeline timeline={timeline} />
        </div>
        {!isCallCenter && //CallCenter não pode iniciar ou finalizar
          (!occurrence.startedAt ? (
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
          ))}
      </div>

      {/* Imagem e mapa com modal */}
      <div className="col-span-1 h-full">
        <MediaMapSection
          className="h-full"
          photoUrls={photoUrlsForSection}
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

      {/* Modal de finalização */}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-lg space-y-5 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Anexar foto final
            </h2>

            {isLimpaFossa ? (
              <p className="text-xs text-gray-600 -mt-2">
                Para o setor <strong>Limpa Fossa</strong>, a foto final é
                opcional.
              </p>
            ) : (
              <p className="text-xs text-gray-600 -mt-2">
                Para este setor, a foto final é <strong>obrigatória</strong>.
              </p>
            )}

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
                // sem foto se for Limpa Fossa
                disabled={!selectedPhoto && !isLimpaFossa}
                className={`flex items-center justify-center gap-2 w-full rounded-2xl ${
                  selectedPhoto || isLimpaFossa
                    ? "bg-black hover:bg-gray-900"
                    : "bg-gray-300"
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

      {/* Modal para criar ocorrência de Pavimentação ao finaliza pavimentação */}
      {isCreatePavingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-lg space-y-5 text-left">
            <h2 className="text-xl font-semibold text-gray-900">
              Criar ocorrência de pavimentação
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                >
                  <option value="DESOBSTRUCAO">Drenagem</option>
                  <option value="TAPA_BURACO">Asfalto</option>
                  <option value="LOGRADOURO">Logradouro</option>
                  <option value="LIMPA_FOSSA">limpa fossa</option>
                  <option value="TERRAPLANAGEM">Terraplanagem</option>
                </select>
              </div>

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

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleCreatePavingOccurrence}
                disabled={
                  !(pavSectorId || selectedSectorId) || !!pavLookupError
                }
                className={`py-3 rounded-2xl font-medium text-sm text-white ${
                  !(pavSectorId || selectedSectorId) || pavLookupError
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
      {/* Modal para criar ocorrência de Drenagem ao finalizar limpa fossa */}
      {isCreateDrainModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-lg space-y-5 text-left">
            <h2 className="text-xl font-semibold text-gray-900">
              Criar ocorrência de desobstrução
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={formTipoDrain}
                  onChange={(e) => setFormTipoDrain(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                >
                  <option value="DESOBSTRUCAO">Drenagem</option>
                  <option value="TAPA_BURACO">Asfalto</option>
                  <option value="LOGRADOURO">Logradouro</option>
                  <option value="LIMPA_FOSSA">limpa fossa</option>
                  <option value="TERRAPLANAGEM">Terraplanagem</option>
                </select>
              </div>

              <div className="rounded-lg border p-3 bg-[#F8F8F8]">
                <p className="text-sm text-gray-700">
                  <strong>Setor de destino:</strong> Desobstrução
                </p>
                {drainLookupError ? (
                  <p className="mt-2 text-xs text-red-600">
                    {drainLookupError}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    Esta ação irá encaminhar a nova ocorrência diretamente para
                    o setor de Desobstrução.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  value={formDescricaoDrain}
                  onChange={(e) => setFormDescricaoDrain(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="emergencialDrain"
                  type="checkbox"
                  checked={formEmergencialDrain}
                  onChange={(e) => setFormEmergencialDrain(e.target.checked)}
                />
                <label
                  htmlFor="emergencialDrain"
                  className="text-sm text-gray-700"
                >
                  É emergencial?
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleCreateDrainOccurrence}
                disabled={!drainSectorId || !!drainLookupError}
                className={`py-3 rounded-2xl font-medium text-sm text-white ${
                  !drainSectorId || drainLookupError
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-black hover:bg-gray-900"
                }`}
              >
                Confirmar criação e encaminhar
              </button>
              <button
                onClick={() => {
                  setIsCreateDrainModalOpen(false);
                  setDrainSectorId("");
                  setDrainLookupError("");

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

      {/* Modal de reagendamento */}
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

      {/* Modal do histórico de reagendamento */}
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

      {/* Modal de adicionar fotos de andamento */}
      {isAddPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-lg space-y-5 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Adicionar imagem (andamento)
            </h2>

            <p className="text-xs text-gray-600 -mt-2">
              Selecione uma ou mais imagens e, se quiser, adicione uma
              observação.
            </p>

            <input
              type="file"
              multiple
              accept="image/png, image/jpeg"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setInProgressFiles(files);
              }}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800
                   file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                   file:text-sm file:font-semibold file:bg-black file:text-white"
            />

            <textarea
              placeholder="Observação (opcional)"
              value={inProgressObs}
              onChange={(e) => setInProgressObs(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-800"
              rows={3}
            />

            <div className="text-xs text-gray-500">
              {inProgressFiles.length > 0
                ? `${inProgressFiles.length} arquivo(s) selecionado(s)`
                : "Nenhum arquivo selecionado"}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddInProgressPhotos}
                className={`flex items-center justify-center gap-2 w-full rounded-2xl
            ${
              inProgressFiles.length > 0
                ? "bg-black hover:bg-gray-900"
                : "bg-gray-300 cursor-not-allowed"
            }
            text-white py-3 font-medium text-sm transition`}
                disabled={inProgressFiles.length === 0}
              >
                Enviar
              </button>

              <button
                onClick={() => {
                  setIsAddPhotoModalOpen(false);
                  setInProgressFiles([]);
                  setInProgressObs("");
                }}
                className="text-sm text-gray-500 underline hover:text-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* modal de ver notas */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-0 shadow-lg flex flex-col">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-6 py-4 ">
              <h2 className="text-lg font-semibold text-gray-900">
                Notas da ocorrência
              </h2>
              <button
                onClick={() => setIsNotesModalOpen(false)}
                className="text-sm text-gray-500 underline hover:text-gray-700"
              >
                Fechar
              </button>
            </div>

            {/* chat */}
            <div
              ref={notesScrollRef}
              className="px-4 py-3 space-y-3 max-h-[56vh] overflow-y-auto bg-[#F7F7F7]"
            >
              {occurrenceNotes.length > 0 ? (
                occurrenceNotes.map((n) => {
                  const authorName = (
                    n?.author?.name ||
                    n?.author?.email ||
                    "Usuário"
                  ).trim();
                  const created = n?.createdAt
                    ? format(new Date(n.createdAt), "dd/MM/yyyy HH:mm")
                    : "";

                  return (
                    <div key={n.id} className="flex items-start gap-2">
                      <div className="shrink-0 mt-1 h-6 w-6 rounded-full bg-[#ECECEC] flex items-center justify-center text-[10px] text-gray-600">
                        {authorName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="max-w-[80%] rounded-2xl bg-white border px-3 py-2 shadow-sm">
                        <p className="text-[13px] text-gray-900">
                          <span className="font-semibold">{authorName}:</span>{" "}
                          {n?.content || ""}
                        </p>
                        {created && (
                          <p className="text-[10px] text-gray-500 mt-1">
                            {created}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600 text-sm px-2">
                  Nenhuma nota registrada.
                </p>
              )}
            </div>

            <div className="p-3 rounded-[2rem] bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  onKeyDown={onNoteKeyDown}
                  placeholder="Escreva uma nota"
                  rows={1}
                  className="flex-1 rounded-2xl border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                />
                <button
                  type="button"
                  onClick={handleCreateNote}
                  disabled={noteLoading || !noteContent.trim()}
                  className={`px-4 h-10 rounded-2xl text-sm font-medium ${
                    noteLoading || !noteContent.trim()
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-[#D1F0FA] text-[#116B97] hover:bg-blue-300"
                  }`}
                  title="Enviar nota"
                >
                  {noteLoading ? "Enviando…" : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
