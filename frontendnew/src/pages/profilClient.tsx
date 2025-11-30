import { useState } from "react";
import { Plus, X } from "lucide-react";

interface Entreprise {
  id: number;
  nom: string;
}

interface Contact {
  id: number;
  nom: string;
  email: string;
  telephone: string;
}

interface Client {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  type: "individu" | "entreprise";
  entreprises: Entreprise[];
  contacts?: Contact[]; // uniquement si type = entreprise
}

const ProfilClient = () => {
  const [showModal, setShowModal] = useState(false);

  // Exemple de données (à remplacer par des données venant de l'API)
  const client: Client = {
    id: 1,
    nom: "Jean Dupont",
    email: "jean.dupont@example.com",
    telephone: "+229 90 00 00 00",
    type: "entreprise",
    entreprises: [
      { id: 1, nom: "Tech Solutions" },
      { id: 2, nom: "AgriCorp" },
    ],
    contacts: [
      { id: 1, nom: "Alice K.", email: "alice@example.com", telephone: "+229 91 22 33 44" },
      { id: 2, nom: "Marc T.", email: "marc@example.com", telephone: "+229 66 55 44 33" },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 lg:pt-10 text-black">
      <div className="max-w-4xl xl:max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-blue-800 mb-6">Mon Profil</h1>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 flex-shrink-0"
              >
                <Plus className="mr-2" size={18} /> Ajouter un contact
              </button>
        </div>
        

        {/* Informations du client */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Informations personnelles</h2>
          <div className="space-y-2">
            <p><strong>Nom :</strong> {client.nom}</p>
            <p><strong>Email :</strong> {client.email}</p>
            <p><strong>Téléphone :</strong> {client.telephone}</p>
            <p><strong>Type de client :</strong> {client.type}</p>
          </div>
        </div>

        {/* Entreprises affiliées */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Entreprises affiliées</h2>
          <ul className="list-disc pl-6 space-y-1">
            {client.entreprises.map((e) => (
              <li key={e.id} className="font-medium">{e.nom}</li>
            ))}
          </ul>
        </div>

        {/* Liste des contacts si c'est une entreprise */}
        {client.type === "entreprise" && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-800">Contacts</h2>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
              >
                <Plus className="mr-2" size={18} /> Ajouter un contact
              </button>
            </div>

            {client.contacts && client.contacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.contacts.map((c) => (
                  <div key={c.id} className="border rounded-lg p-4 bg-blue-50 shadow-sm">
                    <p className="font-semibold text-blue-900">{c.nom}</p>
                    <p>Email : {c.email}</p>
                    <p>Téléphone : {c.telephone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Aucun contact pour le moment.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal d'ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-800">Ajouter un contact</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="text-gray-900" size={28} />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block font-medium">Nom</label>
                <input type="text" className="w-full border px-3 py-2 rounded" />
              </div>

              <div>
                <label className="block font-medium">Email</label>
                <input type="email" className="w-full border px-3 py-2 rounded" />
              </div>

              <div>
                <label className="block font-medium">Téléphone</label>
                <input type="text" className="w-full border px-3 py-2 rounded" />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-700 font-semibold"
              >
                Ajouter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilClient;