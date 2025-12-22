import React, { useState } from "react";
import Logo2 from "./logo2";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar2: React.FC = () => {
  const [open, setOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className="bg-blue-100 py-4 px-4 lg:px-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        
        {/* Logo */}
        <Logo2 />

        {/* Desktop Menu */}
        <ul className="hidden lg:flex gap-6 font-medium text-gray-800">
          <li
            className="cursor-pointer hover:text-blue-700"
            onClick={() => scrollToSection("hero")}
          >
            Accueil
          </li>
          <li
            className="cursor-pointer hover:text-blue-700"
            onClick={() => scrollToSection("features")}
          >
            Fonctionnalités
          </li>
          <li
            className="cursor-pointer hover:text-blue-700"
            onClick={() => scrollToSection("pricing")}
          >
            Tarifs
          </li>
          <li
            className="cursor-pointer hover:text-blue-700"
            onClick={() => scrollToSection("faq")}
          >
            FAQ
          </li>
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/inscriptionentreprise"
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            Commencer gratuitement
          </Link>

          <Link
            to="/connexionentreprise"
            className="bg-blue-800 text-white px-4 py-2 rounded"
          >
            Se connecter
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden mt-4 bg-white shadow rounded-xl p-4 flex flex-col gap-4">
          <li
            className="cursor-pointer hover:text-blue-800"
            onClick={() => scrollToSection("hero")}
          >
            Accueil
          </li>
          <li
            className="list-none cursor-pointer"
            onClick={() => scrollToSection("features")}
          >
            Fonctionnalités
          </li>
          <li
            className="list-none cursor-pointer"
            onClick={() => scrollToSection("pricing")}
          >
            Tarifs
          </li>
          <li
            className="list-none cursor-pointer"
            onClick={() => scrollToSection("faq")}
          >
            FAQ
          </li>

          <Link
            to="/inscriptionentreprise"
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            Commencer gratuitement
          </Link>

          <Link
            to="/connexionentreprise"
            className="bg-blue-800 text-white px-4 py-2 rounded"
          >
            Se connecter
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar2;
