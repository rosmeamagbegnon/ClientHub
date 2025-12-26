/**
 * Configuration centralisée de l'API
 *
 * PROBLÈME RÉSOLU :
 * Avant : Les URLs API étaient hardcodées dans chaque composant (ex: "http://localhost:3000/api/...")
 * Pourquoi c'était mauvais :
 * - Impossible de changer l'URL selon l'environnement (dev/prod)
 * - Duplication de code
 * - Risque d'erreurs de frappe
 * - Difficile à maintenir
 *
 * SOLUTION :
 * Configuration centralisée avec variables d'environnement
 * - Un seul endroit pour changer l'URL
 * - Support multi-environnements (dev, staging, prod)
 * - Type-safe avec TypeScript
 */

/**
 * Configuration de l'API
 * Utilise les variables d'environnement Vite (préfixe VITE_)
 */
export const API_CONFIG = {
  /**
   * URL de base de l'API backend
   * Par défaut : http://localhost:3000 (développement local)
   * En production : définir VITE_API_URL dans .env
   */
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",

  /**
   * Préfixe de toutes les routes API
   */
  API_PREFIX: "/api",

  /**
   * Timeout par défaut pour les requêtes (en millisecondes)
   */
  TIMEOUT: 30000, // 30 secondes

  /**
   * Nom de la clé dans localStorage pour le token JWT
   */
  TOKEN_STORAGE_KEY: "ticketsmaster_token",

  /**
   * Nom de la clé dans localStorage pour les données utilisateur
   */
  USER_STORAGE_KEY: "ticketsmaster_user",
} as const;

/**
 * Construit l'URL complète d'un endpoint API
 *
 * @example
 * buildApiUrl("/auth/clients/login")
 * // => "http://localhost:3000/api/auth/clients/login"
 */
export function buildApiUrl(endpoint: string): string {
  // Enlève le slash initial s'il existe pour éviter les doubles slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/${cleanEndpoint}`;
}

/**
 * Endpoints API centralisés
 * Tous les endpoints sont définis ici pour éviter les erreurs de frappe
 */
export const API_ENDPOINTS = {
  // Authentification clients
  AUTH: {
    CLIENT: {
      LOGIN: "/auth/clients/login",
      REGISTER_PARTICULIER: "/auth/clients/register/particulier",
      REGISTER_ENTREPRISE: "/auth/clients/register/entreprise",
      ME: "/auth/clients/me",
    },
    // Authentification entreprises CRM
    ENTREPRISE: {
      LOGIN: "/auth/entreprises/login",
      REGISTER: "/auth/entreprises/register",
      ME: "/auth/entreprises/me",
      PROFILE: "/auth/entreprises/profile",
    },
  },
  // Tickets
  TICKETS: {
    BASE: "/tickets",
    BY_ID: (id: string) => `/tickets/${id}`,
    STATUS: (id: string) => `/tickets/${id}/status`,
    NOTES: (id: string) => `/tickets/${id}/notes`,
  },
  // Commandes
  COMMANDES: {
    BASE: "/commandes",
    BY_ID: (id: string) => `/commandes/${id}`,
  },
  // Bonus
  BONUS: {
    BASE: "/bonus",
  },
  // Dashboard
  DASHBOARD: {
    BASE: "/dashboard",
    OVERVIEW: "/dashboard/overview",
    TRENDS: "/dashboard/trends",
    QUICK_STATS: "/dashboard/quick-stats",
  },
  // Chatbot
  CHATBOT: {
    SESSIONS: "/chatbot/sessions",
    SESSION_BY_ID: (id: string) => `/chatbot/sessions/${id}`,
    MESSAGES: (id: string) => `/chatbot/sessions/${id}/messages`,
  },
  // Clients (pour les entreprises)
  CLIENTS: {
    BASE: "/dashboard/top-clients",
  },
} as const;
