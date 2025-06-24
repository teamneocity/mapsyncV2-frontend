import { useEffect, useState } from "react";
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
import CloudUploadAlt from "@/assets/icons/cloudUploadAlt.svg?react";
import { TopHeader } from "@/components/topHeader";
import Mapa from "@/assets/Mapa.svg";
import Mapa2 from "@/assets/Mapa2.svg";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function UserProfile() {
  const { signOut, user, updateProfile } = useAuth();

  const navigate = useNavigate();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [passwordOld, setPasswordOld] = useState();
  const [passwordNew, setPasswordNew] = useState();

  const [recentAccess, setRecentAccess] = useState([]);

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
      await updateProfile({
        user: {
          email,
          name,
          role: user.role,
        },
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

  async function fetchRecentAccess() {
    const recentAccess = await api.get("/me/access-logs");
    console.log(recentAccess.data);
    setRecentAccess(recentAccess.data);
  }

  useEffect(() => {
    fetchRecentAccess();
  }, []);

  return (
    <div className="bg-[#EBEBEB] min-h-screen font-inter">
      <Sidebar />

      <main className="w-full px-6 sm:pl-[250px] max-w-full space-y-4 pt-6">
        <TopHeader />

        {/* LINHA 1 */}
        <section className=" max-w-[1500px] w-full mx-auto bg-white rounded-xl p-2 flex flex-col xl:flex-row justify-between items-center gap-6 ">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              <span className="font-semibold">Seu Perfil.</span> Nesta seção,
              você tem o controle total sobre seu acesso ao sistema. Atribua
              níveis de acesso (Administrador, Supervisor, Operador de Campo,
              Visualizador etc.), garantindo que cada usuário visualize apenas
              as informações relevantes para sua função.
            </p>
          </div>
          <div className="flex-1 max-w-md w-full">
            <img
              src={Mapa}
              alt="Ilustração"
              className="w-full rounded-xl object-contain"
            />
          </div>
        </section>

        <section className=" max-w-[1500px] w-full mx-auto bg-[#F9F9F9] rounded-xl p-2 flex flex-col xl:flex-row gap-6 items-stretch xl:h-[270px]">
          {/* Coluna da imagem */}
          <div className="w-full xl:w-[200px] flex flex-col items-center justify-between h-full">
            {/* Caixa branca que ocupa quase toda a altura */}
            <div className="bg-white rounded-xl shadow-md w-full h-[220px] flex items-center justify-center">
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Upload fora da caixa, colado abaixo */}
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
          <form className="flex-1 grid grid-cols-1 bg-white p-2 border-b rounded-xl sm:grid-cols-2 gap-1">
            <Input
              className="h-[64px]"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              className="h-[64px]"
              placeholder="Data de nascimento"
              disabled
              value={user?.birthDate || "01/01/1990"}
            />
            <Input
              className="h-[64px]"
              placeholder="Setor"
              disabled
              value={user?.sector?.name || "Não definido"}
            />
            <Input
              className="h-[64px]"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="col-span-full">
              <Button
                onClick={handleUpdateInfo}
                type="button"
                className="h-[55px] w-full bg-[#A6E0FF] hover:bg-[#87CEEB] text-[#00679D]"
              >
                Salvar
              </Button>
            </div>
          </form>
        </section>

        {/* LINHA 3 */}
        <section className=" max-w-[1500px] w-full mx-auto bg-[#F5F5F5] rounded-xl p-2 flex flex-col xl:flex-row gap-6">
          {/* Atividades */}
          <div className="max-h-[440px] overflow-y-auto w-full xl:w-1/2">
            <h3 className="font-semibold text-base mb-4">
              Atividades de acessos recentes
            </h3>
            <ul className="space-y-3 text-sm">
              {recentAccess.map((access, i) => {
                const dataValida =
                  access.accessedAt && !isNaN(new Date(access.accessedAt));
                const dataFormatada = dataValida
                  ? format(
                      new Date(access.accessedAt),
                      "dd 'de' MMMM 'às' HH:mm",
                      { locale: ptBR }
                    )
                  : "Data inválida";

                return (
                  <li
                    key={i}
                    className="bg-white min-h-[80px] rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-zinc-800">
                        {access.os || "Sistema desconhecido"}
                      </div>
                      <div className="text-zinc-600 text-sm">
                        Último login em {dataFormatada}
                      </div>
                      <div className="text-zinc-500 text-xs">
                        {access.location || "Localização não identificada"}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Senha */}
          <div className="flex flex-col justify-between w-full xl:w-1/2 space-y-4">
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
                className="h-[64px]"
                onChange={(e) => setPasswordOld(e.target.value)}
              />
              <PasswordInput
                placeholder="Nova senha"
                value={passwordNew}
                className="h-[64px] mt-2"
                onChange={(e) => setPasswordNew(e.target.value)}
              />
            </div>

            <Button
              onClick={handleChangePassword}
              className="h-[64px] w-full bg-[#A6E0FF] hover:bg-[#87CEEB] text-[#00679D]"
            >
              Atualizar senha
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
