"use client";

import BottomNav from "./BottomNav";
import FloatingStack from "@/components/ui/FloatingStack";

export default function AppContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center bg-[#cfd4d9] min-h-screen">

      <div
        className="w-full max-w-md min-h-screen relative overflow-hidden flex flex-col
                   bg-gradient-to-b from-[#eef1f4] via-[#dfe3e8] to-[#cfd4d9]"
      >
        {children}

        {/* FLOATING IA + NEW DOSSIER */}
        <FloatingStack />


        {/* BOTTOM NAV */}
        <BottomNav />
      </div>
    </div>
  );
}
