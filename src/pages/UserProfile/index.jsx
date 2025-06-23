import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/passwordInput";
import { ProfileUpload } from "./userProfile-uploadbtn";
import { useAuth } from "@/hooks/auth";
import { getInicials } from "@/lib/utils";
import { api } from "@/services/api";
import { LiveActionButton } from "@/components/live-action-button";
import { TopHeader } from "@/components/topHeader";
import Mapa from "@/assets/Mapa.svg";
import Mapa2 from "@/assets/Mapa2.svg";

export function UserProfile() {
  const { signOut, user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [passwordOld, setPasswordOld] = useState();
  const [passwordNew, setPasswordNew] = useState();
  console.log("user", user);

  const avatarUrl = user.avatar
    ? `${api.defaults.baseURL}/avatar/${user.avatar}`
    : "";
  const [avatar, setAvatar] = useState(avatarUrl);
  const [avatarFile, setAvatarFile] = useState(null);

  const initials = getInicials(name);

  function handleChangeAvatar(file) {
    setAvatarFile(file);
    const imagePreview = URL.createObjectURL(file);
    setAvatar(imagePreview);
  }

  async function handleUpdateInfo(e) {
  e.preventDefault();

  try {
    // Passo 1: buscar o ID do usuário logado
    const response = await api.get("/me");
    const userId = response.data.id;

    // Passo 2: atualizar nome e email
    await api.patch(`/me/update-employee/${userId}`, {
      name,
      email,
    });

    alert("Informações atualizadas com sucesso!");
  } catch (error) {
    console.error(error);
    alert("Erro ao atualizar as informações.");
  }
}


  async function handleChangePassword(e) {
    e.preventDefault();

    if (!passwordOld || !passwordNew) {
      alert("Preencha os dois campos de senha.");
      return;
    }

    try {
      await api.patch("/me/change-password", {
        currentPassword: passwordOld,
        newPassword: passwordNew,
      });

      alert("Senha atualizada com sucesso!");
      setPasswordOld("");
      setPasswordNew("");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar senha. Verifique os dados.");
    }
  }

  return (
    <div className="bg-[#EBEBEB] gap-0 font-inter min-h-screen ">
      <Sidebar />

      <main className="max-w-6xl sm:ml-[250px] mx-auto space-y-8 mt-6">
        <TopHeader />
        {/* LINHA 1: Título e descrição */}
        <section className="bg-white rounded-xl p-2 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              <span className="font-semibold">Seu Perfil.</span> Nesta seção,
              você tem o controle total sobre seu acesso ao sistema. Atribua
              níveis de acesso (Administrador, Supervisor, Operador de Campo,
              Visualizador etc.), garantindo que cada usuário visualize apenas
              as informações relevantes para sua função.
            </p>
          </div>
          <div className="flex-1 max-w-[584px]">
            <img
              src={Mapa}
              alt="Ilustração"
              className="w-full rounded-xl object-contain"
            />
          </div>
        </section>

        {/* LINHA 2: Avatar + Inputs */}
        <section className="bg-[#F9F9F9] rounded-xl p-6 flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center w-full md:max-w-[200px]">
            <Avatar className="w-28 h-28">
              <AvatarImage src={avatar} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <ProfileUpload onFileChange={handleChangeAvatar} />
          </div>

          <form className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              className="h-22"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              className="h-22"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              className="h-22"
              placeholder="Setor"
              disabled
              value={user?.sector?.name || "Não definido"}
            />
            <Input
              className="h-22"
              placeholder="Data de nascimento"
              disabled
              value={user?.birthDate || "01/01/1990"}
            />
            <div className="col-span-full pt-2">
              <Button
                onClick={handleUpdateInfo}
                type="button"
                className="h-[80px] w-full bg-[#A6E0FF] hover:bg-[#87CEEB] text-[#00679D]"
              >
                Salvar Informações
              </Button>
            </div>
          </form>
        </section>

        {/* LINHA 3: Atividades e Senha */}
        <section className="bg-[#F5F5F5] rounded-xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividades recentes com scroll */}
          <div className="max-h-[440px] overflow-y-auto pr-2">
            <h3 className="font-semibold text-base mb-4">
              Atividades de acessos recentes
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                "Mac",
                "Windows",
                "Iphone",
                "Android",
                "teste",
                "teste",
                "Linux",
                "ChromeOS",
              ].map((device, i) => (
                <li
                  key={i}
                  className="bg-white h-[80px] rounded-lg p-3 flex justify-between items-center"
                >
                  <span>
                    Último login em {device}
                    <br />
                    03 de junho de 2023 às 16:30 Aracaju, Sergipe, Brasil
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Alterar senha - altura fixa, botão visível */}
          <div className="flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="mb-2">
                <p className="font-semibold text-sm text-zinc-800">
                  Altere sempre sua senha e a mantenha segura.
                </p>
                <p className="text-xs text-zinc-600">
                  Última alteração <strong>01/02/2025</strong>
                </p>
              </div>

              <div className="bg-[#E5E5F7] p-4 rounded-xl mb-4">
                <img
                  src={Mapa2}
                  alt="Segurança"
                  className="w-full object-contain"
                />
              </div>

              <PasswordInput
                placeholder="Senha atual"
                value={passwordOld}
                className="h-[80px]"
                onChange={(e) => setPasswordOld(e.target.value)}
              />
              <PasswordInput
                placeholder="Nova senha"
                value={passwordNew}
                className="h-[80px] mt-2"
                onChange={(e) => setPasswordNew(e.target.value)}
              />
            </div>

            <Button
              onClick={handleChangePassword}
              className="h-[70px] w-full bg-[#A6E0FF] hover:bg-[#87CEEB] text-[#00679D] mt-4"
            >
              Atualizar senha
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
