import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import card1 from '../../assets/card1.png';
import card2 from '../../assets/card2.png';
import card3 from '../../assets/card3.png';

export function TutorialCard() {
  const [emblaRef, embla] = useEmblaCarousel({ align: 'start', loop: true });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 bg-[#F7F7F7] rounded-2xl shadow-md relative">
      {/* Setas no mobile */}
      {embla && (
        <>
          <button
            onClick={() => embla.scrollPrev()}
            className="absolute md:hidden left-2 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => embla.scrollNext()}
            className="absolute md:hidden right-2 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Carrossel (uma única estrutura responsiva) */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 px-6">
          <div className="min-w-[85%] md:min-w-0 md:flex-1 flex flex-col items-center gap-4 text-center">
            <img src={card1} alt="" className="w-[200px]" />
            <h3 className="text-[16px] font-semibold">Customize sua rota</h3>
            <p className="text-sm text-gray-700 max-w-[200px]">
              Defina suas rotas fixas através do mapas e acompanhe com sua equipe de área.
            </p>
          </div>

          <div className="min-w-[85%] md:min-w-0 md:flex-1 flex flex-col items-center gap-4 text-center">
            <img src={card2} alt="" className="w-[200px]" />
            <h3 className="text-[16px] font-semibold">Defina os envolvidos</h3>
            <p className="text-sm text-gray-700 max-w-[200px]">
              Direcione as tarefas paras os pilotos e os fiscais de obras.
            </p>
          </div>

          <div className="min-w-[85%] md:min-w-0 md:flex-1 flex flex-col items-center gap-4 text-center">
            <img src={card3} alt="" className="w-[200px]" />
            <h3 className="text-[16px] font-semibold">Verifique todo o processo</h3>
            <p className="text-sm text-gray-700 max-w-[200px]">
              Visualize em tempo real a gestão situacional das atividades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
