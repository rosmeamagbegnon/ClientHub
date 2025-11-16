import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

export default function ClientsEntreprise() {
  // Fake data
  const data = useMemo(() => [
    { id: 1, type: "particulier", nom: "Kossi Amadou", contact: "+229 97 00 11 22", email: "kossi@example.com" },
    { id: 2, type: "entreprise", nom: "Société BeninTech", contact: "+229 91 55 88 44", email: "contact@benintech.com" },
    { id: 3, type: "particulier", nom: "Mariam Seko", contact: "+229 60 22 18 77", email: "seko.mariam@gmail.com" },
    { id: 4, type: "entreprise", nom: "AgriBénin SARL", contact: "+229 90 30 44 55", email: "agri@benin.com" },
    { id: 5, type: "particulier", nom: "Daniel Kpa", contact: "+229 52 90 12 12", email: "danielk@example.com" },
  ], []);

  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return data.filter((c) => {
      const matchType = filterType === "all" || c.type === filterType;
      const matchSearch = c.nom.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [data, filterType, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className=" space-y-6 bg-slate-100 p-6 absolute left-[15%] -z-50 w-[85%] h-full">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Liste des Clients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

            {/* Recherche */}
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un client..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filtre type */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-1/3">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                <SelectItem value="particulier">Particuliers</SelectItem>
                <SelectItem value="entreprise">Entreprises</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.nom}</TableCell>
                  <TableCell className="capitalize">{client.type}</TableCell>
                  <TableCell>{client.contact}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" className="text-blue-800 border-blue-800 hover:bg-blue-50">
                      Voir détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Précédent
            </Button>

            <p className="text-sm">Page {page} / {totalPages}</p>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-2"
            >
              Suivant <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}