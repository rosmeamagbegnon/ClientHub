// src/pages/TicketsEntreprise.tsx
import { useState } from "react";
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
import { Eye } from "lucide-react";
import TicketStatusColor from "../config/ticketStatusColor";

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
interface Ticket {
  id: number;
  title: string;
  client: string;
  type: string;
  status:
    | "En cours d'étude"
    | "Rejetée"
    | "Acceptée"
    | "Assignée"
    | "En cours de traitement"
    | "Traitée";
  dueDate: string;
  notes: string[];
}

const STATUSES: Ticket["status"][] = [
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
  ticket: Ticket;
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
  status: Ticket["status"];
  tickets: Ticket[];
  onView: (ticket: Ticket) => void;
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
  const [ticketsData, setTicketsData] = useState<Ticket[]>([
    {
      id: 1,
      title: "Problème de connexion",
      client: "Société Alpha",
      type: "technique",
      status: "En cours d'étude",
      dueDate: "2025-02-20",
      notes: ["Ticket ouvert par le client."],
    },
    {
      id: 2,
      title: "Erreur de facturation",
      client: "Particulier – Marc D.",
      type: "facturation",
      status: "Assignée",
      dueDate: "2025-02-18",
      notes: [],
    },
    {
      id: 3,
      title: "Suggestion d'amélioration",
      client: "Entreprise Koffi SARL",
      type: "suggestion",
      status: "Traitée",
      dueDate: "2025-02-15",
      notes: ["Suggestion acceptée et mise en place."],
    },
  ]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newNote, setNewNote] = useState("");

  // ===== FILTERS =====
  const filtered = ticketsData.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      (typeFilter ? t.type === typeFilter : true) &&
      (statusFilter ? t.status === statusFilter : true) &&
      (clientFilter
        ? t.client.toLowerCase().includes(clientFilter.toLowerCase())
        : true)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const ticketsByStatus: Record<Ticket["status"], Ticket[]> = {
    "En cours d'étude": [],
    Assignée: [],
    "En cours de traitement": [],
    Acceptée: [],
    Traitée: [],
    Rejetée: [],
  };

  STATUSES.forEach((status) => {
    ticketsByStatus[status] = filtered.filter((t) => t.status === status);
  });

  // ===== DRAG END =====
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const activeTicket = ticketsData.find((t) => t.id === activeId);
    if (!activeTicket) return;

    const overId = over.id.toString();
    const overTicket = ticketsData.find(
      (t) => t.id.toString() === overId
    );

    const newStatus: Ticket["status"] =
      overTicket?.status ?? (overId as Ticket["status"]);

    if (!newStatus) return;

    setTicketsData((prev) =>
      prev.map((t) =>
        t.id === activeId ? { ...t, status: newStatus } : t
      )
    );

    if (selectedTicket?.id === activeId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  // ===== STATUS UPDATE =====
  const updateTicketStatus = (id: number, newStatus: Ticket["status"]) => {
    setTicketsData((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, status: newStatus } : ticket
      )
    );

    if (selectedTicket?.id === id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  // ===== ADD NOTE =====
  const addNote = () => {
    if (!selectedTicket || !newNote.trim()) return;

    setTicketsData((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, notes: [...t.notes, newNote.trim()] }
          : t
      )
    );

    setSelectedTicket({
      ...selectedTicket,
      notes: [...selectedTicket.notes, newNote.trim()],
    });
    setNewNote("");
  };

  return (
    <div className="bg-slate-100 p-6 absolute left-[15%] -z-50 w-[85%] h-full">
      <CardTitle className="text-3xl font-bold text-blue-800 mb-6">Liste des Tickets</CardTitle>

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
            {STATUSES.map((s) => (
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tickets={ticketsByStatus[status]}
              onView={(t) => setSelectedTicket(t)}
            />
          ))}
        </div>
      </DndContext>

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
              onValueChange={(v) =>
                updateTicketStatus(
                  selectedTicket.id,
                  v as Ticket["status"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Changer le statut" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
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

                {selectedTicket.notes.map((note, i) => (
                  <div
                    key={i}
                    className="text-sm bg-white p-2 rounded-md border"
                  >
                    {note}
                  </div>
                ))}
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
                >
                  Ajouter
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
