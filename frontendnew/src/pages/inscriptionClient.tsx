/**
 * Page d'inscription client
 * 
 * CORRECTION EFFECTUÉE :
 * Avant : Aucun appel API, juste un console.log() et un alert()
 * Pourquoi c'était mauvais :
 * - Aucune inscription réelle
 * - Pas de création de compte
 * - Pas de gestion d'erreur
 * 
 * Maintenant :
 * - Utilise le service d'authentification
 * - Appel API réel selon le type de client (particulier ou entreprise)
 * - Gestion d'erreur avec messages utilisateur
 * - Redirection vers /dashboardclient après succès
 */

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { handleApiError } from "../utils/errorHandler";

const secteursOptions = [
  "Technologie",
  "Agriculture",
  "Commerce",
  "Finance",
  "Transport & Logistique",
  "Industrie",
  "Éducation",
  "Santé",
];

const taillesEntrepriseOptions = [
  "1 - 10 employés",
  "11 - 50 employés",
  "51 - 200 employés",
  "201 - 500 employés",
  "500+ employés",
];

const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const InscriptionClient = () => {
  const [clientType, setClientType] = useState("particulier");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { registerClientParticulier, registerClientEntreprise } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const initialValues = {
    prenom: "",
    nom: "",
    email: "",
    whatsappPersonnel: "",
    canalContact: "",
    clientType: "particulier",
    nomEntreprise: "",
    secteurActivite: "",
    tailleEntreprise: "",
    poste: "",
    rccmIfu: "",
    adresseProfessionnelle: "",
    whatsappEntreprise: "",
    siteInternet: "",
    linkedin: "",
    password: "",
    confirmPassword: "",
  };

  // Schemas
  const step1Schema = Yup.object({
    prenom: Yup.string().required("Le prénom est obligatoire"),
    nom: Yup.string().required("Le nom est obligatoire"),
    email: Yup.string().email("Email invalide").required("L'email est obligatoire"),
    whatsappPersonnel: Yup.string().required("Le WhatsApp personnel est obligatoire"),
    canalContact: Yup.string().required("Le canal de contact préféré est obligatoire"),
    clientType: Yup.string().required(),
    poste: Yup.string().when("clientType", (value: unknown, schema: Yup.StringSchema) => {
      // value peut être string ou tableau selon l'overload TS
      const clientType = Array.isArray(value) ? value[0] : value;
      return clientType === "entreprise"
        ? schema.required("Le poste est obligatoire")
        : schema.notRequired();
    }),



  });

  const step2EntrepriseSchema = Yup.object({
    nomEntreprise: Yup.string().required("Le nom de l'entreprise est obligatoire"),
    secteurActivite: Yup.string().required("Le secteur d'activité est obligatoire"),
    tailleEntreprise: Yup.string().required("La taille de l'entreprise est obligatoire"),
    rccmIfu: Yup.string().required("Le RCCM/IFU est obligatoire"),
    adresseProfessionnelle: Yup.string().required("L'adresse professionnelle est obligatoire"),
    whatsappEntreprise: Yup.string().required("Le WhatsApp de l'entreprise est obligatoire"),
    siteInternet: Yup.string().url("URL invalide").required("Le site internet est obligatoire"),
    linkedin: Yup.string().url("URL invalide").required("Le LinkedIn est obligatoire"),
  });

  const stepFinalPasswordSchema = Yup.object({
    password: Yup.string().min(6, "Minimum 6 caractères").required("Mot de passe obligatoire"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas")
      .required("Confirmez votre mot de passe"),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    setError(null);
    try {
      if (clientType === "particulier") {
        // Inscription client particulier
        await registerClientParticulier({
          prenom: values.prenom,
          nom: values.nom,
          email: values.email,
          telephone: values.whatsappPersonnel,
          canal_contact: values.canalContact as "email" | "whatsapp" | "sms",
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
      } else {
        // Inscription client entreprise
        await registerClientEntreprise({
          prenom: values.prenom,
          nom: values.nom,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          nom_entreprise: values.nomEntreprise,
          secteur_activite: values.secteurActivite,
          taille_entreprise: values.tailleEntreprise,
          numero_rccm: values.rccmIfu,
          poste_occupe: values.poste,
          adresse_physique: values.adresseProfessionnelle,
          email_professionnel: values.adresseProfessionnelle,
          telephone_entreprise: values.whatsappEntreprise,
          site_internet: values.siteInternet,
          linkedin: values.linkedin,
        });
      }

      // Rediriger vers le dashboard après inscription réussie
      navigate("/dashboardclient", { replace: true });
    } catch (err: any) {
      // Afficher un message d'erreur utilisateur-friendly
      const errorMessage = handleApiError(err, "Une erreur est survenue lors de l'inscription");
      setError(errorMessage);
    }
  };

  const stepsTotal = clientType === "entreprise" ? 3 : 2;
  const progress = (step / stepsTotal) * 100;

  return (
    <div className="pt-24 w-full bg-white">
      <div className="max-w-md mx-auto bg-gray-50 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">
          Inscription Client
        </h1>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={
            step === 1
              ? step1Schema
              : clientType === "entreprise" && step === 2
                ? step2EntrepriseSchema
                : stepFinalPasswordSchema
          }
        >
          {({ values, validateForm, setFieldValue }) => (
            <Form className="space-y-4 overflow-hidden">
              {/* Message d'erreur global */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}
                
              <AnimatePresence mode="wait">
                {/* ÉTAPE 1 */}
                {step === 1 && (
                  
                  <motion.div
                    key="step1"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={stepVariants}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <h1 className="text-black font-semibold text-xl"> <span className="text-blue-700">Etape1:</span> Informations personnelles</h1>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prénom</label>
                      <Field
                        name="prenom"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="prenom" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom</label>
                      <Field
                        name="nom"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="nom" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <Field
                        type="email"
                        name="email"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp Personnel</label>
                      <Field
                        name="whatsappPersonnel"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="whatsappPersonnel" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Canal de contact préféré</label>
                      <Field
                        as="select"
                        name="canalContact"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                      </Field>
                      <ErrorMessage name="canalContact" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type de client</label>
                      <Field
                        as="select"
                        name="clientType"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          setFieldValue("clientType", e.target.value);
                          setClientType(e.target.value);
                        }}
                      >
                        <option value="particulier">Particulier</option>
                        <option value="entreprise">Entreprise</option>
                      </Field>
                    </div>
                    {clientType === "entreprise" &&(
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quel poste occupez vous?</label>
                          <Field name="poste" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <ErrorMessage name="poste" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                      )
                    }
                    
                    <button
                      type="button"
                      className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition mt-6"
                      onClick={() =>
                        validateForm().then((errors) => {
                          if (Object.keys(errors).length === 0) {
                            setStep(clientType === "entreprise" ? 2 : 2);
                          }
                        })
                      }
                    >
                      Suivant
                    </button>
                  </motion.div>
                )}

                {/* ÉTAPE 2 — ENTREPRISE */}
                {step === 2 && clientType === "entreprise" && (
                  <motion.div
                    key="step2"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={stepVariants}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <h1 className="text-black font-semibold text-xl"><span className="text-blue-700">Etape2:</span>Informations de l'entreprise</h1>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                      <Field name="nomEntreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="nomEntreprise" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Secteur d'activité</label>
                      <Field as="select" name="secteurActivite" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Sélectionner --</option>
                        {secteursOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="secteurActivite" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Taille entreprise</label>
                      <Field as="select" name="tailleEntreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Sélectionner --</option>
                        {taillesEntrepriseOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="tailleEntreprise" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">RCCM / IFU</label>
                      <Field name="rccmIfu" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="rccmIfu" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email entreprise</label>
                      <Field name="adresseProfessionnelle" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="adresseProfessionnelle" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp entreprise</label>
                      <Field name="whatsappEntreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="whatsappEntreprise" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Site Internet</label>
                      <Field type="url" name="siteInternet" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="siteInternet" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                      <Field type="url" name="linkedin" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="linkedin" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-md hover:bg-gray-500 transition" onClick={() => setStep(1)}>Précédent</button>
                      <button
                      type="button"
                      className="flex-1 bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-blue-800 transition"
                      onClick={() =>
                        step2EntrepriseSchema.validate(values, { abortEarly: false }).then(() => setStep(3)).catch(() => {})
                      }
                      >
                        Suivant
                      </button>                   
                    </div>
                      
                  </motion.div>
                )}

                {/* ÉTAPE 2 ou 3 — MOT DE PASSE */}
                {step === (clientType === "entreprise" ? 3 : 2) && (
                  <motion.div
                    key="stepFinal"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={stepVariants}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <h1 className="text-black font-semibold text-xl"><span className="text-blue-700"> {clientType === "entreprise" ? "Etape3:" : "Etape2:"} </span>Sécurité du compte</h1>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                      <Field type="password" name="password" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                      <Field type="password" name="confirmPassword" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-md hover:bg-gray-500 transition" onClick={() => {
                        if (clientType === "entreprise") {
                          setStep(2);
                        } else {
                          setStep(1);
                        }
                        }}
                        >Précédent
                      </button>
                      <button
                      type="button"
                      className="flex-1 bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-blue-800 transition"
                      onClick={() =>
                        stepFinalPasswordSchema.validate(values, { abortEarly: false }).then(() => {
                          const form = document.querySelector("form");
                          if (form) {
                            form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                          }
                        }).catch(() => {})
                      }
                      >
                        S'inscrire
                      </button>                    
                    </div>
                    
                  </motion.div>
                )}
              </AnimatePresence>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default InscriptionClient;