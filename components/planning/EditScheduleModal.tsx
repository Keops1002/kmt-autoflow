"use client";

import { useState } from "react";
import { scheduleDossier, clearPlanning } from "@/lib/api/planning";

export default function EditScheduleModal({
  bar,
  onClose,
}: {
  bar: any;
  onClose: () => void;
}) {
  const [start, setStart] = useState(
    bar.start_date ?? bar.start?.toISOString().slice(0, 10) ?? ""
  );
  const [end, setEnd] = useState(
    bar.end_date ?? bar.end?.toISOString().slice(0, 10) ?? ""
  );

  const save = async () => {
    await scheduleDossier(bar.dossier_id, start, end);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Modifier planning</h2>

        <label className="block mb-2 text-sm font-medium">Début</label>
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <label className="block mb-2 text-sm font-medium mt-3">Fin</label>
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />

        <div className="flex justify-between mt-4">
          <button
            className="px-3 py-2 bg-red-500 text-white rounded"
            onClick={async () => {
              await clearPlanning(bar.dossier_id);
              onClose();
            }}
          >
            Supprimer
          </button>
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded"
            onClick={save}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}