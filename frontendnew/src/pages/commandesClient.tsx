import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, X, PlusCircle, Loader2 } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { AnimatePresence, motion } from "framer-motion";
import { useApiData, useApiMutation } from "../hooks/useApiData";
import { commandeService } from "../services/commandes/commandeService";
import type { Commande, CommandeNote } from "../types/api.types";
import { logger } from "../utils/logger";

// --- Types pour l'affichage ---
interface CommandeDisplay {
  id: string;
  nom: string;
  cloture: string;
  status: string; // Statut d'affichage (frontend)
  statusBackend: Commande["statut"]; // Statut backend
  budget: number;
  notes: CommandeNote[];
  description?: string;
}

// --- Validation Yup ---
const PropositionSchema = Yup.object().shape({
  nom: Yup.string().required("Champ obligatoire"),
  description: Yup.string().required("Champ obligatoire"),
  contact: Yup.string().required("Champ obligatoire"),
  entreprise: Yup.string().required("Champ obligatoire"),
  budget: Yup.number().required("Champ obligatoire"),
  cloture: Yup.date().required("Champ obligatoire"),
});

// --- Mapping des statuts backend → frontend ---
const mapStatusToDisplay = (status: Commande["statut"]): string => {
  const mapping: Record<Commande["statut"], string> = {
    en_attente: "en cours d'étude",
    contrat_accepte: "contrat accepté",
    en_cours_developpement: "en cours de développement",
    livraison: "livraison",
    livree: "livrée",
    annulee: "annulée",
  };
  return mapping[status] || status;
};

// --- Mapping inverse : frontend → backend (pour les filtres) ---
const mapDisplayToBackend = (displayStatus: string): Commande["statut"] | null => {
  const mapping: Record<string, Commande["statut"]> = {
    "en cours d'étude": "en_attente",
    "contrat accepté": "contrat_accepte",
    "en cours de développement": "en_cours_developpement",
    livraison: "livraison",
    livrée: "livree",
    annulée: "annulee",
  };
  return mapping[displayStatus] || null;
};

// --- Mapping des couleurs des statuts ---
const statusColors: Record<string, string> = {
  "en cours d'étude": "bg-yellow-200 text-yellow-800",
  "contrat accepté": "bg-green-200 text-green-800",
  "en cours de développement": "bg-blue-200 text-blue-800",
  livraison: "bg-purple-200 text-purple-800",
  livrée: "bg-green-300 text-green-900",
  annulée: "bg-red-200 text-red-800",
};

// --- Convertir une Commande API en CommandeDisplay ---
const convertCommandeToDisplay = (commande: Commande): CommandeDisplay => {
  return {
    id: commande.id,
    nom: commande.titre,
    cloture: commande.date_livraison || commande.date_modification || commande.date_creation,
    status: mapStatusToDisplay(commande.statut),
    statusBackend: commande.statut,
    budget: commande.cout_final || commande.cout_estime || 0,
    notes: commande.notes || [],
    description: commande.description,
  };
};

export default function PropositionsClient() {
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedCommandeId, setSelectedCommandeId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");

  // Récupérer les commandes depuis l'API
  const {
    data: commandesData,
    loading,
    error,
    refetch,
  } = useApiData(
    () => commandeService.listCommandes({ page: 1, limit: 100 }),
    { errorMessage: "Erreur lors du chargement des commandes" }
  );

  // Hook pour l'ajout de note
  const {
    mutate: addNoteMutation,
    loading: addingNote,
  } = useApiMutation(
    ({ commandeId, contenu }: { commandeId: string; contenu: string }) =>
      commandeService.addNote(commandeId, { contenu, est_publique: true })
  );

  // Convertir les commandes API en commandes d'affichage
  const commandes = useMemo(() => {
    if (!commandesData?.items) return [];
    return commandesData.items.map(convertCommandeToDisplay);
  }, [commandesData]);

  // Récupérer la commande sélectionnée avec ses notes
  const selectedCommande = useMemo(() => {
    if (!selectedCommandeId) return null;
    return commandes.find((c) => c.id === selectedCommandeId) || null;
  }, [selectedCommandeId, commandes]);

  // Filtrer les commandes
  const filteredCommandes = useMemo(() => {
    return commandes.filter((c) => {
      const matchSearch = c.nom.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ? true : c.status === filter;
      return matchSearch && matchFilter;
    });
  }, [commandes, search, filter]);

  // Gérer l'ajout d'une note
  const handleAddNote = async () => {
    if (!selectedCommandeId || !newNote.trim()) return;

    try {
      await addNoteMutation({ commandeId: selectedCommandeId, contenu: newNote });
      setNewNote("");
      await refetch(); // Recharger les commandes pour avoir les nouvelles notes
      logger.info("Note ajoutée avec succès");
    } catch (error) {
      logger.error("Erreur lors de l'ajout de la note", error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-4 lg:mx-auto bg-slate-100 mt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Mes propositions d'opportunités</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 font-semibold px-5 py-3 rounded-lg shadow transition bg-blue-800 text-white hover:bg-blue-700"
        >
          <PlusCircle size={20} />
          Faire une demande
        </button>
      </div>

      {/* Barre de recherche + filtre */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm bg-white">
          <ShoppingCart size={20} />
          <input
            type="text"
            placeholder="Rechercher une proposition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm bg-white">
          <CreditCard size={20} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full outline-none bg-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="en cours d'étude">En cours d'étude</option>
            <option value="contrat accepté">Contrat accepté</option>
            <option value="en cours de développement">En cours de développement</option>
            <option value="livraison">Livraison</option>
            <option value="livrée">Livrée</option>
            <option value="annulée">Annulée</option>
          </select>
        </div>
      </div>

      {/* États de chargement et d'erreur */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
          <span className="ml-2 text-gray-600">Chargement des commandes...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {/* Liste des propositions */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommandes.map((c) => (
              <Card key={c.id} className="shadow-md rounded-2xl hover:shadow-lg transition">
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold text-blue-800 line-clamp-1">{c.nom}</h2>
                  <p className="text-sm mb-1 mt-3">
                    <span className="font-semibold">Statut:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ml-2 ${statusColors[c.status] || "bg-gray-200 text-gray-800"}`}>
                      {c.status}
                    </span>
                  </p>

                  <p className="text-sm mb-1">
                    <span className="font-semibold">Date de clôture :</span>{" "}
                    {new Date(c.cloture).toLocaleDateString("fr-FR")}
                  </p>

                  <p className="text-sm mb-4">
                    <span className="font-semibold">Budget :</span> {c.budget.toFixed(2)} €
                  </p>

                  <Button
                    className="w-full bg-blue-800 text-white rounded-xl py-2 hover:bg-blue-900"
                    onClick={() => setSelectedCommandeId(c.id)}
                  >
                    Voir les détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCommandes.length === 0 && (
            <p className="text-center text-gray-500 mt-10">Aucune proposition trouvée.</p>
          )}
        </>
      )}

      {/* ➤ MODAL : Détails */}
      <AnimatePresence>
        {selectedCommande && (
          <motion.div
            className="fixed inset-0 bg-[rgb(30,64,175,0.3)] bg-opacity-50 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button
                onClick={() => {
                  setSelectedCommandeId(null);
                  setNewNote("");
                }}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-blue-800 mb-4">Détails de la proposition</h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-semibold">{selectedCommande.nom}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{selectedCommande.description || "—"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold">{selectedCommande.budget.toFixed(2)} €</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date de clôture</p>
                  <p>{new Date(selectedCommande.cloture).toLocaleDateString("fr-FR")}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Statut actuel</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[selectedCommande.status] || "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {selectedCommande.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Notes de l'entreprise</p>
                  <div className="bg-gray-100 rounded-md p-3 space-y-2 max-h-40 overflow-auto">
                    {selectedCommande.notes && selectedCommande.notes.length > 0 ? (
                      selectedCommande.notes.map((note) => (
                        <p key={note.id} className="text-gray-700 text-sm border-b pb-1 last:border-none">
                          • {note.contenu}
                          <span className="text-xs text-gray-500 ml-2">
                            ({new Date(note.date_creation).toLocaleDateString("fr-FR")})
                          </span>
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Aucune note disponible</p>
                    )}
                  </div>
                </div>

                {/* Formulaire d'ajout de note */}
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm text-gray-500 mb-2">Ajouter une note</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Écrire une note..."
                      className="flex-1 border rounded-md px-3 py-2 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !addingNote) {
                          handleAddNote();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addingNote}
                      className="bg-blue-800 text-white"
                    >
                      {addingNote ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Ajouter"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setSelectedCommandeId(null);
                    setNewNote("");
                  }}
                  className="px-4 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ➤ MODAL FORMULAIRE DE PROPOSITION */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgb(30,64,175,0.3)] bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="relative bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Nouvelle proposition</h2>

            <Formik
              initialValues={{
                nom: "",
                description: "",
                contact: "",
                entreprise: "",
                budget: "",
                cloture: "",
              }}
              validationSchema={PropositionSchema}
              onSubmit={(values) => {
                console.log("Proposition envoyée :", values);
                setShowModal(false);
              }}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="font-semibold">Nom de la proposition</label>
                    <Field name="nom" className="w-full border rounded-xl px-3 py-2" />
                    {errors.nom && touched.nom && <p className="text-red-600 text-sm">{errors.nom}</p>}
                  </div>

                  <div>
                    <label className="font-semibold">Description</label>
                    <Field as="textarea" name="description" className="w-full border rounded-xl px-3 py-2" rows={3} />
                    {errors.description && touched.description && <p className="text-red-600 text-sm">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="font-semibold">Contact</label>
                    <Field name="contact" className="w-full border rounded-xl px-3 py-2" />
                    {errors.contact && touched.contact && <p className="text-red-600 text-sm">{errors.contact}</p>}
                  </div>

                  <div>
                    <label className="font-semibold">Entreprise affiliée</label>
                    <Field name="entreprise" className="w-full border rounded-xl px-3 py-2" />
                    {errors.entreprise && touched.entreprise && <p className="text-red-600 text-sm">{errors.entreprise}</p>}
                  </div>

                  <div>
                    <label className="font-semibold">Budget</label>
                    <Field type="number" name="budget" className="w-full border rounded-xl px-3 py-2" />
                    {errors.budget && touched.budget && <p className="text-red-600 text-sm">{errors.budget}</p>}
                  </div>

                  <div>
                    <label className="font-semibold">Date de clôture</label>
                    <Field type="date" name="cloture" className="w-full border rounded-xl px-3 py-2" />
                    {errors.cloture && touched.cloture && <p className="text-red-600 text-sm">{errors.cloture}</p>}
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <Button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 text-black">Annuler</Button>
                    <Button type="submit" className="bg-blue-800 text-white">Soumettre</Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
}
