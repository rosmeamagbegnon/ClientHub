import { useState } from "react";
import AjoutTicket from "../components/ajoutTicket";
import { PlusCircle } from "lucide-react";

// 1️⃣ Définir les props
interface ButtonTicketProps {
  bgColor?: string;     // couleur de fond
  textColor?: string;   // couleur du texte
  hoverBgColor?: string; // couleur de fond au survol
}

const ButtonTicket: React.FC<ButtonTicketProps> = ({
  bgColor = "bg-white",       // valeurs par défaut
  textColor = "text-blue-800",
  hoverBgColor = "hover:bg-gray-100",
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-2 ${bgColor} ${textColor} font-semibold px-5 py-3 rounded-lg shadow ${hoverBgColor} transition`}
      >
        <PlusCircle size={20} />
        Faire une demande
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full shadow-lg relative">
            {/* Bouton fermer */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl md:text-2xl font-bold"
            >
              ×
            </button>

            {/* Composant AjoutTicket */}
            <AjoutTicket />
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonTicket;
