"use client";

import { useRouter } from "next/navigation";
import { Plus, Bot } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingStack() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="absolute bottom-28 right-6 flex flex-col items-center gap-5 z-50">

      {/* ================= BOT BUTTON ================= */}
      <button
        onClick={() => router.push("/assistant")}
        className={`
          w-14 h-14 rounded-full
          flex items-center justify-center
          bg-gradient-to-br from-blue-500 to-indigo-600
          text-white
          transition-all duration-300 ease-out
          shadow-[0_10px_25px_rgba(59,130,246,0.35)]
          hover:shadow-[0_15px_35px_rgba(59,130,246,0.5)]
          active:scale-90 active:shadow-[0_5px_15px_rgba(59,130,246,0.3)]
          ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
        `}
        style={{
          animation: "floatBot 4s ease-in-out infinite",
        }}
      >
        <Bot size={22} strokeWidth={2.5} />
      </button>

      {/* ================= PLUS BUTTON ================= */}
      <button
        onClick={() => router.push("/dossiers/new")}
        className={`
          w-16 h-16 rounded-full
          flex items-center justify-center
          bg-gradient-to-br from-white to-slate-300
          text-slate-800
          transition-all duration-300 ease-out
          shadow-[0_15px_40px_rgba(0,0,0,0.25),inset_0_2px_4px_white]
          hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]
          active:scale-90 active:shadow-[0_8px_20px_rgba(0,0,0,0.2)]
          ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
        `}
        style={{
          animation: "floatPlus 5s ease-in-out infinite",
        }}
      >
        <Plus size={30} strokeWidth={3} />
      </button>

      {/* KEYFRAMES */}
      <style jsx>{`
        @keyframes floatBot {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }

        @keyframes floatPlus {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

    </div>
  );
}
