import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../components/logo";

const NavbarClient = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // détecte la route active

  const navLinks = [
    { path: "/dashboardclient", label: "Accueil" },
    { path: "/ticketsclient", label: "Mes Demandes" },
    { path: "/commandesclient", label: "Mes Propositions" },
    { path: "/bonusclient", label: "Mes Bonus" },
  ];

  // fonction pour déterminer le style d'un lien
  const linkClass = (path: string) =>
    path === location.pathname
      ? "text-blue-800 font-bold"
      : "text-black font-semibold";

  return (
    <nav className="bg-blue-100 text-black shadow-md items-center">
      <div className="max-w-7xl mx-auto px-6  xl:px-0 items-center">
        <div className="flex justify-between h-16 items-center">
          <Logo />

          {/* Menu desktop */}
          <div className="hidden lg:flex space-x-8">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={linkClass(link.path)}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Menu mobile button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <div className="hidden lg:block">
            <Link
              to="/profilclient"
              className="bg-blue-800 text-white px-4 py-2 rounded font-semibold"
            >
              Profil
            </Link>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
      <div className="lg:hidden bg-blue-100 px-2 pt-2 pb-4 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block px-3 py-2 rounded ${linkClass(link.path)}`}
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        {/* Ajout du bouton Profil dans le menu mobile */}
        <Link
          to="/profilclient"
          className="block bg-blue-800 text-white px-3 py-2 rounded  font-semibold text-center"
          onClick={() => setIsOpen(false)}
        >
          Profil
        </Link>
      </div>
    )}

    </nav>
  );
};

export default NavbarClient;
