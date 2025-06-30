import { Routes, Route, Navigate } from "react-router-dom";

import { Dashboard } from "@/pages/Dashboard";
import { SignIn } from "@/pages/SignIn";
import { OccurrencesT } from "@/pages/OccurrencesT";
import { OccurrencesA } from "@/pages/OccurrencesA";
import { ServiceOrder } from "@/pages/ServiceOrder";
import { RouteMap } from "@/pages/RouteMap";
import { Activities } from "@/pages/Activities";
import { Reports } from "@/pages/Reports";
import { UserProfile } from "@/pages/UserProfile";
import { Notifications } from "@/pages/Notifications";
import { Analysis } from "@/pages/Analysis";
import { TeamManagement } from "@/pages/TeamManagement";
import { AuditLogs } from "@/pages/AuditLogs";
import { CreateOccurrencePage } from "@/pages/Pilot";
import { CreateOccurrenceTPage } from "@/pages/PilotT";
import { Inspection } from "@/pages/Inspection";
import { SectorAdmin } from "@/pages/SectorAdmin";
import { UserManagement } from "@/pages/UserManagement";
import { PilotMap } from "@/pages/PilotMap";
import { ServicePlanning } from "@/pages/ServicePlanning";
import { Feedback } from "@/pages/Feedback";
import { Settings } from "@/pages/Settings";
import NeighborhoodOccurrences from "@/pages/LiveAction";

import { useAuth } from "@/hooks/auth";
import { usePermissions } from "@/hooks/usePermissions";

export function AppRoutes() {
  const { user } = useAuth();
  const { isAdmin, isSupervisor, isAnalyst, isInspector, isChief } =
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
          isAnalyst || isAdmin || isChief ? <Analysis /> : <Navigate to="/" />
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
      <Route
        path="/feedback"
        element={canSeeAll || isChief ? <Feedback /> : <Navigate to="/" />}
      />
      {/* Rotas livres (não aparecem na Sidebar) */}
      <Route path="/routemap" element={<RouteMap />} />
      <Route path="/activities" element={<Activities />} />
      <Route path="/userprofile" element={<UserProfile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/dashboard" element={<Dashboard />} /> {/* ajuste leve */}
      <Route path="/settings" element={<Settings />} />
      {/* Admin/Gestor apenas */}
      {["admin", "gestor"].includes(user.role) ? (
        <>
          <Route path="/teammanagement" element={<TeamManagement />} />
          <Route path="/logs" element={<AuditLogs />} />
          <Route path="/liveaction" element={<NeighborhoodOccurrences />} />
        </>
      ) : (
        <>
          <Route path="/teammanagement" element={<Navigate to="/" />} />
          <Route path="/logs" element={<Navigate to="/" />} />
          <Route path="/liveaction" element={<Navigate to="/" />} />
        </>
      )}
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
