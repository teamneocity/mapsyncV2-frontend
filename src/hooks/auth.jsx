import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();


  async function renewAccessToken() {
    try {
      const response = await api.post("/auth/renew");

      const { access_token, accessToken } = response.data;
      const newAccessToken = accessToken || access_token;

      if (!newAccessToken) {
        return null;
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

      localStorage.setItem("@popcity:accessToken", newAccessToken);

      setData((prev) => ({
        ...prev,
        token: newAccessToken,
      }));
      return newAccessToken;
    } catch (error) {
      console.error("Erro ao renovar access token:", error);
      throw error;
    }
  }

  async function signIn({ email, password }) {
    try {
      const response = await api.post("/sessions", { email, password });

      const {
        access_token,
        employee_name,
        employee_email,
      } = response.data;

      const token = access_token;

      const decodedToken = jwtDecode(token);
      const role = decodedToken.role;

      const user = {
        name: employee_name,
        email: employee_email,
        role,
      };

      localStorage.setItem("@popcity:user", JSON.stringify(user));
      localStorage.setItem("@popcity:loginTime", Date.now().toString());

      localStorage.setItem("@popcity:accessToken", token);
      localStorage.removeItem("@popcity:token");

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setData({ user, token });
    } catch (error) {
      console.error("Erro no login:", error);

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
    localStorage.removeItem("@popcity:accessToken");
    localStorage.removeItem("@popcity:token"); 
    localStorage.removeItem("@popcity:loginTime");

    setData({});
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

    const storedAccessToken =
      localStorage.getItem("@popcity:accessToken") ||
      localStorage.getItem("@popcity:token");

    const loginTime = localStorage.getItem("@popcity:loginTime");

    if (storedAccessToken && userData && loginTime) {
      const now = Date.now();
      const timeElapsed = now - parseInt(loginTime, 10);
      const tokenExpirationTime = 7 * 24 * 60 * 60 * 1000;

      if (timeElapsed > tokenExpirationTime) {
        signOut();
      } else {
        api.defaults.headers.common["Authorization"] =
          `Bearer ${storedAccessToken}`;

        try {
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
        } catch (err) {
          console.error("Erro ao decodificar token salvo:", err);
          signOut();
        }
      }
    }

    setLoading(false);
  }, []);

  async function resetPassword(email) {
    try {
      await api.post("/employees/password/forgot", { email });
    } catch (error) {
      console.error("Erro ao enviar solicitação de senha:", error);
      throw error;
    }
  }


  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;
        const originalRequest = error.config;

        if (status !== 401 || !originalRequest) {
          return Promise.reject(error);
        }

        const url = originalRequest.url || "";

        if (
          url.includes("/sessions") ||
          url.includes("/employees/password/forgot") ||
          url.includes("/auth/renew")
        ) {
          return Promise.reject(error);
        }

        if (originalRequest._retry) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const newAccessToken = await renewAccessToken();

          if (!newAccessToken) {
            signOut();
            return Promise.reject(error);
          }
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
          };

          
          return api(originalRequest);
        } catch (refreshError) {
          
          signOut();
          return Promise.reject(refreshError);
        }
      }
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, []);

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
