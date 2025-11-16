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
import Chatbot from './pages/chatbot';
import DashboardEntreprise from './pages/dashboardEntreprise';
import SidebarEntreprise from './components/sidebarEntreprise';
import ClientsEntreprise from './pages/clientsEntreprise';
import TicketsEntreprise from './pages/ticketsEntreprise';
// Layout qui choisit la navbar en fonction de la route
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  let navbarToShow: React.ReactElement;

  // Routes client → NavbarClient
  const clientRoutes = [
    "/dashboardclient",
    "/ticketsclient",
    "/commandesclient",
    "/bonusclient",
    "/chatbot",
    "/ajoutticket",
  ];

  // 👉 Routes entreprise
  const entrepriseRoutes = [
    "/dashboardentreprise",
    "/ticketsentreprise",
    "/clientsentreprise",
    "/commandesentreprise",
    "/bonusentreprise",
    "/parametresentreprise",
  ];

  if (clientRoutes.some(route => location.pathname.startsWith(route))) {
    navbarToShow = <NavbarClient />;
  }
  else if (entrepriseRoutes.some(route => location.pathname.startsWith(route))) {
    navbarToShow = <SidebarEntreprise />;
  }
  else if (location.pathname === "/") {
    navbarToShow = <Navbar2 />;
  }
  else if (
    location.pathname === "/inscriptionclient" ||
    location.pathname === "/connexionclient" ||
    location.pathname === "/connexionentreprise" ||
    location.pathname === "/inscriptionentreprise"
  ) {
    navbarToShow = <Navbar1 />;
  } 
  else {
    navbarToShow = <Navbar1 />; // fallback
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
          {/* PUBLIC */}
          <Route path="/" element={<AccueilClient />} />
          <Route path="/inscriptionclient" element={<InscriptionClient />} />
          <Route path="/connexionclient" element={<ConnexionClient />} />
          <Route path="/connexionentreprise" element={<ConnexionEntreprise />} />
          <Route path="/inscriptionentreprise" element={<InscriptionEntreprise />} />

          {/* CLIENT */}
          <Route path="/dashboardclient" element={<DashboardClient />} />
          <Route path="/ticketsclient" element={<TicketsClient />} />
          <Route path="/commandesclient" element={<CommandesClient />} />
          <Route path="/bonusclient" element={<BonusClient />} />
          <Route path="/chatbot" element={<Chatbot />} />

          {/* ENTREPRISE */}
          <Route path="/dashboardentreprise" element={<DashboardEntreprise />} />
          <Route path="/clientsentreprise" element={<ClientsEntreprise />} />
          <Route path="/ticketsentreprise" element={<TicketsEntreprise />} />
          
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
