import React from "react";
import Logo from "./logo";
import { Link } from "react-router-dom";
import { FilePlus } from "lucide-react";
import { HelpCircle } from "lucide-react";
const Navbar2: React.FC = () => {
  return (
    <div className="flex justify-center lg:justify-between bg-blue-100 py-4 px-2 lg:px-16 fixed top-0 left-0 right-0">
      <Logo/>
      <div className="hidden lg:flex flex-wrap justify-center items-center gap-4 lg:gap-8 text-white font-semibold">
            <button className="bg-blue-800  px-4 py-2 rounded  flex items-center space-x-2">
                <FilePlus size={20}/>
                <Link to="/">Faire une demande</Link>
            </button>
            <button className="bg-blue-800  px-4 py-2 rounded  flex items-center space-x-2">
                <HelpCircle size={20}/>
                <Link to="/">Poser une question</Link>
            </button>
        </div>
    </div>
  );
};  
export default Navbar2;
