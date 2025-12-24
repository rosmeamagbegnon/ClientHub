/**
 * Composant de protection de route
 * 
 * PROBLÈME RÉSOLU :
 * Avant : Pas de protection des routes, n'importe qui pouvait accéder aux pages protégées
 * Pourquoi c'était mauvais :
 * - Sécurité : accès non autorisé aux données
 * - UX : erreurs si l'utilisateur n'est pas connecté
 * - Pas de redirection automatique vers login
 * 
 * SOLUTION :
 * Composant qui :
 * - Vérifie si l'utilisateur est authentifié
 * - Redirige vers la page de connexion si non authentifié
 * - Peut vérifier le type d'utilisateur (client vs entreprise)
 * - Affiche un loader pendant la vérification
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  /**
   * Composant à afficher si l'utilisateur est authentifié
   */
  children: ReactNode;
  /**
   * Type d'utilisateur requis (optionnel)
   * Si spécifié, redirige si l'utilisateur n'est pas du bon type
   */
  requiredUserType?: "client" | "entreprise";
  /**
   * Route de redirection si non authentifié (défaut: "/connexionclient")
   */
  redirectTo?: string;
}

/**
 * Composant qui protège une route en vérifiant l'authentification
 * 
 * @example
 * // Route protégée pour tous les utilisateurs authentifiés
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 * 
 * @example
 * // Route protégée uniquement pour les clients
 * <Route path="/dashboardclient" element={
 *   <ProtectedRoute requiredUserType="client">
 *     <DashboardClient />
 *   </ProtectedRoute>
 * } />
 */
export default function ProtectedRoute({
  children,
  requiredUserType,
  redirectTo,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, userType } = useAuth();

  // Afficher un loader pendant la vérification du token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    const defaultRedirect = requiredUserType === "entreprise" 
      ? "/connexionentreprise" 
      : "/connexionclient";
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  // Si un type d'utilisateur est requis et que l'utilisateur n'est pas du bon type
  if (requiredUserType && userType !== requiredUserType) {
    // Rediriger vers le dashboard approprié
    const redirectPath = userType === "client" ? "/dashboardclient" : "/dashboardentreprise";
    return <Navigate to={redirectPath} replace />;
  }

  // Tout est OK, afficher le contenu
  return <>{children}</>;
}

