// src/pages/Analysis/ExpandedRowAnalysis.jsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { api } from "@/services/api";
import { MediaMapSection } from "@/components/MediaMapSection";
import { AddressUpdateDialog } from "./AddressUpdateDialog";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const { toast } = useToast();

  const [sectors, setSectors] = useState([]);
  const [isEmergencialSelection, setIsEmergencialSelection] = useState(false);

  const [neighborhoods, setNeighborhoods] = useState([]);

  const [editableNeighborhoodId, setEditableNeighborhoodId] = useState(
    occurrence.address?.neighborhoodId || ""
  );

  const [currentNeighborhoodId, setCurrentNeighborhoodId] = useState(
    occurrence.address?.neighborhoodId || ""
  );
  const [currentNeighborhoodName, setCurrentNeighborhoodName] = useState(
    occurrence.address?.neighborhoodName || "Não informado"
  );

  const [localAddress, setLocalAddress] = useState({
    street: occurrence.address?.street || "",
    number: occurrence.address?.number || "",
    city: occurrence.address?.city || "",
    state: occurrence.address?.state || "",
    zipCode: occurrence.address?.zipCode || "",
    latitude: occurrence.address?.latitude || "",
    longitude: occurrence.address?.longitude || "",
  });

  const REGION_OPTIONS = ["Norte", "Sul", "Central", "Expansão"];

  const [region, setRegion] = useState(occurrence.address?.region || "");

  const [updatingNeighborhood, setUpdatingNeighborhood] = useState(false);
  const [confirmNeighborhoodOpen, setConfirmNeighborhoodOpen] = useState(false);

  const [isAddressHistoryOpen, setIsAddressHistoryOpen] = useState(false);
  const [addressAudits, setAddressAudits] = useState([]);
  const [loadingAddressAudits, setLoadingAddressAudits] = useState(false);

  const [externalCompany, setExternalCompany] = useState(""); // "", "SERGAS", "IGUA"
  const [confirmExternalOpen, setConfirmExternalOpen] = useState(false);
  const [archivingExternal, setArchivingExternal] = useState(false);

  function openConfirmExternal() {
    setConfirmExternalOpen(true);
  }

  async function handleConfirmExternalArchive() {
    try {
      setArchivingExternal(true);
      const body = { note: "Encaminhado via análise" };
      if (externalCompany) body.company = externalCompany; // só manda se tiver

      await api.patch(`/occurrences/${occurrence.id}/forward-external`, body);

      toast({
        title: "Arquivado/Encaminhado",
        description: externalCompany
          ? `Ocorrência encaminhada para ${externalCompany}.`
          : "Ocorrência arquivada sem empresa.",
      });

      setConfirmExternalOpen(false);

      // 🔄 recarrega a página depois de 500ms (pra dar tempo de mostrar o toast)
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha ao arquivar/encaminhar",
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setArchivingExternal(false);
    }
  }

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
        setNeighborhoods(response.data.neighborhoods);
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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingAddressAudits(true);
        const res = await api.get(`/occurrences/${occurrence.id}/audits`);

        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.audits || [];

        const filtered = list.filter((a) =>
          (a.field || "").startsWith("address.")
        );
        if (mounted) setAddressAudits(filtered);
      } catch (err) {
        console.error("Erro ao buscar histórico de endereço:", err);
      } finally {
        if (mounted) setLoadingAddressAudits(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [occurrence.id]);

  const createdAt = occurrence.createdAt
    ? format(new Date(occurrence.createdAt), "dd/MM/yyyy HH:mm")
    : "Data não informada";

  const addressLine = localAddress.street
    ? `${localAddress.street}, ${localAddress.number || "s/n"} - ${
        localAddress.city || "Aracaju"
      }`
    : "Endereço não informado";

  const zip = localAddress.zipCode || "Não informado";
  const bairro =
    currentNeighborhoodName ||
    neighborhoods.find((n) => n.id === currentNeighborhoodId)?.name ||
    "Não informado";
  const regiao = region || occurrence.address?.region || "Não informado";

  const openConfirmAdjustments = () => {
    if (nothingToSave) {
      toast({
        title: "Nada para atualizar",
        description:
          "Selecione um bairro e/ou região diferente para confirmar.",
      });
      return;
    }

    if (!willChangeRegion && !editableNeighborhoodId) {
      toast({
        variant: "destructive",
        title: "Selecione um bairro",
        description: "Você precisa escolher um bairro antes de salvar.",
      });
      return;
    }

    setConfirmNeighborhoodOpen(true);
  };

  async function handleConfirmSaveAdjustments() {
    try {
      setUpdatingNeighborhood(true);

      if ((region || "") !== (occurrence.address?.region || "")) {
        await api.patch(`/occurrences/${occurrence.id}/address`, { region });
      }

      if (
        !!editableNeighborhoodId &&
        editableNeighborhoodId !== currentNeighborhoodId
      ) {
        await api.patch(`/occurrences/${occurrence.id}/neighborhood`, {
          neighborhoodId: editableNeighborhoodId,
        });
        const newName =
          neighborhoods.find((n) => n.id === editableNeighborhoodId)?.name ||
          "Atualizado";
        setCurrentNeighborhoodId(editableNeighborhoodId);
        setCurrentNeighborhoodName(newName);
      }

      const changedParts = [
        !!editableNeighborhoodId &&
        editableNeighborhoodId !== currentNeighborhoodId
          ? "bairro"
          : null,
        (region || "") !== (occurrence.address?.region || "") ? "região" : null,
      ]
        .filter(Boolean)
        .join(" e ");

      toast({
        title: "Ajustes salvos",
        description: `Alterações de ${changedParts} aplicadas com sucesso.`,
      });

      setConfirmNeighborhoodOpen(false);
      setTimeout(() => window.location.reload(), 300);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar ajustes",
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setUpdatingNeighborhood(false);
    }
  }

  const willChangeNeighborhood =
    !!editableNeighborhoodId &&
    editableNeighborhoodId !== currentNeighborhoodId;

  const willChangeRegion =
    (region || "") !== (occurrence.address?.region || "");

  const nothingToSave = !willChangeNeighborhood && !willChangeRegion;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-[#F7F7F7] p-4 rounded-lg shadow-sm text-sm">
      {/* Coluna 1 - Informações */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-1 text-[#787891]">
          <h3 className="font-semibold text-base mb-2 border-b pb-1">
            Informações sobre a ocorrência
          </h3>
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleCopyProtocol}
              className="w-full h-[58px] text-left text-black flex items-center justify-between gap-3 rounded-lg border px-3 py-2
                 bg-[#D9DCE2] hover:bg-gray-300 "
              aria-label="Copiar protocolo"
            >
              <span className="truncate ">
                Protocolo : {occurrence?.protocolNumber || "—"}
              </span>
              <Copy className="w-4 h-4 shrink-0 opacity-70" />
            </button>
          </div>
          <p>
            <span className="text-gray-500 font-medium">Data:</span> {createdAt}
          </p>

          <div>
            <label className="text-sm text-[#787891] font-semibold mb-1 block">
              Local:
            </label>
            <button
              onClick={() => setIsAddressHistoryOpen(true)}
              className="w-full h-[64px] border border-[#818898] rounded-xl px-3 py-2 text-left text-[#787891] bg-[#E4E4E4] hover:bg-gray-200 transition"
              title="Ver histórico de alterações de endereço"
            >
              {addressLine}
            </button>
          </div>
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
            <span className="text-gray-500 font-medium">Latitude:</span>{" "}
            {localAddress.latitude}
          </p>
          <p>
            <span className="text-gray-500 font-medium">Longitude:</span>{" "}
            {localAddress.longitude}
          </p>
        </div>

        {/* Encaminhar para outra empresa */}
        <div className="mt-2">
          <label className="text-[16px] text-[#787891] font-semibold mb-1 block">
            Classificacão
          </label>

          <div className="flex gap-2">
            <select
              value={externalCompany}
              onChange={(e) => setExternalCompany(e.target.value)}
              className="flex-1 p-2 rounded h-[55px] text-[#787891]"
            >
              <option value="">Classifique </option>
              <option value="SERGAS">SERGAS</option>
              <option value="IGUA">IGUA</option>
            </select>

            <Button
              className="h-[55px] px-6 bg-[#EDEDED] hover:bg-gray-100 text-[#5F5F5F] flex items-center justify-center gap-2"
              onClick={openConfirmExternal}
              disabled={archivingExternal}
            >
              {archivingExternal ? "..." : "Arquivar"}
            </Button>
          </div>
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
          <label className="font-semibold text-[18px] block mb-1 text-[#787891]">
            Ajustes da ocorrência
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={editableNeighborhoodId}
                onChange={(e) => setEditableNeighborhoodId(e.target.value)}
                className="w-full p-2 rounded h-[55px] text-[#787891] text-left flex-1"
              >
                <option className="" value="">
                  Altere o bairro se necessário for
                </option>
                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <AddressUpdateDialog
                occurrenceId={occurrence.id}
                neighborhoods={neighborhoods}
                currentNeighborhoodId={currentNeighborhoodId}
                initialLat={
                  Number(localAddress.latitude) ||
                  Number(occurrence.address?.latitude) ||
                  -10.9472
                }
                initialLng={
                  Number(localAddress.longitude) ||
                  Number(occurrence.address?.longitude) ||
                  -37.0731
                }
                onSuccess={(updated) => {
                  setLocalAddress((prev) => ({
                    ...prev,
                    street: updated.street ?? prev.street,
                    zipCode: updated.zipCode ?? prev.zipCode,
                  }));
                  if (updated.neighborhoodId) {
                    setCurrentNeighborhoodId(updated.neighborhoodId);
                    setCurrentNeighborhoodName(
                      updated.neighborhoodName ||
                        neighborhoods.find(
                          (n) => n.id === updated.neighborhoodId
                        )?.name ||
                        "Atualizado"
                    );
                  }
                  toast?.({
                    title: "Endereço atualizado",
                    description: "Rua, CEP e bairro alterados com sucesso.",
                  });
                }}
              />

              {/* Salva região */}
              <div className="mt-3 space-y-2">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-2 rounded h-[55px] text-[#787891]"
                >
                  <option value="">Selecione a região</option>
                  {REGION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              className="h-[55px] w-full px-4 bg-[#E8F7FF] hover:bg-blue-100 text-[#00679D] flex items-center justify-center gap-2"
              onClick={openConfirmAdjustments}
              disabled={updatingNeighborhood || nothingToSave}
            >
              {updatingNeighborhood ? (
                "Salvando..."
              ) : (
                <>
                  <span>Confirmar ajustes</span>
                  <ThumbsUp className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
          <label className="font-semibold text-[18px] block mb-1 text-[#787891]">
            Encaminhamento para análise
          </label>

          {/* Setor responsável */}
          <div>
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

          {/* Classificação */}
          <div>
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
        </div>

        {/* Encaminhar (sem salvar bairro aqui) */}
        <Button
          className="w-full bg-[#FFF0E6] h-[64px] hover:bg-orange-200 text-[#FF7A21] flex items-center justify-center gap-2"
          onClick={() =>
            handleForwardOccurrence(occurrence.id, isEmergencialSelection)
          }
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
        lat={parseFloat(localAddress.latitude || 0)}
        lng={parseFloat(localAddress.longitude || 0)}
      />

      {/* Modal de arquivamento */}
      <Dialog open={confirmExternalOpen} onOpenChange={setConfirmExternalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {externalCompany
                ? "Encaminhar para empresa"
                : "Arquivar sem empresa"}
            </DialogTitle>
            <DialogDescription>
              {externalCompany ? (
                <>
                  A ocorrência será encaminhada para{" "}
                  <strong>{externalCompany}</strong>. Deseja continuar?
                </>
              ) : (
                <>
                  A ocorrência será <strong>arquivada</strong> sem selecionar
                  uma empresa. Deseja continuar?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmExternalOpen(false)}
              disabled={archivingExternal}
            >
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirmExternalArchive}
              disabled={archivingExternal}
            >
              {archivingExternal ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação  */}
      <Dialog
        open={confirmNeighborhoodOpen}
        onOpenChange={setConfirmNeighborhoodOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar alteração de bairro</DialogTitle>
            <DialogDescription>
              {willChangeNeighborhood && willChangeRegion ? (
                <>
                  Esta ocorrência terá o <strong>bairro</strong> alterado para{" "}
                  <strong>
                    {neighborhoods.find((n) => n.id === editableNeighborhoodId)
                      ?.name || "selecionado"}
                  </strong>{" "}
                  e a <strong>região</strong> alterada para{" "}
                  <strong>{region}</strong>. Deseja continuar?
                </>
              ) : willChangeNeighborhood ? (
                <>
                  Esta ocorrência passará a pertencer ao bairro{" "}
                  <strong>
                    {neighborhoods.find((n) => n.id === editableNeighborhoodId)
                      ?.name || "selecionado"}
                  </strong>
                  . Deseja continuar?
                </>
              ) : (
                <>
                  Esta ocorrência terá a <strong>região</strong> alterada para{" "}
                  <strong>{region}</strong>. Deseja continuar?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmNeighborhoodOpen(false)}
              disabled={updatingNeighborhood}
            >
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirmSaveAdjustments}
              disabled={updatingNeighborhood}
            >
              {updatingNeighborhood ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal - Histórico de alterações de endereço */}
      <Dialog
        open={isAddressHistoryOpen}
        onOpenChange={setIsAddressHistoryOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Histórico de alterações de endereço</DialogTitle>
            <DialogDescription>
              Registros de alterações em bairro, rua e número desta ocorrência.
            </DialogDescription>
          </DialogHeader>

          {loadingAddressAudits ? (
            <p className="text-gray-600">Carregando...</p>
          ) : addressAudits.length > 0 ? (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {addressAudits.map((a) => {
                const fieldLabel =
                  a.field === "address.neighborhoodId"
                    ? "Bairro"
                    : a.field === "address.street"
                    ? "Rua"
                    : a.field === "address.number"
                    ? "Número"
                    : a.field?.replace("address.", "") || "Endereço";

                const fromVal =
                  a.oldNeighborhoodName ||
                  a.oldValue ||
                  (a.type?.includes("NEIGHBORHOOD") ? "—" : "—");
                const toVal =
                  a.newNeighborhoodName ||
                  a.newValue ||
                  (a.type?.includes("NEIGHBORHOOD") ? "—" : "—");

                return (
                  <li
                    key={a.id}
                    className="border rounded-lg p-3 bg-[#F8F8F8] text-sm text-gray-800"
                  >
                    <p className="text-xs text-gray-500 mb-1">
                      {format(new Date(a.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                    </p>

                    <p className="font-medium">
                      <strong>{fieldLabel}:</strong>{" "}
                      <span className="inline-block">
                        {fromVal} <span className="text-gray-500">→</span>{" "}
                        {toVal}
                      </span>
                    </p>

                    {a.changedBy?.name && (
                      <p className="mt-1">
                        <strong>Alterado por:</strong> {a.changedBy.name}
                      </p>
                    )}

                    {a.reason && (
                      <p className="mt-1">
                        <strong>Motivo:</strong> {a.reason}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-600">
              Nenhuma alteração de endereço registrada.
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={() => setIsAddressHistoryOpen(false)}
              className="text-sm text-gray-500 underline hover:text-gray-700 transition w-full"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
