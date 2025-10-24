// src/pages/Reports/ReportsBuilder.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import Star from "@/assets/icons/Star.svg?react";
import ReportIcon from "@/assets/icons/ReportIcon.svg?react";
import NeighborhoodIcon from "@/assets/icons/NeighborhoodIcon.svg?react";
import FireIcon from "@/assets/icons/FireIcon.svg?react";

import { Mic, Send, Image, Paperclip } from "lucide-react";

export default function ReportsBuilder() {
  const [, setParams] = useSearchParams();

  function backToOverview() {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete("view");
      return p;
    });
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-6">
        <div className="text-left">
          <h2 className="text-[32px] font-bold text-black">
            Resumo de indicadores operacionais
          </h2>

          <div className="flex items-center gap-1.5 text-[15px] text-zinc-400 -mt-0.5">
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
            Por favor, conte-me como está o seu negócio
          </p>
        </div>
      </div>

      {/* input */}
      <div className="rounded-2xl border border-zinc-200 p-4 sm:p-5 flex flex-col justify-between gap-4 relative">
        <textarea
          rows={6}
          maxLength={200}
          placeholder="Escreva o tipo de relatório que você deseja"
          className="flex-1 resize-none outline-none bg-transparent placeholder-zinc-400 text-zinc-900"
        />

        {/* Ações */}
        <div className="flex items-center justify-between">
          {/* lado esquerdo */}
          <div className="flex items-center gap-2">
            <button
              className="h-[42px] px-3 rounded-3xl border border-zinc-200 hover:bg-zinc-50"
              title="Anexar imagem"
            >
              <Paperclip className="w-5 h-5 text-black" />
            </button>
            <button
              className="h-[42px] px-3 rounded-3xl border border-zinc-200 hover:bg-zinc-50"
              title="Anexar arquivo"
            >
              <Image className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* lado direito */}
          <div className="flex items-center gap-2">
            <button
              className="h-[42px] px-3 rounded-3xl border border-zinc-200 hover:bg-zinc-50"
              title="Gravar áudio"
            >
              <Mic className="w-5 h-5 text-black" />
            </button>
            <button className="h-[42px] px-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
              <span>Enviar</span>
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="text-center text-zinc-400 text-lg">ou tente isso</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SuggestionCard
          icon={<FireIcon className="w-6 h-6 text-white" />}
          title="Mapa de calor"
          desc="Entenda qual região necessita da sua maior atenção por mapas de calor"
          onClick={() => console.log("#MAPA")}
        />
        <SuggestionCard
          icon={<NeighborhoodIcon className="w-6 h-6 text-white" />}
          title="Relatório por bairros"
          desc="Resolva situações conhecendo as ocorrências de cada bairro"
          onClick={() => console.log("bairros")}
        />
        <SuggestionCard
          icon={<ReportIcon className="w-4 h-4 text-white" />}
          title="Relatório detalhado"
          desc="Defina o relatório que deseja: sintético, fotográfico ou com gráfico"
          onClick={() => console.log("detalhado")}
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={backToOverview}
          className="text-sm text-zinc-500 hover:text-zinc-700 underline"
        >
          Voltar para overview
        </button>
      </div>
    </div>
  );
}

function SuggestionCard({ icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-5 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition bg-gradient-to-br from-white to-zinc-50"
    >
      <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center mb-4">
        {icon}
      </div>

      <h3 className="font-semibold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500 mt-1">{desc}</p>

      <div className="mt-4">
        <span className="inline-flex items-center gap-2 text-sm text-zinc-700">
          Solicitar <span>→</span>
        </span>
      </div>
    </button>
  );
}
