import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

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

    const handleSubmit = async (values: FormValues) => {
        console.log("Soumission formulaire client :", values);
        return new Promise((res) => setTimeout(res, 500));
    };

    return (
        <div className="pt-32 w-full bg-white">
            <div className="max-w-md mx-auto bg-gray-50 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">Connexion client</h2>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            await handleSubmit(values);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, touched, errors }) => (
                        <Form noValidate className="space-y-4">
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
                                className="w-full bg-blue-800 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition mt-4"
                            >
                                {isSubmitting ? "Envoi..." : "Se connecter"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
