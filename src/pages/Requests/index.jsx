// src/pages/Requests/index.jsx
"use client";

// React e React Query
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Hooks customizados
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { useAnalysisNotification } from "@/hooks/useAnalysisNotification";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";

// Componentes locais
import { RequestsList } from "./RequestsList";

// Serviços e utilitários
import { api } from "@/services/api";

const typeLabels = {
  TAPA_BURACO: "Asfalto",
  LIMPA_FOSSA: "Limpa fossa",
  DESOBSTRUCAO: "Drenagem",
  MEIO_FIO: "Meio fio",
  AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
  TERRAPLANAGEM: "Terraplanagem",
  LOGRADOURO: "Logradouro",
  PAVIMENTACAO: "Pavimentação",
  DESOBSTRUCAO_CAMINHAO: "Desobstrução",
};

// Parte expandida, cria a ocorrencia a partir da solicitacao
function ExpandedCreateFromRequest({ item, onCreated }) {
  const { toast } = useToast();
  const [file, setFile] = useState(null);

  const [photoIdStr, setPhotoIdStr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false); 

  // campos editáveis (preenchidos com a solicitação)
  const [description, setDescription] = useState(item?.description || "");
  const [latitude, setLatitude] = useState(item?.latitude ?? "");
  const [longitude, setLongitude] = useState(item?.longitude ?? "");
  const [isEmergencial, setIsEmergencial] = useState(false);

  function toAttachmentIdString(data) {
    if (typeof data === "string") return data;
    return data?.attachmentId || data?.id || data?.fileId || "";
  }

  async function uploadAttachment(f) {
    const form = new FormData();
    form.append("file", f);

    const { data } = await api.post("/occurrences/attachments", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  async function handleUpload() {
    if (!file) {
      toast({ title: "Selecione uma imagem primeiro", variant: "destructive" });
      return;
    }
    try {
      setUploading(true);
      const resp = await uploadAttachment(file);
      const idStr = toAttachmentIdString(resp);

      if (!idStr) {
        throw new Error("Não foi possível identificar o ID do anexo.");
      }

      setPhotoIdStr(idStr);

      toast({
        title: "Imagem enviada",
        description: `Anexo vinculado (ID: ${idStr}).`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Falha ao enviar imagem",
        description: err?.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateOccurrence() {
    try {
      setCreating(true);

      if (latitude === "" || longitude === "") {
        throw new Error("Latitude e longitude são obrigatórias.");
      }

      const rawType = item?.type || "";

      const payload = {
        type: String(rawType).trim(),
        description: String(description || item?.description || "").trim(),
        street: item?.address?.street || item?.street || "",
        number: item?.address?.number || item?.number || "",
        zipCode: item?.address?.cep || item?.cep || "",
        neighborhoodId:
          item?.address?.neighborhoodId || item?.neighborhoodId || "",
        latitude: Number(latitude),
        longitude: Number(longitude),
        isEmergencial: Boolean(isEmergencial),
        ...(photoIdStr ? { initialPhotosUrls: [photoIdStr] } : {}),
      };

      if (!payload.type) throw new Error("Selecione/ajuste o tipo.");
      if (!payload.street) throw new Error("Endereço (rua) é obrigatório.");
      if (!payload.neighborhoodId)
        throw new Error("Bairro é obrigatório (neighborhoodId).");

      // cria a ocorrência
      await api.post("/occurrences/employee", payload);

      // marca a pré-ocorrência como registrada
      try {
        await api.patch("/pre-occurrences/status", {
          preOccurrenceId: item?.id,
          action: "register",
        });
      } catch (markErr) {
        console.error("Falha ao registrar pré-ocorrência:", markErr);
        toast({
          title: "Ocorrência criada, mas…",
          description:
            "Não foi possível atualizar o status da solicitação para 'registrado'.",
          variant: "destructive",
        });
      }

      toast({
        title: "Ocorrência criada",
        description: "A solicitação foi convertida e registrada com sucesso.",
      });
      onCreated?.();
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao criar ocorrência",
        description: err?.message || "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  // cancelar / recusar pré-ocorrência em pré-análise
  async function handleCancelPreOccurrence() {
    if (!item?.id) return;

    if (item?.status !== "aguardando") {
      toast({
        title: "Não é possível cancelar",
        description: "Só é possível cancelar solicitações em pré-análise.",
        variant: "destructive",
      });
      setShowCancelModal(false);
      return;
    }

    try {
      setCanceling(true);

      await api.patch("/pre-occurrences/status", {
        preOccurrenceId: item.id,
        action: "cancel",
      });

      toast({
        title: "Pré-ocorrência cancelada",
        description: "A solicitação foi recusada com sucesso.",
      });

      setShowCancelModal(false);
      onCreated?.();
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao cancelar pré-ocorrência",
        description: err?.message || "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border p-4 mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div>
            <label className="text-xs text-zinc-500">Rua</label>
            <input
              readOnly
              value={item?.address?.street || item?.street || ""}
              className="w-full rounded-lg border px-3 py-2 bg-zinc-50 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-500">Número</label>
              <input
                readOnly
                value={item?.address?.number || item?.number || ""}
                className="w-full rounded-lg border px-3 py-2 bg-zinc-50 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">CEP</label>
              <input
                readOnly
                value={item?.address?.cep || item?.cep || ""}
                className="w-full rounded-lg border px-3 py-2 bg-zinc-50 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-500">Bairro (nome)</label>
              <input
                readOnly
                value={
                  item?.address?.neighborhood || item?.neighborhoodName || ""
                }
                className="w-full rounded-lg border px-3 py-2 bg-zinc-50 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Campos editaveis */}
        <div className="space-y-2">
          <div>
            <label className="text-xs text-zinc-500">Tipo</label>
            <input
              readOnly
              value={typeLabels[item?.type] || item?.type || ""}
              className="w-full rounded-lg border px-3 py-2 bg-zinc-50 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Descreva o problema"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-500">Latitude</label>
              <input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Ex.: -10.94"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Longitude</label>
              <input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Ex.: -37.07"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 mt-1 select-none">
            <input
              type="checkbox"
              checked={isEmergencial}
              onChange={(e) => setIsEmergencial(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-zinc-700">Emergencial</span>
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500">Foto inicial</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:px-3 file:py-1.5 file:bg-white file:hover:bg-zinc-50 file:text-zinc-700 file:border-zinc-300"
            />

            {photoIdStr ? (
              <p className="text-xs text-emerald-700 mt-1">
                Anexo enviado. ID:{" "}
                <span className="font-mono">{photoIdStr}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="mt-2 w-full h-[64px] rounded-lg bg-[#C8ECFF] text-blue-500 text-sm px-3 py-2 disabled:opacity-60"
              >
                {uploading ? "Enviando..." : "Enviar imagem"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleCreateOccurrence}
            disabled={creating}
            className="w-full h-[64px] rounded-lg bg-[#C9F2E9] text-green-700 text-sm px-3 py-2 hover:bg-green-300 disabled:opacity-60"
          >
            {creating ? "Criando..." : "Criar ocorrência"}
          </button>

          {item?.status === "aguardando" && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              disabled={canceling}
              className="w-full h-[64px] rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 hover:bg-red-100 disabled:opacity-60"
            >
              {canceling ? "Cancelando..." : "Recusar pré-ocorrência"}
            </button>
          )}

          <p className="text-[11px] text-zinc-500">
            Obs.: se não enviar foto, a ocorrência será criada sem foto inicial
          </p>
        </div>
      </div>

      {/* Modal de confirmação de recusa */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Recusar pré-ocorrência
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja recusar esta pré-ocorrência? Essa ação irá
              alterar o status para <span className="font-semibold">cancelado</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={canceling}
                className="flex-1 h-10 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleCancelPreOccurrence}
                disabled={canceling}
                className="flex-1 h-10 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {canceling ? "Cancelando..." : "Confirmar recusa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Busca as solicitações
async function fetchRequests({ queryKey }) {
  const [
    _key,
    { page, searchTerm, filterRecent, filterType, filterNeighborhood },
  ] = queryKey;

  const order =
    filterRecent === "oldest" || filterRecent === "asc" ? "asc" : "desc";

  const params = {
    page,
    street: searchTerm || undefined,
    neighborhoodId: filterNeighborhood || undefined,
    type: filterType || undefined,
    order,
  };

  const { data } = await api.get("/pre-occurrences", { params });

  const raw = Array.isArray(data.items) ? data.items : [];

  const list = raw.map((it) => ({
    id: it.id,
    createdAt: it.createdAt,
    sentBy: {
      id: it.createdById,
      name: it.createdByName,
      email: it.createdByEmail,
    },
    address: {
      street: it.street,
      number: it.number,
      complement: it.complement,
      neighborhood: it.neighborhoodName,
      neighborhoodId: it.neighborhoodId,
      city: it.city,
      cep: it.cep,
    },
    type: it.type,
    description: it.description,
    status: it.status,
    latitude: it.latitude ?? null,
    longitude: it.longitude ?? null,
  }));

  return {
    list,
    page: data.page ?? page ?? 1,
    totalPages: data.totalPages ?? data.total_pages ?? 1,
  };
}

function useRequests({
  page,
  searchTerm,
  filterRecent,
  filterType,
  filterNeighborhood,
  toast,
}) {
  return useQuery({
    queryKey: [
      "requests",
      {
        page,
        searchTerm,
        filterRecent,
        filterType,
        filterNeighborhood,
      },
    ],
    queryFn: fetchRequests,
    keepPreviousData: true,
    onError: (error) => {
      console.error("Erro ao buscar solicitações:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar solicitações",
        description: error.message,
      });
    },
  });
}

export function Requests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // helper para recarregar a lista via React Query
  function refetchRequests() {
    queryClient.invalidateQueries({ queryKey: ["requests"] });
  }

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRecent, setFilterRecent] = useState("recent");
  const [filterType, setFilterType] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [filterNeighborhood, setFilterNeighborhood] = useState(null);

  const { currentCount, lastSeenCount, markAsSeen } = useAnalysisNotification({
    userId: user?.id,
  });

  useEffect(() => {
    if (typeof currentCount === "number" && currentCount >= 0) {
      if (lastSeenCount !== currentCount) markAsSeen();
    }
  }, [currentCount, lastSeenCount, markAsSeen]);

  // busca da lista via React Query
  const { data, isLoading } = useRequests({
    page: currentPage,
    searchTerm,
    filterRecent,
    filterType,
    filterNeighborhood,
    toast,
  });

  const items = data?.list ?? [];
  const totalPages = data?.totalPages ?? 1;
  const effectivePage = data?.page ?? currentPage;

  const handleToggleDateOrder = (order) => {
    const normalized =
      order === "oldest" || order === "asc"
        ? "asc"
        : order === "desc"
        ? "desc"
        : "recent";
    setFilterRecent(normalized);
    setCurrentPage(1);
  };

  const handleApplyFiltersClick = () => {
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />

      <div className="px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:hidden">
          Solicitações
        </h1>
        <Filters
          title="Solicitações"
          subtitle="de serviços"
          onSearch={(input) => {
            setSearchTerm(input);
            setCurrentPage(1);
          }}
          onFilterType={(type) => {
            setFilterType(type);
            setCurrentPage(1);
          }}
          onFilterRecent={(order) => {
            setFilterRecent(order);
            setCurrentPage(1);
          }}
          onFilterNeighborhood={(neighborhood) => {
            setFilterNeighborhood(neighborhood);
            setCurrentPage(1);
          }}
          onFilterDateRange={(range) => {
            setFilterDateRange(range);
            setCurrentPage(1);
          }}
          handleApplyFilters={handleApplyFiltersClick}
          showStatus={false}
        />
      </div>

      <RequestsList
        items={items}
        dateOrder={filterRecent}
        onToggleDateOrder={handleToggleDateOrder}
        renderExpandedRow={(row) => (
          <ExpandedCreateFromRequest item={row} onCreated={refetchRequests} />
        )}
      />

      <footer className="bg-[#EBEBEB] p-4 mt-auto">
        <div className="max-w-full mx-auto">
          <Pagination
            currentPage={effectivePage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </footer>
    </div>
  );
}
