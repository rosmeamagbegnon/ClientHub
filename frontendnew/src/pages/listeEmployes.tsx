

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";

// ================= Types =================
type Role = "admin" | "commercial" | "support";
type Status = "actif" | "inactif" | "invité";

interface ActivityLog {
  id: number;
  action: string;
  date: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  department: string;
  status: Status;
  permissions: string[];
  activity: ActivityLog[];
}

// ================= Permissions =================
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: ["gerer_utilisateurs", "voir_rapports", "tout_gerer"],
  commercial: ["gerer_opportunites", "voir_liste_clients"],
  support: ["gerer_tickets", "voir_clients"],
};

// ================= EmployeeTable (FIX) =================
interface EmployeeTableProps {
  title: string;
  data: Employee[];
  onEdit: (e: Employee) => void;
  onToggleStatus: (id: number) => void;
}

function EmployeeTable({ title, data, onEdit, onToggleStatus }: EmployeeTableProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.firstName} {e.lastName}</TableCell>
                <TableCell>{e.email}</TableCell>
                <TableCell><Badge>{e.role}</Badge></TableCell>
                <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" onClick={() => onEdit(e)}>Modifier</Button>
                  {e.status !== "invité" && (
                    <Button variant="outline" onClick={() => onToggleStatus(e.id)}>
                      {e.status === "actif" ? "Désactiver" : "Réactiver"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ================= Page principale =================
export default function EmployeesCRMAdvanced() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [newEmployee, setNewEmployee] = useState<Omit<Employee, "id" | "permissions" | "activity">>({
    firstName: "",
    lastName: "",
    email: "",
    role: "commercial",
    department: "",
    status: "invité",
  });

  useEffect(() => {
    setEmployees([
      {
        id: 1,
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean@crm.com",
        role: "commercial",
        department: "Ventes",
        status: "actif",
        permissions: ROLE_PERMISSIONS.commercial,
        activity: [{ id: 1, action: "Connexion", date: "12/12/2025" }],
      },
      {
        id: 2,
        firstName: "Awa",
        lastName: "Mensah",
        email: "awa@crm.com",
        role: "support",
        department: "Support",
        status: "inactif",
        permissions: ROLE_PERMISSIONS.support,
        activity: [],
      },
    ]);
  }, []);

  const filtered = useMemo(() =>
    employees.filter((e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase())
    ), [employees, search]);

  const actifs = filtered.filter((e) => e.status === "actif");
  const inactifs = filtered.filter((e) => e.status === "inactif");
  const invites = filtered.filter((e) => e.status === "invité");

  const toggleStatus = (id: number) => {
    setEmployees((prev) => prev.map((e) =>
      e.id === id ? { ...e, status: e.status === "actif" ? "inactif" : "actif" } : e
    ));
  };

  const saveEdit = () => {
    if (!selectedEmployee) return;
    setEmployees((prev) => prev.map((e) => e.id === selectedEmployee.id ? selectedEmployee : e));
    setEditOpen(false);
  };

  const addEmployee = () => {
    setEmployees((prev) => [...prev, {
      ...newEmployee,
      id: Date.now(),
      permissions: ROLE_PERMISSIONS[newEmployee.role],
      activity: [{ id: 1, action: "Invitation envoyée", date: new Date().toLocaleDateString() }],
    }]);
    setAddOpen(false);
    setNewEmployee({ firstName: "", lastName: "", email: "", role: "commercial", department: "", status: "invité" });
  };

  return (
    <div className="space-y-6 bg-slate-100 p-6 absolute left-[15%] w-[85%] h-full -z-50">
      <div className="flex justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border"> 
          <div className="relative flex-1 w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input className="pl-10" placeholder="Rechercher un employé" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button className="bg-blue-800 text-white" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter un employé
          </Button>
      </div>

      <EmployeeTable title="Employés actifs" data={actifs} onEdit={(e) => { setSelectedEmployee(e); setEditOpen(true); }} onToggleStatus={toggleStatus} />
      <EmployeeTable title="Comptes désactivés" data={inactifs} onEdit={(e) => { setSelectedEmployee(e); setEditOpen(true); }} onToggleStatus={toggleStatus} />
      <EmployeeTable title="Invitations en attente" data={invites} onEdit={(e) => { setSelectedEmployee(e); setEditOpen(true); }} onToggleStatus={toggleStatus} />

      {/* Modal Ajout */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un employé</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Prénom</Label><Input value={newEmployee.firstName} onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })} /></div>
            <div><Label>Nom</Label><Input value={newEmployee.lastName} onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} /></div>
            <div><Label>Département</Label><Input value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} /></div>
            <div><Label>Rôle</Label>
              <Select value={newEmployee.role} onValueChange={(v) => setNewEmployee({ ...newEmployee, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annuler</Button>
            <Button className="bg-blue-800 text-white" onClick={addEmployee}>Envoyer l'invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Édition */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier l'employé</DialogTitle></DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div><Label>Prénom</Label><Input value={selectedEmployee.firstName} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })} /></div>
              <div><Label>Nom</Label><Input value={selectedEmployee.lastName} onChange={(e) => setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })} /></div>
              <div><Label>Rôle</Label>
                <Select value={selectedEmployee.role} onValueChange={(v) => setSelectedEmployee({ ...selectedEmployee, role: v as Role, permissions: ROLE_PERMISSIONS[v as Role] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedEmployee.permissions.map((p) => <Badge key={p} variant="outline">{p}</Badge>)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button className="bg-blue-800 text-white" onClick={saveEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
