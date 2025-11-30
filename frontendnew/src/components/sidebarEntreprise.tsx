import {
  Home,
  Ticket,
  Users,
  Sparkles,
  Gift,
  Settings,
  UserCircle,
  LogOut,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo1 from "./logo1";
import { useState, useRef, useEffect } from "react";

export default function SidebarEntreprise() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // ✅ typage corrigé

  const menu = [
    { label: "Dashboard", icon: Home, link: "/dashboardentreprise" },
    { label: "Clients", icon: Users, link: "/clientsentreprise" },
    { label: "Tickets", icon: Ticket, link: "/ticketsentreprise" },
    { label: "Opportunités", icon: Sparkles, link: "/opportunités" },
    { label: "Bonus", icon: Gift, link: "/bonusentreprise" },
    { label: "Paramètres", icon: Settings, link: "/parametresentreprise" },
  ];

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) // ✅ correction TS
      ) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="h-screen w-64 bg-blue-800 text-white flex flex-col shadow-xl fixed left-0 top-0 p-6">
      <Logo1 />
      <h1 className="text-lg font-normal mb-10">InterfaceEntreprise</h1>

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

      {/* --- PROFIL + DROPDOWN --- */}
      <div ref={dropdownRef} className="mt-auto relative">
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className="w-full flex items-center gap-3 bg-white text-blue-800 px-4 py-3 rounded-xl hover:bg-gray-100 transition mt-10"
        >
          <UserCircle size={22} />
          <span className="font-semibold">Mon Profil</span>
        </button>

        {/* Menu flottant affiché VERS LE HAUT */}
        {openDropdown && (
          <div
            className="
              absolute left-0 w-full 
              bottom-16      /* 👈 affichage vers le haut */
              bg-white text-blue-800 rounded-2xl shadow-2xl border border-gray-100 z-50
              animate-fadeIn animate-slideDown
            "
          >
            {/* Section info profil */}
            <div className="p-4 border-b border-gray-100 w-full">
                <div>
                  <p className="font-semibold">Nom de l'entreprise</p>
                  <p className="text-sm text-gray-500">email@entreprise.com</p>
                </div>
            </div>

            <div className="py-2">
              <Link
                to="/mes-informations"
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition"
              >
                <User size={18} />
                Mes informations
              </Link>

              <Link
                to="/utilisateurs"
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition"
              >
                <Users size={18} />
                Utilisateurs
              </Link>
            </div>

            <div className="border-t border-gray-100 py-2">
              <button
                onClick={() => console.log("Déconnexion")}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 text-red-600 transition"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
