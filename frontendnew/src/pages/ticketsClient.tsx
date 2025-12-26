// src/pages/TicketsClient.tsx
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import ButtonTicket from "../components/buttonTicket";
import DetailsTicket from "../components/detailsTicket";
import TicketStatusColor from "../config/ticketStatusColor";
import { useApiData } from "../hooks/useApiData";
import { ticketService } from "../services/tickets/ticketService";
import type { Ticket } from "../types/api.types";

/**
 * Mapper les statuts backend vers les statuts d'affichage frontend
 */
const mapStatusToDisplay = (status: Ticket["statut"]): string => {
  const statusMap: Record<Ticket["statut"], string> = {
    en_attente: "En attente",
    en_cours_etude: "En cours d'étude",
    rejete: "Rejetée",
    accepte: "Acceptée",
    assigne: "Assignée",
    en_cours_traitement: "En cours de traitement",
    traite: "Traitée",
  };
  return statusMap[status] || status;
};

/**
 * Mapper les types backend vers les types d'affichage frontend
 */
const mapTypeToDisplay = (type: Ticket["type_ticket"]): string => {
  const typeMap: Record<Ticket["type_ticket"], string> = {
    facturation: "Facturation",
    réclamation: "Réclamation",
    technique: "Technique",
    suggestion: "Suggestion",
    autre: "Autre",
  };
  return typeMap[type] || type;
};

// --- Filtres types ---
type FilterType = "all" | Ticket["type_ticket"];
type StatusFilterType = "all" | Ticket["statut"];

export default function TicketsClient() {
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Récupérer les tickets depuis l'API
  const {
    data: ticketsData,
    loading,
    error,
    refetch,
  } = useApiData(
    () => ticketService.listTickets({ page: 1, limit: 100 }),
    { errorMessage: "Erreur lors du chargement des tickets" }
  );

  const tickets = ticketsData?.items || [];

  // Filtrer les tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket: Ticket) => {
      const matchSearch = ticket.titre.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" ? true : ticket.type_ticket === filter;
      const matchStatus =
        statusFilter === "all" ? true : ticket.statut === statusFilter;
      return matchSearch && matchFilter && matchStatus;
    });
  }, [tickets, search, filter, statusFilter]);

  // Récupérer le ticket sélectionné
  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return tickets.find((t) => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

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

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <Button
            onClick={() => refetch()}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
          <span className="ml-2 text-gray-600">Chargement des tickets...</span>
        </div>
      )}

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
            <option value="réclamation">Réclamation</option>
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
            <option value="en_attente">En attente</option>
            <option value="en_cours_etude">En cours d'étude</option>
            <option value="en_cours_traitement">En cours de traitement</option>
            <option value="assigne">Assignée</option>
            <option value="accepte">Acceptée</option>
            <option value="traite">Traitée</option>
            <option value="rejete">Rejetée</option>
          </select>
        </div>
      </div>

      {/* Liste des tickets */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket: Ticket) => (
              <Card
                key={ticket.id}
                className="shadow-md rounded-2xl hover:shadow-xl transition bg-white border border-gray-100"
              >
                <CardContent className="p-5">
                  <h2
                    className="text-xl font-semibold text-blue-900 mb-1 line-clamp-1"
                    title={ticket.titre}
                  >
                    {ticket.titre}
                  </h2>

                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Type :</span>{" "}
                    {mapTypeToDisplay(ticket.type_ticket)}
                  </p>

                  <p className="text-sm mt-2">
                    <span className="font-semibold">Statut : </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        TicketStatusColor[mapStatusToDisplay(ticket.statut)] ||
                        "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {mapStatusToDisplay(ticket.statut)}
                    </span>
                  </p>

                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold">Date :</span>{" "}
                    {new Date(ticket.date_creation).toLocaleDateString("fr-FR")}
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

          {filteredTickets.length === 0 && !error && (
            <p className="text-center text-gray-500 mt-10">
              {tickets.length === 0
                ? "Aucun ticket pour le moment."
                : "Aucun ticket ne correspond à vos filtres."}
            </p>
          )}
        </>
      )}

      {/* === MODAL TICKET === */}
      {selectedTicket && (
        <DetailsTicket
          isOpen={true}
          onClose={() => setSelectedTicketId(null)}
          ticket={{
            id: selectedTicket.id,
            titre: selectedTicket.titre,
            description: selectedTicket.description || "Aucune description",
            type: mapTypeToDisplay(selectedTicket.type_ticket),
            statut: mapStatusToDisplay(selectedTicket.statut),
            notes: selectedTicket.notes || [],
            dateCreation: selectedTicket.date_creation,
          }}
        />
      )}
    </div>
  );
}
