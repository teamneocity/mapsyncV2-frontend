import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  async function signIn({ email, password }) {
    try {
      const response = await api.post("/sessions", { email, password });

      const { access_token, employee_name, employee_email } = response.data;
      const token = access_token;

      // ⬇️ Decodificando o token para pegar o cargo (role)
      const decodedToken = jwtDecode(token);
      console.log("🧠 Token decodificado:", decodedToken);
      const role = decodedToken.role;

      const user = {
        name: employee_name,
        email: employee_email,
        role, // ⬅️ Aqui o cargo é armazenado
      };

      localStorage.setItem("@popcity:user", JSON.stringify(user));
      localStorage.setItem("@popcity:loginTime", Date.now().toString());
      localStorage.setItem("@popcity:token", token);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setData({ user, token });
    } catch (error) {
      console.error("❌ Erro no login:", error);

      if (error.response) {
        toast({
          variant: "destructive",
          title: error.response.data.msg || error.response.data.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: "Algo inesperado aconteceu.",
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
    const userData = localStorage.getItem("@popcity:user");
    const token = localStorage.getItem("@popcity:token");
    const loginTime = localStorage.getItem("@popcity:loginTime");

    if (token && userData && loginTime) {
      const now = Date.now();
      const timeElapsed = now - parseInt(loginTime, 10);
      const tokenExpirationTime = 24 * 60 * 60 * 1000;

      if (timeElapsed > tokenExpirationTime) {
        signOut();
      } else {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // ⬇️ Decodifica novamente para garantir que role esteja presente
        const decodedToken = jwtDecode(token);
        const role = decodedToken.role;

        const parsedUser = JSON.parse(userData);
        const userWithRole = {
          ...parsedUser,
          role,
        };

        setData({
          user: userWithRole,
          token,
        });
      }
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ signIn, signOut, updateProfile, user: data.user }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth };
