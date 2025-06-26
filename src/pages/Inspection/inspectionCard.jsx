import { format } from "date-fns";
import { Clock } from "lucide-react";

export function InspectionCard({ serviceorder }) {
  const occurrence = serviceorder.occurrence;

  const statusColors = {
    os_gerada: "bg-[#EFFBFF] text-[#33CFFF]",
    finalizado: "bg-[#DDF2EE] text-[#40C4AA]",
    em_analise: "bg-[#FFF6E0] text-[#FFBD4C]",
  };

  const statusLabel = {
    os_gerada: "Solicitado",
    finalizado: "Finalizado",
    em_analise: "Andamento",
  };

  const status = statusLabel[occurrence.status] || "Status";
  const statusClass =
    statusColors[occurrence.status] || "bg-gray-200 text-gray-600";

  const imageUrl =
    occurrence.photos?.initial?.[0] ||
    "https://via.placeholder.com/500x200.png?text=Sem+imagem";

  const timeline = {
    requested: occurrence.createdAt,
    accepted: serviceorder.createdAt,
    started: serviceorder.startedAt,
    finished: serviceorder.finishedAt,
  };
  

  return (
    <div className="bg-[#F7F7F7] rounded-xl shadow-sm overflow-hidden flex-shrink-0 w-full max-w-[525px] border border-gray-200 min-h-[650px] sm:min-h-[auto]">
      <div className="relative">
        <img
          src={imageUrl}
          alt="Imagem da ocorrência"
          className="h-[270px] w-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-white text-xs px-2 py-1 rounded shadow">
          Imagem 1/1
        </div>
      </div>

      <div className="flex justify-end p-2 border-b border-dotted border-gray-300 pb-4 mb-4">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass}`}
        >
          {status}
        </span>
      </div>

      <div className="px-4 pb-4 text-sm text-[#787891] grid grid-cols-12 gap-2 min-h-[400px] sm:min-h-[auto]">
        <div className="col-span-7 space-y-1">
          <p>
            <strong>O.S.:</strong> {serviceorder.protocolNumber}
          </p>
          <p>
            <strong>Zona:</strong> {occurrence.address?.zone || "—"}
          </p>
          <p>
            <strong>Setor:</strong> {occurrence.sector?.name || "—"}
          </p>
          <p>
            <strong>Enviado por:</strong> {occurrence.author?.name || "—"}
          </p>
          <p>
            <strong>Revisado por:</strong> {occurrence.approvedBy?.name || "—"}
          </p>
          <p>
            <strong>Bairro:</strong> {occurrence.address?.neighborhoodName || "—"}
          </p>
          <p>
            <strong>Endereço:</strong>{" "}
            {occurrence.address?.street}, {occurrence.address?.number}
          </p>
          <p>
            <strong>CEP:</strong> {occurrence.address?.zipCode}
          </p>
          <p>
            <strong>Longitude:</strong> {occurrence.address?.longitude}
          </p>
          <p>
            <strong>Latitude:</strong> {occurrence.address?.latitude}
          </p>
          <p>
            <strong>Ocorrência:</strong> {occurrence.type}
          </p>
        </div>

        <div className="col-span-5">
          {Object.entries(timeline).map(([key, date], i, arr) => (
            <div className="flex items-start gap-2 mb-3" key={i}>
              <div className="flex flex-col items-center">
                <div className="h-4 w-4 bg-[#33C083] rounded-full border border-white" />
                {arr[i + 1]?.[1] && (
                  <div className="h-8 border-l-2 border-dotted border-green-300" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold capitalize">
                  {
                    {
                      requested: "Solicitação",
                      accepted: "Aceito",
                      started: "Iniciado",
                      finished: "Finalizado",
                    }[key]
                  }
                </p>
                <p className="text-xs text-gray-600">
                  <Clock className="inline-block h-3 w-3 mr-1" />
                  {date ? format(new Date(date), "dd/MM/yy, HH:mm") : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
