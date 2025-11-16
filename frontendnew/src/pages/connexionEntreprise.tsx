import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
    rccm_ifu: Yup.string().required("Le N°RCCM/IFU est requis"),
    email: Yup.string().email('Email invalide').required("L'email est requis"),
    motDePasse: Yup.string().min(6, 'Au moins 6 caractères').required('Le mot de passe est requis'),
});

interface FormValues {
    rccm_ifu: string;
    email: string;
    motDePasse: string;
}

export default function ConnexionEntreprise(): JSX.Element {
    const initialValues: FormValues = {
        rccm_ifu: '',
        email: '',
        motDePasse: '',
    };

    const handleSubmit = async (values: FormValues) => {
        console.log('Formulaire soumis:', values);
        return new Promise((res) => setTimeout(res, 500));
    };

    return (
        <div className="pt-32 w-full bg-white">
            <div className="max-w-md mx-auto bg-gray-50 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">Connexion entreprise</h2>

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

                            {/* Champ RCCM / IFU */}
                            <div>
                                <label htmlFor="rccm_ifu" className="block text-sm font-medium text-gray-700">
                                    N° RCCM / IFU
                                </label>
                                <Field
                                    id="rccm_ifu"
                                    name="rccm_ifu"
                                    type="text"
                                    placeholder="Ex : RB/COT/20XX..."
                                    aria-invalid={Boolean(touched.rccm_ifu && errors.rccm_ifu)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage name="rccm_ifu">
                                    {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email de l'entreprise
                                </label>
                                <Field
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="adresse@entreprise.com"
                                    aria-invalid={Boolean(touched.email && errors.email)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage name="email">
                                    {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </div>

                            {/* Mot de passe */}
                            <div>
                                <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">
                                    Mot de passe
                                </label>
                                <Field
                                    id="motDePasse"
                                    name="motDePasse"
                                    type="password"
                                    placeholder="••••••••"
                                    aria-invalid={Boolean(touched.motDePasse && errors.motDePasse)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage name="motDePasse">
                                    {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-800 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition mt-4"
                            >
                                {isSubmitting ? 'Envoi...' : 'Se connecter'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
