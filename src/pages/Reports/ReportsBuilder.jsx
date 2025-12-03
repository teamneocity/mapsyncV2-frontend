// src/pages/Reports/ReportsBuilder.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Star from "@/assets/icons/Star.svg?react";
import ReportIcon from "@/assets/icons/ReportIcon.svg?react";
import NeighborhoodIcon from "@/assets/icons/NeighborhoodIcon.svg?react";
import FireIcon from "@/assets/icons/FireIcon.svg?react";

import { Send } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export default function ReportsBuilder() {
  const [, setParams] = useSearchParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState(null);

  function backToOverview() {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete("view");
      return p;
    });
  }

  // POST
  const invokeChatMutation = useMutation({
    mutationFn: async (userMessage) => {
      const response = await api.post("/chat-ai/chat/invoke", {
        message: userMessage,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (!data?.jobId) {
        setError("JobId não retornado pela API.");
        return;
      }

      setJobId(data.jobId);
      setError(null);
    },
    onError: () => {
      setError("Não foi possível enviar a mensagem no momento.");
    },
  });

  // GET
  const {
    data: jobData,
    error: jobQueryError,
    isFetching: isCheckingJob,
  } = useQuery({
    queryKey: ["chat-job", jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const response = await api.get(`/chat-ai/chat/jobs/${jobId}`);
      return response.data;
    },
    refetchInterval: jobId ? 2000 : false,
  });

  useEffect(() => {
    if (!jobData) return;

    const { status, result } = jobData;

    if (status === "completed") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result?.content ?? "Nenhuma resposta retornada.",
        },
      ]);

      setJobId(null);
      setError(null);
    }

    if (status === "failed" || status === "error") {
      setError("A IA não conseguiu gerar uma resposta.");
      setJobId(null);
    }
  }, [jobData]);

  useEffect(() => {
    if (!jobQueryError) return;
    setError("Erro ao consultar o status da resposta.");
    setJobId(null);
  }, [jobQueryError]);

  function handleSend() {
    const text = message.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);

    setMessage("");
    setError(null);
    invokeChatMutation.mutate(text);
  }

  const isLoading =
    invokeChatMutation.isPending || (jobId && isCheckingJob);

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-6">
        <div className="text-left">
          <h2 className="text-[32px] font-bold text-black">
            Resumo de indicadores operacionais
          </h2>

          <div className="flex items-center gap-1.5 text-[15px] text-zinc-400 -mt-1">
            <span>Consulta por IA</span>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-[64px] flex flex-col items-center leading-[1.15]">
            <Star className="w-12 h-12 text-yellow-400 animate-pulse mb-2" />
            <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              Comece a criar relatórios
            </span>
            <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 bg-clip-text text-transparent -mt-0">
              com mais transparência
            </span>
          </h1>

          <p className="text-zinc-500">
            Envie uma pergunta sobre seus indicadores operacionais
          </p>
        </div>
      </div>

      {/* Chat */}
      <div className="rounded-2xl border border-zinc-200 p-4 sm:p-5 flex flex-col gap-3 min-h-[260px]">
        {/* Área das mensagens */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 && (
            <p className="text-sm text-zinc-400">
              Nenhuma conversa ainda. Envie sua primeira pergunta.
            </p>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-900"
                }`}
              >
                <div className="text-[11px] font-semibold opacity-75 mb-0.5">
                  {msg.role === "user" ? "Você" : "Assistente IA"}
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-zinc-100 text-zinc-700 italic">
                Assistente IA está gerando uma resposta...
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-end gap-2 pt-2 border-t border-zinc-100">
          <textarea
            rows={2}
            placeholder="Digite sua pergunta…"
            className="flex-1 resize-none outline-none bg-transparent placeholder-zinc-400 text-zinc-900 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className={`h-[42px] px-4 rounded-2xl flex items-center gap-2 ${
              isLoading || !message.trim()
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            } text-white transition`}
          >
            <span>{isLoading ? "Enviando..." : "Enviar"}</span>
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cards  */}
      <div className="text-center text-zinc-400 text-lg">ou tente isso</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SuggestionCard
          icon={<FireIcon className="w-6 h-6 text-white" />}
          title="Mapa de calor"
          desc="Visualize concentrações de ocorrências por região"
        />
        <SuggestionCard
          icon={<NeighborhoodIcon className="w-6 h-6 text-white" />}
          title="Relatório por bairros"
          desc="Veja a distribuição de ocorrências entre bairros"
        />
        <SuggestionCard
          icon={<ReportIcon className="w-4 h-4 text-white" />}
          title="Relatórios operacionais"
          desc="Explore análises gerais dos serviços e operações"
        />
      </div>
    </div>
  );
}

function SuggestionCard({ icon, title, desc }) {
  return (
    <button
      className="text-left p-5 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition bg-gradient-to-br from-white to-zinc-50"
      type="button"
    >
      <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center mb-4">
        {icon}
      </div>

      <h3 className="font-semibold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500 mt-1">{desc}</p>

      <div className="mt-4">
        <span className="inline-flex items-center gap-2 text-sm text-zinc-700">
          Ver mais <span>→</span>
        </span>
      </div>
    </button>
  );
}
