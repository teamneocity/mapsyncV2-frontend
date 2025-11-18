import { useAuth } from "@/hooks/auth";

export const usePermissions = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isAnalyst = user?.role === "ANALYST";
  const isOperator = user?.role === "FIELD_AGENT";
  const isSupervisor = user?.role === "SECTOR_CHIEF";
  const isInspector = user?.role == "INSPECTOR";
  const isChief = user?.role == "CHIEF";
  const isPilot = user?.role == "PILOT";
  const isDroneOperator = user?.role == "DRONE_OPERATOR";

  return {
    isAdmin,
    isAnalyst,
    isOperator,
    isSupervisor,
    isInspector,
    isChief,
    isPilot,
    isDroneOperator
  };
};
