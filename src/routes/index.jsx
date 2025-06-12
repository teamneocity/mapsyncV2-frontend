import { BrowserRouter } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

import { AppRoutes } from "./app.routes";
import { AuthRoutes } from "./auth.routes";

export function Routes() {
  const { user, loading } = useAuth(); // Pegue o estado de carregamento do contexto

  if (loading) {
    return <div>Carregando...</div>; // Ou qualquer outro indicador de carregamento
  }

  return (
    <BrowserRouter>
      {user ? <AppRoutes /> : <AuthRoutes />}
    </BrowserRouter>
  );
}
