import { Clock, MapPin, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export function Timeline({ timeline }) {
  // Encontra o último índice com data preenchida
  const lastIndexWithDate = timeline.reduce((acc, step, idx) => {
    return step.date ? idx : acc;
  }, -1);

  return (
    <div className="relative mt-6 pl-6">
      {/* Linha verde que termina no último status */}
      <div
        className="absolute left-2.5 w-[2px] bg-green-400"
        style={{
          top: "10px",
          height: `${lastIndexWithDate * 52}px`,
        }}
      />

      <ul className="space-y-6 relative z-10">
        {timeline.map((step, index) => {
          const isFinalStep = index === timeline.length - 1 && step.date;

          // Define ícone com base no status
          let icon;
          if (step.label === "Solicitação") {
            icon = <MapPin className="text-[#33C083] bg-[##C9F2E9]" size={12} />;
          } else if (step.label === "Finalizado" && step.date) {
            // Ícone cheque verde para "Finalizado"
            icon = <CheckCircle className="text-green-500 bg-[#C9F2E9]"  size={12} />;
          } else {
            // Pontinho verde para os intermediários
            icon = <div className="w-3 h-3 bg-[#C9F2E9] rounded-full" size={12} />;
          }

          return (
            <li key={index} className="relative flex gap-3 items-start">
              {/* Ponto com ícone */}
              <div className="absolute -left-6 top-1 bg-white z-10">
                <div className="w-5 h-5 rounded-full border-2 border-green-400 bg-white flex items-center justify-center">
                  {icon}
                </div>
              </div>

              {/* Informações */}
              <div className="ml-1">
                <div className="text-sm font-medium text-gray-700">
                  {step.label}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} />
                  {step.date
                    ? format(
                        new Date(step.date),
                        "EEE. dd 'de' MMM. yyyy, HH:mm"
                      )
                    : "—"}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
