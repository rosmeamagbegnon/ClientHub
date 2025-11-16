import { Ticket, ShoppingBag, Gift, BotMessageSquare } from "lucide-react";
import ButtonTicket from "../components/buttonTicket";
import { Link } from "react-router-dom";
import { TicketStatusColors } from "../config/ticketStatusColor";

const AccueilClient1 = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-14 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:justify-between">
          <div className="space-y-5 md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Ticket, label: "Demandes ouvertes", qty: 12 },
            { icon: ShoppingBag, label: "Commandes actives", qty: 5 },
            { icon: Gift, label: "Bonus obtenus", qty: 2 },
            { icon: BotMessageSquare, label: "Chat en attente", qty: 1 },
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
      </section>

      {/* DERNIÈRES DEMANDES */}
      <SectionList
        title="Vos dernières demandes"
        link="/ticketsclient"
        items={[
          { label: "Problème de facturation", status: "En cours d'étude" },
          { label: "Réclamation sur commande", status: "Acceptée" },
          { label: "Problème technique", status: "Traitée" },
        ]}
      />

      {/* DERNIÈRES COMMANDES */}
      <SectionList
        title="Vos dernières commandes"
        link="/commandes"
        items={[
          { label: "Site vitrine de EcoChamp", status: "En préparation" },
          { label: "Site de gestion des ressources humaines", status: "Livrée" },
          { label: "Audit écologique d'un site web", status: "En attente" },
        ]}
      />

      {/* DERNIERS BONUS */}
      <SectionList
        title="Vos derniers bonus"
        link="/bonus"
        items={[
          { label: "Bonus fidélité – 50 points", status: "Attribué" },
          { label: "Réduction 10% sur commande", status: "Utilisé" },
          { label: "Bonus parrainage – 20 points", status: "Valide" },
        ]}
      />

      {/* SERVICES */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Services disponibles</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Ticket, title: "Gérer mes tickets", text: "Consultez et suivez l’évolution de vos tickets.", link: "/tickets" },
            { icon: ShoppingBag, title: "Mes commandes", text: "Suivez vos commandes en temps réel.", link: "/commandes" },
            { icon: Gift, title: "Mes bonus", text: "Accumulez des points et obtenez des récompenses.", link: "/bonus" },
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
}: {
  title: string;
  link: string;
  items: { label: string; status: string }[];
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
        {items.map((item, i) => (
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
        ))}
      </div>
    </section>
  );
}

export default AccueilClient1;
