import { Sidebar } from "@/components/sidebar"
import { StatsCard } from "@/components/statsCard"
import { LinearChart } from "@/pages/Dashboard/linearChart"
import { PerformanceChart } from "@/pages/Dashboard/performanceChart"
import { StaticCards } from "@/pages/Dashboard/staticCards"
import { TutorialCard } from "@/pages/Dashboard/tutorialCard"
import { useDashboardData } from "@/hooks/useDashboardData"
import { LiveActionButton } from "@/components/live-action-button"
import { useUserSector } from "@/hooks/useUserSector"
import { useAuth } from "@/hooks/auth"
import { SectorDashboard } from "@/pages/Dashboard/SectorDashboard"

export function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useDashboardData()
  const { setor, loading: setorLoading } = useUserSector()

  const normalize = (str) =>
    str?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  if (!user || !["admin", "gestor", "supervisor"].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Acesso restrito: apenas usuários autorizados podem ver este painel.
      </div>
    );
  }

  if (isLoading || (user.role === "supervisor" && (setorLoading || !setor || !data))) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Carregando informações do dashboard...
      </div>
    )
  }
  // Dashboard por setor (supervisor)
  if (user.role === "supervisor") {
    const setorInfo = data.occurrencesBySector?.find(
      (s) => normalize(s.sectorName) === normalize(setor.name)
    )
    const setorTotal = setorInfo?.currentMonth || 0
    const porcentagem = Number.parseFloat(setorInfo?.differencePercentage) || 0
    const totalGeral = data.totalOccurrences || 0

    return (
      <div className="bg-white sm:ml-[270px] font-inter">
        <Sidebar />
        <main className="p-6">
          <SectorDashboard
            setor={setor.name}
            setorTotal={setorTotal}
            totalGeral={totalGeral}
            porcentagem={porcentagem}
          />
        </main>
      </div>
    )
  }

  // Dashboard Geral (admin / gestor)
  const drains = data?.occurrencesBySector?.find(s => s.sectorName === 'DRENAGEM')?.currentMonth || 0;
  const sewerCleaning = data?.occurrencesBySector?.find(s => s.sectorName === 'LIMPA FOSSA')?.currentMonth || 0;
  const paving = data?.occurrencesBySector?.find(s => s.sectorName === 'PAVIMENTACAO')?.currentMonth || 0;
  const earthwork = data?.occurrencesBySector?.find(s => s.sectorName === 'TERRAPLANAGEM')?.currentMonth || 0;

  const drainsPercentage = Number.parseFloat(data?.occurrencesBySector?.find(s => s.sectorName === 'DRENAGEM')?.differencePercentage) || 0;
  const sewerCleaningPercentage = Number.parseFloat(data?.occurrencesBySector?.find(s => s.sectorName === 'LIMPA FOSSA')?.differencePercentage) || 0;
  const pavingPercentage = Number.parseFloat(data?.occurrencesBySector?.find(s => s.sectorName === 'PAVIMENTACAO')?.differencePercentage) || 0;
  const earthworkPercentage = Number.parseFloat(data?.occurrencesBySector?.find(s => s.sectorName === 'TERRAPLANAGEM')?.differencePercentage) || 0;

  const totalOccurrences = data?.totalOccurrences || 0;
  const underReview = data?.occurrencesByStatus?.find(s => s.status === 'EmAnalise')?.total || 0;
  const resolved = data?.occurrencesByStatus?.find(s => s.status === 'Resolvido')?.total || 0;
  const pending = data?.occurrencesByStatus?.find(s => s.status === 'Pendente')?.total || 0;
  const inQueue = data?.occurrencesByStatus?.find(s => s.status === 'EmFila')?.total || 0;
  const inProgress = data?.occurrencesByStatus?.find(s => s.status === 'EmAndamento')?.total || 0;

  return (
    <div className="bg-white sm:ml-[270px] font-inter">
      <Sidebar />
      <main className="">
        <header className="hidden sm:flex sm:justify-between sm:items-center border-b py-6 px-0">
          <img src="/logoAju.png" alt="Logo" className="h-16 object-contain ml-8" />
          <div className="mr-8">
            <LiveActionButton />
          </div>
        </header>

        <div className="py-4 px-8 flex flex-col">
          <div className="mb-8">
            <p className="text-lg font-medium">Guia de Ajuda Rápida</p>
          </div>

          <div className="flex justify-between flex-col gap-5 md:gap-9 lg:flex-row">
            <TutorialCard />
            <StaticCards />
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
            <StatsCard text="Pavimentação" number={paving} statistics={pavingPercentage} status={pavingPercentage >= 0} />
            <StatsCard text="Limpa Fossa" number={sewerCleaning} statistics={sewerCleaningPercentage} status={sewerCleaningPercentage >= 0} />
            <StatsCard text="Drenagem" number={drains} statistics={drainsPercentage} status={drainsPercentage >= 0} />
            <StatsCard text="Terraplanagem" number={earthwork} statistics={earthworkPercentage} status={earthworkPercentage >= 0} />
          </section>

          <section className="flex flex-col xl:flex-row gap-6 mt-6">


            <LinearChart />
            <PerformanceChart
              occurrences={totalOccurrences}
              underReview={underReview}
              resolved={resolved}
              pending={pending}
              inProgress={inProgress}
              inQueue={inQueue}
            />
          </section>
        </div>
      </main>
    </div>
  )
}
