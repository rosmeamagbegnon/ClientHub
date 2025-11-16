
import { Link } from "react-router-dom";
import { FilePlus } from "lucide-react";
import { HelpCircle } from "lucide-react";
const AccueilClient  = () => {
  return (
    <div className="bg-white mx-auto flex flex-col items-center text-center h-screen justify-center px-4 lg:px-0 space-y-2 lg:space-y-4 xl:space-y-6">
      <h1 className="text-3xl lg:text-4xl font-bold text-black">Bienvenue sur <span className="text-blue-800">TicketsMaster</span> </h1>
      <p className="max-w-xl xl:max-w-2xl mx-auto text-lg lg:text-xl ">TicketsMaster est la plateforme qui reçoit vos commandes, recommandations ou critiques sur notre service, des demandes de réclamation et répond à vos préoccupations concernant nos services.</p>
      <div className="flex flex-wrap justify-center items-center mx-auto gap-4 lg:gap-8 text-white font-semibold">
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
export default AccueilClient;
