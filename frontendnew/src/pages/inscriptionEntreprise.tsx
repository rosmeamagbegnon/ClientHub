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

const InscriptionEntreprise = () => {
  const [step, setStep] = useState(1);

  const initialValues = {
    // Étape 1 : infos entreprise
    nomEntreprise: "",
    secteurActivite: "",
    tailleEntreprise: "",
    rccmIfu: "",
    // Étape 2 : contacts entreprise
    contactEntreprise: "",
    whatsappEntreprise: "",
    emailEntreprise: "",
    siteInternet: "",
    linkedin: "",
    // Étape 3 : responsable
    prenom: "",
    nom: "",
    emailResponsable: "",
    // Étape 4 : sécurité
    password: "",
    confirmPassword: "",
  };

  // Validation schemas pour chaque étape
  const step1Schema = Yup.object({
    nomEntreprise: Yup.string().required("Le nom de l'entreprise est obligatoire"),
    secteurActivite: Yup.string().required("Le secteur d'activité est obligatoire"),
    tailleEntreprise: Yup.string().required("La taille de l'entreprise est obligatoire"),
    rccmIfu: Yup.string().required("Le RCCM / IFU est obligatoire"),
  });

  const step2Schema = Yup.object({
    contactEntreprise: Yup.string().required("Le contact entreprise est obligatoire"),
    whatsappEntreprise: Yup.string().required("Le WhatsApp entreprise est obligatoire"),
    emailEntreprise: Yup.string().email("Email invalide").required("L'email entreprise est obligatoire"),
    siteInternet: Yup.string().url("URL invalide").optional(),
    linkedin: Yup.string().url("Lien LinkedIn invalide").optional(),
  });

  const step3Schema = Yup.object({
    prenom: Yup.string().required("Le prénom du responsable est obligatoire"),
    nom: Yup.string().required("Le nom du responsable est obligatoire"),
    emailResponsable: Yup.string().email("Email invalide").required("L'email responsable est obligatoire"),
  });

  const step4Schema = Yup.object({
    password: Yup.string().min(6, "Minimum 6 caractères").required("Mot de passe obligatoire"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas")
      .required("Confirmez votre mot de passe"),
  });

  const handleSubmit = (values) => {
    console.log("Formulaire soumis :", values);
    alert("Inscription réussie !");
  };

  const progress = (step / 4) * 100;

  return (
    <div className="pt-24 md:pt-32 w-full bg-slate-50">
      <div className="max-w-md md:mx-auto bg-gray-50 rounded-lg shadow-lg p-8 mx-4">
        <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">Inscription Entreprise</h1>

        <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, validateForm }) => (
            <Form className="space-y-4 overflow-hidden">
              <AnimatePresence mode="wait">
                {/* Étape 1 : Informations de l'entreprise */}
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
                    <h2 className="text-black font-semibold text-xl">Informations de l'entreprise</h2>

                    <div>
                      <label className="block text-sm font-medium">Nom de l'entreprise</label>
                      <Field name="nomEntreprise" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="nomEntreprise" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Secteur d'activité</label>
                      <Field as="select" name="secteurActivite" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Sélectionner --</option>
                        {secteursOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Field>
                      <ErrorMessage name="secteurActivite" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Taille de l'entreprise</label>
                      <Field as="select" name="tailleEntreprise" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Sélectionner --</option>
                        {taillesEntrepriseOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                      </Field>
                      <ErrorMessage name="tailleEntreprise" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">RCCM / IFU</label>
                      <Field name="rccmIfu" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="rccmIfu" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <button
                      type="button"
                      className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md mt-6"
                      onClick={() => step1Schema.validate(values, { abortEarly: false }).then(() => setStep(2)).catch(() => {})}
                    >
                      Suivant
                    </button>
                  </motion.div>
                )}

                {/* Étape 2 : Contacts de l'entreprise */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={stepVariants}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <h2 className="text-black font-semibold text-xl">Contacts de l'entreprise</h2>

                    <div>
                      <label className="block text-sm font-medium">Contact entreprise</label>
                      <Field name="contactEntreprise" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="contactEntreprise" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">WhatsApp entreprise</label>
                      <Field name="whatsappEntreprise" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="whatsappEntreprise" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Email entreprise</label>
                      <Field type="email" name="emailEntreprise" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="emailEntreprise" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Site Internet</label>
                      <Field type="url" name="siteInternet" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="siteInternet" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">LinkedIn</label>
                      <Field type="url" name="linkedin" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="linkedin" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <button
                      type="button"
                      className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md mt-6"
                      onClick={() => step2Schema.validate(values, { abortEarly: false }).then(() => setStep(3)).catch(() => {})}
                    >
                      Suivant
                    </button>
                  </motion.div>
                )}

                {/* Étape 3 : Informations du responsable */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={stepVariants}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <h2 className="text-black font-semibold text-xl">Informations du responsable</h2>

                    <div>
                      <label className="block text-sm font-medium">Prénom</label>
                      <Field name="prenom" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="prenom" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Nom</label>
                      <Field name="nom" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="nom" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Email professionnel</label>
                      <Field type="email" name="emailResponsable" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="emailResponsable" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <button
                      type="button"
                      className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md mt-6"
                      onClick={() => step3Schema.validate(values, { abortEarly: false }).then(() => setStep(4)).catch(() => {})}
                    >
                      Suivant
                    </button>
                  </motion.div>
                )}

                {/* Étape 4 : Sécurité */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={stepVariants}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <h2 className="text-black font-semibold text-xl">Sécurité du compte</h2>

                    <div>
                      <label className="block text-sm font-medium">Mot de passe</label>
                      <Field type="password" name="password" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Confirmer le mot de passe</label>
                      <Field type="password" name="confirmPassword" className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                      <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-800 text-white font-semibold py-2 rounded-md mt-6"
                    >
                      S'inscrire en tant que entreprise
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

export default InscriptionEntreprise;
