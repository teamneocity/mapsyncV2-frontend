"use client";

import { useState } from "react";
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
  Building2,
  Plus,
  Edit,
  Trash2,
  Settings,
  Shield,
  Briefcase,
  MapPin,
  Bell,
  Home,
  BarChart3,
  Map,
  ClipboardList,
  FileText,
  HelpCircle,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Link } from "react-router-dom";
import { LiveActionButton } from "@/components/live-action-button";

import emurb from "../../assets/emurb.svg";

// Mock data baseado no JSON fornecido
const sectorData = {
  id: "2630cdd3-b386-4e02-a6c9-ba8fe40e1d3b",
  name: "Pavimentação",
  chiefs: [
    {
      id: "598e7d08-07dc-44cf-94d5-3261c483b4ef",
      name: "Caua Campos",
      email: "caua@neocity.com.br",
    },
  ],
  inspectors: [
    {
      id: "8e8d05e9-8649-4074-ad66-ea274af502b4",
      name: "Fiscalização Neocity",
      email: "fiscal@neocity.com.br",
    },
  ],
  teams: [
    {
      id: "6f69b5a8-de13-4588-b27f-13a7f01a5bfe",
      name: "EMURB Pavimentação",
      serviceNatures: [
        {
          id: "7afc8ce7-9617-4f14-b45f-60dbcc0be459",
          name: "Tapa Buraco",
        },
      ],
    },
  ],
  foremen: [
    {
      id: "787cade5-832d-4cde-94be-f84c86d50789",
      name: "João Silva",
    },
  ],
};

export function SectorAdmin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const adjustItems = [
    { icon: Settings, label: "Configurações" },
    { icon: Users, label: "Usuários" },
    { icon: HelpCircle, label: "Enviar Feedback" },
  ];

  return (
    <div className="flex min-h-screen flex-col sm:ml-[250px] font-inter bg-[#EBEBEB]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center py-4 px-4 sm:px-8 bg-[#EBEBEB] sticky top-0 z-10">
                <div className="px-2 py-2">
                  <Link to="/">
                    <img
                      src={emurb}
                      alt="Logo EMURB"
                      className="h-16 w-auto rounded-md"
                    />
                  </Link>
                </div>
        
                <div className="flex items-center gap-2">
                  <LiveActionButton />
                </div>
              </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Overview Cards */}
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

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="chiefs">Chefes</TabsTrigger>
                <TabsTrigger value="inspectors">Fiscais</TabsTrigger>
                <TabsTrigger value="teams">Equipes</TabsTrigger>
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
                          <Button onClick={() => setSelectedRole("chief")}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Chefe
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Novo Chefe</DialogTitle>
                            <DialogDescription>
                              Preencha as informações do novo chefe do setor
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name">Nome Completo</Label>
                              <Input
                                id="name"
                                placeholder="Digite o nome completo"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">E-mail Corporativo</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="email@neocity.com.br"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                              >
                                Cancelar
                              </Button>
                              <Button>Cadastrar</Button>
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
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Fiscais do Setor</CardTitle>
                        <CardDescription>
                          Gerencie os fiscais responsáveis pela fiscalização
                        </CardDescription>
                      </div>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Fiscal
                      </Button>
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
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Equipe
                      </Button>
                    </div>
                  </CardHeader>
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
                                <h3 className="font-semibold text-lg">
                                  {team.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {team.serviceNatures.length} natureza(s) de
                                  serviço
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
