import {Link} from "react-router-dom";
import Logo from "./logo";

const NavbarP: React.FC = () => {
  return (
    <nav className="bg-blue-100 py-4 px-4 lg:px-16 fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
      <Logo/>
      <div>
        <Link
          to="/inscriptionclient"
          className="bg-gray-800 text-white px-4 py-2 rounded mr-4"
        >
          S'inscrire
        </Link>
        <Link
          to="/connexionclient"
          className="bg-blue-800 text-white px-4 py-2 rounded"
        >
          Se connecter
        </Link>
      </div>
    </div>
    </nav>
    
  );
};  
export default NavbarP;
