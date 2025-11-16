import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Search } from "lucide-react";

// --- Types ---
export interface Bonus {
  id: number;
  name: string;
  type: "points" | "réduction" | "cadeau";
  value: number;
  periode: string;
}

type BonusFilter = "all" | Bonus["type"];

export default function BonusClient() {
  const [bonusList, setBonusList] = useState<Bonus[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<BonusFilter>("all");

  useEffect(() => {
    // Mock data
    setBonusList([
      { id: 1, name: "Points fidélité Novembre", type: "points", value: 50, periode: "Du 05/11/2025 au 10/11/2025" },
      { id: 2, name: "Réduction Black Friday", type: "réduction", value: 20, periode: "Du 05/11/2025 au 10/11/2025" },
      { id: 3, name: "Cadeau anniversaire", type: "cadeau", value: 1, periode: "Du 05/11/2025 au 10/11/2025" },
      { id: 4, name: "Points fidélité Décembre", type: "points", value: 30, periode: "Du 05/11/2025 au 10/11/2025" },
    ]);
  }, []);

  const filteredBonus = bonusList.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true : b.type === filter;
    return matchSearch && matchFilter;
  });

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

      {/* Liste des bonus */}
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
              <p className="text-sm mb-1">
                <span className="font-semibold">Période de validité :</span> {bonus.periode}
              </p>
              <p className="text-sm mb-4">
                <span className="font-semibold">Valeur :</span> {bonus.value}{" "}
                {bonus.type === "points" ? "pts" : bonus.type === "réduction" ? "€" : ""}
              </p>

              <Button className="w-full bg-blue-800 text-white rounded-xl py-2 hover:bg-blue-900">
                Utiliser
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBonus.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Aucun bonus trouvé.</p>
      )}
    </div>
  );
}
