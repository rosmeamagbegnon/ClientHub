import { useState, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { useApiData, useApiMutation } from "../hooks/useApiData";
import { bonusService } from "../services/bonus/bonusService";
import type { Bonus, CreateBonusData, UpdateBonusData } from "../types/api.types";
import { logger } from "../utils/logger";
import { useAuth } from "../contexts/AuthContext";

// --- Types pour l'affichage ---
interface BonusDisplay {
  id: string;
  name: string;
  type: "points" | "réduction" | "cadeau";
  value: number;
  periode: string;
  est_actif: boolean;
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
  const periode = `${dateDebut.toLocaleDateString("fr-FR")} - ${dateFin.toLocaleDateString("fr-FR")}`;

  return {
    id: bonus.id,
    name: bonus.titre,
    type,
    value: bonus.valeur,
    periode,
    est_actif: bonus.est_actif,
  };
};

export default function BonusEntreprise() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<BonusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);

  // Formulaire pour nouveau bonus
  const [newBonus, setNewBonus] = useState<CreateBonusData>({
    titre: "",
    description: "",
    valeur: 0,
    appliquer_a: "tous",
    date_debut: "",
    date_fin: "",
    conditions: "",
  });

  // Formulaire pour édition
  const [editBonus, setEditBonus] = useState<UpdateBonusData>({});

  // Récupérer les bonus depuis l'API
  const {
    data: bonusData,
    loading,
    error,
    refetch,
  } = useApiData(
    () => bonusService.listBonus({ page, limit: pageSize }),
    { errorMessage: "Erreur lors du chargement des bonus" }
  );

  // Convertir les bonus API en bonus d'affichage
  const bonusDisplay = useMemo(() => {
    if (!bonusData?.items) return [];
    return bonusData.items.map(convertBonusToDisplay);
  }, [bonusData]);

  // Hook pour créer un bonus
  const {
    mutate: createBonusMutation,
    loading: creatingBonus,
  } = useApiMutation(
    (data: CreateBonusData) => bonusService.createBonus(data)
  );

  // Hook pour mettre à jour un bonus
  const {
    mutate: updateBonusMutation,
    loading: updatingBonus,
  } = useApiMutation(
    ({ id, data }: { id: string; data: UpdateBonusData }) =>
      bonusService.updateBonus(id, data)
  );

  // Hook pour supprimer un bonus
  const {
    mutate: deleteBonusMutation,
    loading: deletingBonus,
  } = useApiMutation(
    (id: string) => bonusService.deleteBonus(id)
  );

  // Hook pour activer/désactiver un bonus
  const {
    mutate: toggleBonusMutation,
    loading: togglingBonus,
  } = useApiMutation(
    (id: string) => bonusService.toggleBonusActif(id)
  );

  // Filtrer les bonus
  const filtered = useMemo(() => {
    return bonusDisplay.filter((b) => {
      const matchType = filterType === "all" || b.type === filterType;
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [bonusDisplay, filterType, search]);

  // Pagination depuis l'API
  const totalPages = bonusData?.pagination?.pages || 1;

  const getTypeColor = (type: BonusDisplay["type"]) => {
    switch (type) {
      case "points": return "bg-yellow-200 text-yellow-800";
      case "réduction": return "bg-green-200 text-green-800";
      case "cadeau": return "bg-purple-200 text-purple-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  // Gérer la création d'un bonus
  const handleCreateBonus = async () => {
    try {
      await createBonusMutation(newBonus);
      setAddModalOpen(false);
      setNewBonus({
        titre: "",
        description: "",
        valeur: 0,
        appliquer_a: "tous",
        date_debut: "",
        date_fin: "",
        conditions: "",
      });
      await refetch();
      logger.info("Bonus créé avec succès");
    } catch (error) {
      logger.error("Erreur lors de la création du bonus", error);
    }
  };

  // Gérer la mise à jour d'un bonus
  const handleUpdateBonus = async () => {
    if (!selectedBonus) return;
    try {
      await updateBonusMutation({ id: selectedBonus.id, data: editBonus });
      setEditModalOpen(false);
      setSelectedBonus(null);
      setEditBonus({});
      await refetch();
      logger.info("Bonus mis à jour avec succès");
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du bonus", error);
    }
  };

  // Gérer la suppression d'un bonus
  const handleDeleteBonus = async () => {
    if (!selectedBonus) return;
    try {
      await deleteBonusMutation(selectedBonus.id);
      setDeleteModalOpen(false);
      setSelectedBonus(null);
      await refetch();
      logger.info("Bonus supprimé avec succès");
    } catch (error) {
      logger.error("Erreur lors de la suppression du bonus", error);
    }
  };

  // Gérer l'activation/désactivation d'un bonus
  const handleToggleBonus = async (bonusId: string) => {
    try {
      await toggleBonusMutation(bonusId);
      await refetch();
      logger.info("Statut du bonus changé");
    } catch (error) {
      logger.error("Erreur lors du changement de statut", error);
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (bonus: Bonus) => {
    setSelectedBonus(bonus);
    setEditBonus({
      titre: bonus.titre,
      description: bonus.description,
      valeur: bonus.valeur,
      appliquer_a: bonus.appliquer_a,
      date_debut: bonus.date_debut.split("T")[0], // Format YYYY-MM-DD pour input date
      date_fin: bonus.date_fin.split("T")[0],
      conditions: bonus.conditions,
      est_actif: bonus.est_actif,
    });
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6 bg-slate-100 p-6 absolute left-[15%] w-[85%] h-full -z-50">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-blue-800 mb-6">Liste des Bonus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un bonus..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={filterType} onValueChange={(value) => setFilterType(value as BonusFilter)}>
              <SelectTrigger className="w-full md:w-1/3">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="réduction">Réduction</SelectItem>
                <SelectItem value="cadeau">Cadeau</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-blue-800 text-white" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Ajouter un bonus
            </Button>
          </div>

          {/* États de chargement et d'erreur */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
              <span className="ml-2 text-gray-600">Chargement des bonus...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Erreur</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        Aucun bonus trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((bonus) => {
                      const bonusApi = bonusData?.items.find((b) => b.id === bonus.id);
                      return (
                        <TableRow key={bonus.id}>
                          <TableCell>{bonus.name}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(bonus.type)}`}>
                              {bonus.type}
                            </span>
                          </TableCell>
                          <TableCell>{bonus.value}</TableCell>
                          <TableCell>{bonus.periode}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => bonusApi && handleToggleBonus(bonusApi.id)}
                              disabled={togglingBonus}
                              className={bonus.est_actif ? "text-green-700 border-green-700" : "text-gray-500 border-gray-500"}
                            >
                              {bonus.est_actif ? "Actif" : "Inactif"}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              className="border-blue-800"
                              onClick={() => bonusApi && openEditModal(bonusApi)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="outline"
                              className="text-red-700 border-red-700"
                              onClick={() => {
                                if (bonusApi) {
                                  setSelectedBonus(bonusApi);
                                  setDeleteModalOpen(true);
                                }
                              }}
                            >
                              Supprimer
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ArrowLeft className="h-4 w-4" /> Précédent
                </Button>
                <p className="text-sm">
                  Page {page} / {totalPages}
                </p>
                <Button
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal d'ajout */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un bonus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Titre *</Label>
              <Input
                value={newBonus.titre}
                onChange={(e) => setNewBonus({ ...newBonus, titre: e.target.value })}
                placeholder="Ex: Points fidélité Novembre"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={newBonus.description || ""}
                onChange={(e) => setNewBonus({ ...newBonus, description: e.target.value })}
                placeholder="Description du bonus"
              />
            </div>
            <div className="space-y-1">
              <Label>Valeur *</Label>
              <Input
                type="number"
                value={newBonus.valeur}
                onChange={(e) => setNewBonus({ ...newBonus, valeur: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label>Appliquer à *</Label>
              <Select
                value={newBonus.appliquer_a}
                onValueChange={(value: "tous" | "specifique" | "filtre") =>
                  setNewBonus({ ...newBonus, appliquer_a: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les clients</SelectItem>
                  <SelectItem value="specifique">Client spécifique</SelectItem>
                  <SelectItem value="filtre">Filtre (type, secteur, taille)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Date de début *</Label>
              <Input
                type="date"
                value={newBonus.date_debut}
                onChange={(e) => setNewBonus({ ...newBonus, date_debut: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Date de fin *</Label>
              <Input
                type="date"
                value={newBonus.date_fin}
                onChange={(e) => setNewBonus({ ...newBonus, date_fin: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Conditions</Label>
              <Input
                value={newBonus.conditions || ""}
                onChange={(e) => setNewBonus({ ...newBonus, conditions: e.target.value })}
                placeholder="Conditions d'application (optionnel)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-blue-800 text-white"
              onClick={handleCreateBonus}
              disabled={creatingBonus || !newBonus.titre || !newBonus.date_debut || !newBonus.date_fin}
            >
              {creatingBonus ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Création...
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le bonus</DialogTitle>
          </DialogHeader>
          {selectedBonus && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Titre *</Label>
                <Input
                  value={editBonus.titre || selectedBonus.titre}
                  onChange={(e) => setEditBonus({ ...editBonus, titre: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input
                  value={editBonus.description ?? selectedBonus.description ?? ""}
                  onChange={(e) => setEditBonus({ ...editBonus, description: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Valeur *</Label>
                <Input
                  type="number"
                  value={editBonus.valeur ?? selectedBonus.valeur}
                  onChange={(e) => setEditBonus({ ...editBonus, valeur: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label>Appliquer à *</Label>
                <Select
                  value={editBonus.appliquer_a || selectedBonus.appliquer_a}
                  onValueChange={(value: "tous" | "specifique" | "filtre") =>
                    setEditBonus({ ...editBonus, appliquer_a: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les clients</SelectItem>
                    <SelectItem value="specifique">Client spécifique</SelectItem>
                    <SelectItem value="filtre">Filtre (type, secteur, taille)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Date de début *</Label>
                <Input
                  type="date"
                  value={editBonus.date_debut || selectedBonus.date_debut.split("T")[0]}
                  onChange={(e) => setEditBonus({ ...editBonus, date_debut: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Date de fin *</Label>
                <Input
                  type="date"
                  value={editBonus.date_fin || selectedBonus.date_fin.split("T")[0]}
                  onChange={(e) => setEditBonus({ ...editBonus, date_fin: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Conditions</Label>
                <Input
                  value={editBonus.conditions ?? selectedBonus.conditions ?? ""}
                  onChange={(e) => setEditBonus({ ...editBonus, conditions: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-blue-800 text-white"
              onClick={handleUpdateBonus}
              disabled={updatingBonus}
            >
              {updatingBonus ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de suppression */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>Êtes-vous sûr de vouloir supprimer ce bonus ? Cette action est irréversible.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Non
            </Button>
            <Button
              className="bg-red-700 text-white"
              onClick={handleDeleteBonus}
              disabled={deletingBonus}
            >
              {deletingBonus ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                "Oui, supprimer le bonus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
