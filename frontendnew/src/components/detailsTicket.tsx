
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TicketStatusColor from "../config/ticketStatusColor";

interface DetailsTicketProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    id: string;
    titre: string;
    description: string;
    type: string;
    statut: string;
    notes: string[];
    dateCreation: string;
  } | null;
}

function DetailsTicket({ isOpen, onClose, ticket }: DetailsTicketProps) {
  return (
    <AnimatePresence>
      {isOpen && ticket && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {/* Button Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-blue-800 mb-4">Détails de la Demande</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Titre</p>
                <p className="font-semibold">{ticket.titre}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700">{ticket.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="capitalize">{ticket.type}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Statut actuel</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    TicketStatusColor[ticket.statut] || "bg-gray-200 text-gray-800"
                  }`}
                >
                  {ticket.statut}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date de création</p>
                <p>{ticket.dateCreation}</p>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm text-gray-500">Notes de l'entreprise</p>
                <div className="bg-gray-100 rounded-md p-3 space-y-2 max-h-40 overflow-auto">
                  {ticket.notes.length > 0 ? (
                    ticket.notes.map((n, index) => (
                      <p key={index} className="text-gray-700 text-sm border-b pb-1 last:border-none">
                        • {n}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Aucune note disponible</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default DetailsTicket;