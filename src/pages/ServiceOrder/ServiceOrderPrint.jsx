import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import logo from "@/assets/Isolation_Mode.png";

export function ServiceOrderPrint() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const storageKey = `print:order:${id}`;
  const storageOrder = (() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [order, setOrder] = useState(() => state?.order || storageOrder || null);
  const [loading, setLoading] = useState(!(state?.order || storageOrder));

  useEffect(() => {
    if (!state?.order && storageOrder) {
      setOrder(storageOrder);
      setLoading(false);
    } else if (state?.order) {
      setLoading(false);
    }
  }, [state?.order, storageOrder]);

  useEffect(() => {
    if (!loading && order) {
      const t = setTimeout(() => {
        try {
          window.print();
        } catch {}
      }, 400);
      return () => clearTimeout(t);
    }
  }, [loading, order]);

  const statusLabels = {
    em_analise: "Em análise",
    emergencial: "Emergencial",
    aprovada: "Aprovada",
    os_gerada: "O.S. gerada",
    aguardando_execucao: "Agendada",
    em_execucao: "Andamento",
    finalizada: "Finalizada",
    pendente: "Pendente",
    aceita: "Aceita",
    verificada: "Verificada",
    rejeitada: "Rejeitada",
  };
  const maskStatus = (raw) => {
    if (!raw) return "—";
    const key = String(raw).toLowerCase();
    return statusLabels[key] ?? raw;
  };

  const data = useMemo(() => {
    const o = order || {};
    const occurrence = o.occurrence || o?.raw?.occurrence || {};
    const address = occurrence.address || {};
    const startedAt = o.startedAt ? new Date(o.startedAt) : null;
    const finishedAt = o.finishedAt ? new Date(o.finishedAt) : null;

    const initialPath = occurrence?.photos?.initial?.[0];
    const photoUrl = initialPath
      ? `https://mapsync-media.s3.sa-east-1.amazonaws.com/${initialPath}`
      : null;

    return {
      osNumber: o.protocolNumber || o.protocol || "—",
      todayStr: new Date().toLocaleDateString("pt-BR"),
      nowTimeStr: new Date().toLocaleTimeString("pt-BR").slice(0, 5),

      authorName: occurrence?.author?.name || "—",
      sentBy: occurrence?.author?.name || "—",
      technician: o?.inspector?.name || "—",
      team: o?.team?.name || "—",

      responsible: occurrence?.approvedBy?.name || "—",
      foreman: o?.foreman?.name || "—",
      serviceNature: o?.serviceNature?.name || "—",
      statusMasked: maskStatus(o?.status),

      addressStreet: address?.street || "—",
      addressNumber: address?.number || "—",
      longitude: address?.longitude || "—",
      latitude: address?.latitude || "—",

      notes: occurrence?.description || "Sem anotações.",

      startedAtStr: startedAt ? startedAt.toLocaleDateString("pt-BR") : "—",
      finishedAtStr: finishedAt ? finishedAt.toLocaleDateString("pt-BR") : "—",

      photoUrl,
    };
  }, [order]);

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-neutral-700">Carregando O.S…</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-black text-white no-print"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 12mm;
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-neutral-100 print:bg-white py-6">
        <div className="no-print max-w-[210mm] mx-auto mb-4 flex gap-3 justify-end px-4">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-black text-white"
          >
            Imprimir
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-neutral-300"
          >
            Voltar
          </button>
        </div>

        <div className="bg-white max-w-[210mm] mx-auto p-0 text-[10pt] font-sans text-neutral-900" id="print-area">
          <div className="border border-neutral-300 rounded-lg">
            <div className="flex items-center justify-between px-5 pt-3 print:hidden">
              <span>MapSync - OS Nº {data.osNumber}</span>
              <span>
                {data.todayStr}, {data.nowTimeStr}
              </span>
            </div>

            <div className="border border-neutral-300 rounded-lg flex items-center justify-between px-5 py-3 mt-4 mb-3 mx-5">
              <img
                src={logo}
                alt="Logo"
                className="h-[31px] w-auto"
                style={{ maxWidth: 205 }}
              />
              <span className="text-[12pt] font-bold">OS {data.osNumber}</span>
            </div>
          </div>

          <div className="py-3 text-center">
            <div className="text-[14pt] font-bold leading-tight">
              Ordem de Serviço
            </div>
            <div className="text-[11pt]">
              ARACAJU - EMPRESA MUNICIPAL DE OBRAS E URBANIZACAO - EMURB
            </div>
          </div>

          <div className="border border-neutral-300 rounded-lg p-3 mx-2 flex gap-3 justify-between">
            <div className="w-[48%] space-y-1">
              <div className="border border-neutral-300 rounded-md px-2 py-1">
                Solicitado por: {data.authorName}
              </div>
              <div className="border border-neutral-300 rounded-md px-2 py-1">
                Enviado por: {data.sentBy}
              </div>
              <div className="border border-neutral-300 rounded-md px-2 py-1">
                Técnico: {data.technician}
              </div>
              <div className="border border-neutral-300 rounded-md px-2 py-1">
                Equipe: {data.team}
              </div>
            </div>

            <div className="w-[48%] space-y-1">
              <div className="border border-neutral-300 rounded-md px-2 py-1">
                Responsável: {data.responsible}
              </div>
              <div className="border border-neutral-300 rounded-md px-2 py-1">
                Encarregado: {data.foreman}
              </div>
              <div className="border border-neutral-300 rounded-md px-2 py-1">
                Natureza de Serviço: {data.serviceNature}
              </div>
              <div className="border border-neutral-300 rounded-md px-2 py-1">
                Status: {data.statusMasked}
              </div>
            </div>
          </div>

          <div className="border border-neutral-300 rounded-lg m-2 p-3">
            {data.photoUrl && (
              <img
                src={data.photoUrl}
                alt="Foto da OS"
                className="w-full h-[300px] object-cover border border-neutral-300 mb-2"
              />
            )}

            <div className="flex gap-2 justify-between">
              <div className="border border-neutral-300 rounded-md px-2 py-1 w-1/2">
                Endereço: {data.addressStreet}, {data.addressNumber}
              </div>
              <div className="border border-neutral-300 rounded-md px-2 py-1 w-1/4">
                Long.: {data.longitude}
              </div>
              <div className="border border-neutral-300 rounded-md px-2 py-1 w-1/4">
                Lat.: {data.latitude}
              </div>
            </div>
          </div>

          <div className="mx-2">
            <div className="font-bold mb-1">ANOTAÇÕES:</div>
            <div className="border border-neutral-300 rounded-lg min-h-[120px] px-3 py-2">
              {data.notes}
            </div>
          </div>

          <div className="flex justify-between px-2 mt-8">
            <div className="w-[45%] text-center">
              <div className="border-t border-black pt-1">
                <div>Responsável</div>
                <div>Iniciado em: {data.startedAtStr}</div>
              </div>
            </div>
            <div className="w-[45%] text-center">
              <div className="border-t border-black pt-1">
                <div>Responsável</div>
                <div>Concluído em: {data.finishedAtStr}</div>
              </div>
            </div>
          </div>

          <div className="h-6" />
        </div>
      </div>
    </>
  );
}
