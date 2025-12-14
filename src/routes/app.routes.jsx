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
import { PanelAdm } from "@/pages/PanelAdm"; // painel adm
import { UserManagement } from "@/pages/UserManagement"; // usuários
import { PilotMap } from "@/pages/PilotMap"; // mapa de percurso
import { ServicePlanning } from "@/pages/ServicePlanning"; // planejamento
import { Feedback } from "@/pages/Feedback"; // feedback
import { Settings } from "@/pages/Settings"; // configurações
import NeighborhoodOccurrences from "@/pages/LiveAction"; // LiveAction
import { ServiceOrderPrint } from "@/pages/ServiceOrder/ServiceOrderPrint";
import PilotsDashboard from "@/pages/Dashboard/PilotsDashboard";
import { Warranty } from "@/pages/Warranty";
import { OpenCall } from "@/pages/OpenCall";
import { Requests } from "@/pages/Requests";

import { useAuth } from "@/hooks/auth";
import { usePermissions } from "@/hooks/usePermissions";

export function AppRoutes() {
  const { user } = useAuth();
  const {
    isAdmin,
    isSupervisor,
    isAnalyst,
    isInspector,
    isChief,
    isPilot,
    isDroneOperator,
    isCallCenter,
  } = usePermissions();

  const canSeeAll = isAdmin || isSupervisor;

  //  Rotas exclusivas para piloto aéreo
  if (user.role === "pilotoa") {
    return (
      <Routes>
        <Route path="/" element={<CreateOccurrencePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  //  Rotas exclusivas para piloto terrestre
  if (user.role === "pilotot") {
    return (
      <Routes>
        <Route path="/" element={<CreateOccurrenceTPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  //  Rotas exclusivas para CALLCENTER
  if (isCallCenter) {
    return (
      <Routes>
        {/* mapeamento terrestre */}
        <Route path="/" element={<Navigate to="/occurrencest" />} />

        {/* Mapeamento terrestre */}
        <Route path="/occurrencest" element={<OccurrencesT />} />

        {/* Ordem de serviço */}
        <Route path="/serviceorder" element={<ServiceOrder />} />
        
        {/* Perfil do usuário */}
        <Route path="/userprofile" element={<UserProfile />} />

        <Route
          path="/service-orders/print/:id"
          element={<ServiceOrderPrint />}
        />

        {/* Qualquer outra rota cai aqui */}
        <Route path="*" element={<Navigate to="/occurrencest" />} />
      </Routes>
    );
  }

  //  Rotas padrão (admin, gestor, supervisor, analista, etc)
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

      {/* analysis */}
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

      {/* occurrencesa */}
      <Route
        path="/occurrencesa"
        element={
          canSeeAll || isInspector || isChief || isDroneOperator ? (
            <OccurrencesA />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* occurrencest */}
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

      {/* serviceorder */}
      <Route
        path="/serviceorder"
        element={canSeeAll || isChief ? <ServiceOrder /> : <Navigate to="/" />}
      />

      {/* servicePlanning */}
      <Route
        path="/servicePlanning"
        element={
          canSeeAll || isChief ? <ServicePlanning /> : <Navigate to="/" />
        }
      />

      {/* inspection */}
      <Route
        path="/inspection"
        element={canSeeAll || isChief ? <Inspection /> : <Navigate to="/" />}
      />

      <Route
        path="/requests"
        element={
          canSeeAll || isChief || isAnalyst ? <Requests /> : <Navigate to="/" />
        }
      />

      {/* reports */}
      <Route
        path="/reports"
        element={canSeeAll || isChief ? <Reports /> : <Navigate to="/" />}
      />

      <Route path="/pilots/dashboard" element={<PilotsDashboard />} />

      {/* Rotas livres (não aparecem na Sidebar) */}
      <Route path="/userprofile" element={<UserProfile />} />
      <Route path="/warranty" element={<Warranty />} />

      <Route
        path="/dashboard"
        element={
          canSeeAll || isChief || isInspector ? (
            <Dashboard />
          ) : (
            <Navigate to="/userprofile" />
          )
        }
      />

      {/* settings somente admin, gestor e chefe de setor */}
      <Route
        path="/settings"
        element={
          canSeeAll || user.role === "gestor" ? (
            <Settings />
          ) : (
            <Navigate to="/" />
          )
        }
      />

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

      {/* Rota fora do sidebar */}
      <Route
        path="/open-call"
        element={
          isAdmin || isChief || isSupervisor ? (
            <OpenCall />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/service-orders/print/:id" element={<ServiceOrderPrint />} />
    </Routes>
  );
}
