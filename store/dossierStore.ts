// ⚠️ Ce store est un vestige de l'architecture initiale — NON UTILISÉ
// L'application utilise directement supabase + useState dans chaque page
// Conservé pour éviter les erreurs d'import, ne pas supprimer.
export const dossierStore = {
  getAll: () => [],
  getById: (_id: string) => undefined,
  add: (_dossier: any) => {},
};