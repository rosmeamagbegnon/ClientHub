// src/constants/opportunityStatusColors.ts

export const opportunityStatusColors: Record<
  string,
  { background: string; text: string }
> = {
  "Nouveau": {
    background: "#DBEAFE", // Bleu très clair
    text: "#1E40AF",       // Bleu foncé
  },
  "En cours d'étude": {
    background: "#E0E7FF", // Indigo clair
    text: "#3730A3",       // Indigo foncé
  },
  "Contrat accepté": {
    background: "#CFFAFE", // Cyan clair
    text: "#0E7490",       // Cyan foncé
  },
  "En cours de développement": {
    background: "#FEF3C7", // Orange clair
    text: "#B45309",       // Orange foncé
  },
  "Livraison": {
    background: "#D1FAE5", // Vert clair
    text: "#047857",       // Vert foncé
  },
  "Gagné": {
    background: "#DCFCE7", // Vert succès clair
    text: "#15803D",       // Vert succès foncé
  },
  "Perdu": {
    background: "#FEE2E2", // Rouge clair
    text: "#B91C1C",       // Rouge foncé
  },
};

export default opportunityStatusColors;
