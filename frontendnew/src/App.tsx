import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AccueilClient from './pages/accueilClient';
import InscriptionClient from './pages/inscriptionClient';
import ConnexionClient from './pages/connexionClient';
import ConnexionEntreprise from './pages/connexionEntreprise';
import InscriptionEntreprise from './pages/inscriptionEntreprise';
import Navbar1 from './components/navbar1';
import Navbar2 from './components/navbar2';
import NavbarClient from './components/navbarClient';
import AccueilClient1 from './pages/accueilClient1';
import TicketsClient from './pages/ticketsClient';
import CommandesClient from './pages/commandesClient';
import BonusClient from './pages/bonusClient';
import Chatbot from './pages/chatbot';
// Layout qui choisit la navbar en fonction de la route
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  let navbarToShow: JSX.Element;

  // Routes client → NavbarClient
  if (
    location.pathname.startsWith("/accueilclient1") ||
    location.pathname.startsWith("/tickets") ||
    location.pathname.startsWith("/commandes") ||
    location.pathname.startsWith("/Bonus") ||
    location.pathname.startsWith("/chatbot") ||
    location.pathname.startsWith("/ajoutticket") ||
    location.pathname.startsWith("/ticketsclient") ||
    location.pathname.startsWith("/commandesclient") ||
    location.pathname.startsWith("/bonusclient") ||
    location.pathname.startsWith("/chatbot")
  ) {
    navbarToShow = <NavbarClient />;
  } 
  // Routes publiques ou de connexion/inscription → Navbar1 ou Navbar2
  else if (location.pathname === "/") {
    navbarToShow = <Navbar2 />;
  } else if (
    location.pathname === "/inscriptionclient" ||
    location.pathname === "/connexionclient" ||
    location.pathname === "/connexionentreprise" ||
    location.pathname === "/inscriptionentreprise"
  ) {
    navbarToShow = <Navbar1 />;
  } else {
    navbarToShow = <Navbar1 />; // fallback par défaut
  }

  return (
    <>
      {navbarToShow}
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<AccueilClient />} />
          <Route path="/inscriptionclient" element={<InscriptionClient />} />
          <Route path="/connexionclient" element={<ConnexionClient />} />
          <Route path="/connexionentreprise" element={<ConnexionEntreprise />} />
          <Route path="/inscriptionentreprise" element={<InscriptionEntreprise />} />
          <Route path="/accueilclient1" element={<AccueilClient1 />} />
          <Route path="/ticketsclient" element={<TicketsClient />} />
          <Route path="/commandesclient" element={<CommandesClient />} />
          <Route path="/bonusclient" element={<BonusClient />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
