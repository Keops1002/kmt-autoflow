"use client";

import AppContainer   from "@/components/layout/AppContainer";
import HeroBanner     from "@/components/home/HeroBanner";
import QuickActions   from "@/components/home/QuickActions";
import PlanningWidget from "@/components/home/PlanningWidget";
import StatsWidget    from "@/components/home/StatsWidget";
import AlertesWidget  from "@/components/home/AlertesWidget";
import KMTSplash      from "@/components/home/KMTSplash";

export default function HomePage() {
  return (
    <AppContainer>
      <div className="relative">
        <div className="px-4 pt-6 pb-32 space-y-4" style={{ position: "relative", zIndex: 1 }}>

          {/* KMT juste sous le bouton Réglages */}
          <KMTSplash />

          <HeroBanner />
          <QuickActions />
          <PlanningWidget />
          <StatsWidget />
          <AlertesWidget />
        </div>
      </div>
    </AppContainer>
  );
}