import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CloudUploadAlt from "@/assets/icons/cloudUploadAlt.svg?react";
import { useAuth } from "@/hooks/auth";
import { getInicials } from "@/lib/utils";
import { api } from "@/services/api";
import { TopHeader } from "@/components/topHeader";
import ImgUsers from "@/assets/icons/imgUsers.svg";
import Block from "@/assets/icons/block.svg?react";
import Trash from "@/assets/icons/trash.svg?react";
import Edit from "@/assets/icons/edit.svg?react";

export function UserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");

  // no topo do componente
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("SECTOR_CHIEF");

  const [users, setUsers] = useState([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // pra saber qual usuário foi clicado

  async function handleCreateUser(e) {
    e.preventDefault();
    try {
      await api.post("/accounts", {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      alert("Usuário criado com sucesso!");
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("SECTOR_CHIEF");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar usuário.");
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await api.get("/employees");
      setUsers(response.data.employees); // agora sim, é um array
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  }

  const avatarUrl = user.avatar
    ? `${api.defaults.baseURL}/avatar/${user.avatar}`
    : "";
  const [avatar, setAvatar] = useState(avatarUrl);
  const initials = getInicials(name);

  function handleChangeAvatar(file) {
    const imagePreview = URL.createObjectURL(file);
    setAvatar(imagePreview);
  }

  return (
    <div className="bg-[#EBEBEB] min-h-screen font-inter">
      <Sidebar />
      {/* MODAL EDITAR */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Editar usuário</h2>

            <div className="space-y-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome completo"
              />
              <Input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email"
              />
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full h-[40px] border border-gray-300 rounded-md px-2 text-sm"
              >
                <option value="SECTOR_CHIEF">Chefe de Setor</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="MANAGER">Gestor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setEditModalOpen(false)} variant="outline">
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await api.put(`/accounts/${selectedUser.id}`, {
                      name: editName,
                      email: editEmail,
                      role: editRole,
                    });
                    setEditModalOpen(false);
                    fetchUsers();
                  } catch (error) {
                    console.error("Erro ao editar:", error);
                    alert("Erro ao editar usuário");
                  }
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REMOVER */}
      {removeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
                  console.log("Usuário selecionado:", selectedUser.id);
                  try {
                    await api.delete(`/employees/${selectedUser.id}`);
                    setRemoveModalOpen(false);
                    fetchUsers(); // Atualiza lista
                  } catch (error) {
                    console.error("Erro ao remover:", error);
                    alert("Erro ao remover usuário");
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

      {/* MODAL BLOQUEAR */}
      {blockModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-yellow-600">
              Bloquear usuário
            </h2>
            <p>
              Deseja bloquear <strong>{selectedUser?.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setBlockModalOpen(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await api.put(`/accounts/${selectedUser.id}/status`, {
                      status: "bloqueado",
                    });
                    setBlockModalOpen(false);
                    fetchUsers(); // Atualiza lista
                  } catch (error) {
                    console.error("Erro ao bloquear:", error);
                    alert("Erro ao bloquear usuário");
                  }
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-white"
              >
                Bloquear
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="w-full px-6 sm:pl-[250px] max-w-full space-y-4 pt-6">
        <TopHeader />

        {/* SEÇÃO 1 - Apresentação */}
        <section className="max-w-[1500px] w-full mx-auto bg-white rounded-xl p-2 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              Opções de gerenciamento de usuários. Saiba quais funções cada
              usuário pode desempenhar e quais permissões são atribuídas a cada
              perfil. Garantimos segurança, organização e personalização de
              acessos, respeitando o nível de responsabilidade e a função de
              cada colaborador ou equipe.
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

        {/* SEÇÃO 2 - Pesquisa visual */}
        <section className="max-w-[1500px] w-full mx-auto bg-white border border-zinc-200 rounded-xl px-4 py-4 flex flex-col xl:flex-row gap-3 items-center justify-between">
          <div className="flex w-full gap-2">
            {/* Input ocupa todo o espaço disponível */}
            <input
              type="text"
              placeholder="Pesquise por nome"
              className="flex-1 h-[48px] rounded-xl border border-zinc-300 px-4 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            />

            {/* Select e botão alinhados à direita */}
            <select className="h-[48px] rounded-xl border border-zinc-300 px-3 text-sm bg-white text-zinc-700">
              <option>Por cargo</option>
              <option value="ADMIN">Administrador</option>
              <option value="MANAGER">Gestor</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="SECTOR_CHIEF">Chefe de setor</option>
            </select>

            <button className="h-[48px] px-6 bg-[#A6E0FF] hover:bg-[#87CEEB] text-[#00679D] text-sm font-medium rounded-xl transition">
              Aplicar
            </button>
          </div>
        </section>

        {/* SEÇÃO 3 - Formulário de dados */}
        <section className="max-w-[1500px] w-full mx-auto bg-[#F9F9F9] rounded-xl p-2 flex flex-col xl:flex-row gap-6 items-stretch xl:h-[270px]">
          {/* Coluna da imagem */}
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

          {/* Coluna dos inputs */}
          <form
            onSubmit={handleCreateUser}
            className="flex-1 grid grid-cols-1 bg-white p-2 border-b rounded-xl sm:grid-cols-2 gap-1"
          >
            <Input
              className="h-[64px]"
              placeholder="Nome completo"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              className="h-[64px]"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              className="h-[64px]"
              placeholder="Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <select
              className="h-[64px] rounded-md border border-gray-300 px-4 text-sm"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="SECTOR_CHIEF">Chefe de Setor</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="MANAGER">Gestor</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <div className="col-span-full">
              <Button
                type="submit"
                className="h-[55px] w-full bg-[#A6E0FF] hover:bg-[#87CEEB] text-[#00679D]"
              >
                Criar usuário
              </Button>
            </div>
          </form>
        </section>
        {/* SEÇÃO 4 - Lista de usuários */}
        <section className="max-w-[1500px] w-full mx-auto">
          {/* Cabeçalho - apenas desktop */}
          <div className="hidden xl:block bg-[#D9DCE2] text-[#020231] font-semibold rounded-xl px-4 py-5 border border-gray-200 mb-2 text-sm">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3">Nome</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Perfil</div>
              <div className="col-span-2">Ações</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
          </div>

          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Linha principal */}
              <div className="hover:bg-gray-50 transition cursor-pointer">
                {/* Mobile */}
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
                            <button className="text-red-500 hover:underline text-xs">
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
                              user.status === "ativo"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop */}
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
                          setEditName(user.name);
                          setEditEmail(user.email);
                          setEditRole(user.role);
                          setEditModalOpen(true);
                        }}
                        className="p-1 hover:bg-zinc-100 rounded"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setRemoveModalOpen(true);
                        }}
                        className="p-1 hover:bg-zinc-100 rounded"
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setBlockModalOpen(true);
                        }}
                        className="p-1 hover:bg-zinc-100 rounded"
                      >
                        <Block className="w-4 h-4 text-yellow-500" />
                      </button>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === "ativo"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
