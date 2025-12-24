/**
 * Composant de sélection du type d'utilisateur
 * 
 * Permet à l'utilisateur de choisir s'il est :
 * - Une entreprise CRM (qui utilise la plateforme pour gérer ses clients)
 * - Un client (particulier ou entreprise client)
 */

import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, User, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function UserTypeSelector() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = (searchParams.get("action") || "register") as "register" | "login";

  const handleSelect = (userType: "entreprise" | "client") => {
    if (action === "register") {
      if (userType === "entreprise") {
        navigate("/inscriptionentreprise");
      } else {
        navigate("/inscriptionclient");
      }
    } else {
      // action === "login"
      if (userType === "entreprise") {
        navigate("/connexionentreprise");
      } else {
        navigate("/connexionclient");
      }
    }
  };

  const actionText = action === "register" ? "inscrire" : "connecter";
  const actionTitle = action === "register" ? "Inscription" : "Connexion";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour à l'accueil</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {actionTitle}
          </h1>
          <p className="text-gray-600 text-lg">
            Choisissez votre profil pour vous {actionText}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Entreprise CRM Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all"
            onClick={() => handleSelect("entreprise")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4">
                <Building2 className="h-12 w-12 text-blue-800" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Entreprise CRM
              </h2>
              <p className="text-gray-600 mb-6">
                Vous êtes une entreprise qui souhaite utiliser ClientHub pour
                gérer vos clients, tickets et opportunités commerciales.
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Gestion de votre base clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Suivi des tickets et demandes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Tableaux de bord et reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Portail client pour vos clients</span>
                </li>
              </ul>
              <button className="w-full bg-blue-800 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors">
                {action === "register" ? "S'inscrire" : "Se connecter"} en tant qu'entreprise
              </button>
            </div>
          </motion.div>

          {/* Client Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer border-2 border-transparent hover:border-green-500 transition-all"
            onClick={() => handleSelect("client")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <User className="h-12 w-12 text-green-800" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Client
              </h2>
              <p className="text-gray-600 mb-6">
                Vous êtes un client (particulier ou entreprise) qui souhaite
                accéder au portail client pour suivre vos tickets et opportunités.
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Suivi de vos tickets en temps réel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Consultation de vos commandes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Accès aux opportunités commerciales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Gestion de vos bonus et récompenses</span>
                </li>
              </ul>
              <button className="w-full bg-green-800 text-white py-3 rounded-lg font-semibold hover:bg-green-900 transition-colors">
                {action === "register" ? "S'inscrire" : "Se connecter"} en tant que client
              </button>
            </div>
          </motion.div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Vous n'êtes pas sûr ?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Retournez à l'accueil
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

