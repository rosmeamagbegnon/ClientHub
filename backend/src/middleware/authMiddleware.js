/**
 * Middleware d'Authentification
 *
 * Vérifie que l'utilisateur est connecté et possède les bons rôles/permissions.
 * À placer avant les contrôleurs qui nécessitent une authentification.
 */

import { verifyToken, extractTokenFromHeader } from "../utils/jwt.js";
import { ApiError } from "./errorMiddleware.js";

/**
 * Middleware pour vérifier l'authentification
 * Extrait et valide le JWT du header Authorization
 *
 * @param {string} allowedTypes - Types d'utilisateurs autorisés ('client', 'entreprise', 'admin')
 */
export const authenticateMiddleware = (allowedTypes = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "❌ Token manquant - Authentification requise",
        });
      }

      // Vérifie le token
      const decoded = verifyToken(token);

      // Vérifie le type d'utilisateur si spécifié
      if (allowedTypes.length > 0 && !allowedTypes.includes(decoded.userType)) {
        return res.status(403).json({
          success: false,
          message: "❌ Accès refusé - Type d'utilisateur non autorisé",
        });
      }

      // Ajoute les données utilisateur à la requête
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(401).json({
        success: false,
        message: "❌ Authentification échouée",
      });
    }
  };
};

/**
 * Middleware pour les routes optionnellement authentifiées
 * Ne lève pas d'erreur si pas de token, mais peuple req.user si présent
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      req.user = verifyToken(token);
    }

    next();
  } catch (error) {
    // Ignore les erreurs et continue
    next();
  }
};

/**
 * Middleware pour vérifier les permissions spécifiques
 * Exemples: créer des tickets, modifier un client, etc.
 */
export const authorizeMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      });
    }

    // Exemple simple - peut être étendu avec une DB de permissions
    if (
      req.user.permissions &&
      !req.user.permissions.includes(requiredPermission)
    ) {
      return res.status(403).json({
        success: false,
        message: "Permission refusée",
      });
    }

    next();
  };
};
