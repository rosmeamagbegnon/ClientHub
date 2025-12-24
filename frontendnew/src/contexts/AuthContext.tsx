/**
 * Contexte d'authentification React
 *
 * PROBLÈME RÉSOLU :
 * Avant : Pas de gestion d'état global pour l'authentification
 * Pourquoi c'était mauvais :
 * - Chaque composant devait gérer l'état utilisateur indépendamment
 * - Pas de partage d'état entre composants
 * - Difficile de savoir si l'utilisateur est connecté
 * - Pas de protection des routes
 *
 * SOLUTION :
 * Contexte React qui :
 * - Gère l'état global de l'utilisateur connecté
 * - Fournit des méthodes login/logout accessibles partout
 * - Vérifie automatiquement le token au chargement
 * - Permet de protéger les routes facilement
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authService } from "../services/auth/authService";
import { logger } from "../utils/logger";
import type { ClientProfile, EntrepriseProfile } from "@/types/api.types";

/**
 * Type d'utilisateur
 */
export type UserType = "client" | "entreprise";

/**
 * État d'authentification
 */
interface AuthState {
  /**
   * Utilisateur connecté (null si non connecté)
   */
  user: ClientProfile | EntrepriseProfile | null;
  /**
   * Type d'utilisateur
   */
  userType: UserType | null;
  /**
   * Si true, on est en train de vérifier le token (chargement initial)
   */
  isLoading: boolean;
  /**
   * Si true, l'utilisateur est authentifié
   */
  isAuthenticated: boolean;
}

/**
 * Méthodes disponibles dans le contexte
 */
interface AuthContextValue extends AuthState {
  /**
   * Connexion d'un client
   */
  loginClient: (email: string, password: string) => Promise<void>;
  /**
   * Connexion d'une entreprise
   */
  loginEntreprise: (email: string, password: string) => Promise<void>;
  /**
   * Inscription d'un client particulier
   */
  registerClientParticulier: (data: any) => Promise<void>;
  /**
   * Inscription d'un client entreprise
   */
  registerClientEntreprise: (data: any) => Promise<void>;
  /**
   * Inscription d'une entreprise CRM
   */
  registerEntreprise: (data: any) => Promise<void>;
  /**
   * Déconnexion
   */
  logout: () => void;
  /**
   * Rafraîchir le profil utilisateur
   */
  refreshProfile: () => Promise<void>;
}

// Créer le contexte
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Hook pour accéder au contexte d'authentification
 *
 * @example
 * const { user, isAuthenticated, loginClient, logout } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}

/**
 * Provider du contexte d'authentification
 *
 * Ce composant doit envelopper toute l'application pour que
 * les composants enfants puissent accéder à l'état d'authentification.
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userType: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /**
   * Charge le profil utilisateur depuis l'API
   */
  const loadUserProfile = async () => {
    if (!authService.isAuthenticated()) {
      setState({
        user: null,
        userType: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return;
    }

    try {
      // Essayer de charger le profil client d'abord
      try {
        const profile = await authService.getClientProfile();
        setState({
          user: profile,
          userType: "client",
          isLoading: false,
          isAuthenticated: true,
        });
        logger.info("Profil client chargé", { userId: profile.id });
        return;
      } catch (clientError) {
        // Si erreur, essayer entreprise
        try {
          const profile = await authService.getEntrepriseProfile();
          setState({
            user: profile,
            userType: "entreprise",
            isLoading: false,
            isAuthenticated: true,
          });
          logger.info("Profil entreprise chargé", { userId: profile.id });
          return;
        } catch (entrepriseError) {
          // Aucun profil trouvé, déconnecter
          authService.logout();
          setState({
            user: null,
            userType: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    } catch (error) {
      logger.error("Erreur lors du chargement du profil", error);
      authService.logout();
      setState({
        user: null,
        userType: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  /**
   * Vérifie le token et charge le profil au montage du composant
   */
  useEffect(() => {
    loadUserProfile();
  }, []);

  /**
   * Connexion client
   */
  const loginClient = async (email: string, password: string) => {
    try {
      const result = await authService.loginClient({ email, password });
      setState({
        user: result.user,
        userType: "client",
        isLoading: false,
        isAuthenticated: true,
      });
      logger.info("Connexion client réussie via contexte", {
        userId: result.user.id,
      });
    } catch (error) {
      logger.error("Erreur lors de la connexion client", error);
      throw error;
    }
  };

  /**
   * Connexion entreprise
   */
  const loginEntreprise = async (email: string, password: string) => {
    try {
      const result = await authService.loginEntreprise({ email, password });
      setState({
        user: result.user,
        userType: "entreprise",
        isLoading: false,
        isAuthenticated: true,
      });
      logger.info("Connexion entreprise réussie via contexte", {
        userId: result.user.id,
      });
    } catch (error) {
      logger.error("Erreur lors de la connexion entreprise", error);
      throw error;
    }
  };

  /**
   * Inscription client particulier
   */
  const registerClientParticulier = async (data: any) => {
    try {
      const result = await authService.registerClientParticulier(data);
      setState({
        user: result.user,
        userType: "client",
        isLoading: false,
        isAuthenticated: true,
      });
      logger.info("Inscription client particulier réussie via contexte", {
        userId: result.user.id,
      });
    } catch (error) {
      logger.error("Erreur lors de l'inscription client particulier", error);
      throw error;
    }
  };

  /**
   * Inscription client entreprise
   */
  const registerClientEntreprise = async (data: any) => {
    try {
      const result = await authService.registerClientEntreprise(data);
      setState({
        user: result.user,
        userType: "client",
        isLoading: false,
        isAuthenticated: true,
      });
      logger.info("Inscription client entreprise réussie via contexte", {
        userId: result.user.id,
      });
    } catch (error) {
      logger.error("Erreur lors de l'inscription client entreprise", error);
      throw error;
    }
  };

  /**
   * Inscription entreprise CRM
   */
  const registerEntreprise = async (data: any) => {
    try {
      const result = await authService.registerEntreprise(data);
      setState({
        user: result.user,
        userType: "entreprise",
        isLoading: false,
        isAuthenticated: true,
      });
      logger.info("Inscription entreprise CRM réussie via contexte", {
        userId: result.user.id,
      });
    } catch (error) {
      logger.error("Erreur lors de l'inscription entreprise CRM", error);
      throw error;
    }
  };

  /**
   * Déconnexion
   */
  const logout = () => {
    authService.logout();
    setState({
      user: null,
      userType: null,
      isLoading: false,
      isAuthenticated: false,
    });
    logger.info("Déconnexion via contexte");
  };

  /**
   * Rafraîchir le profil
   */
  const refreshProfile = async () => {
    await loadUserProfile();
  };

  const value: AuthContextValue = {
    ...state,
    loginClient,
    loginEntreprise,
    registerClientParticulier,
    registerClientEntreprise,
    registerEntreprise,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
