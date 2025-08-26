import { Routes, Route, Navigate } from "react-router-dom";

import { Dashboard } from "@/pages/Dashboard"; //dashboard
import { OccurrencesT } from "@/pages/OccurrencesT"; // mapeamento terrestre
import { OccurrencesA } from "@/pages/OccurrencesA"; // mapeamento aéreo
import { ServiceOrder } from "@/pages/ServiceOrder"; // ordem de serviço
import { Reports } from "@/pages/Reports"; // relatório
import { UserProfile } from "@/pages/UserProfile"; // perfil
import { Analysis } from "@/pages/Analysis"; // análise
import { CreateOccurrencePage } from "@/pages/Pilot";
import { CreateOccurrenceTPage } from "@/pages/PilotT";
import { Inspection } from "@/pages/Inspection"; // fiscalização
import { SectorAdmin } from "@/pages/SectorAdmin"; // setor
import { UserManagement } from "@/pages/UserManagement"; // usuários
import { PilotMap } from "@/pages/PilotMap"; // mapa de percurso
import { ServicePlanning } from "@/pages/ServicePlanning"; // planejamento
import { Feedback } from "@/pages/Feedback"; // feedback
import { Settings } from "@/pages/Settings"; // configurações
import NeighborhoodOccurrences from "@/pages/LiveAction"; // LiveAction
import { ServiceOrderPrint } from "@/pages/ServiceOrder/ServiceOrderPrint"; 

import { useAuth } from "@/hooks/auth";
import { usePermissions } from "@/hooks/usePermissions";

export function AppRoutes() {
  const { user } = useAuth();
  const { isAdmin, isSupervisor, isAnalyst, isInspector, isChief, isPilot } =
    usePermissions();
  const canSeeAll = isAdmin || isSupervisor;

  if (user.role === "pilotoa") {
    return (
      <Routes>
        <Route path="/" element={<CreateOccurrencePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  if (user.role === "pilotot") {
    return (
      <Routes>
        <Route path="/" element={<CreateOccurrenceTPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Redireciona a rota raiz (/) de acordo com o role */}
      <Route
        path="/"
        element={
          ["admin", "gestor", "supervisor"].includes(user.role) ? (
            <Dashboard />
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      />
      {/* Rota: /sectorAdmin */}
      <Route
        path="/sectorAdmin"
        element={canSeeAll || isChief ? <SectorAdmin /> : <Navigate to="/" />}
      />
      {/* Rota: /analysis */}
      <Route
        path="/analysis"
        element={
          isAnalyst || isAdmin || isChief || isSupervisor ? (
            <Analysis />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      {/* Rota: /occurrencesa */}
      <Route
        path="/occurrencesa"
        element={
          canSeeAll || isInspector || isChief ? (
            <OccurrencesA />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      {/* Rota: /occurrencest */}
      <Route
        path="/occurrencest"
        element={
          canSeeAll || isInspector || isChief ? (
            <OccurrencesT />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      {/* Rota: /serviceorder */}
      <Route
        path="/serviceorder"
        element={canSeeAll || isChief ? <ServiceOrder /> : <Navigate to="/" />}
      />
      {/* Rota: /servicePlanning */}
      <Route
        path="/servicePlanning"
        element={
          canSeeAll || isChief ? <ServicePlanning /> : <Navigate to="/" />
        }
      />
      {/* Rota: /inspection */}
      <Route
        path="/inspection"
        element={canSeeAll || isChief ? <Inspection /> : <Navigate to="/" />}
      />
      <Route
        path="/PilotMap"
        element={canSeeAll || isChief ? <PilotMap /> : <Navigate to="/" />}
      />
      {/* Rota: /reports */}
      <Route
        path="/reports"
        element={canSeeAll || isChief ? <Reports /> : <Navigate to="/" />}
      />
      {/* Rota: /userManagement */}
      <Route
        path="/userManagement"
        element={isAdmin || isChief ? <UserManagement /> : <Navigate to="/" />}
      />
      {/* Rota: /feedback */}
      {/* <Route
        path="/feedback"
        element={canSeeAll || isChief ? <Feedback /> : <Navigate to="/" />}
      /> */}
      {/* Rotas livres (não aparecem na Sidebar) */}

      <Route path="/userprofile" element={<UserProfile />} />
      <Route
        path="/dashboard"
        element={canSeeAll || isChief || isInspector ? <Dashboard/> : <Navigate to="/userprofile"/>} 
      />

      {/* <Route path="/settings" element={<Settings />} /> */}
      {/* Admin/Gestor apenas */}
      {["admin", "gestor"].includes(user.role) ? (
        <>
          <Route path="/liveaction" element={<NeighborhoodOccurrences />} />
        </>
      ) : (
        <>
          <Route path="/liveaction" element={<Navigate to="/" />} />
        </>
      )}
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/service-orders/print/:id" element={<ServiceOrderPrint />} />
    </Routes>
  );
}