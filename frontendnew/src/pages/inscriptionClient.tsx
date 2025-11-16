import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";

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
    contactEntreprise: "",
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
  });

  const step2EntrepriseSchema = Yup.object({
    nomEntreprise: Yup.string().required("Le nom de l'entreprise est obligatoire"),
    secteurActivite: Yup.string().required("Le secteur d'activité est obligatoire"),
    tailleEntreprise: Yup.string().required("La taille de l'entreprise est obligatoire"),
    poste: Yup.string().required("Le poste est obligatoire"),
    rccmIfu: Yup.string().required("Le RCCM/IFU est obligatoire"),
    adresseProfessionnelle: Yup.string().required("L'adresse professionnelle est obligatoire"),
    whatsappEntreprise: Yup.string().required("Le WhatsApp de l'entreprise est obligatoire"),
    contactEntreprise: Yup.string().required("Le contact entreprise est obligatoire"),
    siteInternet: Yup.string().url("URL invalide").required("Le site internet est obligatoire"),
    linkedin: Yup.string().url("URL invalide").required("Le LinkedIn est obligatoire"),
  });

  const stepFinalPasswordSchema = Yup.object({
    password: Yup.string().min(6, "Minimum 6 caractères").required("Mot de passe obligatoire"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas")
      .required("Confirmez votre mot de passe"),
  });

  const handleSubmit = (values) => {
    console.log("Formulaire soumis :", values);
    alert("Inscription réussie !");
  };

  const stepsTotal = clientType === "entreprise" ? 3 : 2;
  const progress = (step / stepsTotal) * 100;

  return (
    <div className="pt-32 w-full bg-white">
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

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, validateForm, setFieldValue }) => (
            <Form className="space-y-4 overflow-hidden">
                
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
                    <h1 className="text-black font-semibold text-xl">Informations personnelles</h1>
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
                        onChange={(e) => {
                          setFieldValue("clientType", e.target.value);
                          setClientType(e.target.value);
                        }}
                      >
                        <option value="particulier">Particulier</option>
                        <option value="entreprise">Entreprise</option>
                      </Field>
                    </div>

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
                    <h1 className="text-black font-semibold text-xl">Informations de l'entreprise</h1>
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
                      <label className="block text-sm font-medium text-gray-700">Poste</label>
                      <Field name="poste" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="poste" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">RCCM / IFU</label>
                      <Field name="rccmIfu" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="rccmIfu" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Adresse professionnelle</label>
                      <Field name="adresseProfessionnelle" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="adresseProfessionnelle" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp entreprise</label>
                      <Field name="whatsappEntreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="whatsappEntreprise" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact entreprise</label>
                      <Field name="contactEntreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="contactEntreprise" component="div" className="text-red-500 text-sm mt-1" />
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

                    <button
                      type="button"
                      className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition mt-6"
                      onClick={() =>
                        step2EntrepriseSchema.validate(values, { abortEarly: false }).then(() => setStep(3)).catch(() => {})
                      }
                    >
                      Suivant
                    </button>
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
                    <h1 className="text-black font-semibold text-xl">Sécurité du compte</h1>
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

                    <button
                      type="button"
                      className="w-full bg-blue-800 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition mt-6"
                      onClick={() =>
                        stepFinalPasswordSchema.validate(values, { abortEarly: false }).then(() => {
                          document.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                        }).catch(() => {})
                      }
                    >
                      S'inscrire
                    </button>
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
