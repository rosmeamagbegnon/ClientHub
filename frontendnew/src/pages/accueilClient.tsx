
import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";
const AccueilClient  = () => {
  return (
    <div className="bg-white mx-auto flex flex-col items-center text-center h-screen justify-center px-4 lg:px-0 space-y-2 lg:space-y-4 xl:space-y-6">
      <h1 className="text-3xl lg:text-4xl font-bold text-black">Bienvenue sur <span className="text-blue-800">ClientHub</span> </h1>
      <p className="max-w-xl xl:max-w-2xl mx-auto text-lg lg:text-xl ">ClientHub est la plateforme qui reçoit vos commandes, recommandations ou critiques sur notre service, des demandes de réclamation et répond à vos préoccupations concernant nos services.</p>
      <button className="bg-blue-800  px-4 py-2 rounded text-white font-semibold text-lg flex items-center space-x-2">
        <Rocket size={20}/>
        <Link to="/inscriptionclient">Commencer maintenant</Link>
      </button>
    </div>
  );
};  
export default AccueilClient;
