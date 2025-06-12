import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const { toast } = useToast();

  async function signIn({ email, password }) {
    try {
      const response = await api.post("/login", { email, password });
      const { user, token } = response.data;

      localStorage.setItem("@popcity:user", JSON.stringify(user));
      localStorage.setItem("@popcity:loginTime", Date.now().toString());
      localStorage.setItem("@popcity:token", token);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setData({ user, token });

    } catch (error) {
      if (error.response) {
        toast({
          variant: "destructive",
          title: error.response.data.msg,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Não foi possível entrar.",
          description: "Teve um problema na sua requisição.",
        });
      }
    }
  }

  function signOut() {
    localStorage.removeItem("@popcity:user");
    localStorage.removeItem("@popcity:token");
    localStorage.removeItem("@popcity:loginTime");

    setData({});
  }

  async function updateProfile({ user, avatarFile }) {
    try {
      if (avatarFile) {
        const fileUploadForm = new FormData();
        fileUploadForm.append("avatar", avatarFile);

        const response = await api.patch("/users/avatar", fileUploadForm);

        user.avatar = response.data.avatar;
      }

      await api.put("/users", user);
      localStorage.setItem("@popcity:user", JSON.stringify(user));

      setData({ user, token: data.token });
      toast({
        description: "Perfil Atualizado!",
      });
    } catch (error) {
      if (error.response) {
        toast({
          variant: "destructive",
          title: error.response.data.error,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Não foi possível Atualizar o perfil.",
          description: "Teve um problema na sua requisição.",
        });
      }
    }
  }

  useEffect(() => {
    const user = localStorage.getItem("@popcity:user");
    const token = localStorage.getItem("@popcity:token");
    const loginTime = localStorage.getItem("@popcity:loginTime");
  
    if (token && user && loginTime) {
      const now = Date.now();
      const timeElapsed = now - parseInt(loginTime, 10);
      const tokenExpirationTime = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
  
      if (timeElapsed > tokenExpirationTime) {
        signOut();
      } else {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setData({
          user: JSON.parse(user),
          token,
        });
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ signIn, signOut, updateProfile, user: data.user }}>
      {loading ? null : children} {/* Só renderiza os filhos após o carregamento */}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth };
