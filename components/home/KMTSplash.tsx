"use client";

export default function KMTSplash() {
  return (
    <div className="flex items-center justify-center py-2">
      <div style={{ animation: "kmtFadeIn 1.5s ease-out forwards", opacity: 0 }}>
        <span
          className="text-xs font-black uppercase tracking-[0.4em]"
          style={{
            background: "linear-gradient(90deg, var(--accent), var(--text-muted), var(--accent))",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "kmtFadeIn 1.5s ease-out forwards, kmtShimmer 4s linear 1.5s infinite",
            opacity: 0,
          }}
        >
          KMT · Autoflow
        </span>
      </div>

      <style>{`
        @keyframes kmtFadeIn {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
        @keyframes kmtShimmer {
          0%   { background-position: 0%   center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}