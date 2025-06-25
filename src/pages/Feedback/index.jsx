import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Star } from "lucide-react";
import Mapa from "@/assets/Mapa.svg";
import Mapa2 from "@/assets/Mapa2.svg";
import NewLogo from "@/assets/icons/NewLogo.svg";
import Clip from "@/assets/icons/Clip.svg?react";
import Edit from "@/assets/icons/edit.svg?react";

export function Feedback() {
  const ratings = [5, 4, 3, 2, 1, 0];

  const renderStars = (count) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < count ? "text-black fill-black" : "text-gray-300"
        }`}
      />
    ));

  const renderStarsGold = (count) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));

  // Mock dos dados da avaliação final
  const mockRatingData = {
    average: 4.7,
    total: 38,
    comment:
      "Aplicativo simples, bonito e intuitivo. vale a pena. Uso a versão paga e é muito barato por um ano.",
    author: "Thiago Vila Nova",
    timeAgo: "Há 02 anos",
    scoreTitle: "Muito bom",
    scoreStars: 5,
  };

  return (
    <div className="bg-[#EBEBEB] min-h-screen font-inter">
      <Sidebar />
      <main className="w-full px-6 sm:pl-[250px] pt-6 space-y-4">
        <TopHeader />

        {/* 1. Cabeçalho com imagem */}
        <section className=" max-w-[1500px] w-full mx-auto bg-white rounded-xl p-2 flex flex-col xl:flex-row justify-between items-center gap-6 ">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              <span className="font-semibold">
                Informações pessoais e opções de gerenciamento.
              </span>{" "}
              Você poderá registrar sua opinião sobre os serviços prestados, de
              forma rápida e objetiva. A ideia é simples: queremos ouvir você
              para melhorar constantemente. Sua avaliação nos ajuda a entender o
              que está funcionando bem e onde podemos evoluir.
            </p>
          </div>
          <div className="flex-1 max-w-md w-full">
            <img
              src={Mapa}
              alt="Ilustração"
              className="w-full rounded-xl object-contain"
            />
          </div>
        </section>

        {/* 2. Sobre + contatos */}
        <section className="max-w-[1500px] mx-auto bg-[#F9F9F9] rounded-xl p-2 flex flex-row gap-2">
          {/* Coluna da logo */}
          <div className="w-[220px] bg-white rounded-xl flex items-center justify-center px-2 py-4">
            <img
              src={NewLogo}
              alt="Logo Neocity"
              className="w-[112px] h-[112px]"
            />
          </div>

          {/* Coluna do conteúdo e contatos */}
          <div className="flex-1 bg-white rounded-xl flex flex-col xl:flex-row justify-between p-4 gap-4 text-base text-zinc-800">
            {/* Texto do meio */}
            <div className="leading-relaxed xl:w-2/3">
              <p className="font-semibold mb-1">Sobre</p>
              <p>
                Sabemos o peso das decisões que você precisa tomar. São
                parceiros estratégicos que trabalham com você, entregando dados
                concretos, análises profundas e suporte em todas as etapas. O
                MapSync é a nossa plataforma SaaS e ERP, projetada para análise
                e monitoramento de vias públicas e privadas com foco em
                eficiência operacional e redução de custos. Através de um
                ecossistema robusto de coleta e processamento de dados.
              </p>
            </div>

            {/* Contatos */}
            <div className="flex flex-col items-center justify-center gap-4 text-base text-zinc-800">
              {/* Suporte */}
              <div className="flex items-center justify-between gap-4 w-full max-w-[220px]">
                <div className="text-right xl:text-left">
                  <p className="font-semibold">Suporte</p>
                  <p>suporte@neocity.com.br</p>
                </div>
                <Clip className="w-5 h-5 text-zinc-500" />
              </div>

              {/* Site */}
              <div className="flex items-center justify-between gap-4 w-full max-w-[220px]">
                <div className="text-right xl:text-left">
                  <p className="font-semibold">Site</p>
                  <p>www.neocity.com.br</p>
                </div>
                <Clip className="w-5 h-5 text-zinc-500" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Avaliações e segurança */}
        <section className="max-w-[1500px] mx-auto bg-[#F9F9F9] rounded-xl p-4">
          <div className="grid xl:grid-cols-2 gap-4">
            {/* Coluna da esquerda */}
            <div>
              <h3 className="font-semibold text-sm text-zinc-800 mb-2">
                Classificações e Avaliações
              </h3>
              <div className="space-y-3">
                {ratings.map((rate, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white px-4 h-20 rounded-xl shadow-sm"
                  >
                    <span className="text-sm text-zinc-800">
                      O fluxo de entrada de dados é compreensível?
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">{renderStars(rate)}</div>
                      <Edit className="w-4 h-4 text-zinc-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna da direita */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-sm text-zinc-800 mb-2">
                Altere sempre sua senha e a mantenha segura.{" "}
                <span className="font-bold">Última alteração 01/02/2025</span>
              </h3>

              {/* Imagem */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <img
                  src={Mapa2}
                  alt="Segurança"
                  className="w-full object-contain rounded-md"
                />
              </div>

              {/* Nota geral */}
              <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <p className="text-4xl font-bold text-[#4B4B62]">4,7</p>
                <p className="text-xs text-gray-500">de 5</p>
                <p className="text-xs text-gray-500 ml-auto">38 avaliações</p>
              </div>

              
              {/* Avaliação detalhada */}
              <div>
                <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold">Muito bom</p>
                      <div className="flex gap-1">{renderStarsGold(5)}</div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>Há 02 anos</p>
                      <p>Thiago Vila Nova</p>
                    </div>
                  </div>
                  <div className="border border-zinc-200 rounded-md p-3">
                    <p className="text-sm text-zinc-600">
                      Aplicativo simples, bonito e intuitivo. Vale a pena. Uso a
                      versão paga e é muito barato por um ano.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
