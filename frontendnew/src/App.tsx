/**
 * Application principale
 * 
 * CORRECTION EFFECTUÉE :
 * - Ajout du AuthProvider pour gérer l'état d'authentification global
 * - Protection des routes avec ProtectedRoute
 * - Routes client protégées pour les clients uniquement
 * - Routes entreprise protégées pour les entreprises uniquement
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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
import UserTypeSelector from './components/UserTypeSelector';

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
  else if (location.pathname === "/" || location.pathname === "/choisir-type") {
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
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* ROUTES PUBLIQUES */}
            <Route path="/" element={<Landing />} />
            <Route path="/choisir-type" element={<UserTypeSelector />} />
            <Route path="/inscriptionclient" element={<InscriptionClient />} />
            <Route path="/connexionclient" element={<ConnexionClient />} />
            <Route path="/connexionentreprise" element={<ConnexionEntreprise />} />
            <Route path="/inscriptionentreprise" element={<InscriptionEntreprise />} />

            {/* ROUTES CLIENT PROTÉGÉES */}
            <Route
              path="/portailclient"
              element={
                <ProtectedRoute requiredUserType="client">
                  <AccueilClient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboardclient"
              element={
                <ProtectedRoute requiredUserType="client">
                  <DashboardClient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ticketsclient"
              element={
                <ProtectedRoute requiredUserType="client">
                  <TicketsClient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commandesclient"
              element={
                <ProtectedRoute requiredUserType="client">
                  <CommandesClient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bonusclient"
              element={
                <ProtectedRoute requiredUserType="client">
                  <BonusClient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profilclient"
              element={
                <ProtectedRoute requiredUserType="client">
                  <ProfilClient />
                </ProtectedRoute>
              }
            />

            {/* ROUTES ENTREPRISE PROTÉGÉES */}
            <Route
              path="/dashboardentreprise"
              element={
                <ProtectedRoute requiredUserType="entreprise">
                  <DashboardEntreprise />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientsentreprise"
              element={
                <ProtectedRoute requiredUserType="entreprise">
                  <ClientsEntreprise />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ticketsentreprise"
              element={
                <ProtectedRoute requiredUserType="entreprise">
                  <TicketsEntreprise />
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunites"
              element={
                <ProtectedRoute requiredUserType="entreprise">
                  <Opportunites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bonusentreprise"
              element={
                <ProtectedRoute requiredUserType="entreprise">
                  <BonusEntreprise />
                </ProtectedRoute>
              }
            />
            <Route
              path="/listeemployes"
              element={
                <ProtectedRoute requiredUserType="entreprise">
                  <ListeEmployes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profilemploye"
              element={
                <ProtectedRoute requiredUserType="entreprise">
                  <ProfilEmploye />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
