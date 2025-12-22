import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
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
  const [filterType, setFilterType] = useState<BonusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);

  const [newBonus, setNewBonus] = useState<Bonus>({
    id: 0,
    name: "",
    type: "points",
    value: 0,
    periode: "",
  });

  useEffect(() => {
    setBonusList([
      { id: 1, name: "Points fidélité Novembre", type: "points", value: 50, periode: "05/11/2025 - 10/11/2025" },
      { id: 2, name: "Réduction Black Friday", type: "réduction", value: 20, periode: "05/11/2025 - 10/11/2025" },
      { id: 3, name: "Cadeau anniversaire", type: "cadeau", value: 1, periode: "05/11/2025 - 10/11/2025" },
      { id: 4, name: "Points fidélité Décembre", type: "points", value: 30, periode: "05/11/2025 - 10/11/2025" },
    ]);
  }, []);

  const filtered = useMemo(() => {
    return bonusList.filter((b) => {
      const matchType = filterType === "all" || b.type === filterType;
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [bonusList, filterType, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const getTypeColor = (type: Bonus["type"]) => {
    switch (type) {
      case "points": return "bg-yellow-200 text-yellow-800";
      case "réduction": return "bg-green-200 text-green-800";
      case "cadeau": return "bg-purple-200 text-purple-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const confirmDelete = () => {
    if (!selectedBonus) return;
    setBonusList((prev) => prev.filter((b) => b.id !== selectedBonus.id));
    setDeleteModalOpen(false);
  };

  const saveEdit = () => {
    if (!selectedBonus) return;
    setBonusList((prev) => prev.map((b) => (b.id === selectedBonus.id ? selectedBonus : b)));
    setEditModalOpen(false);
  };

  const saveNewBonus = () => {
    setBonusList((prev) => [...prev, { ...newBonus, id: Date.now() }]);
    setAddModalOpen(false);
    setNewBonus({ id: 0, name: "", type: "points", value: 0, periode: "" });
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

            <Select value={filterType} onValueChange={setFilterType}>
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Période</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((bonus) => (
                <TableRow key={bonus.id}>
                  <TableCell>{bonus.name}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(bonus.type)}`}>
                      {bonus.type}
                    </span>
                  </TableCell>
                  <TableCell>{bonus.value}</TableCell>
                  <TableCell>{bonus.periode}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" className="border-blue-800" onClick={() => { setSelectedBonus(bonus); setEditModalOpen(true); }}>
                      Modifier
                    </Button>
                    <Button variant="outline" className="text-red-700 border-red-700" onClick={() => { setSelectedBonus(bonus); setDeleteModalOpen(true); }}>
                      Annuler
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ArrowLeft className="h-4 w-4" /> Précédent
            </Button>
            <p className="text-sm">Page {page} / {totalPages}</p>
            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Suivant <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le bonus</DialogTitle>
          </DialogHeader>
          {selectedBonus && (
            <div className="space-y-4">
              <div className="space-y-1"><Label>Nom</Label><Input value={selectedBonus.name} onChange={(e) => setSelectedBonus({ ...selectedBonus, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Valeur</Label><Input type="number" value={selectedBonus.value} onChange={(e) => setSelectedBonus({ ...selectedBonus, value: Number(e.target.value) })} /></div>
              <div className="space-y-1"><Label>Période</Label><Input value={selectedBonus.periode} onChange={(e) => setSelectedBonus({ ...selectedBonus, periode: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Annuler</Button>
            <Button className="bg-blue-800 text-white" onClick={saveEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un bonus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1"><Label>Nom</Label><Input value={newBonus.name} onChange={(e) => setNewBonus({ ...newBonus, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Valeur</Label><Input type="number" value={newBonus.value} onChange={(e) => setNewBonus({ ...newBonus, value: Number(e.target.value) })} /></div>
            <div className="space-y-1"><Label>Période</Label><Input value={newBonus.periode} onChange={(e) => setNewBonus({ ...newBonus, periode: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Annuler</Button>
            <Button className="bg-blue-800 text-white" onClick={saveNewBonus}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'annulation</DialogTitle>
          </DialogHeader>
          <p>Êtes-vous sûr de vouloir annuler ce bonus ? Cette action est irréversible.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Non</Button>
            <Button className="bg-red-700 text-white" onClick={confirmDelete}>Oui, annuler le bonus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
