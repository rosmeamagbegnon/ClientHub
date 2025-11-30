import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, X, PlusCircle } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { AnimatePresence, motion } from "framer-motion";

// --- Types ---
export interface Proposition {
  id: number;
  nom: string;
  cloture: string;
  status:
    | "en cours d'étude"
    | "contrat accepté"
    | "en cours de développement"
    | "livraison";
  budget: number;
  notes?: string[];
  description?: string;
  contact?: string;
  entreprise?: string;
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

// --- Mapping des couleurs des statuts ---
const statusColors: Record<Proposition["status"], string> = {
  "en cours d'étude": "bg-yellow-200 text-yellow-800",
  "contrat accepté": "bg-green-200 text-green-800",
  "en cours de développement": "bg-blue-200 text-blue-800",
  livraison: "bg-purple-200 text-purple-800",
};

export default function PropositionsClient() {
  const [propositions] = useState<Proposition[]>([
    {
      id: 1,
      nom: "Site vitrine",
      cloture: "2025-11-01",
      status: "en cours d'étude",
      budget: 120.5,
      notes: ["Client intéressé mais attend validation interne."],
      description: "Création d'un site vitrine 5 pages",
      contact: "Alice - 67000000",
      entreprise: "Entreprise A",
    },
    {
      id: 2,
      nom: "Plateforme E-commerce",
      cloture: "2025-11-05",
      status: "contrat accepté",
      budget: 75.0,
      notes: ["Contrat signé. Livraison prévue sous 10 jours."],
      description: "Boutique en ligne avec paiement",
      contact: "Bob - 67111111",
      entreprise: "Entreprise B",
    },
    {
      id: 3,
      nom: "Application mobile",
      cloture: "2025-11-08",
      status: "en cours de développement",
      budget: 200.0,
      notes: ["Phase de développement en cours."],
      description: "App cross-platform pour Android/iOS",
      contact: "Carol - 67222222",
      entreprise: "Entreprise C",
    },
    {
      id: 4,
      nom: "CRM sur mesure",
      cloture: "2025-11-10",
      status: "livraison",
      budget: 150.0,
      notes: ["Projet livré et validé."],
      description: "CRM pour PME, modules ventes et support",
      contact: "Dave - 67333333",
      entreprise: "Entreprise D",
    },
  ]);

  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<Proposition["status"] | "all">("all");
  const [showModal, setShowModal] = useState(false);

  // state pour le modal de détails
  const [selectedProposition, setSelectedProposition] = useState<Proposition | null>(null);

  const filteredPropositions = propositions.filter((p) => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true : p.status === filter;
    return matchSearch && matchFilter;
  });

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
            onChange={(e) => setFilter(e.target.value as Proposition["status"] | "all")}
            className="w-full outline-none bg-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="en cours d'étude">En cours d'étude</option>
            <option value="contrat accepté">Contrat accepté</option>
            <option value="en cours de développement">En cours de développement</option>
            <option value="livraison">Livraison</option>
          </select>
        </div>
      </div>

      {/* Liste des propositions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPropositions.map((p) => (
          <Card key={p.id} className="shadow-md rounded-2xl hover:shadow-lg transition">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold text-blue-800 line-clamp-1">{p.nom}</h2>
              <p className="text-sm mb-1 mt-3">
                <span className="font-semibold">Statut:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[p.status]}`}>{p.status}</span>

              </p>

              <p className="text-sm mb-1">
                <span className="font-semibold">Date de clôture :</span> {p.cloture}
              </p>

              <p className="text-sm mb-4">
                <span className="font-semibold">Budget :</span> {p.budget} €
              </p>

              <Button
                className="w-full bg-blue-800 text-white rounded-xl py-2 hover:bg-blue-900"
                onClick={() => setSelectedProposition(p)}
              >
                Voir les détails
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPropositions.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Aucune proposition trouvée.</p>
      )}

      {/* ➤ MODAL : Détails */}
      <AnimatePresence>
        {selectedProposition && (
          <motion.div
            className="fixed inset-0 bg-[rgb(30,64,175,0.3)] bg-opacity-50 flex justify-center items-center z-50 p-4"
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
              <button
                onClick={() => setSelectedProposition(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-blue-800 mb-4">Détails de la proposition</h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-semibold">{selectedProposition.nom}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{selectedProposition.description || "—"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold">{selectedProposition.budget} €</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date de clôture</p>
                  <p>{selectedProposition.cloture}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Statut actuel</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[selectedProposition.status]
                    }`}
                  >
                    {selectedProposition.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Notes de l'entreprise</p>
                  <div className="bg-gray-100 rounded-md p-3 space-y-2 max-h-40 overflow-auto">
                    {selectedProposition.notes && selectedProposition.notes.length > 0 ? (
                      selectedProposition.notes.map((n, index) => (
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

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedProposition(null)}
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
