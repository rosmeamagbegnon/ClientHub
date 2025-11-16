import React from "react";
import Logo from "./logo";
import { Link } from "react-router-dom";
const Navbar2: React.FC = () => {
  return (
    <div className="flex justify-center lg:justify-between bg-blue-100 py-4 px-2 lg:px-16 fixed top-0 left-0 right-0">
      <Logo/>
      <div className="hidden lg:flex flex-wrap justify-center items-center gap-4 lg:gap-8 text-white font-semibold">
            <button className="bg-gray-800 px-4 py-2 rounded  text-center">
                <Link to="/inscriptionclient">S'inscrire</Link>
            </button>
            <button className="bg-blue-800  px-4 py-2 rounded  flex items-center space-x-2">
                <Link to="/connexionclient">Se Connecter</Link>
            </button>
        </div>
    </div>
  );
};  
export default Navbar2;
