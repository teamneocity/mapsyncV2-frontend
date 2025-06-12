import { useAuth } from "@/hooks/auth";

export const usePermissions = () => {
  const { user } = useAuth();

  const isManager = user.role === "gestor";
  const isAnalyst = user.role === "analista";
  const isOperator = user.role === "operador";
  const isSupervisor = user.role === "supervisor";
  const isAdmin = user.role === "admin"

  return {
    isManager,
    isAnalyst,
    isOperator,
    isSupervisor,
    isAdmin,
  };
};