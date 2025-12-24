/**
 * Service API centralisé - Client HTTP
 *
 * PROBLÈME RÉSOLU :
 * Avant : Chaque composant faisait ses propres appels fetch() directement
 * Pourquoi c'était mauvais :
 * - Code dupliqué partout
 * - Pas de gestion centralisée du token JWT
 * - Pas de gestion d'erreur cohérente
 * - URLs hardcodées dans chaque composant
 * - Difficile à maintenir et tester
 *
 * SOLUTION :
 * Service API centralisé qui :
 * - Gère automatiquement le token JWT dans les headers
 * - Centralise la configuration (URL, timeout, etc.)
 * - Gère les erreurs de manière cohérente
 * - Fournit des méthodes réutilisables (get, post, patch, delete)
 * - Log toutes les requêtes pour le débogage
 * - Gère les timeouts et les erreurs réseau
 */

import { buildApiUrl, API_CONFIG } from "../../config/api.config";
import { logger } from "../../utils/logger";
import {
  handleApiError,
  extractApiErrorMessage,
  ApiException,
} from "../../utils/errorHandler";
import type { ApiResponse } from "@/types/api.types";

/**
 * Options pour les requêtes API
 */
interface RequestOptions extends RequestInit {
  /**
   * Si true, n'ajoute pas automatiquement le token d'authentification
   */
  skipAuth?: boolean;
  /**
   * Timeout personnalisé (en millisecondes)
   */
  timeout?: number;
}

/**
 * Client API centralisé
 *
 * Ce service encapsule toutes les interactions avec l'API backend.
 * Il gère automatiquement :
 * - L'ajout du token JWT dans les headers
 * - La gestion des erreurs
 * - Le logging
 * - Les timeouts
 */
class ApiClient {
  private token: string | null = null;

  /**
   * Définit le token d'authentification
   * Ce token sera automatiquement ajouté dans le header Authorization de toutes les requêtes
   */
  setToken(token: string | null): void {
    this.token = token;
    logger.debug("Token mis à jour", { hasToken: !!token });
  }

  /**
   * Récupère le token actuel
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Charge le token depuis localStorage
   */
  loadTokenFromStorage(): void {
    const storedToken = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
    if (storedToken) {
      this.token = storedToken;
      logger.debug("Token chargé depuis localStorage");
    }
  }

  /**
   * Sauvegarde le token dans localStorage
   */
  saveTokenToStorage(token: string): void {
    localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, token);
    this.token = token;
    logger.debug("Token sauvegardé dans localStorage");
  }

  /**
   * Supprime le token (logout)
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    logger.debug("Token supprimé");
  }

  /**
   * Effectue une requête GET
   *
   * @param endpoint - Endpoint API (ex: "/auth/clients/me")
   * @param options - Options de requête
   * @returns Données de la réponse API
   * @throws ApiException si la requête échoue
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  /**
   * Effectue une requête POST
   *
   * @param endpoint - Endpoint API
   * @param data - Données à envoyer dans le body
   * @param options - Options de requête
   * @returns Données de la réponse API
   * @throws ApiException si la requête échoue
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>("POST", endpoint, data, options);
  }

  /**
   * Effectue une requête PATCH
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, data, options);
  }

  /**
   * Effectue une requête DELETE
   */
  async delete<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }

  /**
   * Méthode générique pour effectuer une requête HTTP
   *
   * Cette méthode centralise toute la logique de requête :
   * - Construction de l'URL
   * - Ajout des headers (Content-Type, Authorization)
   * - Gestion du timeout
   * - Gestion des erreurs
   * - Logging
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = buildApiUrl(endpoint);
    const timeout = options?.timeout || API_CONFIG.TIMEOUT;

    // Préparer les headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options?.headers,
    };

    // Ajouter le token d'authentification si disponible et non désactivé
    if (!options?.skipAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    // Préparer le body
    let body: string | undefined;
    if (data) {
      body = JSON.stringify(data);
    }

    // Log la requête
    logger.apiRequest(method, url, data);

    // Créer un AbortController pour gérer le timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Effectuer la requête
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      // Log la réponse
      logger.apiResponse(method, url, response.status);

      // Si la réponse n'est pas OK, gérer l'erreur
      if (!response.ok) {
        const errorMessage = await extractApiErrorMessage(response);
        throw new ApiException(errorMessage, response.status);
      }

      // Parser la réponse JSON
      const responseData: ApiResponse<T> = await response.json();

      // Le backend retourne toujours { success, message, data }
      // Si success est false, c'est une erreur
      if (!responseData.success) {
        throw new ApiException(
          responseData.message || "Une erreur s'est produite",
          response.status
        );
      }

      // Retourner les données
      // Si data est undefined, retourner l'objet complet (pour compatibilité)
      return (
        responseData.data !== undefined ? responseData.data : responseData
      ) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Si c'est une erreur d'abort (timeout)
      if (error instanceof Error && error.name === "AbortError") {
        logger.apiError(method, url, "Timeout");
        throw new ApiException(
          "La requête a pris trop de temps. Vérifiez votre connexion internet.",
          408
        );
      }

      // Si c'est déjà une ApiException, la relancer
      if (error instanceof ApiException) {
        throw error;
      }

      // Autre erreur (réseau, etc.)
      logger.apiError(method, url, error);
      throw new ApiException(handleApiError(error), undefined, error);
    }
  }
}

// Export d'une instance singleton
// Toute l'application utilise la même instance, ce qui garantit :
// - Un seul point de configuration
// - Le token est partagé partout
// - Pas de duplication de code
export const apiClient = new ApiClient();

// Charger le token depuis localStorage au démarrage
apiClient.loadTokenFromStorage();
