import { useAuth } from "@/hooks/auth";

export const usePermissions = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isAnalyst = user?.role === "ANALYST";
  const isOperator = user?.role === "FIELD_AGENT";
  const isSupervisor = user?.role === "SECTOR_CHIEF";
  const isInspector = user?.role == "INSPECTOR";

  return {
    isAdmin,
    isAnalyst,
    isOperator,
    isSupervisor,
    isInspector
  };
};
