/* =========================================================
   MOCK DATA – SIMULATION UI (CARDS)
========================================================= */

import { DossierCardModel } from "./types";

export const dossiersMock: DossierCardModel[] = [
  {
    id: "1",
    garage_id: "atlas_01",
    client_name: "Jean Dupont",
    vehicle_label: "BMW Série 3",
    problem: "Jante",
    progress: "2/5 TÂCHES",
    status: "in_progress",
  },
  {
    id: "2",
    garage_id: "atlas_01",
    client_name: "Paul Martin",
    vehicle_label: "Renault Clio",
    problem: "Pare-choc",
    status: "pending",
  },
];
