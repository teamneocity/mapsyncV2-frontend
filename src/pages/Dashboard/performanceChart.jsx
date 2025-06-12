import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";

const chartConfig = {
  quantidade: {
    label: "Quantidade",
  },
  Pendente: {
    label: "Pendente",
    color: "#FF8C00",
  },
  Resolvido: {
    label: "Resolvido",
    color: "#9654F4",
  },
  EmAnalise: {
    label: "Em Análise",
    color: "#3a86ff",
  },
  EmAndamento: {
    label: "Em Andamento",
    color: "#dfeb34",
  },
  EmFila: {
    label: "Em Fila",
    color: "#ef233c",
  },
};

export function PerformanceChart({ occurrences, underReview, resolved, pending, inProgress, inQueue }) {
  const chartData = [
    { status: "Em Análise", quantidade: underReview, fill: "#3a86ff" },
    { status: "Resolvidas", quantidade: resolved, fill: "#9654F4" },
    { status: "Pendente", quantidade: pending, fill: "#FF8C00	" },
    { status: "Em Progresso", quantidade: inProgress, fill: "#dfeb34" }, 
    { status: "EmFila", quantidade: inQueue, fill: "#ef233c" },
  ];
  const totalOcorrencias = occurrences;

  return (
     <Card className="flex flex-col w-full min-h-[400px]">


      <CardHeader className=" pb-0">
        <CardTitle>Status das Ocorrências</CardTitle>
        <CardDescription>Visão Geral</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto h-[210px] w-full max-w-[300px]">

          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="quantidade"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalOcorrencias.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">Distribuição das ocorrências por status</div>
      </CardFooter>
    </Card>
  );
}