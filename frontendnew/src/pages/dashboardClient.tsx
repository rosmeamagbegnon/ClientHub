import { Ticket, ShoppingBag, Gift, BotMessageSquare, Loader2 } from "lucide-react";
import ButtonTicket from "../components/buttonTicket";
import { Link } from "react-router-dom";
import { TicketStatusColors } from "../config/ticketStatusColor";
import { useApiData } from "../hooks/useApiData";
import { ticketService } from "../services/tickets/ticketService";
import { commandeService } from "../services/commandes/commandeService";
import { bonusService } from "../services/bonus/bonusService";
import type { Ticket as TicketType, Commande, Bonus } from "../types/api.types";
import { useMemo } from "react";

// Fonction pour mapper le statut backend vers le libellé frontend
const mapStatusToDisplay = (status: string): string => {
  const mapping: Record<string, string> = {
    en_attente: "En attente",
    en_cours_etude: "En cours d'étude",
    rejete: "Rejeté",
    accepte: "Acceptée",
    assigne: "Assignée",
    en_cours_traitement: "En cours de traitement",
    traite: "Traitée",
    contrat_accepte: "Contrat accepté",
    en_cours_developpement: "En préparation",
    livraison: "En livraison",
    livree: "Livrée",
    annulee: "Annulée",
  };
  return mapping[status] || status;
};

const DashboardClient = () => {
  // Récupérer les tickets
  const {
    data: ticketsData,
    loading: loadingTickets,
    error: errorTickets,
  } = useApiData(
    () => ticketService.listTickets({ page: 1, limit: 100 }),
    { errorMessage: "Erreur lors du chargement des tickets" }
  );

  // Récupérer les commandes
  const {
    data: commandesData,
    loading: loadingCommandes,
    error: errorCommandes,
  } = useApiData(
    () => commandeService.listCommandes({ page: 1, limit: 100 }),
    { errorMessage: "Erreur lors du chargement des commandes" }
  );

  // Récupérer les bonus
  const {
    data: bonusList,
    loading: loadingBonus,
    error: errorBonus,
  } = useApiData(
    () => bonusService.getMesBonus(),
    { errorMessage: "Erreur lors du chargement des bonus" }
  );

  // Calculer les statistiques
  const stats = useMemo(() => {
    const tickets = ticketsData?.items || [];
    const commandes = commandesData?.items || [];
    const bonus = bonusList || [];

    // Demandes ouvertes (tickets non traités)
    const demandesOuvertes = tickets.filter(
      (t) => !["traite", "rejete"].includes(t.statut)
    ).length;

    // Commandes actives (non livrées et non annulées)
    const commandesActives = commandes.filter(
      (c) => !["livree", "annulee"].includes(c.statut)
    ).length;

    // Bonus obtenus (actifs et dans la période de validité)
    const bonusObtenus = bonus.length;

    return {
      demandesOuvertes,
      commandesActives,
      bonusObtenus,
      chatEnAttente: 0, // À implémenter si un endpoint chat existe
    };
  }, [ticketsData, commandesData, bonusList]);

  // Derniers tickets (3 premiers)
  const derniersTickets = useMemo(() => {
    const tickets = ticketsData?.items || [];
    return tickets
      .slice(0, 3)
      .map((t) => ({
        label: t.titre,
        status: mapStatusToDisplay(t.statut),
      }));
  }, [ticketsData]);

  // Dernières commandes (3 premières)
  const dernieresCommandes = useMemo(() => {
    const commandes = commandesData?.items || [];
    return commandes
      .slice(0, 3)
      .map((c) => ({
        label: c.titre,
        status: mapStatusToDisplay(c.statut),
      }));
  }, [commandesData]);

  // Derniers bonus (3 premiers)
  const derniersBonus = useMemo(() => {
    const bonus = bonusList || [];
    return bonus.slice(0, 3).map((b) => ({
      label: b.titre,
      status: b.est_actif ? "Valide" : "Expiré",
    }));
  }, [bonusList]);

  const isLoading = loadingTickets || loadingCommandes || loadingBonus;
  const hasError = errorTickets || errorCommandes || errorBonus;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-14 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:justify-between">
          <div className="space-y-5 md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight drop-shadow">
              Bienvenue sur votre espace client
            </h1>
            <p className="text-lg text-gray-200 leading-relaxed">
              Suivez vos demandes, commandes et avantages en toute simplicité.
            </p>
            <ButtonTicket />
          </div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/906/906343.png"
            alt="Support"
            className="w-44 md:w-64 mt-8 md:mt-0 drop-shadow-2xl animate-bounce-slow"
          />
        </div>
      </section>

      {/* STATISTIQUES */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Vos statistiques</h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
            <span className="ml-2 text-gray-600">Chargement des statistiques...</span>
          </div>
        ) : hasError ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Certaines données n'ont pas pu être chargées. Veuillez rafraîchir la page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Ticket, label: "Demandes ouvertes", qty: stats.demandesOuvertes },
              { icon: ShoppingBag, label: "Commandes actives", qty: stats.commandesActives },
              { icon: Gift, label: "Bonus obtenus", qty: stats.bonusObtenus },
              { icon: BotMessageSquare, label: "Chat en attente", qty: stats.chatEnAttente },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition-all"
              >
                <item.icon size={32} className="mx-auto text-blue-800" />
                <p className="text-3xl font-extrabold mt-3">{item.qty}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DERNIÈRES DEMANDES */}
      <SectionList
        title="Vos dernières demandes"
        link="/ticketsclient"
        items={derniersTickets}
        loading={loadingTickets}
        error={errorTickets}
      />

      {/* DERNIÈRES COMMANDES */}
      <SectionList
        title="Vos dernières commandes"
        link="/commandesclient"
        items={dernieresCommandes}
        loading={loadingCommandes}
        error={errorCommandes}
      />

      {/* DERNIERS BONUS */}
      <SectionList
        title="Vos derniers bonus"
        link="/bonusclient"
        items={derniersBonus}
        loading={loadingBonus}
        error={errorBonus}
      />

      {/* SERVICES */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Services disponibles</h2>
        <div className="grid md:grid-cols-3 gap-6">
            {[
            { icon: Ticket, title: "Gérer mes tickets", text: "Consultez et suivez l'évolution de vos tickets.", link: "/ticketsclient" },
            { icon: ShoppingBag, title: "Mes commandes", text: "Suivez vos commandes en temps réel.", link: "/commandesclient" },
            { icon: Gift, title: "Mes bonus", text: "Accumulez des points et obtenez des récompenses.", link: "/bonusclient" },
          ].map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <card.icon size={32} className="text-blue-800 mb-4" />
              <h3 className="text-xl font-semibold mb-1">{card.title}</h3>
              <p className="text-gray-600">{card.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-900 text-gray-200 text-center py-5 mt-14 text-sm">
        © {new Date().getFullYear()} | Votre entreprise – Espace client
      </footer>
    </div>
  );
};

/* 🔵 Composant réutilisable pour listes (demandes, commandes, bonus) */
function SectionList({
  title,
  link,
  items,
  loading,
  error,
}: {
  title: string;
  link: string;
  items: { label: string; status: string }[];
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to={link} className="text-blue-800 font-semibold hover:underline">
          Voir Plus
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-md divide-y">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-800" />
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-gray-500">
            <p>Erreur lors du chargement</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Aucun élément à afficher</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={i}
              className="p-5 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <p className="text-gray-900 font-medium">{item.label}</p>
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  TicketStatusColors[item.status] || "bg-gray-200 text-gray-800"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default DashboardClient;
