import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AccueilClient from './pages/accueilClient';
import InscriptionClient from './pages/inscriptionClient';
import ConnexionClient from './pages/connexionClient';
import ConnexionEntreprise from './pages/connexionEntreprise';
import InscriptionEntreprise from './pages/inscriptionEntreprise';
import Navbar1 from './components/navbar1';
import Navbar2 from './components/navbar2';
import NavbarClient from './components/navbarClient';
import DashboardClient from './pages/dashboardClient';
import TicketsClient from './pages/ticketsClient';
import CommandesClient from './pages/commandesClient';
import BonusClient from './pages/bonusClient';
import DashboardEntreprise from './pages/dashboardEntreprise';
import SidebarEntreprise from './components/sidebarEntreprise';
import ClientsEntreprise from './pages/clientsEntreprise';
import TicketsEntreprise from './pages/ticketsEntreprise';
import ProfilClient from './pages/profilClient';
import Opportunites from './pages/opportunites';
import Landing from './pages/landingPage';
import Navbar3 from './components/navbar3';
import NavbarP from './components/navbarPortailC';
import FloatingChat from './components/floatingChat';
import BonusEntreprise from './pages/bonusEntreprise';
import ListeEmployes from './pages/listeEmployes';
import ProfilEmploye from './pages/profilEmploye';

// Layout qui choisit la navbar en fonction de la route
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  let navbarToShow: React.ReactElement;

  // ✅ Route spéciale portail client
  const isPortailClient = location.pathname === "/portailclient";

  const clientRoutes = [
    "/dashboardclient",
    "/ticketsclient",
    "/commandesclient",
    "/bonusclient",
    "/chatbot",
    "/ajoutticket",
    "/profilclient",
    "/portailclient",
  ];

  const entrepriseRoutes = [
    "/dashboardentreprise",
    "/ticketsentreprise",
    "/clientsentreprise",
    "/commandesentreprise",
    "/bonusentreprise",
    "/listeemployes",
    "/opportunites",
    "/profilemploye",
  ];

  const clientAuthRoutes = [
    "/inscriptionclient",
    "/connexionclient",
  ];

  const entrepriseAuthRoutes = [
    "/connexionentreprise",
    "/inscriptionentreprise",
  ];

  const showDashboardButtonRoutes = [
  "/dashboardclient",
  "/ticketsclient",
  "/commandesclient",
  "/bonusclient",
  "/profilclient",
];
const showFloatingChat = showDashboardButtonRoutes.some(route =>
  location.pathname.startsWith(route)
);

  if (isPortailClient) {
    navbarToShow = <NavbarP />; // ✅ UNIQUEMENT /portailclient
  }
  else if (clientRoutes.some(route => location.pathname.startsWith(route))) {
    navbarToShow = <NavbarClient />;
  }
  else if (entrepriseRoutes.some(route => location.pathname.startsWith(route))) {
    navbarToShow = <SidebarEntreprise />;
  }
  else if (location.pathname === "/") {
    navbarToShow = <Navbar2 />;
  }
  else if (entrepriseAuthRoutes.includes(location.pathname)) {
    navbarToShow = <Navbar3 />;
  }
  else if (clientAuthRoutes.includes(location.pathname)) {
    navbarToShow = <Navbar1 />;
  }
  else {
    navbarToShow = <Navbar1 />;
  }

  return (
    <>
      {navbarToShow}
      {children}
      {showFloatingChat && <FloatingChat />}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* CLIENT */}
          <Route path="/portailclient" element={<AccueilClient />} />
          <Route path="/inscriptionclient" element={<InscriptionClient />} />
          <Route path="/connexionclient" element={<ConnexionClient />} />
          <Route path="/dashboardclient" element={<DashboardClient />} />
          <Route path="/ticketsclient" element={<TicketsClient />} />
          <Route path="/commandesclient" element={<CommandesClient />} />
          <Route path="/bonusclient" element={<BonusClient />} />
          <Route path="/profilclient" element={<ProfilClient />} />

          {/* ENTREPRISE */}
          <Route path="/dashboardentreprise" element={<DashboardEntreprise />} />
          <Route path="/clientsentreprise" element={<ClientsEntreprise />} />
          <Route path="/ticketsentreprise" element={<TicketsEntreprise />} />
          <Route path="/opportunites" element={<Opportunites />} />
          <Route path="/bonusentreprise" element={<BonusEntreprise />} />
          <Route path="/listeemployes" element={<ListeEmployes />} />
          <Route path="/profilemploye" element={<ProfilEmploye />} />

          {/* PUBLIC */}
          <Route path="/" element={<Landing />} />
          <Route path="/connexionentreprise" element={<ConnexionEntreprise />} />
          <Route path="/inscriptionentreprise" element={<InscriptionEntreprise />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
