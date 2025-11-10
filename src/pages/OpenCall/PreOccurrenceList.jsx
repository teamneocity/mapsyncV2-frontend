"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/services/api";
import { getInicials } from "@/lib/utils";

const typeLabels = {
  TAPA_BURACO: "Asfalto",
  AUSENCIA_DE_MEIO_FIO: "Ausência de meio fio",
  MEIO_FIO: "Meio fio",
  DESOBSTRUCAO: "Drenagem",
  LIMPA_FOSSA: "Limpa fossa",
};

export function PreOccurrenceList({ embedded = false }) {
  const [rows, setRows] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const { data } = await api.get("/pre-occurrences");
        const list = Array.isArray(data?.items) ? data.items : [];

        const normalized = list.map((r) => ({
          id: r.id,
          createdAt: r.createdAt,
          senderName: null,
          senderId: r.createdById,
          neighborhoodId: r.neighborhoodId,
          neighborhood: r.neighborhoodName || "—",
          address: {
            street: r.street || "",
            number: r.number || "",
            city: r.city || "",
            cep: r.cep || "",
            complement: r.complement || "",
          },
          verifiedAt: r.verifiedAt,
          verifiedById: r.verifiedById,
          type: r.type || "—",
          status: r.status || "aguardando",
          description: r.description || "",
          raw: r,
        }));

        if (mounted) setRows(normalized);
      } catch (e) {
        if (mounted) setErr("Erro ao carregar pré-ocorrências.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

const StatusBadge = ({ status }) => (
  <span
    className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
      border
      ${status === "aguardando"
        ? "border-[#9D0000] text-[#9D0000]"
        : status === "verificado"
        ? "border-green-500 text-green-600"
        : status === "recusado"
        ? "border-red-500 text-red-600"
        : "border-gray-400 text-gray-600"}
    `}
  >
    {status || "—"}
  </span>
);


  const containerCls = embedded ? "w-full" : "w-full mx-auto px-6";
  const headerWrapCls = embedded
    ? "bg-gray-200 text-gray-900 font-semibold rounded-xl px-4 py-4 border border-gray-200 mb-3 md:text-sm"
    : "bg-gray-200 text-gray-900 font-semibold rounded-xl px-4 py-5 border border-gray-200 mb-2 md:text-sm";

  const Header = () => (
    <div className={`hidden xl:block ${headerWrapCls}`}>
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-1">Data</div>
        <div className="col-span-2">Enviado por</div>
        <div className="col-span-2">Bairro</div>
        <div className="col-span-4">Endereço</div>
        <div className="col-span-2">Tipo</div>
        <div className="col-span-1 text-center">Status</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={containerCls}>
        <Header />
        <div className="space-y-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <div key={j} className="col-span-2 max-xl:col-span-12">
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className={containerCls}>
        <div className="border border-gray-200 rounded-xl bg-white">
          <div className="px-6 py-8 text-center">
            <div className="text-sm font-medium text-red-700">{err}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className={containerCls}>
        <div className="border border-dashed border-gray-300 rounded-xl bg-white">
          <div className="px-6 py-8 text-center">
            <div className="text-sm font-medium text-gray-700">
              Não há pré-ocorrências.
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Assim que surgirem novas solicitações, elas aparecerão aqui.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerCls}>
      <Header />
      <div className="space-y-1">
        {rows.map((occ) => {
          const addressLine = `${occ.address.street}${
            occ.address.number ? `, ${occ.address.number}` : ""
          }${occ.address.city ? ` - ${occ.address.city}` : ""}`;
          const senderDisplay =
            occ.senderName ||
            (occ.senderId ? `${occ.senderId.slice(0, 6)}…` : "—");

          return (
            <div
              key={occ.id}
              className={`${
                expanded === occ.id ? "bg-gray-50" : "bg-white"
              } border border-gray-200 rounded-xl overflow-hidden`}
            >
              <div
                className="hover:bg-gray-50 transition cursor-pointer"
                onClick={() => toggle(occ.id)}
              >
                {/* Mobile */}
                <div className="xl:hidden p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center mt-1">
                      {expanded === occ.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {occ.createdAt
                              ? format(new Date(occ.createdAt), "dd/MM/yy")
                              : "—"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {senderDisplay}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <StatusBadge status={occ.status} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Bairro
                          </span>
                          {occ.neighborhood}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Tipo
                          </span>
                          {typeLabels[occ.type] || occ.type || "—"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-gray-400 block">
                          Endereço
                        </span>
                        <div className="text-sm text-gray-700">
                          {addressLine || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden bg-[#FFE4E4] xl:block p-4">
                  <div className="grid grid-cols-12 gap-4 items-center text-gray-700">
                    <div className="col-span-1 flex items-center gap-2">
                      {expanded === occ.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm">
                        {occ.createdAt
                          ? format(new Date(occ.createdAt), "dd/MM/yy")
                          : "—"}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-sm truncate" title={senderDisplay}>
                        {senderDisplay || "—"}
                      </span>
                    </div>

                    <div className="col-span-2 text-sm truncate">
                      {occ.neighborhood}
                    </div>
                    <div className="col-span-4 text-sm truncate">
                      {addressLine || "—"}
                    </div>
                    <div className="col-span-2 text-sm truncate">
                      {typeLabels[occ.type] || occ.type || "—"}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <StatusBadge status={occ.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* === EXPANDIDO === */}
              {expanded === occ.id && (
                <div className="px-4 py-4 bg-[#FFE8E8] text-sm text-gray-700">
                
                  <div className="flex flex-col space-y-1">
                    <InfoItem label="Tipo">
                      {typeLabels[occ.type] || occ.type || "—"}
                    </InfoItem>
                    <InfoItem label="Data de criação">
                      {occ.createdAt
                        ? format(new Date(occ.createdAt), "dd/MM/yyyy HH:mm")
                        : "—"}
                    </InfoItem>
                    <InfoItem label="Enviado por">
                      {occ.senderId || "—"}
                    </InfoItem>
                     <InfoItem label="Cidade">
                      {occ.address.city || "—"}
                    </InfoItem>
                    <InfoItem label="Bairro">
                      {occ.neighborhood || "—"}
                    </InfoItem>
                    <InfoItem label="Rua">
                      {occ.address.street || "—"}
                    </InfoItem>         
                    <InfoItem label="CEP">{occ.address.cep || "—"}</InfoItem>
                    <InfoItem label="Número">
                      {occ.address.number || "—"}
                    </InfoItem>
                    <InfoItem label="Complemento">
                      {occ.address.complement || "—"}
                    </InfoItem>
                    {occ.description && (
                    <div className="mb-4 border border-gray-300 rounded-lg p-3 bg-white">
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Descrição : 
                      </div>
                      <div className="whitespace-pre-wrap">
                        {occ.description}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function InfoItem({ label, children }) {
  return (
    <div className="text-sm text-gray-800">
      <span className="font-semibold text-gray-600">{label}:</span>{" "}
      <span>{children}</span>
    </div>
  );
}
