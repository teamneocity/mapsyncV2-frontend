"use client";

import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
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
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Shield,
} from "lucide-react";

import Trash from "@/assets/icons/trash.svg?react";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

import { usePermissions } from "@/hooks/usePermissions"; // ou onde está salvo

export function SectorAdmin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const [newTeamName, setNewTeamName] = useState("");

  const [newServiceName, setNewServiceName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: "team" | "service", teamId, serviceId? }

  const [newForemanName, setNewForemanName] = useState("");

  const { isAdmin, isChief } = usePermissions();

  const [allSectors, setAllSectors] = useState([]);
  const [selectedSectorId, setSelectedSectorId] = useState(null);
  const sectorData = allSectors.find((s) => s.id === selectedSectorId);

  const [isAddInspectorDialogOpen, setIsAddInspectorDialogOpen] =
    useState(false);
  const [availableInspectors, setAvailableInspectors] = useState([]);
  const [selectedInspectorId, setSelectedInspectorId] = useState("");

  const [availableChiefs, setAvailableChiefs] = useState([]);
  const [selectedChiefId, setSelectedChiefId] = useState("");

  useEffect(() => {
    async function fetchSector() {
      try {
        const response = await api.get("/sectors/details");
        const sectors = response.data.sectors;
        setAllSectors(sectors);

        // Se for admin ou chefe geral, inicia com o primeiro setor
        // Caso contrário, o backend retorna só o setor dele
        if (isAdmin || isChief) {
          setSelectedSectorId(sectors[0]?.id || null);
        } else {
          setSelectedSectorId(sectors[0]?.id || null);
        }
      } catch (err) {
        console.error("Erro ao buscar setores", err);
      }
    }

    fetchSector();
  }, []);

  //Adicionar inspetor
  async function handleAddInspector() {
    try {
      await api.post("/sectors/add-inspectors", {
        sectorId: sectorData.id,
        inspectorIds: [selectedInspectorId],
      });

      setIsAddInspectorDialogOpen(false);
      setSelectedInspectorId("");
      const response = await api.get("/sectors/details");
      setAllSectors(response.data.sectors);
    } catch (error) {
      console.error("Erro ao adicionar fiscal:", error);
      alert("Erro ao adicionar fiscal");
    }
  }

  // Adiciona equipe
  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      await api.post("/sectors/add-teams", {
        sectorId: sectorData.id,
        teamName: newTeamName,
      });

      setNewTeamName("");
      setIsAddDialogOpen(false);

      // Atualiza os dados localmente (opcional)
      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
    } catch (error) {
      console.error("Erro ao adicionar equipe:", error);
    }
  };

  // Remove equipe
  const handleRemoveTeam = async (teamId) => {
    try {
      await api.post("/sectors/remove-team", {
        sectorId: sectorData.id,
        teamId,
      });

      // Atualiza os dados após remoção
      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
    } catch (error) {
      console.error("Erro ao remover equipe:", error);
    }
  };

  //Adiciona serviço
  const handleAddServiceNature = async () => {
    if (!newServiceName.trim() || !selectedTeamId) return;

    try {
      await api.post("/teams/attach-service-nature", {
        teamId: selectedTeamId,
        serviceNatureName: newServiceName,
      });

      setNewServiceName("");
      setSelectedTeamId(null);

      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
    } catch (error) {
      console.error("Erro ao adicionar natureza de serviço:", error);
    }
  };

  //Remove serviço
  const handleRemoveServiceNature = async (teamId, serviceNatureId) => {
    try {
      await api.post("/teams/remove-nature", {
        teamId,
        serviceNatureId,
      });

      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
    } catch (error) {
      console.error("Erro ao remover natureza de serviço:", error);
    }
  };

  //Adiciona encarregado
  const handleAddForeman = async () => {
    if (!newForemanName.trim() || !selectedTeamId) return;

    try {
      await api.post("/sectors/add-foremen", {
        sectorId: sectorData.id,
        teamId: selectedTeamId,
        foremenName: newForemanName,
      });

      setNewForemanName("");
      setSelectedTeamId(null);

      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
    } catch (error) {
      console.error("Erro ao adicionar encarregado:", error);
    }
  };

  //remover encarregado
  const handleRemoveForeman = async (foremanId) => {
    try {
      await api.post("/sectors/remove-foreman", {
        sectorId: sectorData.id,
        foremanId,
      });

      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
    } catch (error) {
      console.error("Erro ao remover encarregado:", error);
    }
  };

  //Adicionar chefe de setor
  async function handleAddChief() {
    try {
      await api.post("/sectors/add-chiefs", {
        sectorId: sectorData.id,
        chiefIds: [selectedChiefId],
      });

      setIsAddDialogOpen(false);
      setSelectedChiefId("");
      const response = await api.get("/sectors/details");
      setAllSectors(response.data.sectors);
    } catch (error) {
      console.error("Erro ao adicionar chefe:", error);
      alert("Erro ao adicionar chefe");
    }
  }

  if (!sectorData) {
    return (
      <div className="sm:ml-[250px] p-6 text-gray-600">
        Carregando dados do setor...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      <Sidebar />
      <TopHeader />
      {confirmDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-red-600">Confirmação</h2>
            <p>
              Tem certeza que deseja remover{" "}
              <strong>
                {itemToDelete?.type === "team"
                  ? "esta equipe"
                  : itemToDelete?.type === "service"
                  ? "esta natureza de serviço"
                  : "este encarregado"}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setConfirmDeleteOpen(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={async () => {
                  try {
                    if (itemToDelete?.type === "team") {
                      await api.post("/sectors/remove-team", {
                        sectorId: sectorData.id,
                        teamId: itemToDelete.teamId,
                      });
                    } else if (itemToDelete?.type === "service") {
                      await api.post("/teams/remove-nature", {
                        teamId: itemToDelete.teamId,
                        serviceNatureId: itemToDelete.serviceId,
                      });
                    } else if (itemToDelete?.type === "foreman") {
                      await api.post("/sectors/remove-foreman", {
                        sectorId: sectorData.id,
                        foremanId: itemToDelete.foremanId,
                      });
                    } else if (itemToDelete?.type === "inspector") {
                      await api.post("/sectors/remove-inspectors", {
                        sectorId: sectorData.id,
                        inspectorIds: [itemToDelete.inspectorId],
                      });
                    }

                    setConfirmDeleteOpen(false);
                    const res = await api.get("/sectors/details");
                    setAllSectors(res.data.sectors);
                  } catch (err) {
                    console.error("Erro ao remover:", err);
                    alert("Erro ao remover");
                  }
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4 sm:py-6">
        {(isAdmin || isChief) && (
          <div className="mb-4 w-full max-w-7xl mx-auto">
            <Label className="block text-sm mb-1">Selecionar setor:</Label>
            <select
              value={selectedSectorId || ""}
              onChange={(e) => setSelectedSectorId(e.target.value)}
              className="rounded-2xl text-[#4B4B62] px-3 py-2 text-sm w-full max-w-sm h-16"
            >
              {allSectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <main className="flex-1 overflow-auto">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chefes</CardTitle>
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sectorData.chiefs.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Responsáveis pelo setor
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fiscais</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sectorData.inspectors.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fiscalização ativa
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Encarregados
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sectorData.foremen.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supervisão de campo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Equipes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sectorData.teams.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Equipes operacionais
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full bg-transparent p-0 mb-4">
                <TabsTrigger
                  value="overview"
                  className="justify-center items-center"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="chiefs"
                  className="justify-center items-center"
                >
                  Chefes
                </TabsTrigger>
                <TabsTrigger
                  value="inspectors"
                  className="justify-center items-center"
                >
                  Fiscais
                </TabsTrigger>
                <TabsTrigger
                  value="teams"
                  className="justify-center items-center"
                >
                  Equipes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Setor</CardTitle>
                    <CardDescription>
                      Detalhes gerais sobre o setor {sectorData.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Nome do Setor
                        </Label>
                        <p className="text-lg font-semibold">
                          {sectorData.name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          ID do Setor
                        </Label>
                        <p className="text-sm text-gray-600 font-mono">
                          {sectorData.id}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Estrutura Organizacional</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <UserCog className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Chefes</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {sectorData.chiefs.length}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Fiscais</p>
                          <p className="text-2xl font-bold text-green-600">
                            {sectorData.inspectors.length}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <Briefcase className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Encarregados</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {sectorData.foremen.length}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-sm font-medium">Equipes</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {sectorData.teams.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chiefs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Chefes do Setor</CardTitle>
                        <CardDescription>
                          Gerencie os chefes responsáveis pelo setor
                        </CardDescription>
                      </div>
                      <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            onClick={async () => {
                              setIsAddDialogOpen(true);
                              try {
                                const res = await api.get(
                                  "/employees/sector-chiefs-without-a-sector"
                                );
                                setAvailableChiefs(res.data.sectorChiefs); // <- corrigido aqui
                              } catch (err) {
                                console.error(
                                  "Erro ao buscar chefes disponíveis:",
                                  err
                                );
                              }
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Chefe
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Novo Chefe</DialogTitle>
                            <DialogDescription>
                              Selecione um chefe disponível para adicionar ao
                              setor
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <Label htmlFor="chiefSelect">Chefe</Label>
                            <select
                              id="chiefSelect"
                              className="w-full border rounded-md h-10 px-3 text-sm text-[#4B4B62] bg-[#EBEBEB]"
                              value={selectedChiefId}
                              onChange={(e) =>
                                setSelectedChiefId(e.target.value)
                              }
                            >
                              <option value="">Selecione</option>
                              {availableChiefs.map((chief) => (
                                <option key={chief.id} value={chief.id}>
                                  {chief.name}
                                </option>
                              ))}
                            </select>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleAddChief}
                                disabled={!selectedChiefId}
                              >
                                Confirmar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sectorData.chiefs.map((chief) => (
                        <div
                          key={chief.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {chief.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{chief.name}</p>
                              <p className="text-sm text-gray-600">
                                {chief.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Chefe</Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inspectors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>Fiscais do Setor</CardTitle>
                        <CardDescription>
                          Gerencie os fiscais responsáveis pela fiscalização
                        </CardDescription>
                      </div>
                      <Dialog
                        open={isAddInspectorDialogOpen}
                        onOpenChange={setIsAddInspectorDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            onClick={async () => {
                              setIsAddInspectorDialogOpen(true);
                              try {
                                const res = await api.get(
                                  "/employees/inspectors-without-a-sector"
                                );
                                setAvailableInspectors(res.data.inspectors);
                              } catch (err) {
                                console.error("Erro ao buscar fiscais:", err);
                              }
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Fiscal
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Novo Fiscal</DialogTitle>
                            <DialogDescription>
                              Selecione o fiscal que deseja adicionar ao setor
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Label htmlFor="inspectorSelect">Fiscal</Label>
                            <select
                              id="inspectorSelect"
                              className="w-full border rounded-md h-10 px-3 text-sm text-[#4B4B62] bg-[#EBEBEB]"
                              value={selectedInspectorId}
                              onChange={(e) =>
                                setSelectedInspectorId(e.target.value)
                              }
                            >
                              <option value="">Selecione</option>
                              {availableInspectors.map((insp) => (
                                <option key={insp.id} value={insp.id}>
                                  {insp.name}
                                </option>
                              ))}
                            </select>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setIsAddInspectorDialogOpen(false)
                                }
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleAddInspector}
                                disabled={!selectedInspectorId}
                              >
                                Confirmar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {sectorData.inspectors.map((inspector) => (
                        <div
                          key={inspector.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{inspector.name}</p>
                              <p className="text-sm text-gray-600">
                                {inspector.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              Fiscal
                            </Badge>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setItemToDelete({
                                  type: "inspector",
                                  inspectorId: inspector.id,
                                });
                                setConfirmDeleteOpen(true);
                              }}
                            >
                              <Trash className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="teams" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>Equipes do Setor</CardTitle>
                        <CardDescription>
                          Gerencie as equipes, suas naturezas de serviço e
                          encarregados
                        </CardDescription>
                      </div>
                      <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Equipe
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Nova Equipe</DialogTitle>
                            <DialogDescription>
                              Informe o nome da nova equipe
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="teamName">Nome da Equipe</Label>
                              <Input
                                id="teamName"
                                placeholder="Ex: EMURB Pavimentação"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                              >
                                Cancelar
                              </Button>
                              <Button onClick={handleAddTeam}>Cadastrar</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-6">
                      {sectorData.teams.map((team) => (
                        <div key={team.id} className="border rounded-lg p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {team.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {team.serviceNatures.length} natureza(s) de
                                  serviço
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              {/* Adicionar serviço */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-12 border-none bg-[#EBEBEB]"
                                    size="sm"
                                    onClick={() => setSelectedTeamId(team.id)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Serviço
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Nova Natureza de Serviço
                                    </DialogTitle>
                                    <DialogDescription>
                                      Adicione uma natureza de serviço para a
                                      equipe {team.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Label htmlFor="serviceName">
                                      Nome da Natureza
                                    </Label>
                                    <Input
                                      id="serviceName"
                                      placeholder="Ex: Tapa Buraco"
                                      value={newServiceName}
                                      onChange={(e) =>
                                        setNewServiceName(e.target.value)
                                      }
                                      className="h-16 px-6 bg-[#EBEBEB] border-none rounded-xl text-[#4B4B62] placeholder:text-[#787891]"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setSelectedTeamId(null)}
                                      >
                                        Cancelar
                                      </Button>
                                      <Button onClick={handleAddServiceNature}>
                                        Cadastrar
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {/* Adicionar encarregado */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-12 border-none bg-[#EBEBEB]"
                                    size="sm"
                                    onClick={() => setSelectedTeamId(team.id)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Encarregado
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Novo Encarregado</DialogTitle>
                                    <DialogDescription>
                                      Adicione um encarregado para a equipe{" "}
                                      {team.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Label htmlFor="foremanName">
                                      Nome do Encarregado
                                    </Label>
                                    <Input
                                      id="foremanName"
                                      placeholder="Ex: João Silva"
                                      value={newForemanName}
                                      onChange={(e) =>
                                        setNewForemanName(e.target.value)
                                      }
                                      className="h-16 px-6 bg-[#EBEBEB] border-none rounded-xl text-[#4B4B62] placeholder:text-[#787891]"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setSelectedTeamId(null)}
                                      >
                                        Cancelar
                                      </Button>
                                      <Button onClick={handleAddForeman}>
                                        Cadastrar
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {/* Remover equipe */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setItemToDelete({
                                    type: "team",
                                    teamId: team.id,
                                  });
                                  setConfirmDeleteOpen(true);
                                }}
                              >
                                <Trash className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>

                          {/* Naturezas */}
                          <div className="mt-4">
                            <h4 className="font-medium mb-3">
                              Naturezas de Serviço
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {team.serviceNatures.map((service) => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <span className="font-medium">
                                    {service.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setItemToDelete({
                                        type: "service",
                                        teamId: team.id,
                                        serviceId: service.id,
                                      });
                                      setConfirmDeleteOpen(true);
                                    }}
                                  >
                                    <Trash className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Encarregados fora da equipe */}
                <Card>
                  <CardHeader>
                    <CardTitle>Encarregados</CardTitle>
                    <CardDescription>
                      Lista de todos os encarregados do setor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sectorData.foremen.map((foreman) => (
                        <div
                          key={foreman.id}
                          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                        >
                          <span className="font-medium">{foreman.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setItemToDelete({
                                type: "foreman",
                                foremanId: foreman.id,
                              });
                              setConfirmDeleteOpen(true);
                            }}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
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
