import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import TicketStatusColor from "../config/ticketStatusColor";

// --- Types ---
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

const TicketsEntreprise = () => {

  // PUT ticketsData IN STATE (IMPORTANT)
  const [ticketsData, setTicketsData] = useState<Ticket[]>([
    {
      id: 1,
      title: "Problème de connexion",
      client: "Société Alpha",
      type: "technique",
      status: "En cours d'étude",
      dueDate: "2025-02-20",
      notes: ["Ticket ouvert par le client."]
    },
    {
      id: 2,
      title: "Erreur de facturation",
      client: "Particulier – Marc D.",
      type: "facturation",
      status: "Assignée",
      dueDate: "2025-02-18",
      notes: []
    },
    {
      id: 3,
      title: "Suggestion d'amélioration",
      client: "Entreprise Koffi SARL",
      type: "suggestion",
      status: "Traitée",
      dueDate: "2025-02-15",
      notes: ["Suggestion acceptée et mise en place."]
    },
  ]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newNote, setNewNote] = useState("");
  const itemsPerPage = 6;

  const filtered = ticketsData.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (typeFilter ? t.type === typeFilter : true) &&
    (statusFilter ? t.status === statusFilter : true) &&
    (clientFilter ? t.client.toLowerCase().includes(clientFilter.toLowerCase()) : true)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // 🔵 AUTOMATIC STATUS UPDATE
  const updateTicketStatus = (id: number, newStatus: Ticket["status"]) => {
    setTicketsData(prev =>
      prev.map(ticket =>
        ticket.id === id ? { ...ticket, status: newStatus } : ticket
      )
    );

    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  // 🔵 AUTOMATIC NOTE SAVE
  const addNote = () => {
    if (!selectedTicket || !newNote.trim()) return;

    setTicketsData(prev =>
      prev.map(t =>
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

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Liste des Tickets</h1>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-5 rounded-xl shadow-sm border">
        <Input placeholder="Rechercher par titre..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />

        <Select onValueChange={(value) => { setTypeFilter(value); setPage(1); }}>
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

        <Select onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="En cours d'étude">En cours d'étude</SelectItem>
            <SelectItem value="Rejetée">Rejetée</SelectItem>
            <SelectItem value="Acceptée">Acceptée</SelectItem>
            <SelectItem value="Assignée">Assignée</SelectItem>
            <SelectItem value="En cours de traitement">En cours de traitement</SelectItem>
            <SelectItem value="Traitée">Traitée</SelectItem>
          </SelectContent>
        </Select>

        <Input placeholder="Filtrer par client..." value={clientFilter} onChange={(e) => { setClientFilter(e.target.value); setPage(1); }} />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map(ticket => (
          <Card key={ticket.id} className="shadow-md rounded-2xl hover:shadow-xl transition bg-white border border-gray-100">
            <CardContent className="p-5">
              <h2 className="text-xl font-semibold text-blue-800 mb-2 line-clamp-1">{ticket.title}</h2>
              <p className="text-gray-700 mb-1"><span className="font-semibold">Client:</span> {ticket.client}</p>
              <p className="text-gray-700 mb-1"><span className="font-semibold">Type:</span> {ticket.type}</p>
              <p className="text-gray-700 mb-1"><span className="font-semibold">Statut:</span>
                <Badge className={`${TicketStatusColor[ticket.status]}`}>{ticket.status}</Badge>
              </p>
              <p className="text-gray-700 mb-4"><span className="font-semibold">Échéance :</span> {ticket.dueDate}</p>
              <Button className="bg-blue-800 text-white" size="sm" variant="outline" onClick={() => setSelectedTicket(ticket)}>
                <Eye className="w-4 h-4 mr-1"/> Voir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-3 mt-5">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page-1)}>Précédent</Button>
        <span>Page {page} / {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page+1)}>Suivant</Button>
      </div>

      {/* Modal détails */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-[rgb(30,64,175,0.4)] bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl md:text-2xl font-bold" onClick={() => setSelectedTicket(null)}>×</button>
            
            <h2 className="text-xl font-bold text-blue-800 mb-4">{selectedTicket.title}</h2>
            <p><span className="font-semibold">Client:</span> {selectedTicket.client}</p>
            <p><span className="font-semibold">Type:</span> {selectedTicket.type}</p>

            {/* STATUS + SELECT */}
            <p className="flex items-center gap-2 mt-2">
              <span className="font-semibold">Statut:</span>
              <Badge className={`${TicketStatusColor[selectedTicket.status]}`}>{selectedTicket.status}</Badge>
            </p>

            <div className="mt-2">
              <Select onValueChange={(value) => updateTicketStatus(selectedTicket.id, value as Ticket["status"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Changer le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En cours d'étude">En cours d'étude</SelectItem>
                  <SelectItem value="Rejetée">Rejetée</SelectItem>
                  <SelectItem value="Acceptée">Acceptée</SelectItem>
                  <SelectItem value="Assignée">Assignée</SelectItem>
                  <SelectItem value="En cours de traitement">En cours de traitement</SelectItem>
                  <SelectItem value="Traitée">Traitée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="mt-3"><span className="font-semibold">Échéance:</span> {selectedTicket.dueDate}</p>
            
            {/* Notes */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Notes:</h3>
              <div className="max-h-40 overflow-auto border p-2 rounded-md bg-gray-50 space-y-1 mb-3">
                {selectedTicket.notes.length > 0 ? (
                  selectedTicket.notes.map((note, idx) => (
                    <p key={idx} className="text-gray-700 text-sm">• {note}</p>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Aucune note disponible</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input placeholder="Ajouter une note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                <Button className="bg-blue-800" onClick={addNote}>Ajouter une note</Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TicketsEntreprise;
