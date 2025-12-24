/**
 * Gestionnaire d'erreurs centralisé
 *
 * PROBLÈME RÉSOLU :
 * Avant : Chaque composant gérait les erreurs différemment
 * Pourquoi c'était mauvais :
 * - Code dupliqué
 * - Messages d'erreur incohérents
 * - Pas de gestion des codes HTTP spécifiques
 * - Expérience utilisateur médiocre
 *
 * SOLUTION :
 * Gestionnaire centralisé qui :
 * - Transforme les codes HTTP en messages utilisateur compréhensibles
 * - Log les erreurs pour le débogage
 * - Fournit des messages d'erreur cohérents
 * - Gère les erreurs réseau, timeout, etc.
 */

import type { ApiError } from "@/types/api.types";
import { logger } from "./logger";

/**
 * Erreur personnalisée pour les erreurs API
 */
export class ApiException extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = "ApiException";
    Object.setPrototypeOf(this, ApiException.prototype);
  }
}

/**
 * Messages d'erreur utilisateur-friendly par code HTTP
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: "Les données envoyées sont invalides. Veuillez vérifier vos informations.",
  401: "Votre session a expiré. Veuillez vous reconnecter.",
  403: "Vous n'avez pas les permissions nécessaires pour effectuer cette action.",
  404: "La ressource demandée n'a pas été trouvée.",
  409: "Cette ressource existe déjà (email, RCCM, etc.).",
  422: "Les données envoyées ne respectent pas les règles de validation.",
  429: "Trop de requêtes. Veuillez patienter quelques instants.",
  500: "Une erreur serveur s'est produite. Veuillez réessayer plus tard.",
  502: "Le serveur est temporairement indisponible. Veuillez réessayer plus tard.",
  503: "Le service est temporairement indisponible. Veuillez réessayer plus tard.",
};

/**
 * Messages d'erreur pour les erreurs réseau
 */
const NETWORK_ERROR_MESSAGES = {
  TIMEOUT:
    "La requête a pris trop de temps. Vérifiez votre connexion internet.",
  NETWORK:
    "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
  ABORTED: "La requête a été annulée.",
  UNKNOWN: "Une erreur inattendue s'est produite.",
};

/**
 * Traite une erreur et retourne un message utilisateur-friendly
 *
 * @param error - L'erreur à traiter (peut être Error, Response, ou autre)
 * @param defaultMessage - Message par défaut si l'erreur ne peut pas être identifiée
 * @returns Message d'erreur compréhensible pour l'utilisateur
 */
export function handleApiError(error: any, defaultMessage?: string): string {
  logger.error("API Error", error);

  // Si c'est déjà une ApiException, retourner son message
  if (error instanceof ApiException) {
    return error.message;
  }

  // Si c'est une Response HTTP
  if (error instanceof Response) {
    const statusCode = error.status;
    const message =
      ERROR_MESSAGES[statusCode] ||
      defaultMessage ||
      "Une erreur s'est produite.";

    // Log l'erreur avec le code de statut
    logger.error(`HTTP ${statusCode}`, { url: error.url });

    return message;
  }

  // Si c'est une erreur réseau
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return NETWORK_ERROR_MESSAGES.NETWORK;
  }

  // Si c'est une erreur de timeout
  if (error?.name === "AbortError" || error?.message?.includes("timeout")) {
    return NETWORK_ERROR_MESSAGES.TIMEOUT;
  }

  // Si l'erreur a un message
  if (error?.message) {
    // Si c'est un message d'erreur du backend
    if (typeof error.message === "string") {
      return error.message;
    }
  }

  // Message par défaut
  return defaultMessage || NETWORK_ERROR_MESSAGES.UNKNOWN;
}

/**
 * Extrait le message d'erreur d'une réponse API
 *
 * Le backend retourne généralement : { success: false, message: "...", error: "..." }
 */
export async function extractApiErrorMessage(
  response: Response
): Promise<string> {
  try {
    const data: ApiError = await response.json();

    // Priorité : message > error > message par défaut
    return (
      data.message ||
      data.error ||
      ERROR_MESSAGES[response.status] ||
      "Une erreur s'est produite."
    );
  } catch {
    // Si le JSON ne peut pas être parsé, utiliser le message par code HTTP
    return ERROR_MESSAGES[response.status] || "Une erreur s'est produite.";
  }
}

/**
 * Vérifie si une erreur est une erreur d'authentification (401)
 */
export function isAuthError(error: any): boolean {
  if (error instanceof Response) {
    return error.status === 401;
  }
  if (error instanceof ApiException) {
    return error.statusCode === 401;
  }
  return false;
}

/**
 * Vérifie si une erreur est une erreur de validation (400, 422)
 */
export function isValidationError(error: any): boolean {
  if (error instanceof Response) {
    return error.status === 400 || error.status === 422;
  }
  if (error instanceof ApiException) {
    return error.statusCode === 400 || error.statusCode === 422;
  }
  return false;
}
