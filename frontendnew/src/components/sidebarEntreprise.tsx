import {
  Home,
  Ticket,
  Users,
  Sparkles,
  Gift,
  UserCircle,
  LogOut,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo1 from "./logo1";
import { useState, useRef, useEffect } from "react";

export default function SidebarEntreprise() {
  const location = useLocation();
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const menu = [
    { label: "Dashboard", icon: Home, link: "/dashboardentreprise" },
    { label: "Clients", icon: Users, link: "/clientsentreprise" },
    { label: "Tickets", icon: Ticket, link: "/ticketsentreprise" },
    { label: "Opportunites", icon: Sparkles, link: "/opportunites" },
    { label: "Bonus", icon: Gift, link: "/bonusentreprise" },
  ];

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // ici tu peux aussi clear le localStorage si besoin
    // localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <aside className="h-screen w-64 bg-blue-800 text-white flex flex-col shadow-xl fixed left-0 top-0 p-6">
        <Logo1 />
        <h1 className="text-lg font-normal mb-10">
          InterfaceEntreprise
        </h1>

        <nav className="space-y-2">
          {menu.map((item, i) => {
            const active = location.pathname.startsWith(item.link);
            return (
              <Link
                key={i}
                to={item.link}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${
                    active
                      ? "bg-white text-blue-800 font-semibold"
                      : "hover:bg-blue-700"
                  }`}
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

          {openDropdown && (
            <div className="absolute left-0 w-full bottom-16 bg-white text-blue-800 rounded-2xl shadow-2xl border border-gray-100 z-50">
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold">Nom de l'entreprise</p>
                <p className="text-sm text-gray-500">
                  email@entreprise.com
                </p>
              </div>

              <div className="py-2">
                <Link
                  to="/profilemploye"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100"
                >
                  <User size={18} />
                  Mes informations
                </Link>

                <Link
                  to="/listeemployes"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100"
                >
                  <Users size={18} />
                  Utilisateurs
                </Link>
              </div>

              <div className="border-t border-gray-100 py-2">
                <button
                  onClick={() => {
                    setOpenLogoutModal(true);
                    setOpenDropdown(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 text-red-600"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* -------- MODAL DE CONFIRMATION -------- */}
      {openLogoutModal && (
        <div className="fixed inset-0 bg-[rgb(30,64,175,0.4)] flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Déconnexion
            </h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                Non
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Oui, se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
