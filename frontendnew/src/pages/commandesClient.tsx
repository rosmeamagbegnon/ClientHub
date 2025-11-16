import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard } from "lucide-react";

// --- Types ---
export interface Commande {
  id: number;
  reference: string;
  date: string;
  status:
    | "en cours d'étude"
    | "contrat accepté"
    | "en cours de développement"
    | "livraison";
  total: number;
}

// --- Mapping des couleurs des statuts ---
const statusColors: Record<Commande["status"], string> = {
  "en cours d'étude": "bg-yellow-200 text-yellow-800",
  "contrat accepté": "bg-green-200 text-green-800",
  "en cours de développement": "bg-blue-200 text-blue-800",
  "livraison": "bg-purple-200 text-purple-800",
};

export default function CommandesClient() {
  const [commandes] = useState<Commande[]>([
    { id: 1, reference: "CMD-001", date: "2025-11-01", status: "en cours d'étude", total: 120.5 },
    { id: 2, reference: "CMD-002", date: "2025-11-05", status: "contrat accepté", total: 75.0 },
    { id: 3, reference: "CMD-003", date: "2025-11-08", status: "en cours de développement", total: 200.0 },
    { id: 4, reference: "CMD-004", date: "2025-11-10", status: "livraison", total: 150.0 },
  ]);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<Commande["status"] | "all">("all");

  const filteredCommandes = commandes.filter((c) => {
    const matchSearch = c.reference.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true : c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-4 lg:mx-auto bg-slate-100 mt-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Mes Commandes</h1>

      {/* Barre de recherche et filtre */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm bg-white">
          <ShoppingCart size={20} />
          <input
            type="text"
            placeholder="Rechercher par référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm bg-white md:col-span-1">
          <CreditCard size={20} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Commande["status"] | "all")}
            className="w-full outline-none bg-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="en cours d'étude">En cours d'étude</option>
            <option value="contrat accepté">Contrat accepté</option>
            <option value="en cours de développement">En cours de développement</option>
            <option value="livraison">Livraison</option>
          </select>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommandes.map((commande) => (
          <Card
            key={commande.id}
            className="shadow-md rounded-2xl hover:shadow-lg transition"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-blue-800">{commande.reference}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${statusColors[commande.status]}`}
                >
                  {commande.status}
                </span>
              </div>
              <p className="text-sm mb-1">
                <span className="font-semibold">Date :</span> {commande.date}
              </p>
              <p className="text-sm mb-4">
                <span className="font-semibold">Total :</span> {commande.total} €
              </p>

              <Button className="w-full bg-blue-800 text-white rounded-xl py-2 hover:bg-blue-900">
                Voir les détails
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCommandes.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Aucune commande trouvée.</p>
      )}
    </div>
  );
}
