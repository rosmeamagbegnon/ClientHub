import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Ticket,  Users, Settings, PlusCircle } from "lucide-react";
import { TicketStatusColors } from "../config/ticketStatusColor";
import { Link } from "react-router-dom";

// DashboardCompany.tsx
// Page React + TypeScript complète pour le dashboard d'une entreprise

// --- Mock data ---
const kpis = [
  { id: "tickets", label: "Tickets reçus", value: 248, delta: "+12%" },
  { id: "open", label: "Tickets ouverts", value: 34, delta: "-4%" },
  { id: "resolved", label: "Résolus ce mois", value: 198, delta: "+18%" },
  { id: "avgTime", label: "Temps moyen (h)", value: 8.3, delta: "-6%" },
];

const tickets = [
  { id: 101, title: "Erreur paiement sur abonnement", client: "Société A", type: "facturation", status: "En cours d'étude", date: "2025-11-12" },
  { id: 102, title: "Impossible de se connecter", client: "Client B", type: "technique", status: "Assignée", date: "2025-11-10" },
  { id: 103, title: "Demande de remboursement", client: "Client C", type: "facturation", status: "En cours de traitement", date: "2025-11-09" },
  { id: 104, title: "Amélioration tableau de bord", client: "Société D", type: "suggestion", status: "Acceptée", date: "2025-11-08" },
  { id: 105, title: "Problème de performance API", client: "Client E", type: "technique", status: "En cours d'étude", date: "2025-11-07" },
];

const ticketsByDay = [
  { date: "2025-10-29", value: 10 },
  { date: "2025-10-30", value: 8 },
  { date: "2025-10-31", value: 12 },
  { date: "2025-11-01", value: 9 },
  { date: "2025-11-02", value: 11 },
  { date: "2025-11-03", value: 14 },
  { date: "2025-11-04", value: 7 },
  { date: "2025-11-05", value: 13 },
  { date: "2025-11-06", value: 6 },
  { date: "2025-11-07", value: 15 },
];

const ticketsByType = [
  { name: "Technique", value: 82 },
  { name: "Facturation", value: 64 },
  { name: "Suggestion", value: 37 },
  { name: "Réclamation", value: 30 },
];

const clients = [
  { id: 1, name: "Société A", tickets: 12, lastActivity: "2025-11-12" },
  { id: 2, name: "Client B", tickets: 7, lastActivity: "2025-11-10" },
  { id: 3, name: "Client C", tickets: 5, lastActivity: "2025-11-09" },
];

const COLORS = ["#60A5FA", "#FBBF24", "#34D399", "#F87171"];

// --- Subcomponents ---
function KPIGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <div key={k.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{k.label}</p>
              <p className="text-2xl font-extrabold mt-1 text-gray-900">{k.value}</p>
            </div>
            <div className="text-sm text-gray-500">{k.delta}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TicketsTrendChart() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-56">
      <h3 className="text-lg font-semibold mb-2">Tickets - tendance</h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={ticketsByDay}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#1E40AF" strokeWidth={3} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TicketsByTypePie() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-56">
      <h3 className="text-lg font-semibold mb-2">Répartition par type</h3>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie data={ticketsByType} dataKey="value" nameKey="name" outerRadius={70} label>
            {ticketsByType.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function RecentTicketsTable({ onView }: { onView: (id: number) => void }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Derniers tickets</h3>
        <Link to="/tickets" className="text-sm text-blue-800 font-medium hover:underline">Voir tout</Link>
      </div>

      <div className="divide-y">
        {tickets.map((t) => (
          <div key={t.id} className="py-3 flex items-start justify-between">
            <div className="flex-1 pr-4">
              <p className="font-semibold text-gray-900">{t.title}</p>
              <p className="text-sm text-gray-600">{t.client} • {t.type}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${TicketStatusColors[t.status] || 'bg-gray-200 text-gray-800'}`}>
                {t.status}
              </span>
              <button onClick={() => onView(t.id)} className="text-sm px-3 py-1 rounded-md bg-blue-800 text-white hover:bg-blue-700">Voir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentClients() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Clients actifs</h3>
        <Link to="/clients" className="text-sm text-blue-800 font-medium hover:underline">Voir tout</Link>
      </div>

      <ul className="space-y-3">
        {clients.map((c) => (
          <li key={c.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{c.name}</p>
              <p className="text-sm text-gray-500">{c.tickets} tickets • Dernière activité {c.lastActivity}</p>
            </div>
            <Link to={`/clients/${c.id}`} className="text-sm text-blue-800 hover:underline">Profil</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">Accès rapide</h3>
      <div className="grid grid-cols-1 gap-3">
        <Link to="/tickets/new" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-800 text-white hover:bg-blue-700">
          <PlusCircle size={18} />
          <span>Créer un ticket</span>
        </Link>
        <Link to="/tickets" className="flex items-center gap-3 px-4 py-3 rounded-lg border hover:shadow">
          <Ticket size={18} />
          <span>Voir tous les tickets</span>
        </Link>
        <Link to="/clients" className="flex items-center gap-3 px-4 py-3 rounded-lg border hover:shadow">
          <Users size={18} />
          <span>Clients</span>
        </Link>
        <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg border hover:shadow">
          <Settings size={18} />
          <span>Paramètres</span>
        </Link>
      </div>
    </div>
  );
}

// --- Page principale ---
export default function DashboardEntreprise() {
  const handleView = (id: number) => {
    // ici tu peux ouvrir un modal ou router vers la page de détails
    console.log("Voir ticket", id);
  };

  return (
    <div className=" bg-slate-100 p-6 absolute left-[15%] -z-50 w-[85%]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Dashboard entreprise</h1>
            <p className="text-sm text-gray-500 mt-1">Vue globale des activités et performances</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg bg-white border shadow-sm hover:shadow transition">Importer</button>
            <button className="px-4 py-2 rounded-lg bg-blue-800 text-white hover:bg-blue-700">Créer</button>
          </div>
        </header>

        {/* KPI */}
        <KPIGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TicketsTrendChart />
              <TicketsByTypePie />
            </div>

            <RecentTicketsTable onView={handleView} />
          </div>

          <aside className="space-y-6">
            <QuickActions />
            <RecentClients />
          </aside>
        </div>
      </div>
    </div>
  );
}
