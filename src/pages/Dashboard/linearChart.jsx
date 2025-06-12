import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { api } from "@/services/api";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import Select from "react-select";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

const chartConfig = {
  occurrences: {
    label: "Ocorrências",
    color: "#5E56FF",
  },
};

const neighborhoods = [
  "Centro",
  "Getúlio_Vargas",
  "Cirurgia",
  "Pereira_Lobo",
  "Suíssa",
  "Salgado_Filho",
  "Treze_de_Julho",
  "Dezoito_do_Forte",
  "Palestina",
  "Santo_Antônio",
  "Industrial",
  "Santos_Dumont",
  "José_Conrado_de_Araújo",
  "Novo_Paraíso",
  "América",
  "Siqueira_Campos",
  "Soledade",
  "Lamarão",
  "Cidade_Nova",
  "Japãozinho",
  "Porto_Dantas",
  "Bugio",
  "Jardim_Centenário",
  "Olaria",
  "Capucho",
  "Jabotiana",
  "Ponto_Novo",
  "Luzia",
  "Grageru",
  "Jardins",
  "Inácio_Barbosa",
  "São_Conrado",
  "Farolândia",
  "Coroa_do_Meio",
  "Aeroporto",
  "Atalaia",
  "Santa_Maria",
  "Zona_de_Expansão",
  "São_José",
];

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function LinearChart() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState({
    value: neighborhoods[0],
    label: neighborhoods[0].replace(/_/g, " "),
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [percentageChange, setPercentageChange] = useState(0);

  const handleNeighborhoodChange = (selectedOption) => {
    setSelectedNeighborhood(selectedOption);
  };

  const neighborhoodOptions = neighborhoods.map((neighborhood) => ({
    value: neighborhood,
    label: neighborhood.replace(/_/g, " "),
  }));

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // Enviar o bairro selecionado para o backend
        const response = await api.post("/dashboard", {
          neighborhood: selectedNeighborhood.value,
        });

        if (response.data && response.data.success) {
          const backendData = response.data.data || [];

          // Usar a variação percentual calculada pelo backend
          const backendPercentageChange = response.data.percentageChange || 0;
          setPercentageChange(backendPercentageChange);

          // Transformar os dados do backend para o formato esperado pelo gráfico
          const formattedData = backendData.map((item) => {
            // Extrair mês e ano do formato YYYY-MM
            const [year, monthNum] = item.month.split("-");
            const monthIndex = Number.parseInt(monthNum) - 1; // Converter para índice 0-11

            return {
              month: monthNames[monthIndex],
              year: year,
              occurrences: (item.Land || 0) + (item.Air || 0), // Somar ocorrências terrestres e aéreas
              land: item.Land || 0,
              air: item.Air || 0,
            };
          });

          // Preencher meses faltantes com zeros
          const completeData = monthNames.map((month) => {
            const existingData = formattedData.find(
              (item) => item.month === month
            );
            return existingData || { month, occurrences: 0, land: 0, air: 0 };
          });

          setChartData(completeData);
        } else {
          console.error(
            "Erro ao carregar os dados: resposta inválida",
            response.data
          );
          setChartData([]);
          setPercentageChange(0);
        }
      } catch (error) {
        console.error("Erro ao buscar os dados do gráfico:", error);
        setChartData([]);
        setPercentageChange(0);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedNeighborhood.value]);

  const formatPercentageChange = (percentage) => {
    if (percentage > 0) {
      return (
        <>
          <span className="text-green-500">{percentage.toFixed(2)}%</span>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </>
      );
    } else if (percentage < 0) {
      return (
        <>
          <span className="text-red-500">
            {Math.abs(percentage).toFixed(2)}%
          </span>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </>
      );
    } else {
      return <span>Sem variação</span>;
    }
  };

  return (
    <Card className="flex flex-col w-full min-h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ocorrências por bairros</CardTitle>
          <CardDescription>Janeiro - Dezembro 2025</CardDescription>
        </div>
        <Select
          options={neighborhoodOptions}
          value={selectedNeighborhood}
          onChange={handleNeighborhoodChange}
          placeholder="Selecione um bairro"
          className="w-[180px]"
        />
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 text-center">Carregando dados...</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className=" h-[200px] w-[310px] sm:w-[310px] md:w-[430px] lg:w-[668px] xl:w-[700px] 2xl:w-[860px] mx-auto px-2"
          >
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)} // Exibe as 3 primeiras letras do mês
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="occurrences"
                type="linear"
                stroke="#5E56FF"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Variação do mês: {formatPercentageChange(percentageChange)}
        </div>
        <div className="leading-none text-muted-foreground">
          Mostra total de ocorrências por bairro no ano.
        </div>
      </CardFooter>
    </Card>
  );
}
