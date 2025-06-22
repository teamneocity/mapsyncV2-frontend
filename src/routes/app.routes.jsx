import { Routes, Route, Navigate } from "react-router-dom"

import { Dashboard } from "@/pages/Dashboard" // continua sendo a página unificada
import { SignIn } from "@/pages/SignIn"
import { OccurrencesT } from "@/pages/OccurrencesT"
import { OccurrencesA } from "@/pages/OccurrencesA"
import { ServiceOrder } from "@/pages/ServiceOrder"
import { RouteMap } from "@/pages/RouteMap"
import { Activities } from "@/pages/Activities"
import { Reports } from "@/pages/Reports"
import { UserProfile } from "@/pages/UserProfile"
import { Notifications } from "@/pages/Notifications"
import { Analysis } from "@/pages/Analysis"
import { useAuth } from "@/hooks/auth"
import { TeamManagement } from "@/pages/TeamManagement"
import { AuditLogs } from "@/pages/AuditLogs"
import { CreateOccurrencePage } from "@/pages/Pilot"
import { CreateOccurrenceTPage } from "@/pages/PilotT"
import { Inspection } from "@/pages/Inspection"
import NeighborhoodOccurrences from "@/pages/LiveAction"

export function AppRoutes() {
  const { user } = useAuth()

  // Acesso exclusivo para pilotos
  if (user.role === "pilotoa") {
    return (
      <Routes>
        <Route path="/" element={<CreateOccurrencePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }

  if (user.role === "pilotot") {
    return (
      <Routes>
        <Route path="/" element={<CreateOccurrenceTPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {/* Redireciona a rota raiz (/) de acordo com o role */}
      <Route
        path="/"
        element={
          ["admin", "gestor", "supervisor"].includes(user.role) ? (
            <Dashboard /> // agora é o dashboard unificado
          ) : (
            <Navigate to="/userprofile" />
          )
        }
      />

      {/* Rotas comuns */}
      <Route path="/occurrencest" element={<OccurrencesT />} />
      <Route path="/occurrencesa" element={<OccurrencesA />} />
      <Route path="/serviceorder" element={<ServiceOrder />} />
      <Route path="/routemap" element={<RouteMap />} />
      <Route path="/activities" element={<Activities />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/userprofile" element={<UserProfile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/inspection" element={<Inspection />} />

      {/* 🚫 REMOVIDO: Rota /sector-dashboard (não existe mais)
      {user.role === "supervisor" ? (
        <Route path="/sector-dashboard" element={<SectorDashboardPage />} />
      ) : (
        <Route path="/sector-dashboard" element={<Navigate to="/" />} />
      )} */}

      {/* Admin/Gestor */}
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
  )
}
