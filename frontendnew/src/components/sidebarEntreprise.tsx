import { Home, Ticket, Users, ShoppingBag, Gift, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function SidebarEntreprise() {
  const location = useLocation();

  const menu = [
    { label: "Dashboard", icon: Home, link: "/dashboardentreprise" },
    { label: "Clients", icon: Users, link: "/clientsentreprise" },
    { label: "Tickets", icon: Ticket, link: "/ticketsentreprise" },
    { label: "Commandes", icon: ShoppingBag, link: "/commandesentreprise" },
    { label: "Bonus", icon: Gift, link: "/bonusentreprise" },
    { label: "Paramètres", icon: Settings, link: "/parametresentreprise" },
  ];

  return (
    <aside className="h-screen w-64 bg-blue-800 text-white flex flex-col shadow-xl fixed left-0 top-0 p-6">
      <h1 className="text-2xl font-bold mb-10">Entreprise</h1>

      <nav className="space-y-2">
        {menu.map((item, i) => {
          const active = location.pathname.startsWith(item.link);
          return (
            <Link
              key={i}
              to={item.link}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${active ? "bg-white text-blue-800 font-semibold" : "hover:bg-blue-700"}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button className="w-full bg-red-600 py-2 rounded-xl hover:bg-red-500 transition mt-10">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}