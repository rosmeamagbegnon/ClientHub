import {useState} from "react";
import {
  Users,
  Ticket,
  LayoutDashboard,
  BarChart3,
  ChevronDown
} from "lucide-react";
import {Link} from "react-router-dom";
export default function Landing() {

  const features = [
    {
      title: "CRM centralisé",
      desc: "Un seul espace pour toutes les données client : contacts, historiques, opportunités.",
      icon: Users
    },
    {
      title: "Gestion des tickets",
      desc: "Suivi des demandes clients avec SLA et files d'attente intelligentes.",
      icon: Ticket
    },
    {
      title: "Portail client",
      desc: "Permetz à vos clients de suivre en temps réel leurs tickets et propositions d'opportunités commerciales.",
      icon: LayoutDashboard
    },
    {
      title: "Reporting",
      desc: "Tableaux de bord et exports pour suivre la performance commerciale.",
      icon: BarChart3
    }
  ];

  const plans = [
    {
      name: "Starter",
      monthly: "0€",
      yearly: "0€",
      perks: ["3 utilisateurs", "Support email", "Base CRM"]
    },
    {
      name: "Pro",
      monthly: "29€/mo",
      yearly: "290€/an",
      perks: ["Utilisateurs illimités", "Automatisations", "Portail client"]
    },
    {
      name: "Business",
      monthly: "79€/mo",
      yearly: "790€/an",
      perks: ["SSO & Sécurité avancée", "Reporting avancé", "SLA priorité"]
    }
  ];

  const faqs = [
    {
      q: "ClientHub est-il sécurisé ?",
      a: "Oui. Nous utilisons le chiffrement des données, des contrôles d’accès avancés et des journaux d’audit."
    },
    {
      q: "Puis-je changer de plan ?",
      a: "Oui, vous pouvez modifier votre abonnement à tout moment depuis votre espace admin."
    },
    {
      q: "Y a-t-il une version gratuite ?",
      a: "Oui, un plan gratuit est disponible pour démarrer sans engagement."
    }
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}

      {/* HERO */}
        <section id="hero" className="max-w-4xl mx-auto pb-20 pt-32 lg:pt-48 justify-center flex flex-col items-center" >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Gérez votre relation client de manière interactive avec <span className="text-blue-800">ClientHub</span> 
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            ClientHub vous aide à suivre prospects, opportunités et tickets en un seul endroit.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link to="/inscriptionentreprise">
                <button className="bg-blue-800 text-white px-5 py-2 rounded">
                    Essayer gratuitement
                </button>
            </Link>
            
            <button className="bg-gray-800 text-white px-5 py-2 rounded">
              Voir la démo
            </button>
          </div>
        </section>
      {/* FEATURES */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-10 text-blue-800">
            Fonctionnalités principales
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {features.map((f) => (
            <div key={f.title} className="bg-blue-100 rounded-2xl p-6 shadow">
                <f.icon className="h-8 w-8 mb-3 text-blue-800" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
            </div>
            ))}
        </div>
        </section>


      {/* PRICING */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-10 text-blue-800">
            Nos offres
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
            <div key={p.name} className="bg-white rounded-2xl p-6 shadow-blue-100 shadow-lg text-center">
                <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                <p className="text-3xl font-bold mb-2">{p.monthly}</p>
                <p className="text-sm text-gray-500 mb-4">ou {p.yearly} / an</p>

                <ul className="text-gray-600 mb-4 space-y-1">
                {p.perks.map((perk) => (
                    <li key={perk}>• {perk}</li>
                ))}
                </ul>

                <button className="bg-blue-800 text-white px-4 py-2 rounded-xl">
                Choisir
                </button>
            </div>
            ))}
        </div>
        </section>
      {/* FAQ */}
        <section id="faq" className="max-w-4xl mx-auto px-6 py-16">
  <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 text-blue-800">
    Questions fréquentes
  </h2>

  {faqs.map((item, index) => {
    

    return (
      <div
        key={item.q}
        className="mb-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
      >
        <button
          onClick={() => setOpen(open === index ? null : index)}
          className="w-full flex justify-between items-center text-left p-5"
        >
          <span className="font-semibold text-lg lg:text-xl text-gray-800">
            {item.q}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-blue-800 transition-transform duration-300 ${
              open === index ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${
            open === index ? "max-h-40 pb-5" : "max-h-0"
          }`}
        >
          <p className="text-gray-600">
            {item.a}
          </p>
        </div>
      </div>
    );
  })}
</section>


      {/* CTA */}
      <section className="relative overflow-hidden text-white text-center p-12 rounded-3xl max-w-6xl mx-auto my-16 bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-800 bg-[length:200%_200%] animate-gradient shadow-2xl">

        {/* Glow effect */}
        <div className="absolute inset-0 bg-blue-500 opacity-20 blur-3xl"></div>

        <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
            Prêt à booster votre relation client ?
        </h2>

        <p className="mb-8 text-blue-100 relative z-10">
            Essayez ClientHub gratuitement pendant 14 jours — sans carte bancaire.
        </p>

        <Link to="/inscriptionentreprise" className="relative z-10">
            <button className="bg-white font-semibold text-blue-800 px-10 py-4 rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg">
            Commencer maintenant
            </button>
        </Link>

    </section>


      {/* FOOTER */}
      <footer className="text-center text-gray-500 p-6">
        © 2025 ClientHub - Tous droits réservés
      </footer>
    </div>
  );
}
