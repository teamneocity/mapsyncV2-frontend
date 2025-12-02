import { useState, useEffect } from "react";
import { format } from "date-fns";

import { useToast } from "@/hooks/use-toast";

import { api } from "@/services/api";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/selectField";
import { MediaMapSection } from "@/components/MediaMapSection";

import { AddressUpdateDialog } from "./AddressUpdateDialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import Copy from "@/assets/icons/Copy.svg?react";
import Folder from "@/assets/icons/Folder.svg?react";
import Warning from "@/assets/icons/Warning.svg?react";

export function ExpandedRowAnalysis({
  occurrence,
  editableSectorId,
  setEditableSectorId,
  setSelectedOccurrenceId,
  setIsIgnoreOcurrenceModalOpen,
  setSelectedOccurrenceStatus,
  handleForwardOccurrence,
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

  const [externalCompany, setExternalCompany] = useState("");
  const [confirmExternalOpen, setConfirmExternalOpen] = useState(false);
  const [archivingExternal, setArchivingExternal] = useState(false);

  const [isPossibleDuplicateOpen, setIsPossibleDuplicateOpen] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");
  const [nearbyBaseId, setNearbyBaseId] = useState(null);
  const [nearbyItems, setNearbyItems] = useState([]);

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
  function handleCopyStreet() {
    const value = localAddress.street || occurrence.address?.street;

    if (!value) {
      toast({
        title: "Nada para copiar",
        description: "Esta ocorrência não possui rua informada.",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: "Copiado!",
        description: `Rua "${value}" copiada para a área de transferência.`,
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

  // busca duplicatas
  useEffect(() => {
    let mounted = true;

    async function fetchNearby() {
      try {
        setNearbyError("");
        setNearbyLoading(true);

        const { data } = await api.get(`/occurrences/${occurrence.id}/nearby`);
        // Esperado da sua rota: { baseId, count, occurrences: [...] }
        if (!mounted) return;

        setNearbyBaseId(data?.baseId ?? null);
        setNearbyItems(
          Array.isArray(data?.occurrences) ? data.occurrences : []
        );
      } catch (err) {
        if (!mounted) return;
        console.error("Erro ao buscar duplicatas próximas:", err);
        setNearbyError(
          err?.response?.data?.message ||
            "Não foi possível carregar possíveis duplicatas."
        );
      } finally {
        if (mounted) setNearbyLoading(false);
      }
    }

    if (isPossibleDuplicateOpen) {
      fetchNearby();
    } else {
      // ao fechar, opcional: limpar estado
      setNearbyBaseId(null);
      setNearbyItems([]);
      setNearbyError("");
      setNearbyLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [isPossibleDuplicateOpen, occurrence.id]);

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

  const regionClean = (region ?? "").trim();
  const regionValue = REGION_OPTIONS.includes(regionClean) ? regionClean : "";

  // máscara para tipos
  const typeLabels = {
    TAPA_BURACO: "Asfalto",
    AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
    MEIO_FIO: "Meio fio",
    DESOBSTRUCAO: "Drenagem",
    LIMPA_FOSSA: "Limpa fossa",
  };

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
              <Copy className="w-5 h-5 shrink-0 opacity-70" />
            </button>
          </div>
          {/* Exibe aviso de possível duplicata quando vier true */}
          {occurrence?.isAPossibleDuplicate === true && (
            <button
              type="button"
              onClick={() => setIsPossibleDuplicateOpen(true)}
              className="w-full h-[52px] mt-2 text-left flex items-center justify-between gap-3 rounded-lg border px-3 py-2
               bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              aria-label="Abrir detalhes de possível duplicata"
              title="Abrir detalhes de possível duplicata"
            >
              <span className="truncate font-medium">Possível duplicata</span>
              <span className="text-xl leading-none" aria-hidden>
                <Warning
                  className="w-5 h-5 shrink-0 text-yellow-800"
                  fill="currentColor"
                />
              </span>
            </button>
          )}

          <p>
            <span className="text-black font-medium">Data:</span> {createdAt}
          </p>
          <p>
            <span className="text-black font-medium">Tipo:</span>{" "}
            {typeLabels[occurrence.type] || occurrence.type}
          </p>
          <div>
            <label className="text-sm text-black font-semibold mb-1 block">
              Local:
            </label>
            <button
              onClick={() => setIsAddressHistoryOpen(true)}
              className="w-full h-[64px] rounded-xl px-3 py-2
             bg-[#E4E4E4] hover:bg-gray-200 transition
             flex items-center justify-between gap-3"
              title="Ver histórico de alterações de endereço"
            >
              {/* texto do endereço à esquerda, com ellipsis */}
              <span className="text-left text-black truncate">
                {addressLine}
              </span>

              {/* ícone à direita que copia rua ao clicar */}
              <span
                onClick={(e) => {
                  e.stopPropagation(); // não deixa abrir o modal
                  handleCopyStreet();
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-300 cursor-pointer"
                title="Copiar nome da rua"
              >
                <Copy className="w-5 h-5 opacity-70 shrink-0" />
              </span>
            </button>
          </div>

          <p>
            <span className="text-black font-medium">CEP:</span> {zip}
          </p>
          <p>
            <span className="text-black font-medium">Bairro:</span> {bairro}
          </p>
          
          <p>
            <span className="text-black font-medium">Região:</span> {regiao}
          </p>
          <p>
            <span className="text-black font-medium">Complemento:</span>{" "}
            {occurrence.description|| "Não informado" }
          </p>
          <p>
            <span className="text-black font-medium">Latitude:</span>{" "}
            {localAddress.latitude}
          </p>
          <p>
            <span className="text-black font-medium">Longitude:</span>{" "}
            {localAddress.longitude}
          </p>
        </div>

        {/* Encaminhar para outra empresa */}
        <div className="mt-2">
          <label className="text-[16px] text-[#787891] font-semibold mb-1 block">
            Classificacão
          </label>

          <div className="flex gap-2">
            <div className="flex-1">
              <SelectField
                placeholder="Classifique"
                value={externalCompany || ""}
                options={[
                  { value: "SERGAS", label: "SERGAS" },
                  { value: "IGUA", label: "IGUA" },
                ]}
                onChange={(value) => setExternalCompany(value)}
                className="h-[55px] border border-[#FFFFFF]"
              />
            </div>

            <Button
              className="h-[55px] px-6 bg-[#EDEDED] hover:bg-gray-100 text-[#5F5F5F] flex items-center justify-center gap-2"
              onClick={openConfirmExternal}
              disabled={archivingExternal}
            >
              {archivingExternal ? "..." : "Arquivar"}
              <Folder className="w-4 h-4 shrink-0 opacity-70" />
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
              <div className="flex-1">
                <SelectField
                  placeholder="Altere o bairro se necessário for"
                  value={editableNeighborhoodId || ""}
                  options={neighborhoods.map((n) => ({
                    id: n.id,
                    name: n.name,
                  }))}
                  onChange={(value) => setEditableNeighborhoodId(value)}
                  className="h-[55px] border border-[#FFFFFF]"
                />
              </div>
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
                <SelectField
                  placeholder="Informe a Zona / Região"
                  value={regionValue}
                  options={REGION_OPTIONS.map((r) => ({ value: r, label: r }))}
                  onChange={(value) => setRegion(value)}
                  className="h-[55px] border border-[#FFFFFF]"
                />
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
            <SelectField
              placeholder="Selecione o setor"
              value={editableSectorId ?? ""}
              options={sectors.map((s) => ({
                id: s.id,
                name: s.name,
              }))}
              onChange={(value) => setEditableSectorId(value)}
              className="h-[55px] border border-[#FFFFFF]"
            />
          </div>

          {/* Classificação */}
          <div>
            <SelectField
              placeholder="Classificação"
              value={isEmergencialSelection ? "true" : "false"}
              options={[
                { value: "false", label: "Não emergencial" },
                { value: "true", label: "Emergencial" },
              ]}
              onChange={(value) => setIsEmergencialSelection(value === "true")}
              className="h-[55px] border border-[#FFFFFF]"
            />
          </div>
        </div>

        {/* Encaminhar (sem salvar bairro aqui) */}
        <Button
          className="w-full bg-[#FFF0E6] h-[64px] hover:bg-orange-200 text-[#FF7A21] flex items-center justify-center gap-2"
          onClick={() =>
            handleForwardOccurrence(occurrence.id, isEmergencialSelection, {
              externalCompany: externalCompany || null,
              externalCompanyNote: externalCompany
                ? "Encaminhado via análise"
                : null,
            })
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

      {/* Modal de possível duplicata */}
      <Dialog
        open={isPossibleDuplicateOpen}
        onOpenChange={setIsPossibleDuplicateOpen}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Possível duplicata</DialogTitle>
            <DialogDescription>
              Esta ocorrência pode ter registros muito próximos (mesmo
              local/tempo).
            </DialogDescription>
          </DialogHeader>

          {nearbyLoading && (
            <p className="text-sm text-gray-600">
              Carregando possíveis duplicatas...
            </p>
          )}

          {!nearbyLoading && nearbyError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {nearbyError}
            </div>
          )}

          {!nearbyLoading && !nearbyError && (
            <>
              {Array.isArray(nearbyItems) && nearbyItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      ID:{" "}
                      <span className="font-mono">{nearbyBaseId ?? "—"}</span>
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      {nearbyItems.length} possível(is) duplicata(s)
                    </span>
                  </div>

                  <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {nearbyItems.map((o) => {
                      const created = o?.createdAt
                        ? format(new Date(o.createdAt), "dd/MM/yyyy HH:mm")
                        : "—";
                      const rua = o?.address?.street ?? "Rua não informada";
                      const num = o?.address?.number ?? "s/n";
                      const bairro = o?.address?.neighborhoodName ?? "—";
                      const protocolo = o?.protocolNumber ?? "—";
                      const status = o?.status ?? "—";

                      return (
                        <li
                          key={o.id}
                          className="border rounded-lg p-3 bg-[#F8F8F8] text-sm text-gray-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {o.type ?? "Ocorrência"}
                              </p>
                              <p className="text-gray-700 truncate">
                                {rua}, {num} — {bairro}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Criada em: {created}
                              </p>
                              <p className="text-xs text-gray-500">
                                Protocolo:{" "}
                                <span className="font-mono">{protocolo}</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {status}
                              </p>
                            </div>

                            <div className="shrink-0 flex flex-col gap-2">
                              <Button
                                variant="outline"
                                className="h-8 px-2 text-xs"
                                onClick={() => {
                                  if (
                                    protocolo &&
                                    typeof navigator !== "undefined"
                                  ) {
                                    navigator.clipboard?.writeText(protocolo);
                                  }
                                }}
                                title="Copiar protocolo"
                              >
                                Copiar protocolo
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Nenhuma possível duplicata encontrada para esta ocorrência.
                </p>
              )}
            </>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPossibleDuplicateOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Modal de Histórico de alterações de endereço */}
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
