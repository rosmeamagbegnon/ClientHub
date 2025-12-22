import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ================= Types =================
export type Role = "admin" | "commercial" | "support";

export interface Permission {
  key: string;
  label: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  date: string;
}

export interface EmployeeProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  department: string;
  status: "actif" | "inactif";
}

// ================= Permissions par rôle =================
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    { key: "manage_users", label: "Gérer les utilisateurs" },
    { key: "view_reports", label: "Voir les rapports" },
    { key: "manage_settings", label: "Gérer les paramètres" },
  ],
  commercial: [
    { key: "manage_opportunities", label: "Gérer les opportunités" },
    { key: "view_clients", label: "Voir les clients" },
  ],
  support: [
    { key: "manage_tickets", label: "Gérer les tickets" },
    { key: "view_clients", label: "Voir les clients" },
  ],
};

// ================= Libellés des rôles =================
const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  commercial: "Commercial",
  support: "Support",
};

// ================= Component =================
export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile>({
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@crm.com",
    phone: "+229 90 00 11 22",
    role: "commercial",
    department: "Ventes",
    status: "actif",
  });

  const [activities] = useState<ActivityLog[]>([
    { id: 1, action: "Création d'une opportunité", date: "12/12/2025 10:30" },
    { id: 2, action: "Modification d'un client", date: "11/12/2025 15:10" },
    { id: 3, action: "Connexion au CRM", date: "10/12/2025 08:45" },
  ]);

  const handleChange = <K extends keyof EmployeeProfile>(
    key: K,
    value: EmployeeProfile[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = () => {
    console.log("Profil sauvegardé :", profile);
  };

  return (
    <div className="bg-slate-100 min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <Card className="shadow-md">
          <CardContent className="flex flex-col md:flex-row items-center gap-6 p-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl font-bold">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-blue-800">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600">{profile.email}</p>

              <div className="flex gap-2 justify-center md:justify-start mt-2">
                <Badge>{ROLE_LABELS[profile.role]}</Badge>
                <Badge
                  variant={
                    profile.status === "actif"
                      ? "default"
                      : "destructive"
                  }
                >
                  {profile.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infos personnelles */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Prénom</Label>
              <Input
                value={profile.firstName}
                onChange={(e) =>
                  handleChange("firstName", e.target.value)
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Nom</Label>
              <Input
                value={profile.lastName}
                onChange={(e) =>
                  handleChange("lastName", e.target.value)
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>

            <div className="space-y-1">
              <Label>Téléphone</Label>
              <Input value={profile.phone} />
            </div>
          </CardContent>
        </Card>

        {/* Rôle & Permissions (lecture seule) */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Rôle & Permissions</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Rôle</Label>
              <div className="flex items-center gap-2">
                <Badge className="px-3 py-1 text-sm">
                  {ROLE_LABELS[profile.role]}
                </Badge>
                <span className="text-xs text-gray-500">
                  (attribué par l’administrateur)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Droits associés</Label>
              <div className="flex flex-wrap gap-2">
                {ROLE_PERMISSIONS[profile.role].map((perm) => (
                  <Badge key={perm.key} variant="outline">
                    {perm.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historique d'activité */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Historique d'activité</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {activities.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            className="bg-blue-800 text-white"
            onClick={saveProfile}
          >
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
}
