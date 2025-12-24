/**
 * Middleware de Sécurité - Rate Limiting
 *
 * Rate Limiting restreint le nombre de requêtes par IP et par intervalle de temps.
 *
 * Utilité:
 * - Prévient les attaques par brute force (tentatives de mot de passe)
 * - Protège du spam et des attaques DDoS
 * - Limite l'utilisation abusive de l'API
 */

import rateLimit from "express-rate-limit";
import config from "../config/config.js";

/**
 * Rate Limiter général pour toutes les routes
 * Limite: 100 requêtes par 15 minutes (configurable en .env)
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: "❌ Trop de requêtes, réessayez plus tard",
  standardHeaders: true, // Retourne le taux limite en en-têtes
  legacyHeaders: false, // Désactiver les en-têtes X-RateLimit-*
  skip: (req) => {
    // Ne pas limiter les requêtes des admins (optionnel)
    return false;
  },
});

/**
 * Rate Limiter strict pour l'authentification
 * Limite: 5 tentatives par 15 minutes (protection brute force)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 5 tentatives max
  message: "❌ Trop de tentatives de connexion, réessayez dans 15 minutes",
  skipSuccessfulRequests: true, // Réinitialise si succès
});

/**
 * Rate Limiter très strict pour les formulaires sensibles
 * Limite: 3 requêtes par heure
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 50, // 3 requêtes max
  message: "❌ Limite atteinte, réessayez plus tard",
  skipSuccessfulRequests: false,
});
