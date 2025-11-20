/**
 * Utilitaires JWT - Authentification et Autorisation
 *
 * Gère la création et la vérification des tokens JWT
 * JWT (JSON Web Token) : Token signé contenant les données utilisateur
 */

import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { ApiError } from "../middleware/errorMiddleware.js";

/**
 * Génère un JWT pour un utilisateur
 *
 * @param {Object} payload - Données à encoder (userId, type, etc.)
 * @returns {string} Token JWT signé
 */
export const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expire,
    });
    return token;
  } catch (error) {
    throw new ApiError(500, "Erreur génération JWT");
  }
};

/**
 * Vérifie et décrypte un JWT
 *
 * @param {string} token - Token JWT à vérifier
 * @returns {Object} Payload décrypté
 * @throws {ApiError} Si le token est invalide/expiré
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expiré");
    }
    throw new ApiError(401, "Token invalide");
  }
};

/**
 * Crée un token avec refresh pattern (optionnel)
 * Format: { accessToken: '...', refreshToken: '...' }
 */
export const generateTokenPair = (payload) => {
  const accessToken = generateToken({
    ...payload,
    type: "access",
  });

  // Refresh token valable plus longtemps (optionnel - pas implémenté ici)
  const refreshToken = generateToken({
    ...payload,
    type: "refresh",
  });

  return { accessToken, refreshToken };
};

/**
 * Extrait le token du header Authorization
 * Format attendu: "Bearer <token>"
 *
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token ou null si absent/invalide
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7); // Enlève "Bearer "
};
