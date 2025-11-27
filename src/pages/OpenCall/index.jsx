"use client";

import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import MapaCall from "@/assets/MapaCall.svg";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import { PreOccurrenceList } from "./PreOccurrenceList";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import CallDrone from "@/assets/icons/CallDrone.svg?react";
import CallTerra from "@/assets/icons/CallTerra.svg?react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { he } from "date-fns/locale";

export function OpenCall() {
  const { toast } = useToast();
  const [mode, setMode] = useState("terrestre");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [neighborhoods, setNeighborhoods] = useState([]);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [neighborhoodQuery, setNeighborhoodQuery] = useState("");

  const [typeStats, setTypeStats] = useState([]);

  // estilo botão
  const btnBase =
    "group h-28 w-full rounded-2xl flex flex-col items-center justify-center gap-3 transition";
  const btnActive = "bg-[#ECEFF6] border-2 border-[#2E6EFF] shadow-sm";
  const btnIdle = "bg-[#F1F1F1] border border-zinc-300 hover:border-[#C7D0EA]";
  const iconCls = "w-11 h-11 text-[#7A7F99]";
  const labelCls = "text-sm text-[#7A7F99]";

  const [form, setForm] = useState({
    // terrestre
    description: "",
    type: "",
    street: "",
    number: "",
    complement: "",
    neighborhoodId: "",
    cep: "",
    // aéreo
    zipCode: "",
    isEmergency: false,
    verificationDate: "",
    verificationTime: "",
    latitude: "",
    longitude: "",
    observation: "",
  });

  // CEP
  function formatCep(value) {
    const digits = (value || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  function handleCepChange(field, rawValue) {
    const digits = (rawValue || "").replace(/\D/g, "").slice(0, 8);
    setField(field, digits);
  }

  function getCepOrDefault(raw) {
    const digits = (raw || "").replace(/\D/g, "");
    // se vazio ou só zeros usa CEP geral de Aracaju
    if (!digits || /^0+$/.test(digits)) {
      return { digits: "49025330", usedDefault: true };
    }
    if (digits.length !== 8) {
      return { digits: null, usedDefault: false };
    }
    return { digits, usedDefault: false };
  }

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        const res = await api.get("/neighborhoods");
        setNeighborhoods(res?.data?.neighborhoods || []);
      } catch (err) {
        console.error("Erro ao buscar bairros:", err);
      }
    }
    fetchNeighborhoods();
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const { data } = await api.get("/pre-occurrences");
        const items = Array.isArray(data?.items) ? data.items : [];

        // conta por type
        const counts = {};
        for (const it of items) {
          const t = String(it?.type || "");
          if (!t || EXCLUDED_TYPES.has(t)) continue;
          counts[t] = (counts[t] || 0) + 1;
        }

        // garante todos os tipos (com 0 se não veio)
        const allTypes = Object.keys(TYPE_LABELS);
        const rows = allTypes
          .filter((t) => !EXCLUDED_TYPES.has(t))
          .map((type) => ({
            type,
            label: TYPE_LABELS[type] || type,
            count: counts[type] || 0,
          }))
          .sort((a, b) => b.count - a.count);

        if (alive) setTypeStats(rows);
      } catch (err) {
        console.error("Erro ao carregar stats de tipos:", err);
        if (alive) setTypeStats([]);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const filteredNeighborhoods = useMemo(() => {
    const q = (neighborhoodQuery || "").trim().toLowerCase();
    if (!q) return neighborhoods;
    return neighborhoods.filter((n) => n.name?.toLowerCase().includes(q));
  }, [neighborhoods, neighborhoodQuery]);

  const TYPE_LABELS = {
    TAPA_BURACO: "Asfalto",
    LIMPA_FOSSA: "Limpa fossa",
    DESOBSTRUCAO: "Drenagem",
    TERRAPLANAGEM: "Terraplanagem",
    LOGRADOURO: "Logradouro",
  };

  // remover do gráfico
  const EXCLUDED_TYPES = new Set(["MEIO_FIO", "AUSENCIA_DE_MEIO_FIO"]);

  const BAR_COLORS = ["#8CC2FF", "#2E6EFF", "#4B66FF", "#1138FF", "#15299B"];

  const chartConfig = {
    count: {
      label: "Solicitações",
    },
  };

  const chartData = useMemo(
    () =>
      typeStats.map((item, idx) => ({
        label: item.label,
        count: item.count,
        fill:
          item.count === 0 ? "#E4E4E7" : BAR_COLORS[idx % BAR_COLORS.length],
      })),
    [typeStats]
  );

  function buildISO(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const d = new Date(`${dateStr}T${timeStr}:00`);
    return isNaN(d) ? null : d.toISOString();
  }

  async function handleSubmit() {
    try {
      setIsSubmitting(true);

      if (mode === "terrestre") {
        // validação do tipo terrestre
        const hasValidTerrestrialType = TYPE_OPTIONS.some(
          (opt) => opt.value === form.type
        );

        if (!hasValidTerrestrialType) {
          toast({
            title: "Tipo obrigatório",
            description: "Selecione o tipo da ocorrência terrestre.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const { digits: cepDigits, usedDefault } = getCepOrDefault(form.cep);

        if (!cepDigits) {
          toast({
            title: "CEP inválido",
            description: "O CEP deve conter exatamente 8 dígitos.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        if (usedDefault) {
          setField("cep", cepDigits);
          toast({
            title: "CEP ajustado",
            description:
              "CEP não informado ou inválido. Usando o CEP geral de Aracaju: 49025-330.",
          });
        }

        const body = {
          description: form.description.trim(),
          type: form.type,
          street: form.street.trim(),
          number: form.number.trim(),
          complement: form.complement.trim(),
          neighborhoodId: form.neighborhoodId,
          cep: cepDigits,
        };

        console.log("[Terrestre] payload /pre-occurrences:", body);

        await api.post("/pre-occurrences", body);
        toast({
          title: "Pré-ocorrência criada!",
          description: "Terrestre enviada ",
        });
      } else {
        // validação do tipo aéreo
        const validAerialTypes = ["mapeamento", "metragem", "comunicacao"];
        if (!validAerialTypes.includes(form.type)) {
          toast({
            title: "Tipo obrigatório",
            description: "Selecione o tipo do mapeamento aéreo.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const { digits: zipDigits, usedDefault } = getCepOrDefault(
          form.zipCode
        );

        if (!zipDigits) {
          toast({
            title: "CEP inválido",
            description: "O CEP deve conter exatamente 8 dígitos.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        // formata para XXXXX-XXX
        const formattedZip =
          zipDigits.length === 8
            ? `${zipDigits.slice(0, 5)}-${zipDigits.slice(5)}`
            : zipDigits;

        if (usedDefault) {
          setField("zipCode", zipDigits);
          toast({
            title: "CEP ajustado",
            description:
              "CEP não informado ou inválido. Usando o CEP geral de Aracaju: 49025-330.",
          });
        }

        const timeToBeVerified =
          form.type === "comunicacao"
            ? buildISO(form.verificationDate, form.verificationTime)
            : null;

        const body = {
          type: form.type,
          street: form.street.trim(),
          zipCode: formattedZip,
          isEmergency: !!form.isEmergency,
          timeToBeVerified,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
          neighborhoodId: form.neighborhoodId,
          observation: form.observation.trim(),
        };

        console.log("[Aéreo] payload /aerial-inspections:", body);

        // gambiarra controlada pro 500 que cria mas responde errado
        try {
          await api.post("/aerial-inspections", body);

          toast({
            title: "Inspeção aérea criada!",
            description: "Aéreo enviada ",
          });
        } catch (err) {
          console.error(
            "Erro ao enviar /aerial-inspections:",
            err?.response || err
          );

          const status = err?.response?.status;

          if (status === 500) {
            // sabemos que ele está criando mesmo assim
            toast({
              title: "Inspeção possivelmente criada",
              description:
                "O servidor retornou erro interno (500), mas a inspeção pode ter sido registrada. Verifique na listagem.",
            });
            // não dou return aqui pra deixar o fluxo seguir (resetar form etc.)
          } else {
            toast({
              title: "Erro ao enviar",
              description:
                err?.response?.data?.message ||
                "Verifique os campos e tente novamente.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
        }
      }

      handleReset();
    } catch (e) {
      console.error("Erro ao enviar chamada:", e?.response || e);

      toast({
        title: "Erro ao enviar",
        description:
          e?.response?.data?.message ||
          "Verifique os campos e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setForm({
      description: "",
      type: "",
      street: "",
      number: "",
      complement: "",
      neighborhoodId: "",
      cep: "",
      zipCode: "",
      isEmergency: false,
      verificationDate: "",
      verificationTime: "",
      latitude: "",
      longitude: "",
      observation: "",
    });
  }

  const TYPE_OPTIONS = [
    { value: "TAPA_BURACO", label: "Asfalto" },
    { value: "LIMPA_FOSSA", label: "Limpa Fossa" },
    { value: "DESOBSTRUCAO", label: "Drenagem" },
    { value: "TERRAPLANAGEM", label: "Terraplanagem" },
    { value: "LOGRADOURO", label: "Logradouro" },
    { value: "DESOBSTRUCAO_CAMINHAO", label: "Desobstrução" },
  ];

  return (
    <div className="bg-[#EBEBEB] min-h-screen font-inter">
      <Sidebar />
      <main className="w-full px-6 sm:pl-[250px] max-w-full space-y-2 pt-2">
        <TopHeader />

        {/* header */}
        <section className="max-w-[1500px] w-full bg-white rounded-xl p-3 mx-auto flex flex-col xl:flex-row items-center justify-center text-center xl:text-left gap-8">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              <span className="font-semibold">Abrir Chamado.</span> Nesta seção,
              apenas a diretoria pode registrar ocorrências urbanas de forma
              simples, sem necessidade de foto inicial. Basta preencher o
              formulário com as informações do problema para que o sistema
              encaminhe automaticamente ao setor responsável.
            </p>
          </div>
          <div className="flex-1 max-w-md w-full">
            <img
              src={MapaCall}
              alt="Ilustração"
              className="w-full rounded-xl object-contain"
            />
          </div>
        </section>

        {/* conteúdo */}
        <section className="max-w-[1500px] w-full mx-auto">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* esquerda */}
              <div className="bg-white rounded-2xl border p-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("terrestre")}
                    className={`${btnBase} ${
                      mode === "terrestre" ? btnActive : btnIdle
                    }`}
                  >
                    <CallTerra className={iconCls} />
                    <span className={labelCls}>Mapeamento Terrestre</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("aereo")}
                    className={`${btnBase} ${
                      mode === "aereo" ? btnActive : btnIdle
                    }`}
                  >
                    <CallDrone className={iconCls} />
                    <span className={labelCls}>Mapeamento Aéreo</span>
                  </button>
                </div>
                {/* gráfico de barras por tipos */}
                {typeStats.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-zinc-700">
                        Solicitações por tipo
                      </h4>
                      <span className="text-xs text-zinc-500">
                        {typeStats.reduce((s, r) => s + r.count, 0)} no total
                      </span>
                    </div>

                    <ChartContainer
                      config={chartConfig}
                      className="h-[260px] w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 40, right: 0 }}
                      >
                        <YAxis
                          dataKey="label"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={0}
                          tick={({ x, y, payload }) => (
                            <text
                              x={x - 8}
                              y={y + 6}
                              textAnchor="end"
                              fill="#475569"
                              fontSize={12}
                              fontWeight={500}
                            >
                              {payload.value}
                            </text>
                          )}
                        />

                        <XAxis dataKey="count" type="number" hide />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Bar
                          dataKey="count"
                          radius={5}
                          background={(props) => {
                            const { x, y, width, height, payload } = props;

                            // se não for zero fica sem barra de fundo
                            if (payload.count !== 0) return null;

                            // se for 0 aparece uma barra cinza
                            return (
                              <rect
                                x={x}
                                y={y}
                                width={props.background?.width ?? props.width}
                                height={height}
                                fill="#E4E4E7"
                                rx={5}
                              />
                            );
                          }}
                        >
                          {chartData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </div>

              {/* formulário */}
              <div className="lg:col-span-2 bg-white rounded-2xl border p-4 md:p-6 flex flex-col gap-4">
                {mode === "terrestre" ? (
                  <>
                    {/* terrestre */}
                    <div>
                      <label className="text-sm text-zinc-600">Descrição</label>
                      <Textarea
                        placeholder="Buraco profundo em frente ao posto."
                        value={form.description}
                        onChange={(e) =>
                          setField("description", e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-zinc-600">Tipo</label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-10 justify-between rounded-md border bg-white"
                            >
                              {TYPE_OPTIONS.find((t) => t.value === form.type)
                                ?.label || "Selecione o tipo"}
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-[220px]"
                          >
                            {TYPE_OPTIONS.map((opt) => (
                              <DropdownMenuItem
                                key={opt.value}
                                onClick={() => setField("type", opt.value)}
                              >
                                {opt.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm text-zinc-600">Rua</label>
                        <Input
                          placeholder="Rua das Flores"
                          value={form.street}
                          onChange={(e) => setField("street", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-zinc-600">Número</label>
                        <Input
                          value={form.number}
                          onChange={(e) => setField("number", e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-zinc-600">
                          Complemento
                        </label>
                        <Input
                          value={form.complement}
                          onChange={(e) =>
                            setField("complement", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm text-zinc-600">Bairro</label>
                        <Popover
                          open={neighborhoodOpen}
                          onOpenChange={setNeighborhoodOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-10 justify-between rounded-md border bg-white"
                            >
                              {form.neighborhoodId
                                ? neighborhoods.find(
                                    (n) => n.id === form.neighborhoodId
                                  )?.name || "Selecione o bairro"
                                : "Selecione o bairro"}
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent
                            align="start"
                            className="w-[280px] p-0"
                          >
                            <div className="sticky top-0 bg-white p-2 border-b">
                              <Input
                                autoFocus
                                value={neighborhoodQuery}
                                onChange={(e) =>
                                  setNeighborhoodQuery(e.target.value)
                                }
                                placeholder="Buscar bairro..."
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="max-h-[320px] overflow-y-auto py-1">
                              {filteredNeighborhoods.map((n) => (
                                <div key={n.id} className="px-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setField("neighborhoodId", n.id);
                                      setNeighborhoodOpen(false);
                                      setNeighborhoodQuery("");
                                    }}
                                    className="w-full text-left px-2 py-2 rounded-md hover:bg-accent text-sm"
                                  >
                                    {n.name}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-sm text-zinc-600">CEP</label>
                        <Input
                          value={formatCep(form.cep)}
                          onChange={(e) =>
                            handleCepChange("cep", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* aéreo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-zinc-600">Tipo</label>
                        <select
                          value={form.type}
                          onChange={(e) => setField("type", e.target.value)}
                          className="w-full h-10 rounded-md border px-3 text-sm bg-white"
                        >
                          <option value="">Selecione...</option>
                          <option value="mapeamento">mapeamento</option>
                          <option value="comunicacao">comunicacao</option>
                          <option value="metragem">metragem</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-zinc-600">
                          Rua / Avenida
                        </label>
                        <Input
                          placeholder="Rua Exemplo"
                          value={form.street}
                          onChange={(e) => setField("street", e.target.value)}
                        />
                      </div>
                    </div>

                    {form.type === "comunicacao" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-zinc-600">Data</label>
                          <Input
                            type="date"
                            value={form.verificationDate}
                            onChange={(e) =>
                              setField("verificationDate", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm text-zinc-600">Hora</label>
                          <Input
                            type="time"
                            value={form.verificationTime}
                            onChange={(e) =>
                              setField("verificationTime", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-zinc-600">CEP</label>
                        <Input
                          value={formatCep(form.zipCode)}
                          onChange={(e) =>
                            handleCepChange("zipCode", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="text-sm text-zinc-600">
                          Emergencial
                        </label>
                        <div className="h-10 flex items-center gap-2 rounded-md border px-3">
                          <input
                            id="isEmergency"
                            type="checkbox"
                            className="h-4 w-4"
                            checked={!!form.isEmergency}
                            onChange={(e) =>
                              setField("isEmergency", e.target.checked)
                            }
                          />
                          <label htmlFor="isEmergency" className="text-sm">
                            Sim
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-zinc-600">Bairro</label>
                        <Popover
                          open={neighborhoodOpen}
                          onOpenChange={setNeighborhoodOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-10 justify-between rounded-md border bg-white"
                            >
                              {form.neighborhoodId
                                ? neighborhoods.find(
                                    (n) => n.id === form.neighborhoodId
                                  )?.name || "Selecione o bairro"
                                : "Selecione o bairro"}
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[280px] p-0"
                          >
                            <div className="sticky top-0 bg-white p-2 border-b">
                              <Input
                                autoFocus
                                value={neighborhoodQuery}
                                onChange={(e) =>
                                  setNeighborhoodQuery(e.target.value)
                                }
                                placeholder="Buscar bairro..."
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="max-h-[320px] overflow-y-auto py-1">
                              {filteredNeighborhoods.map((n) => (
                                <div key={n.id} className="px-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setField("neighborhoodId", n.id);
                                      setNeighborhoodOpen(false);
                                      setNeighborhoodQuery("");
                                    }}
                                    className="w-full text-left px-2 py-2 rounded-md hover:bg-accent text-sm"
                                  >
                                    {n.name}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-zinc-600">
                          Latitude
                        </label>
                        <Input
                          value={form.latitude}
                          onChange={(e) => setField("latitude", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-zinc-600">
                          Longitude
                        </label>
                        <Input
                          value={form.longitude}
                          onChange={(e) =>
                            setField("longitude", e.target.value)
                          }
                        />
                      </div>
                      <div className="hidden md:block" />
                    </div>

                    <div>
                      <label className="text-sm text-zinc-600">
                        Observação
                      </label>
                      <Textarea
                        placeholder="Área com necessidade urgente de mapeamento"
                        value={form.observation}
                        onChange={(e) =>
                          setField("observation", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}

                {/* botões */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
                    <Button
                      onClick={handleReset}
                      disabled={isSubmitting}
                      className="flex-1 h-[64px] bg-[#FFE8E8] text-[#9D0000] hover:bg-[#FFD8D8] px-8 py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      Refazer
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 h-[64px] bg-[#C9F2E9] text-[#1C7551] hover:bg-[#B8E8B5] px-8 py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      {isSubmitting
                        ? "Enviando..."
                        : mode === "terrestre"
                        ? "Criar Solicitação"
                        : "Criar Solicitação"}
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 h-px" />
            <PreOccurrenceList embedded />
          </div>
        </section>
      </main>
    </div>
  );
}
