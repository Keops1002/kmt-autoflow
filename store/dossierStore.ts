import { Dossier } from "@/lib/types";

let dossiers: Dossier[] = [];

export const dossierStore = {

  getAll: () => dossiers,

  getById: (id: string) =>
    dossiers.find((d) => d.id === id),

  add: (dossier: Dossier) => {
    dossiers = [dossier, ...dossiers];
  },

};
