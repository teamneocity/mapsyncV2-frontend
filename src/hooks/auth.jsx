import { createContext, useContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [data, setData] = useState({});
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = useRef(null); // guarda o setInterval
  const { toast } = useToast();

  // Renova o accesstoken usando o refreshtoken (7 dias)
  async function renewAccessToken() {
  try {
    const storedRefreshToken =
      refreshToken || localStorage.getItem("@popcity:refreshToken");

    if (!storedRefreshToken) {
      return;
    }

    const response = await api.post("/auth/renew", {
      refreshToken: storedRefreshToken,
    });

    const { accessToken: newAccessToken } = response.data;

    if (!newAccessToken) return;

    api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
    localStorage.setItem("@popcity:accessToken", newAccessToken);

    setData((prev) => ({
      ...prev,
      token: newAccessToken,
    }));
  } catch (error) {
    console.error("Erro ao renovar access token:", error);
    signOut();
  }
}


  // Inicia/renova o ciclo de refresh a cada 4min30s
  function startRefreshCycle(refreshTokenValue) {
    if (!refreshTokenValue) return;

    // limpa intervalo anterior se existir
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    const id = setInterval(() => {
      // chama a função que bate em /auth/renew
      renewAccessToken();
    }, 4 * 60 * 1000); // 4 minutos e 30 segundos

    refreshIntervalRef.current = id;
  }

  async function signIn({ email, password }) {
    try {
      const response = await api.post("/sessions", { email, password });

      const {
        access_token,
        refresh_token,
        employee_name,
        employee_email,
      } = response.data;

      const token = access_token;

      // Decodificando o token para pegar o cargo (role)
      const decodedToken = jwtDecode(token);
      const role = decodedToken.role;

      const user = {
        name: employee_name,
        email: employee_email,
        role, // Aqui o cargo é armazenado
      };

      localStorage.setItem("@popcity:user", JSON.stringify(user));
      localStorage.setItem("@popcity:loginTime", Date.now().toString());

      // guarda os dois tokens
      localStorage.setItem("@popcity:accessToken", token);
      localStorage.setItem("@popcity:refreshToken", refresh_token);
      // para compatibilidade com o que já existia
      localStorage.removeItem("@popcity:token");

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setData({ user, token });
      setRefreshToken(refresh_token);

      // inicia o ciclo de renovação do access_token
      startRefreshCycle(refresh_token);
    } catch (error) {
      console.error(" Erro no login:", error);

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

  function clearRefreshCycle() {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }

  function signOut() {
    clearRefreshCycle();

    localStorage.removeItem("@popcity:user");
    localStorage.removeItem("@popcity:accessToken");
    localStorage.removeItem("@popcity:refreshToken");
    localStorage.removeItem("@popcity:token"); // legado
    localStorage.removeItem("@popcity:loginTime");

    setData({});
    setRefreshToken(null);
    api.defaults.headers.common["Authorization"] = null;
  }

  async function updateProfile({ user }) {
    try {
      const { name, email, role } = user;

      await api.patch(`/me/update-employee`, {
        name,
        email,
      });
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

    // suporta chave nova e antiga
    const storedAccessToken =
      localStorage.getItem("@popcity:accessToken") ||
      localStorage.getItem("@popcity:token");

    const storedRefreshToken = localStorage.getItem("@popcity:refreshToken");
    const loginTime = localStorage.getItem("@popcity:loginTime");

    if (storedAccessToken && userData && loginTime) {
      const now = Date.now();
      const timeElapsed = now - parseInt(loginTime, 10);

      // agora 7 dias (igual refresh_token)
      const tokenExpirationTime = 7 * 24 * 60 * 60 * 1000;

      if (timeElapsed > tokenExpirationTime) {
        signOut();
      } else {
        api.defaults.headers.common["Authorization"] =
          `Bearer ${storedAccessToken}`;

        try {
          // Decodifica novamente para garantir que role esteja presente
          const decodedToken = jwtDecode(storedAccessToken);
          const role = decodedToken.role;

          const parsedUser = JSON.parse(userData);
          const userWithRole = {
            ...parsedUser,
            role,
          };

          setData({
            user: userWithRole,
            token: storedAccessToken,
          });
          setRefreshToken(storedRefreshToken || null);

          // se tiver refreshToken salvo, já volta com o ciclo de renovação
          if (storedRefreshToken) {
            startRefreshCycle(storedRefreshToken);
          }
        } catch (err) {
          console.error("Erro ao decodificar token salvo:", err);
          signOut();
        }
      }
    }

    setLoading(false);

    // cleanup quando o provider desmontar
    return () => {
      clearRefreshCycle();
    };
  }, []);

  async function resetPassword(email) {
    try {
      await api.post("/employees/password/forgot", { email });
    } catch (error) {
      console.error("Erro ao enviar solicitação de senha:", error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{ signIn, signOut, updateProfile, resetPassword, user: data.user }}
    >
      {loading ? null : children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth };
