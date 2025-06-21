import { useAuth } from "@/hooks/auth";

export const usePermissions = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isAnalyst = user?.role === "ANALYST";
  const isOperator = user?.role === "FIELD_AGENT";
  const isSupervisor = user?.role === "SECTOR_CHIEF";

  return {
    isAdmin,
    isAnalyst,
    isOperator,
    isSupervisor,
  };
};
