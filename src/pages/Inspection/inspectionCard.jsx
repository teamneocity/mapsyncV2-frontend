import { format } from "date-fns";
import { Clock } from "lucide-react";

export function InspectionCard({ occurrence }) {
  const statusColors = {
    os_gerada: "bg-[#FFF4D6] text-[#FFC118]",
    finalizado: "bg-[#E3FBE8] text-[#18C36D]",
    em_analise: "bg-[#E2F4FF] text-[#009DFF]",
  };

  const statusLabel = {
    os_gerada: "Solicitado",
    finalizado: "Finalizado",
    em_analise: "Em Análise",
  };

  const status = statusLabel[occurrence.status] || "Status";
  const statusClass =
    statusColors[occurrence.status] || "bg-gray-200 text-gray-600";

  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0 
      w-[340px] sm:w-[380px] md:w-[420px] lg:w-[460px] xl:w-[500px] border border-gray-200"
    >
      <div className="relative">
        <img
          src={occurrence.imageUrl}
          alt="Imagem da ocorrência"
          className="h-[270px] w-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-white text-xs px-2 py-1 rounded shadow">
          Imagem 1/1
        </div>
      </div>

      <div className="flex justify-end p-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass}`}
        >
          {status}
        </span>
      </div>

      <div className="px-4 pb-4 text-sm text-gray-700 grid grid-cols-12 gap-2">
        <div className="col-span-7 space-y-1">
          <p>
            <strong>O.S.:</strong> {occurrence.osNumber}
          </p>
          <p>
            <strong>Zona:</strong> {occurrence.zone}
          </p>
          <p>
            <strong>Setor:</strong> {occurrence.sector}
          </p>
          <p>
            <strong>Enviado por:</strong> {occurrence.sentBy}
          </p>
          <p>
            <strong>Revisado por:</strong> {occurrence.reviewedBy}
          </p>
          <p>
            <strong>Bairro:</strong> {occurrence.neighborhood}
          </p>
          <p>
            <strong>Endereço:</strong> {occurrence.address}
          </p>
          <p>
            <strong>CEP:</strong> {occurrence.cep}
          </p>
          <p>
            <strong>Longitude:</strong> {occurrence.longitude}
          </p>
          <p>
            <strong>Altitude:</strong> {occurrence.altitude}
          </p>
          <p>
            <strong>Ocorrência:</strong> {occurrence.occurrenceType}
          </p>
        </div>

        <div className="col-span-5">
          {Object.entries(occurrence.timeline).map(([key, date], i, arr) => (
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
