// src/pages/TicketsClient.tsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import ButtonTicket from "../components/buttonTicket";
import DetailsTicket from "../components/detailsTicket"; // Import du modal
import TicketStatusColor from "../config/ticketStatusColor";
// --- Types ---
export interface Ticket {
  id: number;
  title: string;
  type: "facturation" | "reclamation" | "technique" | "suggestion" | "autre";
  status:
    | "En cours d'étude"
    | "Rejetée"
    | "Acceptée"
    | "Assignée"
    | "En cours de traitement"
    | "Traitée";
  date: string;
}

// --- Filtres types ---
type FilterType = "all" | Ticket["type"];
type StatusFilterType = "all" | Ticket["status"];

export default function TicketsClient() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null); // ID sélectionné

  useEffect(() => {
    // Mock data
    setTickets([
      {
        id: 1,
        title: "Problème de connexion à la plateforme",
        type: "technique",
        status: "En cours d'étude",
        date: "2025-11-10",
      },
      {
        id: 2,
        title: "Erreur sur la facture",
        type: "facturation",
        status: "En cours de traitement",
        date: "2025-11-08",
      },
      {
        id: 3,
        title: "Suggestion d'amélioration",
        type: "suggestion",
        status: "Acceptée",
        date: "2025-11-05",
      },
    ]);
  }, []);

  const filteredTickets = tickets.filter((t: Ticket) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true : t.type === filter;
    const matchStatus =
      statusFilter === "all" ? true : t.status === statusFilter;
    return matchSearch && matchFilter && matchStatus;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-4 lg:mx-auto bg-slate-100 mt-4 rounded-xl">

      <div className="flex flex-wrap gap-4 justify-between mb-4">
        <h1 className="text-3xl font-bold text-blue-800">Mes Demandes</h1>
        <ButtonTicket
          bgColor="bg-blue-800"
          textColor="text-white"
          hoverBgColor="hover:bg-blue-700"
        />
      </div>

      {/* Barre de recherche + filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* RECHERCHE */}
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm bg-white">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un ticket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>

        {/* FILTRE TYPE */}
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm bg-white">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="w-full outline-none bg-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="facturation">Facturation</option>
            <option value="reclamation">Réclamation</option>
            <option value="technique">Technique</option>
            <option value="suggestion">Suggestion</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        {/* FILTRE STATUT */}
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm bg-white">
          <Filter size={20} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
            className="w-full outline-none bg-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="En cours d'étude">En cours d'étude</option>
            <option value="En cours de traitement">En cours de traitement</option>
            <option value="Assignée">Assignée</option>
            <option value="Acceptée">Acceptée</option>
            <option value="Traitée">Traitée</option>
            <option value="Rejetée">Rejetée</option>
          </select>
        </div>
      </div>

      {/* Liste des tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((ticket: Ticket) => (
          <Card
            key={ticket.id}
            className="shadow-md rounded-2xl hover:shadow-xl transition bg-white border border-gray-100"
          >
            <CardContent className="p-5">
              <h2
                className="text-xl font-semibold text-blue-900 mb-1 line-clamp-1"
                title={ticket.title}
              >
                {ticket.title}
              </h2>

              <p className="text-sm text-gray-700">
                <span className="font-semibold">Type :</span> {ticket.type}
              </p>

              <p className="text-sm mt-2">
                <span className="font-semibold">Statut : </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${TicketStatusColor[ticket.status]}`}
                >
                  {ticket.status}
                </span>
              </p>

              <p className="text-sm text-gray-600 mt-2">
                <span className="font-semibold">Date :</span> {ticket.date}
              </p>

              {/* BOUTON VOIR LE TICKET */}
              <Button
                className="w-full bg-blue-800 text-white rounded-xl mt-4 py-2 hover:bg-blue-700"
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                Voir le ticket
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Aucun ticket trouvé.</p>
      )}

      {/* === MODAL TICKET === */}
      {selectedTicketId && (
        <DetailsTicket
          isOpen={true} // maintenant on fournit isOpen
          onClose={() => setSelectedTicketId(null)}
          ticket={{
            id: tickets.find((t) => t.id === selectedTicketId)?.id.toString() || "",
            titre: tickets.find((t) => t.id === selectedTicketId)?.title || "",
            description: "Description non disponible", // mock si pas dispo
            type: tickets.find((t) => t.id === selectedTicketId)?.type || "",
            statut: tickets.find((t) => t.id === selectedTicketId)?.status || "",
            notes: [], // mock vide
            dateCreation: tickets.find((t) => t.id === selectedTicketId)?.date || "",
          }}
        />
      )}
    </div>
  );
}
