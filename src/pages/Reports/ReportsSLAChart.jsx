import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { api } from "@/services/api";

const BASE_COLORS = ["#3B82F6", "#4ADE80", "#C084FC", "#4B5563"];

const formatHours = (hours) => {
  if (hours === null || hours === undefined) return { value: "N/A", unit: "" };
  const numHours = parseFloat(hours);

  if (numHours >= 24) {
    const days = Math.max(1, Math.round(numHours / 24));
    return { value: days, unit: `dia${days > 1 ? "s" : ""}` };
  }

  if (numHours > 1) {
    const h = Math.round(numHours);
    return { value: h, unit: "h" };
  }

  const minutes = Math.round(numHours * 60);
  if (minutes > 0) {
    return { value: minutes, unit: "min" };
  }

  return { value: "0", unit: "min" };
};

const SectorDropdown = ({ sectors, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedName =
    sectors.find((s) => s.id === selectedId)?.name || "Escolha por setor";

  return (
    <div className="relative inline-block text-left w-full h-[89px] sm:w-auto">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-[64px] items-center justify-between sm:justify-center w-full sm:w-auto rounded-md border border-gray-300 bg-white px-3 text-xs md:text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
      >
        <span className="truncate max-w-[180px] sm:max-w-[220px]">
          {selectedName}
        </span>

        <svg
          className="-mr-1 ml-2 h-5 w-5 hidden sm:block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1 max-h-60 overflow-y-auto">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                type="button"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  onSelect(sector.id);
                  setIsOpen(false);
                }}
              >
                {sector.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ReportsSLAChart({ className = "" }) {
  const [sectors, setSectors] = useState([]);
  const [selectedSectorId, setSelectedSectorId] = useState(null);
  const [slaData, setSlaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar setores
  useEffect(() => {
    async function fetchSectors() {
      try {
        const response = await api.get("/sectors/names");
        const sectorsList = response.data?.sectors || [];
        setSectors(sectorsList);

        if (sectorsList.length > 0 && !selectedSectorId) {
          setSelectedSectorId(sectorsList[0].id);
        }
      } catch (e) {
        console.error("Erro ao buscar setores:", e);
      }
    }
    fetchSectors();
  }, []);

  // Buscar métricas
  useEffect(() => {
    let ignore = false;

    async function fetchSlaMetrics() {
      if (!selectedSectorId) {
        setSlaData(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(
          `/metrics/sectors/${selectedSectorId}/sla-by-service-nature`
        );

        if (!ignore) setSlaData(response.data?.metrics || []);
      } catch (e) {
        setError("Erro ao carregar métricas de SLA.");
        setSlaData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSlaMetrics();
    return () => (ignore = true);
  }, [selectedSectorId]);

  const { chartData, cardMetrics } = useMemo(() => {
    if (!slaData || slaData.length === 0) {
      return { chartData: [], cardMetrics: [] };
    }

    const natureMap = new Map();

    slaData.forEach((item) => {
      const key = item.serviceNatureId || item.serviceNatureName;
      const current = natureMap.get(key);
      const totalOsItem = item.totalOs || 0;

      if (!current) {
        natureMap.set(key, {
          name: item.serviceNatureName,
          totalOs: totalOsItem,
        });
      } else {
        current.totalOs += totalOsItem;
      }
    });

    const chartData = Array.from(natureMap.values()).map((nature, index) => ({
      name: nature.name,
      value: nature.totalOs,
      itemStyle: { color: BASE_COLORS[index % BASE_COLORS.length] },
    }));

    // Cálculos ponderados
    const totalOs = slaData.reduce((sum, item) => sum + (item.totalOs || 0), 0);

    const safeTotalOs = totalOs || 1;

    const avg =
      slaData.reduce(
        (sum, item) => sum + (item.sla?.avgHours || 0) * (item.totalOs || 0),
        0
      ) / safeTotalOs;

    const p50 =
      slaData.reduce(
        (sum, item) => sum + (item.sla?.p50Hours || 0) * (item.totalOs || 0),
        0
      ) / safeTotalOs;

    const p90 =
      slaData.reduce(
        (sum, item) => sum + (item.sla?.p90Hours || 0) * (item.totalOs || 0),
        0
      ) / safeTotalOs;

    // Cards
    const cardMetrics = [
      {
        title: "Tempo médio de atendimento",
        label: "Média (SLA)",
        ...formatHours(avg),
        color: BASE_COLORS[0],
        description:
          "Tempo médio que as ordens de serviço levam para serem concluídas.",
      },
      {
        title: "Metade das OS concluídas até",
        label: "Mediana (P50)",
        ...formatHours(p50),
        color: BASE_COLORS[1],
        description: "P50: 50% das OS são concluídas em até esse tempo.",
      },
      {
        title: "90% das OS concluídas até",
        label: "Percentil 90 (P90)",
        ...formatHours(p90),
        color: BASE_COLORS[2],
        description: "P90: 90% das OS são concluídas até esse tempo.",
      },
      {
        title: "Total de ordens",
        label: "Total de OS",
        value: totalOs,
        unit: "",
        color: BASE_COLORS[3],
        description: "Quantidade total de ordens incluídas nessas métricas.",
      },
    ];

    return { chartData, cardMetrics };
  }, [slaData]);

  // Config do gráfico
  const option = useMemo(() => {
    const centerPosition = ["40%", "50%"];

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} OS ({d}%)",
      },
      legend: { show: false },
      series: [
        {
          type: "pie",
          radius: ["50%", "80%"],
          center: centerPosition,
          silent: true,
          data: [{ value: 1, itemStyle: { color: "#EBF3FE" } }],
          label: { show: false },
        },
        {
          name: "Tipos de serviços",
          type: "pie",
          radius: ["45%", "70%"],
          center: centerPosition,
          data: chartData,
          label: { show: false },
        },
      ],
    };
  }, [chartData]);

  // Estados
  if (loading)
    return (
      <div className="flex items-center justify-center h-full min-h-[388px]">
        Carregando dados de SLA...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-full min-h-[388px] text-red-600">
        {error}
      </div>
    );

  return (
    <div className={`w-full h-full min-h-[388px] ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-3">
        <h3 className="text-2xl md:text-2xl font-bold text-gray-900">SLA</h3>

        <SectorDropdown
          sectors={sectors}
          selectedId={selectedSectorId}
          onSelect={setSelectedSectorId}
        />
      </div>

      <div className="border-t border-neutral-200/70 mb-4" />

      {/* conteúdo */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-stretch w-full h-auto">
        {/* gráfico */}
        <div className="w-full md:w-1/2 lg:w-5/12 h-64 md:h-72 lg:h-80">
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
            notMerge
            lazyUpdate
          />
        </div>

        {/* cards */}
        <div className="w-full md:w-1/2 lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 px-1 md:px-2">
          {cardMetrics.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col justify-center"
              title={metric.description}
            >
              <div className="flex items-center mb-1">
                <div
                  className="w-[7px] h-8 mr-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: metric.color }}
                ></div>

                <span className="text-xs text-gray-500 leading-snug">
                  <span className="font-medium">{metric.label}</span>
                  {metric.title && (
                    <span className="ml-1 text-[11px] text-gray-400">
                      – {metric.title}
                    </span>
                  )}
                </span>
              </div>

              <div className="ml-4">
                <p className="text-xl md:text-2xl font-bold text-gray-900 leading-none">
                  {metric.value}
                </p>
                {metric.unit && (
                  <span className="text-xs text-gray-600">{metric.unit}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
