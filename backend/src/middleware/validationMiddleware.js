/**
 * Middleware de Sécurité - Validation des inputs
 *
 * Nettoie et valide tous les inputs utilisateurs pour prévenir:
 * - Les injections SQL (paramétrées par pg)
 * - Les XSS (injection de scripts)
 * - Les données corrompues ou malveillantes
 */

import validator from "validator";

/**
 * Valide et nettoie les adresses email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") return null;

  const cleaned = validator.trim(email.toLowerCase());

  if (validator.isEmail(cleaned)) {
    return cleaned;
  }

  return null;
};

/**
 * Valide et nettoie les mots de passe
 * Critères: Min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== "string") return false;

  const isStrong = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  return isStrong;
};

/**
 * Valide et nettoie les noms
 * Accepte: lettres, espaces, traits d'union, apostrophes
 */
export const validateName = (name) => {
  if (!name || typeof name !== "string") return null;

  const cleaned = validator.trim(name);

  // Accepte lettres, espaces, traits d'union, apostrophes
  if (/^[a-zA-ZÀ-ÿ\s'-]{2,100}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
};

/**
 * Valide et nettoie les numéros de téléphone
 * Format: +229, 20, 22, 96, 97, 98 (Bénin)
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== "string") return null;

  // Enlever les espaces et tirets
  const cleaned = validator.trim(phone).replace(/[\s-]/g, "");

  // Format valide pour Bénin: +229XXXXXXXX ou 20/22/96/97/98XXXXXXXX
  if (/^(\+229|229|20|22|96|97|98)\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
};

/**
 * Valide et nettoie les URLs
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  try {
    if (validator.isURL(url)) {
      return url;
    }
  } catch (e) {
    return null;
  }

  return null;
};

/**
 * Nettoie les chaînes de caractères pour éviter les injections
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== "string") return "";

  return validator.escape(validator.trim(str));
};

/**
 * Middleware Express pour valider les inputs
 * À utiliser sur les routes sensibles
 */
export const validateInputsMiddleware = (req, res, next) => {
  try {
    // Nettoie le corps de la requête
    if (req.body) {
      Object.keys(req.body).forEach((key) => {
        if (typeof req.body[key] === "string") {
          req.body[key] = validator.trim(req.body[key]);
        }
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Erreur de validation des données",
    });
  }
};
