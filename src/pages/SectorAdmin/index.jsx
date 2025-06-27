"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users,
  UserCog,
  Shield,
  Briefcase,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";


import { useAuth } from "@/hooks/auth";



export function SectorAdmin() {
  const [sectorData, setSectorData] = useState(null); 
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const { user } = useAuth();
console.log("Usuário logado:", user);

  // 🔄 Buscar dados reais do setor ao carregar a página
  useEffect(() => {
    async function fetchSectorDetails() {
      try {
        const response = await api.get("/sectors/details"); // backend já sabe o setor pelo login
        setSectorData(response.data);
      } catch (error) {
        toast({
          title: "Erro ao buscar dados do setor",
          description: "Verifique sua conexão ou tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    }

    fetchSectorDetails();
  }, []);

  // 🔃 Exibe loading enquanto não tiver dados
  if (!sectorData) {
    return <div className="sm:ml-[250px] p-6">Carregando setor...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Tabs principais */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="chiefs">Chefes</TabsTrigger>
                <TabsTrigger value="inspectors">Fiscais</TabsTrigger>
                <TabsTrigger value="teams">Equipes</TabsTrigger>
              </TabsList>

              {/* 🧭 Abas omitidas aqui pra focar em TEAMS */}

              {/* ✅ Aba de equipes */}
              <TabsContent value="teams" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Equipes do Setor</CardTitle>
                        <CardDescription>
                          Gerencie as equipes e suas naturezas de serviço
                        </CardDescription>
                      </div>

                      {/* Botão para abrir modal de nova equipe */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Equipe
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Nova Equipe</DialogTitle>
                            <DialogDescription>
                              Informe o nome da equipe para adicioná-la ao setor
                            </DialogDescription>
                          </DialogHeader>

                          {/* Formulário de criação da equipe */}
                          <AddTeamForm />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>

                  {/* Listagem das equipes existentes */}
                  <CardContent>
                    <div className="space-y-6">
                      {sectorData.teams.map((team) => (
                        <div key={team.id} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{team.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {team.serviceNatures.length} natureza(s) de serviço
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Serviço
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Naturezas de Serviço</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {team.serviceNatures.map((service) => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <span className="font-medium">{service.name}</span>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm">
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

function AddTeamForm() {
  const [teamName, setTeamName] = useState("");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTeam = async () => {
    if (!teamName.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post("/sectors/add-teams", {
        teamName, // 🔥 não precisa passar sectorId, o backend já sabe quem está logado
      });

      toast({ title: "Equipe adicionada com sucesso!" });

      setTeamName("");
      window.location.reload(); // só até integrar fetch dinâmico ao vivo
    } catch (error) {
      toast({
        title: "Erro ao adicionar equipe",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="teamName">Nome da Equipe</Label>
        <Input
          id="teamName"
          placeholder="Ex: EMURB Pavimentação"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setTeamName("")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button onClick={handleAddTeam} disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Cadastrar"}
        </Button>
      </div>
    </div>
  );
}

