/**
 * Page d'inscription entreprise CRM
 * 
 * CORRECTION EFFECTUÉE :
 * Avant : Appel fetch() direct avec URL hardcodée, pas de gestion du token
 * Maintenant : Utilise le service d'authentification centralisé
 */

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import type { FormikProps } from "formik";
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

const InscriptionEntreprise = () => {
  const [step, setStep] = useState(1);

  const initialValues = {
    nom_entreprise: "",
    secteur_activite: "",
    taille_entreprise: "",
    numero_rccm_ifu: "",
    telephone_entreprise: "",
    whatsapp_entreprise: "",
    email_entreprise: "",
    site_internet: "",
    linkedin: "",
    prenom_responsable: "",
    nom_responsable: "",
    email_responsable: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchemas = [
    Yup.object({
      nom_entreprise: Yup.string().trim().min(2).required(),
      secteur_activite: Yup.string().required(),
      taille_entreprise: Yup.string().required(),
      numero_rccm_ifu: Yup.string().trim().required(),
    }),

    Yup.object({
      telephone_entreprise: Yup.string()
  .matches(/^\+229\d{8}$/, "Format attendu : +229XXXXXXXX")
  .required("Le contact entreprise est obligatoire"),
      whatsapp_entreprise: Yup.string()
  .matches(/^\+229\d{8}$/, "Format attendu : +229XXXXXXXX")
  .required("Le whatsapp de l'entreprise est obligatoire"),
      email_entreprise: Yup.string().email("Email invalide").required("L'email entreprise est obligatoire"),

      site_internet: Yup.string()
        .transform(v => (v?.trim() === "" ? undefined : v))
        .notRequired()
        .test(
          "is-valid-url",
          "URL invalide (ex: exemple.com)",
          value => !value || /^https?:\/\/.+\..+/.test(value)
        ),

      linkedin: Yup.string()
        .transform(v => (v?.trim() === "" ? undefined : v))
        .notRequired()
        .test(
          "is-valid-url",
          "URL invalide (ex: linkedin.com/...)",
          value => !value || /^https?:\/\/.+\..+/.test(value)
        ),
    }),

    Yup.object({
      prenom_responsable: Yup.string().trim().min(2).required(),
      nom_responsable: Yup.string().trim().min(2).required(),
      email_responsable: Yup.string().email().required(),
    }),

    Yup.object({
      mot_de_passe: Yup.string()
      .min(8, "Minimum 8 caractères")
      .matches(/[A-Z]/, "Au moins une majuscule")
      .matches(/[0-9]/, "Au moins un chiffre")
      .matches(/[^A-Za-z0-9]/, "Au moins un symbole")
      .required("Mot de passe obligatoire"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("mot_de_passe")])
        .required(),
    }),
  ];

  const handleNextStep = async (
    formikProps: FormikProps<typeof initialValues>
  ) => {
    const schema = validationSchemas[step - 1];

    try {
      await schema.validate(formikProps.values, {
        abortEarly: false,
        stripUnknown: true,
      });

      formikProps.setErrors({});

      if (step < validationSchemas.length) {
        setStep(prev => prev + 1);
      } else {
        await handleSubmit(formikProps.values);
      }
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach(error => {
          if (error.path) {
            formikProps.setFieldTouched(error.path, true, false);
          }
        });
      }
    }
  };
  
  /**
   * CORRECTION EFFECTUÉE :
   * Avant : Appel fetch() direct avec URL hardcodée, pas de gestion du token, gestion d'erreur basique
   * Pourquoi c'était mauvais :
   * - URL hardcodée (ne fonctionne pas en production)
   * - Pas de sauvegarde du token après inscription
   * - Gestion d'erreur avec alert() (mauvaise UX)
   * - Pas de redirection automatique vers le dashboard
   * 
   * Maintenant :
   * - Utilise le service d'authentification du contexte
   * - Sauvegarde automatiquement le token
   * - Gestion d'erreur avec messages utilisateur
   * - Redirection vers /dashboardentreprise après succès
   */
  const navigate = useNavigate();
  const { registerEntreprise } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: typeof initialValues) => {
    setError(null);
    try {
      // Utiliser le service d'authentification du contexte
      // Le service gère automatiquement la transformation des données
      await registerEntreprise({
        nom_entreprise: values.nom_entreprise,
        secteur_activite: values.secteur_activite,
        taille_entreprise: values.taille_entreprise,
        numero_rccm_ifu: values.numero_rccm_ifu,
        email_entreprise: values.email_entreprise,
        telephone_entreprise: values.telephone_entreprise,
        whatsapp_entreprise: values.whatsapp_entreprise,
        adresse_professionnelle: values.adresse_professionnelle || "",
        site_internet: values.site_internet || "",
        linkedin: values.linkedin || "",
        prenom_responsable: values.prenom_responsable,
        nom_responsable: values.nom_responsable,
        email_responsable: values.email_responsable,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      // Rediriger vers le dashboard après inscription réussie
      navigate("/dashboardentreprise", { replace: true });
    } catch (err: any) {
      // Afficher un message d'erreur utilisateur-friendly
      const errorMessage = handleApiError(err, "Une erreur est survenue lors de l'inscription");
      setError(errorMessage);
    }
  };

  
  const progress = (step / validationSchemas.length) * 100;

  return (
    <div className="pt-24 md:py-32 w-full bg-slate-50">
      <div className="max-w-md md:mx-auto bg-gray-50 rounded-lg shadow-lg p-8 mx-4">
        <h1 className="text-2xl font-bold mb-6 text-blue-800 text-center">Inscription Entreprise</h1>

        <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>

        <Formik 
          initialValues={initialValues} 
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await handleSubmit(values);
            } finally {
              setSubmitting(false);
            }
          }} 
          validateOnChange 
          validateOnBlur
        >
          {(formikProps) => (
            <Form className="space-y-4 overflow-hidden">
              {/* Message d'erreur global */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">

                {/* Step 1 */}
                {step === 1 && (
                  <motion.div key="step1" initial="initial" animate="animate" exit="exit" variants={stepVariants} transition={{ duration: 0.4 }} className="space-y-4">
                    <h2 className="text-black font-semibold text-xl"><span className="text-blue-700">Etape1:</span>Informations de l'entreprise</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise *</label>
                      <Field name="nom_entreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.nom_entreprise && formikProps.errors.nom_entreprise && <div className="text-red-500 text-sm mt-1">{formikProps.errors.nom_entreprise}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Secteur d'activité *</label>
                      <Field as="select" name="secteur_activite" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Sélectionner --</option>
                        {secteursOptions.map(s => (<option key={s} value={s}>{s}</option>))}
                      </Field>
                      {formikProps.touched.secteur_activite && formikProps.errors.secteur_activite && <div className="text-red-500 text-sm mt-1">{formikProps.errors.secteur_activite}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Taille de l'entreprise *</label>
                      <Field as="select" name="taille_entreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Sélectionner --</option>
                        {taillesEntrepriseOptions.map(t => (<option key={t} value={t}>{t}</option>))}
                      </Field>
                      {formikProps.touched.taille_entreprise && formikProps.errors.taille_entreprise && <div className="text-red-500 text-sm mt-1">{formikProps.errors.taille_entreprise}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">RCCM / IFU *</label>
                      <Field name="numero_rccm_ifu" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.numero_rccm_ifu && formikProps.errors.numero_rccm_ifu && <div className="text-red-500 text-sm mt-1">{formikProps.errors.numero_rccm_ifu}</div>}
                    </div>
                    <button type="button" className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-blue-800 transition mt-6" onClick={() => handleNextStep(formikProps)}>Suivant</button>
                  </motion.div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <motion.div key="step2" initial="initial" animate="animate" exit="exit" variants={stepVariants} transition={{ duration: 0.4 }} className="space-y-4">
                    <h2 className="text-black font-semibold text-xl"><span className="text-blue-700">Etape2:</span>Contacts de l'entreprise</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact entreprise *</label>
                      <Field name="telephone_entreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.telephone_entreprise && formikProps.errors.telephone_entreprise && <div className="text-red-500 text-sm mt-1">{formikProps.errors.telephone_entreprise}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp entreprise *</label>
                      <Field name="whatsapp_entreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.whatsapp_entreprise && formikProps.errors.whatsapp_entreprise && <div className="text-red-500 text-sm mt-1">{formikProps.errors.whatsapp_entreprise}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email entreprise *</label>
                      <Field type="email" name="email_entreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.email_entreprise && formikProps.errors.email_entreprise && <div className="text-red-500 text-sm mt-1">{formikProps.errors.email_entreprise}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Site Internet</label>
                      <Field type="url" name="site_internet" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.site_internet && formikProps.errors.site_internet && <div className="text-red-500 text-sm mt-1">{formikProps.errors.site_internet}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                      <Field type="url" name="linkedin" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.linkedin && formikProps.errors.linkedin && <div className="text-red-500 text-sm mt-1">{formikProps.errors.linkedin}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-md hover:bg-gray-500 transition" onClick={() => setStep(1)}>Précédent</button>
                      <button type="button" className="flex-1 bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-blue-800 transition" onClick={() => handleNextStep(formikProps)}>Suivant</button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <motion.div key="step3" initial="initial" animate="animate" exit="exit" variants={stepVariants} transition={{ duration: 0.4 }} className="space-y-4">
                    <h2 className="text-black font-semibold text-xl"><span className="text-blue-700">Etape3:</span>Informations du responsable</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prénom *</label>
                      <Field name="prenom_responsable" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.prenom_responsable && formikProps.errors.prenom_responsable && <div className="text-red-500 text-sm mt-1">{formikProps.errors.prenom_responsable}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom *</label>
                      <Field name="nom_responsable" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.nom_responsable && formikProps.errors.nom_responsable && <div className="text-red-500 text-sm mt-1">{formikProps.errors.nom_responsable}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email professionnel *</label>
                      <Field type="email" name="email_responsable" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.email_responsable && formikProps.errors.email_responsable && <div className="text-red-500 text-sm mt-1">{formikProps.errors.email_responsable}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-md hover:bg-gray-500 transition" onClick={() => setStep(2)}>Précédent</button>
                      <button type="button" className="flex-1 bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-blue-800 transition" onClick={() => handleNextStep(formikProps)}>Suivant</button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <motion.div key="step4" initial="initial" animate="animate" exit="exit" variants={stepVariants} transition={{ duration: 0.4 }} className="space-y-4">
                    <h2 className="text-black font-semibold text-xl"><span className="text-blue-700">Etape4:</span>Sécurité du compte</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mot de passe *</label>
                      <Field type="password" name="password" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.password && formikProps.errors.password && <div className="text-red-500 text-sm mt-1">{formikProps.errors.password}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe *</label>
                      <Field type="password" name="confirmPassword" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {formikProps.touched.confirmPassword && formikProps.errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{formikProps.errors.confirmPassword}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-md hover:bg-gray-500 transition" onClick={() => setStep(3)}>Précédent</button>
                      <button type="submit" className="flex-1 bg-blue-800 text-white font-semibold py-2 rounded-md hover:bg-blue-900 transition" onClick={() => handleSubmit(formikProps.values)}>
                        {formikProps.isSubmitting ? 'Inscription en cours ...' : 'S\'inscrire'}
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

export default InscriptionEntreprise;
