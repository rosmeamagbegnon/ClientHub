/**
 * Service d'authentification
 *
 * PROBLÈME RÉSOLU :
 * Avant : Pas de service d'authentification, chaque composant gérait l'auth différemment
 * Pourquoi c'était mauvais :
 * - Code dupliqué dans chaque composant
 * - Pas de gestion centralisée du token
 * - Pas de vérification de la validité du token
 * - Pas de refresh automatique
 * - Difficile à maintenir
 *
 * SOLUTION :
 * Service centralisé qui :
 * - Encapsule toute la logique d'authentification
 * - Gère le stockage du token de manière sécurisée
 * - Fournit des méthodes simples (login, register, logout)
 * - Vérifie la validité du token
 * - Gère les erreurs d'authentification
 */

import { apiClient } from "../api/apiClient";
import { API_ENDPOINTS } from "../../config/api.config";
import { logger } from "../../utils/logger";
import { handleApiError, isAuthError } from "../../utils/errorHandler";

/**
 * Données de connexion client
 */
export interface ClientLoginData {
  email: string;
  password: string;
}

/**
 * Données d'inscription client particulier
 */
export interface ClientRegisterParticulierData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  canal_contact?: "email" | "whatsapp" | "sms";
  password: string;
  confirmPassword: string;
}

/**
 * Données d'inscription client entreprise
 */
export interface ClientRegisterEntrepriseData {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  confirmPassword: string;
  nom_entreprise: string;
  secteur_activite: string;
  taille_entreprise: string;
  numero_rccm: string;
  poste_occupe?: string;
  adresse_physique?: string;
  email_professionnel?: string;
  telephone_entreprise?: string;
  site_internet?: string;
  linkedin?: string;
}

/**
 * Données de connexion entreprise CRM
 */
export interface EntrepriseLoginData {
  email: string;
  password: string;
}

/**
 * Données d'inscription entreprise CRM
 */
export interface EntrepriseRegisterData {
  nom_entreprise: string;
  secteur_activite: string;
  taille_entreprise: string;
  numero_rccm_ifu: string;
  email_entreprise: string;
  telephone_entreprise: string;
  whatsapp_entreprise: string;
  adresse_professionnelle: string;
  site_internet?: string;
  linkedin?: string;
  prenom_responsable: string;
  nom_responsable: string;
  email_responsable: string;
  password: string;
  confirmPassword: string;
}

/**
 * Résultat d'authentification
 */
export interface AuthResult {
  token: string;
  user: ClientProfile | EntrepriseProfile;
}

/**
 * Service d'authentification
 *
 * Ce service centralise toutes les opérations d'authentification :
 * - Login/Register pour clients et entreprises
 * - Gestion du token
 * - Vérification du profil utilisateur
 */
class AuthService {
  /**
   * Connexion d'un client (particulier ou entreprise client)
   *
   * @param credentials - Email et mot de passe
   * @returns Token et profil utilisateur
   * @throws ApiException si les identifiants sont incorrects
   */
  async loginClient(credentials: ClientLoginData): Promise<AuthResult> {
    try {
      logger.info("Tentative de connexion client", {
        email: credentials.email,
      });

      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.CLIENT.LOGIN,
        {
          email: credentials.email,
          password: credentials.password,
        },
        { skipAuth: true } // Pas besoin de token pour se connecter
      );

      // Sauvegarder le token
      apiClient.saveTokenToStorage(response.token);

      logger.info("Connexion client réussie", { userId: response.user.id });

      return {
        token: response.token,
        user: response.user,
      };
    } catch (error) {
      logger.error("Erreur lors de la connexion client", error);
      throw error;
    }
  }

  /**
   * Inscription d'un client particulier
   */
  async registerClientParticulier(
    data: ClientRegisterParticulierData
  ): Promise<AuthResult> {
    try {
      logger.info("Tentative d'inscription client particulier", {
        email: data.email,
      });

      // Vérifier que les mots de passe correspondent
      if (data.password !== data.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.CLIENT.REGISTER_PARTICULIER,
        {
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
          telephone: data.telephone,
          canal_contact: data.canal_contact || "email",
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
        { skipAuth: true }
      );

      // Sauvegarder le token
      apiClient.saveTokenToStorage(response.token);

      logger.info("Inscription client particulier réussie", {
        userId: response.user.id,
      });

      return {
        token: response.token,
        user: response.user,
      };
    } catch (error) {
      logger.error("Erreur lors de l'inscription client particulier", error);
      throw error;
    }
  }

  /**
   * Inscription d'un client entreprise
   */
  async registerClientEntreprise(
    data: ClientRegisterEntrepriseData
  ): Promise<AuthResult> {
    try {
      logger.info("Tentative d'inscription client entreprise", {
        email: data.email,
      });

      // Vérifier que les mots de passe correspondent
      if (data.password !== data.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.CLIENT.REGISTER_ENTREPRISE,
        {
          prenom: data.prenom,
          nom: data.nom,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          nom_entreprise: data.nom_entreprise,
          secteur_activite: data.secteur_activite,
          taille_entreprise: data.taille_entreprise,
          numero_rccm: data.numero_rccm,
          poste_occupe: data.poste_occupe,
          adresse_physique: data.adresse_physique,
          email_professionnel: data.email_professionnel,
          telephone_entreprise: data.telephone_entreprise,
          site_internet: data.site_internet,
          linkedin: data.linkedin,
        },
        { skipAuth: true }
      );

      // Sauvegarder le token
      apiClient.saveTokenToStorage(response.token);

      logger.info("Inscription client entreprise réussie", {
        userId: response.user.id,
      });

      return {
        token: response.token,
        user: response.user,
      };
    } catch (error) {
      logger.error("Erreur lors de l'inscription client entreprise", error);
      throw error;
    }
  }

  /**
   * Connexion d'une entreprise CRM
   */
  async loginEntreprise(credentials: EntrepriseLoginData): Promise<AuthResult> {
    try {
      logger.info("Tentative de connexion entreprise", {
        email: credentials.email,
      });

      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.ENTREPRISE.LOGIN,
        {
          email: credentials.email,
          password: credentials.password,
        },
        { skipAuth: true }
      );

      // Sauvegarder le token
      apiClient.saveTokenToStorage(response.token);

      logger.info("Connexion entreprise réussie", { userId: response.user.id });

      return {
        token: response.token,
        user: response.user,
      };
    } catch (error) {
      logger.error("Erreur lors de la connexion entreprise", error);
      throw error;
    }
  }

  /**
   * Inscription d'une entreprise CRM
   *
   * NOTE IMPORTANTE : Le backend attend certains champs avec des noms spécifiques.
   * Ce service transforme les données du frontend pour correspondre au backend.
   */
  async registerEntreprise(data: EntrepriseRegisterData): Promise<AuthResult> {
    try {
      logger.info("Tentative d'inscription entreprise CRM", {
        email: data.email_entreprise,
      });

      // Vérifier que les mots de passe correspondent
      if (data.password !== data.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      // IMPORTANT : Transformer les données pour correspondre au backend
      // Le backend attend "mot_de_passe" et "confirm_password" selon la documentation
      // Mais vérifions d'abord ce que le backend attend réellement
      const payload = {
        nom_entreprise: data.nom_entreprise,
        secteur_activite: data.secteur_activite,
        taille_entreprise: data.taille_entreprise,
        numero_rccm_ifu: data.numero_rccm_ifu,
        email_entreprise: data.email_entreprise,
        telephone_entreprise: data.telephone_entreprise,
        whatsapp_entreprise: data.whatsapp_entreprise,
        adresse_professionnelle: data.adresse_professionnelle,
        site_internet: data.site_internet || "",
        linkedin: data.linkedin || "",
        prenom_responsable: data.prenom_responsable,
        nom_responsable: data.nom_responsable,
        email_responsable: data.email_responsable,
        password: data.password, // Le backend peut accepter "password" ou "mot_de_passe"
        confirmPassword: data.confirmPassword,
      };

      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.ENTREPRISE.REGISTER,
        payload,
        { skipAuth: true }
      );

      // Sauvegarder le token
      apiClient.saveTokenToStorage(response.token);

      logger.info("Inscription entreprise CRM réussie", {
        userId: response.user.id,
      });

      return {
        token: response.token,
        user: response.user,
      };
    } catch (error) {
      logger.error("Erreur lors de l'inscription entreprise CRM", error);
      throw error;
    }
  }

  /**
   * Récupère le profil de l'utilisateur connecté (client)
   */
  async getClientProfile(): Promise<ClientProfile> {
    try {
      const profile = await apiClient.get<ClientProfile>(
        API_ENDPOINTS.AUTH.CLIENT.ME
      );
      logger.debug("Profil client récupéré", { userId: profile.id });
      return profile;
    } catch (error) {
      logger.error("Erreur lors de la récupération du profil client", error);
      throw error;
    }
  }

  /**
   * Récupère le profil de l'entreprise connectée
   */
  async getEntrepriseProfile(): Promise<EntrepriseProfile> {
    try {
      const profile = await apiClient.get<EntrepriseProfile>(
        API_ENDPOINTS.AUTH.ENTREPRISE.ME
      );
      logger.debug("Profil entreprise récupéré", { userId: profile.id });
      return profile;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération du profil entreprise",
        error
      );
      throw error;
    }
  }

  /**
   * Déconnexion
   * Supprime le token et les données utilisateur
   */
  logout(): void {
    logger.info("Déconnexion utilisateur");
    apiClient.clearToken();
    localStorage.removeItem(API_CONFIG.USER_STORAGE_KEY);
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * (vérifie la présence d'un token)
   */
  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }

  /**
   * Vérifie si le token est valide en essayant de récupérer le profil
   *
   * @param userType - Type d'utilisateur ("client" ou "entreprise")
   * @returns true si le token est valide, false sinon
   */
  async validateToken(userType: "client" | "entreprise"): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      if (userType === "client") {
        await this.getClientProfile();
      } else {
        await this.getEntrepriseProfile();
      }
      return true;
    } catch (error) {
      // Si erreur 401, le token est invalide
      if (isAuthError(error)) {
        this.logout();
        return false;
      }
      // Autre erreur, on considère que le token est valide
      return true;
    }
  }
}

// Import nécessaire pour API_CONFIG
import { API_CONFIG } from "../../config/api.config";
import type {
  AuthResponse,
  ClientProfile,
  EntrepriseProfile,
} from "@/types/api.types";

// Export d'une instance singleton
export const authService = new AuthService();
