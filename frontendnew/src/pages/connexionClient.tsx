/**
 * Page de connexion client
 * 
 * CORRECTION EFFECTUÉE :
 * Avant : Le formulaire ne faisait qu'un console.log() et un setTimeout()
 * Pourquoi c'était mauvais :
 * - Aucun appel API réel
 * - Pas de connexion fonctionnelle
 * - Pas de gestion d'erreur
 * - Pas de redirection après connexion
 * 
 * Maintenant :
 * - Utilise le service d'authentification
 * - Appel API réel vers /api/auth/clients/login
 * - Gestion d'erreur avec messages utilisateur
 * - Redirection vers /dashboardclient après succès
 * - Sauvegarde automatique du token
 */

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { handleApiError } from "../utils/errorHandler";

type FormValues = {
    email: string;
    password: string;
};

const validationSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email("Adresse email invalide")
        .required("L'email est requis"),
    password: Yup.string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères")
        .required("Le mot de passe est requis"),
});

export default function ConnexionClient(): JSX.Element {
    const initialValues: FormValues = { email: "", password: "" };
    const navigate = useNavigate();
    const { loginClient } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: FormValues) => {
        setError(null);
        setIsSubmitting(true);

        try {
            // Utiliser le service d'authentification du contexte
            await loginClient(values.email, values.password);
            
            // Rediriger vers le dashboard client après connexion réussie
            navigate("/dashboardclient", { replace: true });
        } catch (err: any) {
            // Afficher un message d'erreur utilisateur-friendly
            const errorMessage = handleApiError(err, "Email ou mot de passe incorrect");
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-32 w-full bg-white">
            <div className="max-w-md mx-auto bg-gray-50 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">Connexion client</h2>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ touched, errors }) => (
                        <Form noValidate className="space-y-4">
                            {/* Message d'erreur global */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email professionnel ou entreprise
                                </label>
                                <Field
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="adresse@exemple.com"
                                    aria-invalid={Boolean(touched.email && errors.email)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage name="email">
                                    {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Mot de passe
                                </label>
                                <Field
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Votre mot de passe"
                                    aria-invalid={Boolean(touched.password && errors.password)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage name="password">
                                    {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-800 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Connexion en cours...
                                    </span>
                                ) : (
                                    "Se connecter"
                                )}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
