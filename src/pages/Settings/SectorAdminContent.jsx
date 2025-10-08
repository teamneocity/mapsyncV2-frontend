"use client";

// React e bibliotecas externas
import { useEffect, useState } from "react";
import { Users, UserCog, Briefcase, Plus, Shield } from "lucide-react";

// Hooks customizados
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";

// Componentes globais (mantidos)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Serviços e utilitários
import { api } from "@/services/api";

// Assets
import Trash from "@/assets/icons/trash.svg?react";

export default function SectorAdminContent() {
  const [activeTab, setActiveTab] = useState("overview");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [newTeamName, setNewTeamName] = useState("");

  const [newServiceName, setNewServiceName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  const { toast } = useToast();

  useEffect(() => {
    async function fetchSector() {
      try {
        const response = await api.get("/sectors/details");
        const sectors = response.data.sectors;
        setAllSectors(sectors);

        setSelectedSectorId(sectors[0]?.id || null);
      } catch (err) {
        console.error("Erro ao buscar setores", err);
      }
    }
    fetchSector();
  }, []);

  async function handleAddInspector() {
    try {
      await api.post("/sectors/add-inspectors", {
        sectorId: sectorData.id,
        inspectorIds: [selectedInspectorId],
      });

      setSelectedInspectorId("");
      const response = await api.get("/sectors/details");
      setAllSectors(response.data.sectors);
      toast({
        title: "Fiscal adicionado",
        description: "O fiscal foi adicionado com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao adicionar fiscal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o fiscal.",
        variant: "destructive",
      });
    }
  }

  const handleRemoveInspector = async (inspectorId) => {
    try {
      await api.post("/sectors/remove-inspectors", {
        sectorId: sectorData.id,
        inspectorIds: [inspectorId],
      });

      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);

      toast({
        title: "Fiscal removido",
        description: "O fiscal foi removido com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao remover fiscal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o fiscal.",
        variant: "destructive",
      });
    }
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      await api.post("/sectors/add-teams", {
        sectorId: sectorData.id,
        teamName: newTeamName,
      });

      setNewTeamName("");
      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
      toast({
        title: "Equipe criada",
        description: "A equipe foi adicionada com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao adicionar equipe:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a equipe.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTeam = async (teamId) => {
    try {
      await api.post("/sectors/remove-team", {
        sectorId: sectorData.id,
        teamId,
      });
      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
      toast({
        title: "Equipe removida",
        description: "A equipe foi removida com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao remover equipe:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a equipe.",
        variant: "destructive",
      });
    }
  };

  const handleAddServiceNature = async () => {
    if (!newServiceName.trim() || !selectedTeamId) return;

    try {
      await api.post("/teams/attach-service-nature", {
        teamId: selectedTeamId,
        serviceNatureName: newServiceName,
      });

      setNewServiceName("");
      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
      toast({
        title: "Serviço adicionado",
        description: "A natureza de serviço foi adicionada com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao adicionar natureza de serviço:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a natureza de serviço.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveServiceNature = async (teamId, serviceNatureId) => {
    try {
      await api.post("/teams/remove-nature", {
        teamId,
        serviceNatureId,
      });
      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
      toast({
        title: "Serviço removido",
        description: "A natureza de serviço foi removida com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao remover natureza de serviço:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a natureza de serviço.",
        variant: "destructive",
      });
    }
  };

  const handleAddForeman = async () => {
    if (!newForemanName.trim() || !selectedTeamId) return;

    try {
      await api.post("/sectors/add-foremen", {
        sectorId: sectorData.id,
        teamId: selectedTeamId,
        foremenName: newForemanName,
      });

      setNewForemanName("");
      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
      toast({
        title: "Encarregado adicionado",
        description: "O encarregado foi adicionado com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao adicionar encarregado:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o encarregado.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveForeman = async (foremanId) => {
    try {
      await api.post("/sectors/remove-foreman", {
        sectorId: sectorData.id,
        foremanId,
      });
      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
      toast({
        title: "Encarregado removido",
        description: "O encarregado foi removido com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao remover encarregado:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o encarregado.",
        variant: "destructive",
      });
    }
  };

  async function handleAddChief() {
    if (!selectedChiefId) return;

    try {
      await api.post("/sectors/add-sector-chiefs", {
        sectorId: sectorData.id,
        chiefIds: [selectedChiefId],
      });

      setSelectedChiefId("");
      const response = await api.get("/sectors/details");
      setAllSectors(response.data.sectors);
      toast({
        title: "Chefe adicionado",
        description: "O chefe foi adicionado com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao adicionar chefe:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o chefe.",
        variant: "destructive",
      });
    }
  }

  const handleRemoveChief = async (chiefId) => {
    try {
      await api.post("/sectors/remove-sector-chiefs", {
        sectorId: sectorData.id,
        chiefIds: [chiefId],
      });
      const updated = await api.get("/sectors/details");
      setAllSectors(updated.data.sectors);
      toast({
        title: "Chefe removido",
        description: "O chefe foi removido com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao remover chefe:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o chefe.",
        variant: "destructive",
      });
    }
  };

  if (!sectorData) {
    return (
      <div className="p-4 text-sm text-zinc-600">
        Carregando dados do setor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* seletor de setor (somente admin/chefe geral) */}
      {(isAdmin || isChief) && (
        <div className="w-full">
          <Label className="block text-sm mb-1">Selecionar setor:</Label>
          <select
            value={selectedSectorId || ""}
            onChange={(e) => setSelectedSectorId(e.target.value)}
            className="rounded-2xl text-[#4B4B62] px-3 py-2 text-sm w-full max-w-sm h-12 bg-white border border-zinc-200"
          >
            {allSectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* métricas topo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chefes</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectorData.chiefs.length}</div>
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
            <p className="text-xs text-muted-foreground">Fiscalização ativa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encarregados</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sectorData.foremen.length}
            </div>
            <p className="text-xs text-muted-foreground">Supervisão de campo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectorData.teams.length}</div>
            <p className="text-xs text-muted-foreground">
              Equipes operacionais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* abas */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full bg-transparent p-0">
          <TabsTrigger value="overview" className="justify-center">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="chiefs" className="justify-center">
            Chefes
          </TabsTrigger>
          <TabsTrigger value="inspectors" className="justify-center">
            Fiscais
          </TabsTrigger>
          <TabsTrigger value="teams" className="justify-center">
            Equipes
          </TabsTrigger>
        </TabsList>

        {/* overview */}
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
                  <Label className="text-sm font-medium">Nome do Setor</Label>
                  <p className="text-lg font-semibold">{sectorData.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">ID do Setor</Label>
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

        {/* chiefs */}
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
                          setAvailableChiefs(res.data.sectorChiefs);
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
                        Selecione um chefe disponível para adicionar ao setor
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Label htmlFor="chiefSelect">Chefe</Label>
                      <select
                        id="chiefSelect"
                        className="w-full border rounded-md h-10 px-3 text-sm text-[#4B4B62] bg-[#EBEBEB]"
                        value={selectedChiefId}
                        onChange={(e) => setSelectedChiefId(e.target.value)}
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
                        <p className="text-sm text-gray-600">{chief.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Chefe</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setItemToDelete({ type: "chief", chiefId: chief.id });
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

        {/* inspectors */}
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
                        onChange={(e) => setSelectedInspectorId(e.target.value)}
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
                          onClick={() => setIsAddInspectorDialogOpen(false)}
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

        {/* teams */}
        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Equipes do Setor</CardTitle>
                  <CardDescription>
                    Gerencie as equipes, naturezas de serviço e encarregados
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
                          <h3 className="font-semibold text-lg">{team.name}</h3>
                          <p className="text-sm text-gray-600">
                            {team.serviceNatures.length} natureza(s) de serviço
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* adicionar serviço */}
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
                                Adicione uma natureza de serviço para a equipe{" "}
                                {team.name}
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
                                className="h-12 px-4 bg-[#EBEBEB] border-none rounded-xl text-[#4B4B62] placeholder:text-[#787891]"
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

                        {/* adicionar encarregado */}
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
                                className="h-12 px-4 bg-[#EBEBEB] border-none rounded-xl text-[#4B4B62] placeholder:text-[#787891]"
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

                        {/* remover equipe */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToDelete({ type: "team", teamId: team.id });
                            setConfirmDeleteOpen(true);
                          }}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* naturezas */}
                    <div className="mt-4">
                      <h4 className="font-medium mb-3">Naturezas de Serviço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {team.serviceNatures.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium">{service.name}</span>
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

          {/* Encarregados */}
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

      {/* modal de confirmação de remoção  */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-red-600">Confirmação</h2>

            {(() => {
              const typeLabel = {
                team: "esta equipe",
                service: "esta natureza de serviço",
                foreman: "este encarregado",
                inspector: "este fiscal",
                chief: "este chefe de setor",
              };
              const label =
                (itemToDelete &&
                  itemToDelete.type &&
                  typeLabel[itemToDelete.type]) ||
                "este item";

              return (
                <p>
                  Tem certeza que deseja remover <strong>{label}</strong>?
                </p>
              );
            })()}

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
                    if (!itemToDelete || !itemToDelete.type) {
                      throw new Error("Tipo de remoção inválido.");
                    }
                    const actions = {
                      team: () => handleRemoveTeam(itemToDelete.teamId),
                      service: () =>
                        handleRemoveServiceNature(
                          itemToDelete.teamId,
                          itemToDelete.serviceId
                        ),
                      foreman: () =>
                        handleRemoveForeman(itemToDelete.foremanId),
                      inspector: () =>
                        handleRemoveInspector(itemToDelete.inspectorId),
                      chief: () => handleRemoveChief(itemToDelete.chiefId),
                    };
                    const fn = actions[itemToDelete.type];
                    if (!fn) throw new Error("Tipo de remoção inválido.");

                    await fn();
                    setConfirmDeleteOpen(false);
                    setItemToDelete(null);
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
    </div>
  );
}
