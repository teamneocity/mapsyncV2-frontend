import { StatsCard } from "@/components/statsCard";
import { SetorVsGeralChart } from "@/pages/Dashboard/SetorVsGeralChart";
import { LinearChart } from "@/pages/Dashboard/linearChart";
import { TutorialCard } from "@/pages/Dashboard/tutorialCard";

export function SectorDashboard({
  setor,
  setorTotal,
  totalGeral,
  porcentagem,
}) {
  return (
    <>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Dashboard do Setor: {setor}
      </h2>

      <div className="py-4 px-8 flex flex-col gap-6">
        <section className="flex flex-col xl:flex-row gap-6">
          <TutorialCard/>
          <StatsCard
            text={setor}
            number={setorTotal}
            statistics={porcentagem}
            status={porcentagem >= 0}
          />
        </section>
        <section className="flex flex-col xl:flex-row gap-6">
          <LinearChart></LinearChart>
          <SetorVsGeralChart
            setorName={setor}
            setorTotal={setorTotal}
            totalGeral={totalGeral}
          />
        </section>
      </div>
    </>
  );
}
