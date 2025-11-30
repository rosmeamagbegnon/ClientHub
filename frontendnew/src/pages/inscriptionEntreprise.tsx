import { useState } from "react";
import { Formik, Form, Field } from "formik";
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
    mot_de_passe: "",
    confirm_password: "",
    adresse_professionnelle: "",
  };

  // Schémas de validation
  const validationSchemas = [
    // Step 1
    Yup.object({
      nom_entreprise: Yup.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").required("Le nom de l'entreprise est obligatoire"),
      secteur_activite: Yup.string().required("Le secteur d'activité est obligatoire"),
      taille_entreprise: Yup.string().required("La taille de l'entreprise est obligatoire"),
      numero_rccm_ifu: Yup.string().trim().required("Le RCCM / IFU est obligatoire"),
    }),
    // Step 2
    Yup.object({
      telephone_entreprise: Yup.string().required("Le contact entreprise est obligatoire"),
      whatsapp_entreprise: Yup.string().required("Le WhatsApp entreprise est obligatoire"),
      email_entreprise: Yup.string().email("Email invalide").required("L'email entreprise est obligatoire"),
      site_internet: Yup.string().trim().url("URL invalide").notRequired().nullable().transform(v => (v === "" ? null : v)),
      linkedin: Yup.string().trim().url("URL invalide").notRequired().nullable().transform(v => (v === "" ? null : v)),
    }),
    // Step 3
    Yup.object({
      prenom_responsable: Yup.string().trim().min(2, "Le prénom doit contenir au moins 2 caractères").required("Le prénom du responsable est obligatoire"),
      nom_responsable: Yup.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").required("Le nom du responsable est obligatoire"),
      email_responsable: Yup.string().email("Email invalide").required("L'email responsable est obligatoire"),
    }),
    // Step 4
    Yup.object({
      mot_de_passe: Yup.string().min(6, "Minimum 6 caractères").required("Mot de passe obligatoire"),
      confirm_password: Yup.string().oneOf([Yup.ref("mot_de_passe")], "Les mots de passe ne correspondent pas").required("Confirmez votre mot de passe"),
    }),
  ];

  const handleNextStep = async (formikProps: any) => {
    const schema = validationSchemas[step - 1];
    try {
      const fieldsToValidate = Object.keys(schema.fields);
      const valuesToValidate = fieldsToValidate.reduce((acc, key) => {
        acc[key] = formikProps.values[key];
        return acc;
      }, {} as any);

      await schema.validate(valuesToValidate, { abortEarly: false });
      if (step < validationSchemas.length) {
        setStep(step + 1);
      } else {
        await handleSubmit(formikProps.values);
      }
    } catch (err: any) {
      err.inner.forEach((error: any) => {
        if (error.path) formikProps.setFieldTouched(error.path, true);
      });
    }
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const payload = {
        ...values,
        site_internet: values.site_internet || "",
        linkedin: values.linkedin || "",
      };

      console.log("Envoi vers l'API :", payload);

      const response = await fetch("http://localhost:3000/api/auth/entreprises/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log("Réponse brute :", text);

      if (!response.ok) {
        alert("Erreur API : " + text);
        return;
      }

      const data = JSON.parse(text);
      console.log("Inscription réussie :", data);
      alert("Inscription réussie !");
    } catch (err) {
      console.error("Erreur fetch :", err);
      alert("Une erreur est survenue. Vérifiez les informations.");
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

        <Formik initialValues={initialValues} onSubmit={handleSubmit} validateOnChange validateOnBlur>
          {({ values, errors, touched, setFieldTouched }) => (
            <Form className="space-y-4 overflow-hidden">
              <AnimatePresence mode="wait">

                {/* Step 1 */}
                {step === 1 && (
                  <motion.div key="step1" initial="initial" animate="animate" exit="exit" variants={stepVariants} transition={{ duration: 0.4 }} className="space-y-4">
                    <h2 className="text-black font-semibold text-xl">Informations de l'entreprise</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise *</label>
                      <Field name="nom_entreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.nom_entreprise && errors.nom_entreprise && <div className="text-red-500 text-sm mt-1">{errors.nom_entreprise}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Secteur d'activité *</label>
                      <Field as="select" name="secteur_activite" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Sélectionner --</option>
                        {secteursOptions.map(s => (<option key={s} value={s}>{s}</option>))}
                      </Field>
                      {touched.secteur_activite && errors.secteur_activite && <div className="text-red-500 text-sm mt-1">{errors.secteur_activite}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Taille de l'entreprise *</label>
                      <Field as="select" name="taille_entreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Sélectionner --</option>
                        {taillesEntrepriseOptions.map(t => (<option key={t} value={t}>{t}</option>))}
                      </Field>
                      {touched.taille_entreprise && errors.taille_entreprise && <div className="text-red-500 text-sm mt-1">{errors.taille_entreprise}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">RCCM / IFU *</label>
                      <Field name="numero_rccm_ifu" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.numero_rccm_ifu && errors.numero_rccm_ifu && <div className="text-red-500 text-sm mt-1">{errors.numero_rccm_ifu}</div>}
                    </div>
                    <button type="button" className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-blue-800 transition mt-6" onClick={() => handleNextStep({ values, setFieldTouched })}>Suivant</button>
                  </motion.div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <motion.div key="step2" initial="initial" animate="animate" exit="exit" variants={stepVariants} transition={{ duration: 0.4 }} className="space-y-4">
                    <h2 className="text-black font-semibold text-xl">Contacts de l'entreprise</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact entreprise *</label>
                      <Field name="telephone_entreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.telephone_entreprise && errors.telephone_entreprise && <div className="text-red-500 text-sm mt-1">{errors.telephone_entreprise}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp entreprise *</label>
                      <Field name="whatsapp_entreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.whatsapp_entreprise && errors.whatsapp_entreprise && <div className="text-red-500 text-sm mt-1">{errors.whatsapp_entreprise}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email entreprise *</label>
                      <Field type="email" name="email_entreprise" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.email_entreprise && errors.email_entreprise && <div className="text-red-500 text-sm mt-1">{errors.email_entreprise}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Site Internet</label>
                      <Field type="url" name="site_internet" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.site_internet && errors.site_internet && <div className="text-red-500 text-sm mt-1">{errors.site_internet}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                      <Field type="url" name="linkedin" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.linkedin && errors.linkedin && <div className="text-red-500 text-sm mt-1">{errors.linkedin}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-md hover:bg-gray-500 transition" onClick={() => setStep(1)}>Précédent</button>
                      <button type="button" className="flex-1 bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-blue-800 transition" onClick={() => handleNextStep({ values, setFieldTouched })}>Suivant</button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <motion.div key="step3" initial="initial" animate="animate" exit="exit" variants={stepVariants} transition={{ duration: 0.4 }} className="space-y-4">
                    <h2 className="text-black font-semibold text-xl">Informations du responsable</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prénom *</label>
                      <Field name="prenom_responsable" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.prenom_responsable && errors.prenom_responsable && <div className="text-red-500 text-sm mt-1">{errors.prenom_responsable}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom *</label>
                      <Field name="nom_responsable" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.nom_responsable && errors.nom_responsable && <div className="text-red-500 text-sm mt-1">{errors.nom_responsable}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email professionnel *</label>
                      <Field type="email" name="email_responsable" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.email_responsable && errors.email_responsable && <div className="text-red-500 text-sm mt-1">{errors.email_responsable}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-md hover:bg-gray-500 transition" onClick={() => setStep(2)}>Précédent</button>
                      <button type="button" className="flex-1 bg-blue-700 text-white font-semibold py-2 rounded-md hover:bg-blue-800 transition" onClick={() => handleNextStep({ values, setFieldTouched })}>Suivant</button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <motion.div key="step4" initial="initial" animate="animate" exit="exit" variants={stepVariants} transition={{ duration: 0.4 }} className="space-y-4">
                    <h2 className="text-black font-semibold text-xl">Sécurité du compte</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mot de passe *</label>
                      <Field type="password" name="mot_de_passe" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.mot_de_passe && errors.mot_de_passe && <div className="text-red-500 text-sm mt-1">{errors.mot_de_passe}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe *</label>
                      <Field type="password" name="confirm_password" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {touched.confirm_password && errors.confirm_password && <div className="text-red-500 text-sm mt-1">{errors.confirm_password}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-md hover:bg-gray-500 transition" onClick={() => setStep(3)}>Précédent</button>
                      <button type="button" className="flex-1 bg-blue-800 text-white font-semibold py-2 rounded-md hover:bg-blue-900 transition" onClick={() => handleNextStep({ values, setFieldTouched })}>S'inscrire</button>
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
