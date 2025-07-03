"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { useMediaQuery } from "@/hooks/use-media-query";
import ImgUsers from "@/assets/icons/imgUsers.svg";

import License from "@/assets/IconsReport/license.svg?react";
import AiImage from "@/assets/IconsReport/ai-image.svg?react";
import AiSearch from "@/assets/IconsReport/ai-search-02.svg?react";
import DocumentValidation from "@/assets/IconsReport/document-validation.svg?react";
import PieChart from "@/assets/IconsReport/pie-chart.svg?react";
import Code from "@/assets/IconsReport/code.svg?react";
import AiSearchAlt from "@/assets/IconsReport/ai-search.svg?react";
import Image02 from "@/assets/IconsReport/image-02.svg?react";
import Link01 from "@/assets/IconsReport/link-01.svg?react";
import Vector from "@/assets/IconsReport/Vector.svg?react";
import Voice from "@/assets/IconsReport/voice.svg?react";
import Zsh from "@/assets/IconsReport/zsh.svg?react";

export function Reports() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [showHint, setShowHint] = useState(true);
  const [message, setMessage] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [hasAsked, setHasAsked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (message.length > 0 && !hasAsked) {
      setHasAsked(true);
    }
  }, [message]);

  const handleSend = async () => {
    if (message.trim()) {
      setLastQuestion(message);
      setIsLoading(true);
      try {
        const res = await fetch("https://chatbot.mapsync.com.br/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: message }),
        });

        const data = await res.json();
        setResponse(data?.resposta || "Sem resposta.");
      } catch (error) {
        console.error("Erro ao enviar pergunta:", error);
        setResponse("Erro ao consultar o chatbot.");
      } finally {
        setIsLoading(false);
        setMessage("");
      }
    }
  };

  return (
    <div className="bg-[#EBEBEB] min-h-screen font-inter">
      <Sidebar />
      <main className="w-full px-6 sm:pl-[250px] max-w-full space-y-4 pt-6">
        <TopHeader />

        <section className="max-w-[1500px] w-full mx-auto bg-white rounded-xl p-2 flex flex-col xl:flex-row justify-between items-center gap-6 mt-4">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              <span className="font-semibold">Relatórios. </span>
              Nesta seção, você pode acessar, gerar e exportar relatórios
              personalizados com base nas suas atividades e monitoramentos.
              Visualize dados detalhados por período, filtros e categorias
              específicas, facilitando a análise e a tomada de decisões.
            </p>
          </div>
          <div className="flex-1 max-w-md w-full">
            <img
              src={ImgUsers}
              alt="Ilustração"
              className="w-full rounded-xl object-contain"
            />
          </div>
        </section>

        <section className="max-w-[1500px] w-full mx-auto bg-white rounded-xl p-6 mt-4">
          <h2 className="text-2xl font-semibold text-center text-gray-800">
            Bem-vindo à murb.ia
          </h2>
          <p className="text-sm text-gray-500 text-center mt-2 mb-6">
            Comece com uma pergunta para gerar um relatório e o chat cuidará do
            resto.
            <br />
            Não sabe por onde começar?
          </p>

          <div className="w-full min-h-[300px]">
            {!hasAsked ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Card 1 - Bairros */}
                <div className="flex flex-col gap-2 border rounded-xl p-4 hover:shadow-md transition">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: "#F9FAFC" }}
                  >
                    <License className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800">
                    Bairros
                  </h3>
                  <p className="text-xs text-gray-500">
                    Create compelling text for ads, emails, and more.
                  </p>
                </div>

                {/* Card 2 - Por Ocorrências */}
                <div className="flex flex-col gap-2 border rounded-xl p-4 hover:shadow-md transition">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: "#F9FAFC" }}
                  >
                    <AiImage className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800">
                    Por ocorrências
                  </h3>
                  <p className="text-xs text-gray-500">
                    Design custom visuals with AI.
                  </p>
                </div>

                {/* Card 3 - Research */}
                <div className="flex flex-col gap-2 border rounded-xl p-4 hover:shadow-md transition">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: "#F9FAFC" }}
                  >
                    <AiSearch className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800">
                    Research
                  </h3>
                  <p className="text-xs text-gray-500">
                    Quickly gather and summarize info.
                  </p>
                </div>

                {/* Card 4 - Generate Article */}
                <div className="flex flex-col gap-2 border rounded-xl p-4 hover:shadow-md transition">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: "#F9FAFC" }}
                  >
                    <DocumentValidation className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800">
                    Generate Article
                  </h3>
                  <p className="text-xs text-gray-500">
                    Write articles on any topic instantly.
                  </p>
                </div>

                {/* Card 5 - Data Analytics */}
                <div className="flex flex-col gap-2 border rounded-xl p-4 hover:shadow-md transition">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: "#F9FAFC" }}
                  >
                    <PieChart className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800">
                    Data Analytics
                  </h3>
                  <p className="text-xs text-gray-500">
                    Analyze data with AI-driven insights.
                  </p>
                </div>

                {/* Card 6 - Generate Code */}
                <div className="flex flex-col gap-2 border rounded-xl p-4 hover:shadow-md transition">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: "#F9FAFC" }}
                  >
                    <Code className="w-6 h-6 text-rose-500" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800">
                    Generate Code
                  </h3>
                  <p className="text-xs text-gray-500">
                    Produce accurate code fast.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#EBEBEB] min-h-[300px] p-6 rounded-xl flex flex-col gap-4 shadow-inner">
                {lastQuestion && (
                  <div className="self-end max-w-[75%] bg-[#D1D9FB] text-sm text-gray-800 p-3 rounded-xl rounded-tr-sm shadow">
                    {lastQuestion}
                  </div>
                )}

                <div className="self-start max-w-[75%] bg-white text-sm text-gray-800 p-3 rounded-xl rounded-tl-sm shadow">
                  {isLoading ? "..." : response}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            {showHint && (
              <div className="bg-[#EDF1FD] text-xs text-[#4F6BED] px-3 py-2 rounded-t-xl flex items-center justify-between">
                <span>
                  Ao selecionar um recurso, você alcançará seu objetivo
                  facilmente
                </span>
                <button
                  className="text-gray-400 hover:text-gray-600 text-sm"
                  onClick={() => setShowHint(false)}
                >
                  ✕
                </button>
              </div>
            )}

            <div
              className={`bg-white border ${
                showHint ? "border-t-0" : ""
              } rounded-b-xl px-4 py-3 flex flex-col gap-2 shadow-sm`}
            >
              <textarea
                placeholder="Escreva sua mensagem..."
                className="w-full resize-none outline-none text-sm text-gray-700 placeholder:text-gray-400 min-h-[60px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-gray-400">
                  <Image02 className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                  <Voice className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                  <Zsh className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                </div>

                <div className="flex gap-4 text-gray-400 items-center">
                  <Link01 className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                  <AiSearchAlt className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                  <button
                    onClick={handleSend}
                    className="text-[#7A83F6] hover:scale-105 transition-transform"
                  >
                    <Vector className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
