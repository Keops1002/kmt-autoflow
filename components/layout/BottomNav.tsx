"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Car,
  Users,
  AlertTriangle,
} from "lucide-react";

/* =========================================================
   BOTTOM NAVIGATION – COMPLETE NAV
========================================================= */

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, path: "/" },
    { icon: Calendar, path: "/planning" },
    { icon: Car, path: "/dossiers" },
    { icon: Users, path: "/clients" },   // ✅ PAGE CLIENTS
    { icon: AlertTriangle, path: "/alertes" },
    
  ];

  return (
    <div className="absolute bottom-0 w-full h-24
                    bg-white/40 backdrop-blur-2xl
                    border-t border-white/40
                    px-6 flex items-center justify-between pb-6">

      {navItems.map(({ icon: Icon, path }) => {
        const isActive = pathname === path;

        return (
          <button
            key={path}
            onClick={() => router.push(path)}
            className={`transition-all duration-200
                        active:scale-110
                        ${
                          isActive
                            ? "text-blue-600 scale-110"
                            : "text-slate-400 hover:text-slate-700"
                        }`}
          >
            <Icon size={24} strokeWidth={2.5} />
          </button>
        );
      })}
    </div>
  );
}
