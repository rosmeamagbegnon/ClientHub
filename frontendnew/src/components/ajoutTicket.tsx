import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface TicketFormValues {
    title: string;
    description: string;
    dueDate: string | null;
    typeProbleme: string;
}

const initialValues: TicketFormValues = {
    title: "",
    description: "",
    dueDate: null,
    typeProbleme: "",
};

const validationSchema = Yup.object({
    title: Yup.string()
        .required("Le titre est requis")
        .min(3, "Le titre doit contenir au moins 3 caractères"),
    description: Yup.string()
        .required("La description est requise")
        .min(10, "La description doit contenir au moins 10 caractères"),
    dueDate: Yup.date()
        .nullable()
        .transform((curr, orig) => (orig === "" ? null : curr))
        .min(new Date(Date.now() - 86400000), "La date d'échéance doit être aujourd'hui ou ultérieure"),
    typeProbleme: Yup.string()
        .oneOf(
            ["facturation", "reclamation", "technique", "suggestion", "autre"],
            "Type de problème invalide"
        )
        .required("Le type de problème est requis"),
});

export default function AjoutTicket(): JSX.Element {
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (values: TicketFormValues, actions: any) => {
        setMessage(null);
        try {
            await new Promise((res) => setTimeout(res, 800));
            console.log("Ticket soumis:", values);
            setMessage("Ticket ajouté avec succès.");
            actions.resetForm();
        } catch (err) {
            setMessage("Une erreur est survenue lors de l'ajout du ticket.");
        } finally {
            actions.setSubmitting(false);
        }
    };

    return (
        <div className="pt-4 md:pt-8 w-full bg-white">
            <div className="max-w-md mx-auto bg-gray-50 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-blue-800">Faire une demande</h2>

                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ isSubmitting }) => (
                        <Form noValidate className="space-y-4">

                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Titre *
                                </label>
                                <Field
                                    id="title"
                                    name="title"
                                    placeholder="Titre du ticket"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage name="title">
                                    {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description *
                                </label>
                                <Field
                                    id="description"
                                    name="description"
                                    as="textarea"
                                    rows={5}
                                    placeholder="Décrivez le problème..."
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage name="description">
                                    {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </div>

                            {/* Select du type de problème */}
                            <div>
                                <label htmlFor="typeProbleme" className="block text-sm font-medium text-gray-700">
                                    Type de problème *
                                </label>
                                <Field
                                    id="typeProbleme"
                                    name="typeProbleme"
                                    as="select"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    <option value="facturation">Facturation</option>
                                    <option value="reclamation">Réclamation</option>
                                    <option value="technique">Problème technique</option>
                                    <option value="suggestion">Suggestion</option>
                                    <option value="autre">Autre</option>
                                </Field>
                                <ErrorMessage name="typeProbleme">
                                    {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </div>

                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                                    Date d'échéance
                                </label>
                                <Field
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage name="dueDate">
                                    {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-800 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition mt-4"
                            >
                                {isSubmitting ? "Envoi..." : "Soumettre la demande"}
                            </button>
                        </Form>
                    )}
                </Formik>

                {message && (
                    <div className={`mt-4 text-sm ${message.includes("succès") ? "text-green-600" : "text-red-600"}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
