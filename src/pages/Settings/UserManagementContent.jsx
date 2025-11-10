"use client";

// React e bibliotecas externas
import { useEffect, useState, useMemo } from "react";

// Hooks customizados
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";

// Componentes globais
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SelectField } from "@/components/selectField";

// Serviços e utilitários
import { api } from "@/services/api";
import { getInicials } from "@/lib/utils";

// Assets
import ImgUsers from "@/assets/icons/imgUsers.svg";
import CloudUploadAlt from "@/assets/icons/cloudUploadAlt.svg?react";
import Trash from "@/assets/icons/trash.svg?react";

export default function UserManagementContent() {
  const { user } = useAuth();

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("SECTOR_CHIEF");

  const [users, setUsers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [allUsers, setAllUsers] = useState([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  const normalize = (s = "") =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  async function loadAllUsersOnce() {
    if (loadingAll || allLoaded) return;
    setLoadingAll(true);
    try {
      let page = 1;
      const acc = [];
      while (true) {
        const res = await api.get(`/employees?page=${page}`);
        const list = res.data.employees || [];
        if (list.length === 0) break;
        acc.push(...list);
        page += 1;
      }
      setAllUsers(acc);
      setAllLoaded(true);
    } catch (err) {
      console.error("Erro ao carregar todos os usuários:", err);
    } finally {
      setLoadingAll(false);
    }
  }

  const isFilterActive = Boolean(
    (searchTerm && searchTerm.trim()) || roleFilter || statusFilter
  );

  useEffect(() => {
    if (isFilterActive && !allLoaded && !loadingAll) {
      loadAllUsersOnce();
    }
  }, [isFilterActive]);

  const filteredUsers = useMemo(() => {
    const q = normalize(searchTerm);

    let base = isFilterActive ? (allLoaded ? allUsers : users) : users;

    if (q) {
      base = base.filter((u) => {
        const name = normalize(u.name || "");
        const email = normalize(u.email || "");
        const role = normalize(u.role || "");
        return name.includes(q) || email.includes(q) || role.includes(q);
      });
    }

    if (roleFilter) {
      base = base.filter((u) => (u.role || "") === roleFilter);
    }

    if (statusFilter) {
      const wantActive = statusFilter === "ATIVO";
      base = base.filter((u) => {
        const isActive = !u.deletedAt;
        return wantActive ? isActive : !isActive;
      });
    }

    return base;
  }, [
    users,
    allUsers,
    allLoaded,
    isFilterActive,
    searchTerm,
    roleFilter,
    statusFilter,
  ]);

  async function handleCreateUser(e) {
    e.preventDefault();
    try {
      await api.post("/accounts", {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso!",
        variant: "success",
      });
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("SECTOR_CHIEF");

      await fetchUsers(1);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    fetchUsers(1);
  }, []);

  async function fetchUsers(page = 1) {
    try {
      const res = await api.get(`/employees?page=${page}`);
      const list = res.data.employees || [];

      setUsers(list);
      setCurrentPage(page);

      try {
        const nextRes = await api.get(`/employees?page=${page + 1}`);
        const nextList = nextRes.data.employees || [];
        setHasNextPage(nextList.length > 0);
      } catch {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro ao buscar usuários",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }

  const canGoPrev = currentPage > 1;
  const canGoNext = hasNextPage;

  const goPrev = async () => {
    if (!canGoPrev) return;
    await fetchUsers(currentPage - 1);
  };

  const goNext = async () => {
    if (!canGoNext) return;
    await fetchUsers(currentPage + 1);
  };

  const avatarUrl = user.avatar
    ? `${api.defaults.baseURL}/avatar/${user.avatar}`
    : "";
  const [avatar, setAvatar] = useState(avatarUrl);
  const initials = getInicials(user.name);

  function handleChangeAvatar(file) {
    const imagePreview = URL.createObjectURL(file);
    setAvatar(imagePreview);
  }

  return (
    <div className="space-y-4">
      {/* - Apresentação */}
      <section className="bg-white rounded-xl p-2 flex flex-col xl:flex-row justify-between items-center gap-6 border border-gray-200">
        <div className="flex-1">
          <p className="text-sm text-zinc-800">
            <span className="font-semibold">
              Opções de gerenciamento de usuários.
            </span>{" "}
            Saiba quais funções cada usuário pode desempenhar e quais permissões
            são atribuídas a cada perfil. Segurança e organização dos acessos
            conforme a responsabilidade.
          </p>
        </div>
        <div className="flex-1 max-w-md w-full">
          <img
            src={ImgUsers}
            alt="Ilustração"
            className="w-full rounded-xl object-contain"
          />
        </div>
      </section>

      {/*Formulário */}
      <section className="bg-[#F9F9F9] rounded-xl p-2 flex flex-col xl:flex-row gap-6 items-stretch xl:h-[270px] border border-gray-200">
        <div className="w-full xl:w-[200px] flex flex-col items-center justify-between h-full">
          <div className="bg-white rounded-xl shadow-md w-full h-[220px] flex items-center justify-center">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden">
              <Avatar className="w-full h-full">
                <AvatarImage src={avatar} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 justify-center">
            <span className="text-sm font-medium text-zinc-700 bg-white rounded-full px-3 py-1 shadow-sm">
              Upload da imagem
            </span>
            <label className="cursor-pointer">
              <input
                type="file"
                onChange={(e) => handleChangeAvatar(e.target.files[0])}
                className="hidden"
              />
              <div className="bg-white hover:bg-zinc-100 p-2 rounded-full shadow-sm">
                <CloudUploadAlt className="w-4 h-4 text-zinc-600" />
              </div>
            </label>
          </div>
        </div>

        <form
          onSubmit={handleCreateUser}
          className="flex-1 grid grid-cols-1 bg-white p-2 rounded-xl sm:grid-cols-2 gap-4 border border-gray-200"
        >
          <Input
            className="h-full rounded-xl"
            placeholder="Nome completo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            className="h-full rounded-xl"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Input
            className="h-full rounded-xl"
            placeholder="Senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <SelectField
            placeholder="Perfil"
            value={newRole}
            options={[
              { value: "SECTOR_CHIEF", label: "Chefe de Setor" },
              { value: "CHIEF", label: "Gestor" },
              { value: "ANALYST", label: "Analista" },
              { value: "INSPECTOR", label: "Inspetor" },
              { value: "PILOT", label: "Piloto" },
              { value: "DRONE_OPERATOR", label: "Operador de Drone" },
              { value:"TRUCK_DRIVER", label: "Motorista de caminhão"}
            ]}
            onChange={(val) => setNewRole(val)}
            className="rounded-xl h-full border border-gray-300 px-4 text-sm"
          />

          <div className="col-span-full">
            <Button
              type="submit"
              className="h-full w-full bg-[#A6E0FF] hover:bg-[#87CEEB] text-[#00679D]"
            >
              Cadastrar
            </Button>
          </div>
        </form>
      </section>

      {/* Lista de usuários */}
      <section className="space-y-3">
        {/* Filtros */}
        <div className="p-2 flex items-center justify-between gap-3 h-[71px] bg-[#F7F7F7] rounded-xl border border-gray-200">
          {/* Filtro por nome */}
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquise por nome"
            className="bg-white rounded-xl h-[55px] placeholder:text-center flex-1"
          />

          {/* Filtro por cargo  */}
          <SelectField
            placeholder="Por cargo"
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            options={[
              { value: "SECTOR_CHIEF", label: "Chefe de Setor" },
              { value: "CHIEF", label: "Gestor" },
              { value: "ANALYST", label: "Analista" },
              { value: "INSPECTOR", label: "Inspetor" },
              { value: "PILOT", label: "Piloto" },
              { value: "DRONE_OPERATOR", label: "Operador de Drone" },
            ]}
            className="rounded-xl h-[55px] border border-gray-300 px-4 text-sm bg-white w-[180px]"
          />

          {/* Filtro por status  */}
          <SelectField
            placeholder="Por status"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: "ATIVO", label: "Ativo" },
              { value: "BLOQUEADO", label: "Bloqueado" },
            ]}
            className="rounded-xl h-[55px] border border-gray-300 px-4 text-sm bg-white w-[160px]"
          />

          {/* contador  */}
          {isFilterActive && !allLoaded ? (
            <span className="text-xs text-gray-500 shrink-0">
              Carregando todos os usuários…
            </span>
          ) : searchTerm || roleFilter || statusFilter ? (
            <span className="text-xs text-gray-500 shrink-0">
              {filteredUsers.length} resultado
              {filteredUsers.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        <div className="hidden xl:block bg-[#D9DCE2] text-[#020231] font-semibold rounded-xl px-4 py-5 border border-gray-200 text-sm">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3">Nome</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Perfil</div>
            <div className="col-span-2">Ações</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-zinc-600">
            {isFilterActive && !allLoaded
              ? "Carregando…"
              : `Nenhum usuário encontrado${
                  searchTerm || roleFilter || statusFilter
                    ? " para esse filtro."
                    : "."
                }`}
          </div>
        )}

        {filteredUsers.map((user) => {
          const status = user.deletedAt ? "bloqueado" : "ativo";

          return (
            <div
              key={user.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="hover:bg-gray-50 transition cursor-pointer">
                {/* MOBILE */}
                <div className="xl:hidden p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Nome
                          </span>
                          {user.name}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Email
                          </span>
                          {user.email}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Perfil
                          </span>
                          {user.role}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">
                            Ações
                          </span>
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:underline text-xs">
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setRemoveModalOpen(true);
                              }}
                              className="text-red-500 hover:underline text-xs"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs font-medium text-gray-400 block">
                            Status
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              status === "ativo"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DESKTOP */}
                <div className="hidden xl:block p-4">
                  <div className="grid grid-cols-12 gap-4 items-center text-[#787891] text-sm">
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                        {getInicials(user.name)}
                      </span>
                      <span className="text-sm truncate">{user.name}</span>
                    </div>
                    <div className="col-span-3">{user.email}</div>
                    <div className="col-span-2">{user.role}</div>
                    <div className="col-span-2 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setRemoveModalOpen(true);
                        }}
                        className="p-1 hover:bg-zinc-100 rounded"
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          status === "ativo"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Paginação  */}
        {!isFilterActive && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">Página {currentPage}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goPrev}
                disabled={!canGoPrev}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goNext}
                disabled={!canGoNext}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </section>

      {removeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-red-600">
              Remover usuário
            </h2>
            <p>
              Tem certeza que deseja remover{" "}
              <strong>{selectedUser?.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setRemoveModalOpen(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await api.delete(`/employees/${selectedUser.id}`);
                    setRemoveModalOpen(false);
                    await fetchUsers(1);
                    toast({
                      title: "Usuário removido",
                      description: "O usuário foi removido com sucesso.",
                      variant: "success",
                    });
                  } catch (error) {
                    console.error("Erro ao remover:", error);
                    toast({
                      title: "Erro",
                      description: "Não foi possível remover o usuário.",
                      variant: "destructive",
                    });
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
