// src/pages/Analysis/ExpandedRowAnalysis.jsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { api } from "@/services/api";
import { MediaMapSection } from "@/components/MediaMapSection";
import { AddressUpdateDialog } from "./AddressUpdateDialog";
import { useToast } from "@/hooks/use-toast";

// Radix Dialog (padrão que você já usa)
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

  // estado editável (select) — já existia
  const [editableNeighborhoodId, setEditableNeighborhoodId] = useState(
    occurrence.address?.neighborhoodId || ""
  );

  // estados “visuais” para refletir a mudança sem recarregar
  const [currentNeighborhoodId, setCurrentNeighborhoodId] = useState(
    occurrence.address?.neighborhoodId || ""
  );
  const [currentNeighborhoodName, setCurrentNeighborhoodName] = useState(
    occurrence.address?.neighborhoodName || "Não informado"
  );

  // endereço local (para atualizar rua/número sem reload)
  const [localAddress, setLocalAddress] = useState({
    street: occurrence.address?.street || "",
    number: occurrence.address?.number || "",
    city: occurrence.address?.city || "",
    state: occurrence.address?.state || "",
    zipCode: occurrence.address?.zipCode || "",
    latitude: occurrence.address?.latitude || "",
    longitude: occurrence.address?.longitude || "",
  });

  // estados do fluxo de salvar bairro
  const [updatingNeighborhood, setUpdatingNeighborhood] = useState(false);
  const [confirmNeighborhoodOpen, setConfirmNeighborhoodOpen] = useState(false);

  // histórico de endereço (bairro/rua/número)
  const [isAddressHistoryOpen, setIsAddressHistoryOpen] = useState(false);
  const [addressAudits, setAddressAudits] = useState([]);
  const [loadingAddressAudits, setLoadingAddressAudits] = useState(false);

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

        // A API pode retornar { audits: [...] } ou só [...]
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.audits || [];

        // interessa só o que mexe no endereço
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

  // exibição usa os estados locais (sem depender de reload)
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
  const regiao = localAddress.state || "Não informado";

  // abre modal de confirmação (sem alert)
  const openConfirmNeighborhood = () => {
    if (!editableNeighborhoodId) {
      toast({
        variant: "destructive",
        title: "Selecione um bairro",
        description: "Você precisa escolher um bairro antes de salvar.",
      });
      return;
    }
    if (editableNeighborhoodId === currentNeighborhoodId) {
      toast({
        title: "Nada para atualizar",
        description: "O bairro selecionado é o mesmo atual.",
      });
      return;
    }
    setConfirmNeighborhoodOpen(true);
  };

  // confirma no modal e salva de fato
  const handleConfirmSaveNeighborhood = async () => {
    try {
      setUpdatingNeighborhood(true);

      await api.patch(`/occurrences/${occurrence.id}/neighborhood`, {
        neighborhoodId: editableNeighborhoodId,
      });

      const newName =
        neighborhoods.find((n) => n.id === editableNeighborhoodId)?.name ||
        "Atualizado";

      setCurrentNeighborhoodId(editableNeighborhoodId);
      setCurrentNeighborhoodName(newName);

      toast({
        title: "Bairro atualizado",
        description: "A alteração foi salva com sucesso.",
      });

      setConfirmNeighborhoodOpen(false);

      // ✅ recarrega a página automaticamente após confirmar
      setTimeout(() => {
        window.location.reload();
        // alternativa com SPA: navigate(0) se você usa react-router-dom v6
        // navigate(0);
      }, 300);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar bairro",
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setUpdatingNeighborhood(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-[#F7F7F7] p-4 rounded-lg shadow-sm text-sm">
      {/* Coluna 1 - Informações */}
      <div className="flex flex-col justify-between space-y-4 h-full">
        <div className="space-y-1 text-[#787891]">
          <h3 className="font-semibold text-base mb-2 border-b pb-1">
            Informações sobre a ocorrência
          </h3>
          <p>
            <span className="text-gray-500 font-medium">Data:</span> {createdAt}
          </p>

          <div>
            <label className="text-sm text-[#787891] font-semibold mb-1 block">
              Local:
            </label>
            <button
              onClick={() => setIsAddressHistoryOpen(true)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-left bg-[#F8F8F8] hover:bg-gray-200 transition"
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
            <span className="text-gray-500 font-medium">Protocolo:</span>{" "}
            {occurrence.protocolNumber}
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
          {/* Setor responsável */}
          <div>
            <label className="font-semibold block mb-1 text-[#787891]">
              Setor responsável
            </label>
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

          {/* Bairro da ocorrência + botão salvar (sem borda/fundo branco) */}
          <div>
            <label className="font-semibold block mb-1 text-[#787891]">
              Bairro da ocorrência
            </label>

            <div className="flex gap-2">
              <select
                value={editableNeighborhoodId}
                onChange={(e) => setEditableNeighborhoodId(e.target.value)}
                className="w-full p-2 rounded h-[55px] text-[#787891] flex-1"
              >
                <option value="">Selecione o bairro</option>
                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>

              <Button
                className="h-[55px] px-4 bg-green-600 hover:bg-green-700 text-white"
                onClick={openConfirmNeighborhood}
                disabled={
                  updatingNeighborhood ||
                  !editableNeighborhoodId ||
                  editableNeighborhoodId === currentNeighborhoodId
                }
              >
                {updatingNeighborhood ? "Salvando..." : "Salvar"}
              </Button>
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
            </div>
          </div>

          {/* Classificação */}
          <div>
            <label className="font-semibold block mb-1 text-[#787891]">
              Classificação
            </label>
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

          {/* Anotações da ocorrência */}
          <div>
            <label className="font-semibold block mb-1">
              Anotações da ocorrência
            </label>
            <textarea
              rows={4}
              value={editableDescription}
              onChange={(e) => setEditableDescription(e.target.value)}
              className="w-full p-2 rounded min-h-[55px]"
              placeholder={occurrence.description}
            />
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

      {/* Modal de confirmação — padrão Radix */}
      <Dialog
        open={confirmNeighborhoodOpen}
        onOpenChange={setConfirmNeighborhoodOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar alteração de bairro</DialogTitle>
            <DialogDescription>
              Esta ocorrência passará a pertencer ao bairro{" "}
              <strong>
                {neighborhoods.find((n) => n.id === editableNeighborhoodId)
                  ?.name || "selecionado"}
              </strong>
              . Deseja continuar?
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
              onClick={handleConfirmSaveNeighborhood}
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
                // mapeia campo em rótulo legível
                const fieldLabel =
                  a.field === "address.neighborhoodId"
                    ? "Bairro"
                    : a.field === "address.street"
                    ? "Rua"
                    : a.field === "address.number"
                    ? "Número"
                    : a.field?.replace("address.", "") || "Endereço";

                // valores antigos/novos com fallback
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
