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
import { Pie, PieChart, Label } from "recharts";

export function SetorVsGeralChart({ setorName, setorTotal, totalGeral }) {
  const outras = totalGeral - setorTotal;

  const chartData = [
    {
      label: `Setor: ${setorName}`,
      quantidade: setorTotal,
      fill: "#5E56FF",
    },
    {
      label: "Outros Setores",
      quantidade: outras > 0 ? outras : 0,
      fill: "#CBD5E1",
    },
  ];

  const chartConfig = {
    quantidade: { label: "Quantidade" },
    [`Setor: ${setorName}`]: {
      label: `Setor: ${setorName}`,
      color: "#5E56FF",
    },
    "Outros Setores": {
      label: "Outros Setores",
      color: "#CBD5E1",
    },
  };

  return (
    <Card className="flex flex-col w-full min-h-[400px]">
      <CardHeader className="pb-0">
        <CardTitle>Distribuição Geral</CardTitle>
        <CardDescription>Comparativo: seu setor x demais</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="quantidade"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalGeral.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
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
        <div className="leading-none text-muted-foreground">
          Distribuição das ocorrências totais
        </div>
      </CardFooter>
    </Card>
  );
}
