// src/pages/TicketsEntreprise.tsx
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2 } from "lucide-react";
import TicketStatusColor from "../config/ticketStatusColor";
import { useApiData, useApiMutation } from "../hooks/useApiData";
import { ticketService } from "../services/tickets/ticketService";
import type { Ticket } from "../types/api.types";
import { logger } from "../utils/logger";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardTitle } from "@/components/ui/card";

// ===== TYPES =====
/**
 * Interface locale pour l'affichage dans le Kanban
 */
interface TicketDisplay {
  id: string;
  title: string;
  client: string;
  type: string;
  status: string;
  dueDate: string;
  notes: Array<{ id?: string; contenu?: string; date_creation?: string } | string>;
}

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
 * Mapper les statuts d'affichage frontend vers les statuts backend
 */
const mapStatusToBackend = (status: string): Ticket["statut"] | null => {
  const statusMap: Record<string, Ticket["statut"]> = {
    "En attente": "en_attente",
    "En cours d'étude": "en_cours_etude",
    "Rejetée": "rejete",
    "Acceptée": "accepte",
    "Assignée": "assigne",
    "En cours de traitement": "en_cours_traitement",
    "Traitée": "traite",
  };
  return statusMap[status] || null;
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

/**
 * Convertir un Ticket API en TicketDisplay pour l'affichage
 */
const convertTicketToDisplay = (ticket: Ticket): TicketDisplay => {
  // Formater le nom du client (on utilisera client_id pour l'instant, à améliorer avec un join)
  const clientName = `Client ${ticket.client_id.substring(0, 8)}...`;
  
  return {
    id: ticket.id,
    title: ticket.titre,
    client: clientName,
    type: mapTypeToDisplay(ticket.type_ticket),
    status: mapStatusToDisplay(ticket.statut),
    dueDate: ticket.date_creation ? new Date(ticket.date_creation).toLocaleDateString("fr-FR") : "N/A",
    notes: ticket.notes || [],
  };
};

const STATUSES_DISPLAY: string[] = [
  "En attente",
  "En cours d'étude",
  "Assignée",
  "En cours de traitement",
  "Acceptée",
  "Traitée",
  "Rejetée",
];

// ===== DRAGGABLE TICKET =====
function DraggableTicket({
  ticket,
  onView,
}: {
  ticket: TicketDisplay;
  onView: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id.toString() });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? "0 10px 20px rgba(0,0,0,0.2)" : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={`p-4 rounded-xl shadow-md mb-2 bg-white border ${
          isDragging ? "bg-blue-50" : ""
        }`}
      >
        <h2 className="text-md font-semibold text-blue-900 line-clamp-2 mb-1">
          {ticket.title}
        </h2>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Client:</span> {ticket.client}
        </p>
        <p className="text-sm text-gray-700 capitalize">
          <span className="font-semibold">Type:</span> {ticket.type}
        </p>
        <div className="mt-2 flex text-sm text-gray-600">
          <p className="font-semibold">Statut:</p>
          <Badge
            className={TicketStatusColor[ticket.status]}
          >
            {ticket.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-semibold">Échéance:</span> {ticket.dueDate}
        </p>
        <Button
          className="w-full bg-blue-800 text-white rounded-xl mt-3 py-1 hover:bg-blue-700"
          onClick={onView}
        >
          <Eye className="w-4 h-4 mr-1 inline" /> Voir
        </Button>
      </div>
    </div>
  );
}

// ===== KANBAN COLUMN =====
function KanbanColumn({
  status,
  tickets,
  onView,
}: {
  status: string;
  tickets: TicketDisplay[];
  onView: (ticket: TicketDisplay) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className="min-w-[280px] bg-gray-100 rounded-xl p-3 flex flex-col gap-3"
    >
      <div className="flex justify-between items-center mb-2">
        <h3
          className="font-semibold px-2 py-1 rounded-md"
          style={{
            backgroundColor: TicketStatusColor[status] || "transparent",
            color: TicketStatusColor[status] || "black",
          }}
        >
          {status}
        </h3>
        <span className="text-sm text-gray-600">
          {tickets.length} ticket{tickets.length > 1 ? "s" : ""}
        </span>
      </div>

      <SortableContext
        items={tickets.map((t) => t.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        {tickets.map((ticket) => (
          <DraggableTicket
            key={ticket.id}
            ticket={ticket}
            onView={() => onView(ticket)}
          />
        ))}
      </SortableContext>
    </div>
  );
}

// ===== MAIN COMPONENT =====
const TicketsEntreprise = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketDisplay | null>(null);
  const [selectedTicketApi, setSelectedTicketApi] = useState<Ticket | null>(null);
  const [newNote, setNewNote] = useState("");

  // Récupérer les tickets depuis l'API
  const {
    data: ticketsDataResponse,
    loading,
    error,
    refetch,
  } = useApiData(
    () => ticketService.listTickets({ page: 1, limit: 100 }),
    { errorMessage: "Erreur lors du chargement des tickets" }
  );

  // Hook pour la mise à jour du statut
  const {
    mutate: updateStatus,
    loading: updatingStatus,
  } = useApiMutation(
    ({ ticketId, newStatus }: { ticketId: string; newStatus: Ticket["statut"] }) =>
      ticketService.updateTicketStatus(ticketId, { statut: newStatus })
  );

  // Hook pour l'ajout de note
  const {
    mutate: addNoteMutation,
    loading: addingNote,
  } = useApiMutation(
    ({ ticketId, contenu }: { ticketId: string; contenu: string }) =>
      ticketService.addNote(ticketId, { contenu, est_publique: true })
  );

  // Convertir les tickets API en tickets d'affichage
  const ticketsData = useMemo(() => {
    if (!ticketsDataResponse?.items) return [];
    return ticketsDataResponse.items.map(convertTicketToDisplay);
  }, [ticketsDataResponse]);

  // ===== FILTERS =====
  const filtered = useMemo(() => {
    return ticketsData.filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) &&
        (typeFilter && typeFilter !== "all" ? t.type.toLowerCase() === typeFilter.toLowerCase() : true) &&
        (statusFilter && statusFilter !== "all" ? t.status === statusFilter : true) &&
        (clientFilter
          ? t.client.toLowerCase().includes(clientFilter.toLowerCase())
          : true)
    );
  }, [ticketsData, search, typeFilter, statusFilter, clientFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const ticketsByStatus: Record<string, TicketDisplay[]> = useMemo(() => {
    const grouped: Record<string, TicketDisplay[]> = {};
    STATUSES_DISPLAY.forEach((status) => {
      grouped[status] = [];
    });
    filtered.forEach((ticket) => {
      if (grouped[ticket.status]) {
        grouped[ticket.status].push(ticket);
      }
    });
    return grouped;
  }, [filtered]);

  // ===== DRAG END =====
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const activeTicket = ticketsData.find((t) => t.id === activeId);
    if (!activeTicket) return;

    const overId = over.id.toString();
    // Si on drop sur une colonne (status), overId sera le statut
    // Si on drop sur un autre ticket, on récupère le statut de ce ticket
    const overTicket = ticketsData.find((t) => t.id === overId);
    const newStatusDisplay = overTicket?.status ?? overId;

    // Convertir le statut d'affichage en statut backend
    const newStatusBackend = mapStatusToBackend(newStatusDisplay);
    if (!newStatusBackend) {
      logger.warn("Statut invalide lors du drag & drop", { newStatusDisplay });
      return;
    }

    // Mise à jour optimiste de l'UI
    const updatedTickets = ticketsData.map((t) =>
      t.id === activeId ? { ...t, status: newStatusDisplay } : t
    );

    // Mettre à jour via l'API
    try {
      await updateStatus({ ticketId: activeId, newStatus: newStatusBackend });
      // Recharger les tickets pour avoir les données à jour
      await refetch();
      logger.info("Statut du ticket mis à jour avec succès", { ticketId: activeId, newStatus: newStatusBackend });
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du statut", error);
      // En cas d'erreur, recharger pour restaurer l'état
      await refetch();
    }
  };

  // ===== STATUS UPDATE =====
  const updateTicketStatus = async (id: string, newStatusDisplay: string) => {
    const newStatusBackend = mapStatusToBackend(newStatusDisplay);
    if (!newStatusBackend) {
      logger.warn("Statut invalide", { newStatusDisplay });
      return;
    }

    try {
      await updateStatus({ ticketId: id, newStatus: newStatusBackend });
      // Recharger les tickets
      await refetch();
      logger.info("Statut du ticket mis à jour", { ticketId: id, newStatus: newStatusBackend });
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du statut", error);
    }
  };

  // ===== ADD NOTE =====
  const addNote = async () => {
    if (!selectedTicketApi || !newNote.trim()) return;

    try {
      await addNoteMutation({
        ticketId: selectedTicketApi.id,
        contenu: newNote.trim(),
      });
      // Recharger le ticket pour avoir les notes à jour
      const updatedTicket = await ticketService.getTicket(selectedTicketApi.id);
      setSelectedTicketApi(updatedTicket);
      setSelectedTicket(convertTicketToDisplay(updatedTicket));
      setNewNote("");
      logger.info("Note ajoutée avec succès", { ticketId: selectedTicketApi.id });
    } catch (error) {
      logger.error("Erreur lors de l'ajout de la note", error);
    }
  };

  // ===== VIEW TICKET =====
  const handleViewTicket = async (ticket: TicketDisplay) => {
    setSelectedTicket(ticket);
    try {
      // Charger les détails complets du ticket depuis l'API
      const fullTicket = await ticketService.getTicket(ticket.id);
      setSelectedTicketApi(fullTicket);
      setSelectedTicket(convertTicketToDisplay(fullTicket));
    } catch (error) {
      logger.error("Erreur lors du chargement du ticket", error);
    }
  };

  return (
    <div className="bg-slate-100 p-6 absolute left-[15%] -z-50 w-[85%] h-full">
      <CardTitle className="text-3xl font-bold text-blue-800 mb-6">Liste des Tickets</CardTitle>

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

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-5 rounded-xl shadow-sm border">
        <Input
          placeholder="Rechercher par titre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select onValueChange={(v) => setTypeFilter(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Type de ticket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="facturation">Facturation</SelectItem>
            <SelectItem value="réclamation">Réclamation</SelectItem>
            <SelectItem value="technique">Technique</SelectItem>
            <SelectItem value="suggestion">Suggestion</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setStatusFilter(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {STATUSES_DISPLAY.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Filtrer par client..."
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        />
      </div>

      {/* KANBAN */}
      {!loading && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUSES_DISPLAY.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tickets={ticketsByStatus[status] || []}
                onView={handleViewTicket}
              />
            ))}
          </div>
        </DndContext>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {ticketsData.length === 0
            ? "Aucun ticket pour le moment."
            : "Aucun ticket ne correspond à vos filtres."}
        </div>
      )}

      {/* MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-[rgb(30,64,175,0.4)] flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl md:text-2xl font-bold"
              onClick={() => setSelectedTicket(null)}
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-blue-800 mb-4">
              {selectedTicket.title}
            </h2>

            <p>
              <span className="font-semibold">Client:</span>{" "}
              {selectedTicket.client}
            </p>

            <p>
              <span className="font-semibold">Type:</span>{" "}
              {selectedTicket.type}
            </p>

            <p className="flex items-center gap-2 mt-2">
              <span className="font-semibold">Statut:</span>
              <Badge
                className={
                  TicketStatusColor[selectedTicket.status]
                }
              >
                {selectedTicket.status}
              </Badge>
            </p>

            <Select
              onValueChange={(v) => updateTicketStatus(selectedTicket.id, v)}
              value={selectedTicket.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Changer le statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES_DISPLAY.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="mt-3">
              <span className="font-semibold">Échéance:</span>{" "}
              {selectedTicket.dueDate}
            </p>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Notes:</h3>

              <div className="max-h-40 overflow-auto border p-2 rounded-md bg-gray-50 space-y-1 mb-3">
                {selectedTicket.notes.length === 0 && (
                  <p className="text-gray-500">
                    Aucune note pour le moment.
                  </p>
                )}

                {selectedTicket.notes.map((note, i) => {
                  const noteContent =
                    typeof note === "string" ? note : note.contenu || "Note sans contenu";
                  const noteDate =
                    typeof note === "object" && note.date_creation
                      ? new Date(note.date_creation).toLocaleDateString("fr-FR")
                      : "";
                  return (
                    <div
                      key={typeof note === "object" && note.id ? note.id : i}
                      className="text-sm bg-white p-2 rounded-md border mb-2"
                    >
                      <p>{noteContent}</p>
                      {noteDate && (
                        <p className="text-xs text-gray-500 mt-1">{noteDate}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button
                  onClick={addNote}
                  className="bg-blue-800 text-white"
                  disabled={addingNote || !newNote.trim()}
                >
                  {addingNote ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    "Ajouter"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsEntreprise;
