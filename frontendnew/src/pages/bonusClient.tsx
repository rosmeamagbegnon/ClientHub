import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Search, Loader2 } from "lucide-react";
import { useApiData, useApiMutation } from "../hooks/useApiData";
import { bonusService } from "../services/bonus/bonusService";
import type { Bonus } from "../types/api.types";
import { logger } from "../utils/logger";

// --- Types pour l'affichage ---
interface BonusDisplay {
  id: string;
  name: string;
  type: "points" | "réduction" | "cadeau";
  value: number;
  periode: string;
  description?: string;
  date_debut: string;
  date_fin: string;
}

type BonusFilter = "all" | BonusDisplay["type"];

// --- Fonction de mapping : Bonus backend → BonusDisplay frontend ---
const convertBonusToDisplay = (bonus: Bonus): BonusDisplay => {
  // Déterminer le type à partir du titre ou de la description
  const titreLower = bonus.titre.toLowerCase();
  const descLower = (bonus.description || "").toLowerCase();
  
  let type: BonusDisplay["type"] = "réduction"; // Par défaut
  
  if (titreLower.includes("point") || descLower.includes("point")) {
    type = "points";
  } else if (titreLower.includes("cadeau") || descLower.includes("cadeau") || titreLower.includes("gift")) {
    type = "cadeau";
  } else if (titreLower.includes("réduction") || titreLower.includes("reduction") || descLower.includes("réduction") || descLower.includes("reduction")) {
    type = "réduction";
  }

  // Formater la période
  const dateDebut = new Date(bonus.date_debut);
  const dateFin = new Date(bonus.date_fin);
  const periode = `Du ${dateDebut.toLocaleDateString("fr-FR")} au ${dateFin.toLocaleDateString("fr-FR")}`;

  return {
    id: bonus.id,
    name: bonus.titre,
    type,
    value: bonus.valeur,
    periode,
    description: bonus.description,
    date_debut: bonus.date_debut,
    date_fin: bonus.date_fin,
  };
};

export default function BonusClient() {
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<BonusFilter>("all");

  // Récupérer les bonus depuis l'API
  const {
    data: bonusList,
    loading,
    error,
    refetch,
  } = useApiData(
    () => bonusService.getMesBonus(),
    { errorMessage: "Erreur lors du chargement des bonus" }
  );

  // Convertir les bonus API en bonus d'affichage
  const bonusDisplay = useMemo(() => {
    if (!bonusList || bonusList.length === 0) return [];
    return bonusList.map(convertBonusToDisplay);
  }, [bonusList]);

  // Hook pour appliquer un bonus
  const {
    mutate: applyBonusMutation,
    loading: applyingBonus,
  } = useApiMutation(
    (bonusId: string) => bonusService.applyBonus(bonusId)
  );

  // Filtrer les bonus
  const filteredBonus = useMemo(() => {
    return bonusDisplay.filter((b) => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" ? true : b.type === filter;
      return matchSearch && matchFilter;
    });
  }, [bonusDisplay, search, filter]);

  // Gérer l'application d'un bonus
  const handleApplyBonus = async (bonusId: string) => {
    try {
      await applyBonusMutation(bonusId);
      logger.info("Bonus appliqué avec succès", { bonus_id: bonusId });
      // Optionnel : recharger les bonus après application
      // await refetch();
    } catch (error) {
      logger.error("Erreur lors de l'application du bonus", error);
    }
  };

  // Fonction pour déterminer la couleur selon le type de bonus
  const getBonusColor = (type: Bonus["type"]) => {
    switch (type) {
      case "points":
        return "bg-yellow-200 text-yellow-800";
      case "réduction":
        return "bg-green-200 text-green-800";
      case "cadeau":
        return "bg-purple-200 text-purple-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-4 lg:mx-auto bg-slate-100 mt-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Mes Bonus</h1>

      {/* Barre de recherche et filtre */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm bg-white">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher un bonus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm bg-white md:col-span-1">
          <Gift size={20} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as BonusFilter)}
            className="w-full outline-none bg-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="points">Points</option>
            <option value="réduction">Réduction</option>
            <option value="cadeau">Cadeau</option>
          </select>
        </div>
      </div>

      {/* États de chargement et d'erreur */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
          <span className="ml-2 text-gray-600">Chargement des bonus...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {/* Liste des bonus */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBonus.map((bonus) => (
              <Card key={bonus.id} className="shadow-md rounded-2xl hover:shadow-lg transition">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-blue-800">{bonus.name}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getBonusColor(bonus.type)}`}
                    >
                      {bonus.type}
                    </span>
                  </div>
                  {bonus.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{bonus.description}</p>
                  )}
                  <p className="text-sm mb-1">
                    <span className="font-semibold">Période de validité :</span> {bonus.periode}
                  </p>
                  <p className="text-sm mb-4">
                    <span className="font-semibold">Valeur :</span> {bonus.value}{" "}
                    {bonus.type === "points" ? "pts" : bonus.type === "réduction" ? "%" : ""}
                  </p>

                  <Button
                    className="w-full bg-blue-800 text-white rounded-xl py-2 hover:bg-blue-900 disabled:opacity-50"
                    onClick={() => handleApplyBonus(bonus.id)}
                    disabled={applyingBonus}
                  >
                    {applyingBonus ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Application...
                      </>
                    ) : (
                      "Utiliser"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBonus.length === 0 && !loading && (
            <p className="text-center text-gray-500 mt-10">
              {bonusDisplay.length === 0
                ? "Aucun bonus disponible pour le moment."
                : "Aucun bonus trouvé avec ces critères."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
