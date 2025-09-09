// React e bibliotecas externas
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Hooks customizados
import { useAuth } from "@/hooks/auth";

// Componentes globais
import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/topHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/passwordInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Serviços e utilitários
import { api } from "@/services/api";
import { getInicials } from "@/lib/utils";

// Assets
import Mapa from "@/assets/Mapa.svg";
import Mapa2 from "@/assets/Mapa2.svg";
import CloudUploadAlt from "@/assets/icons/cloudUploadAlt.svg?react";
import Ponto from "@/assets/icons/Ponto.svg?react";
import Pc from "@/assets/icons/Pc.svg?react";

export function UserProfile() {
  const { user } = useAuth();

  const [name] = useState(user.name);
  const [email] = useState(user.email);
  const [passwordOld, setPasswordOld] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [recentAccess, setRecentAccess] = useState([]);

  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(0);

  const initials = getInicials(name);

  const S3_BASE = "https://mapsync-media.s3.sa-east-1.amazonaws.com";

  async function loadAvatarUrl() {
    try {
      const res = await api.get("/employees/me/avatar/url");
      const key = typeof res.data === "string" ? res.data : res.data?.url;

      if (key) {
        setAvatar(`${S3_BASE}/${key}?v=${avatarVersion}`);
      } else {
        setAvatar("");
      }
    } catch (err) {
      console.error("[avatar] erro ao carregar key:", err);
      setAvatar("");
    }
  }

  async function uploadAvatar() {
    if (!avatarFile) {
      alert("Selecione uma imagem primeiro.");
      return;
    }
    try {
      const form = new FormData();
      form.append("file", avatarFile);

      await api.patch("/employees/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAvatarVersion((v) => v + 1);
      await loadAvatarUrl();
      setAvatarFile(null);
      alert("Foto atualizada com sucesso!");
    } catch (err) {
      console.error("Erro ao enviar avatar:", err);
      alert("Erro ao enviar a imagem. Tente novamente.");
    }
  }

  function handleChangeAvatar(file) {
    if (!file) return;
    setAvatarFile(file);

    const preview = URL.createObjectURL(file);
    setAvatar((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return preview;
    });
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
    try {
      const recentAccess = await api.get("/me/access-logs");
      setRecentAccess(recentAccess.data);
    } catch (err) {
      console.error("Erro ao buscar acessos recentes:", err);
    }
  }

  useEffect(() => {
    loadAvatarUrl();
    fetchRecentAccess();
  }, [avatarVersion]);

  useEffect(() => {
    return () => {
      if (avatar && avatar.startsWith("blob:")) {
        URL.revokeObjectURL(avatar);
      }
    };
  }, [avatar]);

  return (
    <div className="bg-[#EBEBEB] min-h-screen font-inter">
      <Sidebar />

      <main className="w-full px-6 sm:pl-[250px] max-w-full space-y-4 pt-6">
        <TopHeader />

        {/* LINHA 1 */}
        <section className="max-w-[1500px] w-full mx-auto bg-white rounded-xl p-2 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <p className="text-sm text-zinc-800">
              <span className="font-semibold">Seu Perfil.</span> Nesta seção,
              você tem o controle total sobre seu acesso o sistema. Atribua
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

        {/* LINHA 2 */}
        <section className="max-w-[1500px] w-full mx-auto bg-[#F9F9F9] rounded-xl p-2 flex flex-col xl:flex-row gap-6 items-stretch xl:h-[270px]">
          {/* Coluna da imagem */}
          <div className="w-full xl:w-[200px] flex flex-col items-center justify-between h-full">
            <div className="bg-white rounded-xl shadow-md w-full h-[220px] flex items-center justify-center">
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage
                    key={avatar}
                    src={avatar || undefined}
                    alt="Avatar"
                    onError={() => setAvatar("")}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Upload + salvar (layout mínimo) */}
            <div className="mt-2 flex items-center gap-2 justify-center">
              <span className="text-[11px] font-medium text-zinc-700 bg-white rounded-full px-3 py-1 shadow-sm">
                Upload da imagem
              </span>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChangeAvatar(e.target.files?.[0])}
                  className="hidden"
                />
                <div className="bg-white hover:bg-zinc-100 p-2 rounded-full shadow-sm">
                  <CloudUploadAlt className="w-4 h-4 text-zinc-600" />
                </div>
              </label>

              <Button
                onClick={uploadAvatar}
                disabled={!avatarFile}
                className="h-9 px-3 bg-[#A6E0FF] hover:bg-[#87CEEB] text-[#00679D]"
              >
                Salvar
              </Button>
            </div>
          </div>

          {/* Coluna dos inputs */}
          <form className="flex-1 grid grid-cols-1 bg-white p-2 border-b rounded-xl sm:grid-cols-2 gap-4">
            <Input className="h-full rounded-xl" disabled value={name} />
            <Input
              className="h-full rounded-xl"
              disabled
              value={user?.birthDate || "Não definido"}
            />
            <Input
              className="h-full rounded-xl"
              disabled
              value={user?.sector?.name || "Não definido"}
            />
            <Input className="h-full rounded-xl" disabled value={email} />
          </form>
        </section>

        {/* LINHA 3 */}
        <section className="max-w-[1500px] w-full mx-auto bg-[#F5F5F5] rounded-xl p-2 flex flex-col xl:flex-row gap-6">
          {/* Atividades */}
          <div className="max-h-[440px] overflow-y-auto w-full xl:w-1/2">
            <h3 className="font-semibold text-base mb-4">
              Atividades de acessos recentes
            </h3>
            <ul className="space-y-3 text-sm">
              {recentAccess.map((access, i) => {
                const valid =
                  access.accessedAt && !isNaN(new Date(access.accessedAt));
                const date = valid
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
                    <Pc className="w-6 h-6 text-zinc-600" />
                    <div className="flex-1 px-4">
                      <div className="font-semibold text-zinc-800">
                        Último login em {access.os || "Sistema desconhecido"}
                      </div>
                      <div className="text-zinc-600 text-sm">{date}</div>
                      <div className="text-zinc-500 text-xs">
                        {access.location || "Localização não identificada"}
                      </div>
                    </div>
                    <Ponto className="w-5 h-5 text-zinc-500" />
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
