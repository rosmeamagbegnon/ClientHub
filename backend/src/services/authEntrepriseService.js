import * as entrepriseModel from "../models/entrepriseModel.js";
import { generateToken } from "../utils/jwt.js";
import { validateEmail } from "../middleware/validationMiddleware.js";
import { ApiError } from "../utils/responseFormatter.js";

/**
 * ENTREPRISE AUTHENTICATION SERVICE - Business Logic Layer
 *
 * Gère la logique métier pour l'authentification des entreprises CRM.
 * Valide les données, vérifie les règles métier, coordonne le model et les utils.
 *
 * Pattern: MVC - Service (business logic only)
 * Max 300 lignes ✅
 */

// ==================== VALIDATION HELPERS ====================

/**
 * Valide la force du mot de passe
 * Critères: min 8 chars, 1 majuscule, 1 chiffre, 1 symbole
 */
const validatePasswordStrength = (password) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasMinLength || !hasUppercase || !hasDigit || !hasSymbol) {
    throw new ApiError(
      "Mot de passe faible: min 8 caractères, 1 majuscule, 1 chiffre, 1 symbole",
      400
    );
  }
};

/**
 * Valide les données d'inscription d'une entreprise
 */
const validateRegistrationData = (data) => {
  const {
    nom_entreprise,
    secteur_activite,
    taille_entreprise,
    numero_rccm_ifu,
    email_entreprise,
    telephone_entreprise,
    whatsapp_entreprise,
    prenom_responsable,
    nom_responsable,
    email_responsable,
    password,
    confirmPassword,
  } = data;

  // Vérifications obligatoires
  if (
    !nom_entreprise ||
    !secteur_activite ||
    !taille_entreprise ||
    !numero_rccm_ifu ||
    !email_entreprise ||
    !telephone_entreprise ||
    !whatsapp_entreprise ||
    !prenom_responsable ||
    !nom_responsable ||
    !email_responsable ||
    !password ||
    !confirmPassword
  ) {
    throw new ApiError(
      "Tous les champs obligatoires doivent être remplis",
      400
    );
  }

  // Validation et normalisation emails (IMPORTANT : utiliser les emails normalisés partout)
  const emailValidated = validateEmail(email_entreprise);
  if (!emailValidated) {
    throw new ApiError("Email entreprise invalide", 400);
  }
  // Utiliser l'email normalisé (lowercase) pour éviter les doublons avec différentes casses
  data.email_entreprise = emailValidated;

  const emailResponsableValidated = validateEmail(email_responsable);
  if (!emailResponsableValidated) {
    throw new ApiError("Email responsable invalide", 400);
  }
  // Utiliser l'email responsable normalisé
  data.email_responsable = emailResponsableValidated;

  // IMPORTANT : Normaliser le nom d'entreprise (trim + espaces multiples)
  // Cela évite les doublons comme "Test Entreprise" vs "Test Entreprise " (avec espace)
  // ou "Test  Entreprise" (avec espaces multiples)
  if (nom_entreprise && typeof nom_entreprise === "string") {
    data.nom_entreprise = nom_entreprise.trim().replace(/\s+/g, " ");
    if (data.nom_entreprise.length < 2) {
      throw new ApiError("Le nom d'entreprise doit contenir au moins 2 caractères", 400);
    }
  }

  // IMPORTANT : Normaliser le RCCM/IFU (trim + espaces)
  if (numero_rccm_ifu && typeof numero_rccm_ifu === "string") {
    data.numero_rccm_ifu = numero_rccm_ifu.trim();
    if (data.numero_rccm_ifu.length < 5) {
      throw new ApiError("Numéro RCCM/IFU invalide", 400);
    }
  } else {
    throw new ApiError("Numéro RCCM/IFU invalide", 400);
  }

  // Validation mot de passe
  validatePasswordStrength(password);

  // Vérification correspondance mots de passe
  if (password !== confirmPassword) {
    throw new ApiError("Les mots de passe ne correspondent pas", 400);
  }

  // Validation téléphones (format Bénin +229 + 8 chiffres)
  if (
    !telephone_entreprise.startsWith("+229") ||
    telephone_entreprise.length !== 12
  ) {
    throw new ApiError(
      "Téléphone entreprise invalide (format: +229XXXXXXXX)",
      400
    );
  }

  if (
    !whatsapp_entreprise.startsWith("+229") ||
    whatsapp_entreprise.length !== 12
  ) {
    throw new ApiError(
      "WhatsApp entreprise invalide (format: +229XXXXXXXX)",
      400
    );
  }
};

// ==================== REGISTRATION ====================

/**
 * Enregistre une nouvelle entreprise CRM
 * @param {Object} data - Données de l'entreprise
 * @returns {Promise<Object>} { entreprise, token }
 * @throws {ApiError} Si validation échoue
 */
/**
 * CORRECTION EFFECTUÉE :
 * Avant : Pas de vérification de nom_entreprise, pas de transaction, risque de doublons
 * Pourquoi c'était mauvais :
 * - Le nom_entreprise a une contrainte UNIQUE mais n'était pas vérifié
 * - Pas de transaction : si erreur après INSERT, les données restent en base
 * - Race condition possible entre vérifications et insertion
 *
 * Maintenant :
 * - Vérification de nom_entreprise avant insertion
 * - Utilisation d'une transaction pour garantir l'atomicité
 * - Gestion d'erreur améliorée dans le modèle
 */
/**
 * Enregistre une nouvelle entreprise CRM
 * 
 * APPROCHE SIMPLIFIÉE :
 * - Validation des formats uniquement (email, téléphone, etc.)
 * - Pas de vérification préalable d'existence (géré par ON CONFLICT dans le modèle)
 * - Gestion des erreurs PostgreSQL directement dans le catch
 */
export const registerEntreprise = async (data) => {
  // 1. Valider les formats et normaliser les données (emails en lowercase)
  validateRegistrationData(data);

  const { password } = data;

  // 2. Créer l'entreprise directement
  // Le modèle gère les conflits via ON CONFLICT DO NOTHING et les contraintes UNIQUE PostgreSQL
  // IMPORTANT : Aucune vérification préalable - PostgreSQL gère tout de manière atomique
  try {
    const entreprise = await entrepriseModel.createEntreprise({
      ...data,
      mot_de_passe: password,
    });

    // Vérification robuste : entreprise doit exister et avoir un id
    if (!entreprise || !entreprise.id) {
      console.error("❌ Erreur : entreprise créée mais données invalides", {
        entreprise,
        hasId: !!(entreprise && entreprise.id),
      });
      throw new ApiError("Erreur lors de la création de l'entreprise", 500);
    }

    // 3. Générer le token JWT
    const token = generateToken({
      userId: entreprise.id,
      email: entreprise.email_entreprise,
      userType: "entreprise_crm",
    });

    return {
      user: {
        id: entreprise.id,
        nom_entreprise: entreprise.nom_entreprise,
        email_entreprise: entreprise.email_entreprise,
        secteur_activite: entreprise.secteur_activite,
        prenom_responsable: entreprise.prenom_responsable,
        nom_responsable: entreprise.nom_responsable,
      },
      token,
    };
  } catch (error) {
    // IMPORTANT : Si on arrive ici, l'INSERT a ÉCHOUÉ dans le modèle
    // Le compte n'est PAS créé dans la base de données
    
    // Les erreurs de contrainte unique sont déjà transformées en ApiError par le modèle
    // On les relance telles quelles (elles ont déjà le bon message)
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Pour les autres erreurs inattendues, logger et retourner un message générique
    console.error("❌ Erreur inattendue lors de la création d'entreprise:", error);
    throw new ApiError("Erreur lors de la création de l'entreprise", 500);
  }
};

// ==================== LOGIN ====================

/**
 * Authentifie une entreprise par email et mot de passe
 * @param {string} email - Email de l'entreprise
 * @param {string} password - Mot de passe fourni
 * @returns {Promise<Object>} { entreprise, token }
 * @throws {ApiError} Si identifiants invalides
 */
export const loginEntreprise = async (email, password) => {
  if (!email || !password) {
    throw new ApiError("Email et mot de passe requis", 400);
  }

  // Vérifier que l'email est valide
  const emailValidated = validateEmail(email);
  if (!emailValidated) {
    throw new ApiError("Email ou mot de passe incorrect", 401);
  }

  // Chercher l'entreprise par email
  const entreprise = await entrepriseModel.findEntrepriseByEmail(email);
  if (!entreprise) {
    throw new ApiError("Email ou mot de passe incorrect", 401);
  }

  // Vérifier que l'entreprise est active
  if (!entreprise.est_active) {
    throw new ApiError(
      "Compte entreprise désactivé. Contactez le support",
      403
    );
  }

  // Vérifier le mot de passe
  const passwordMatch = await entrepriseModel.verifyPassword(
    password,
    entreprise.mot_de_passe_hash
  );
  if (!passwordMatch) {
    throw new ApiError("Email ou mot de passe incorrect", 401);
  }

  // Mettre à jour le dernier login
  await entrepriseModel.updateLastLogin(entreprise.id);

  // Générer le token
  const token = generateToken({
    userId: entreprise.id,
    email: entreprise.email_entreprise,
    userType: "entreprise_crm", // Distinguer des clients qui sont des entreprises
  });

  return {
    user: {
      id: entreprise.id,
      nom_entreprise: entreprise.nom_entreprise,
      email_entreprise: entreprise.email_entreprise,
      secteur_activite: entreprise.secteur_activite,
      prenom_responsable: entreprise.prenom_responsable,
      nom_responsable: entreprise.nom_responsable,
      est_active: entreprise.est_active,
    },
    token,
  };
};

// ==================== PROFILE ====================

/**
 * Récupère le profil complet d'une entreprise
 * @param {string} id - ID de l'entreprise
 * @returns {Promise<Object>} Profil complet de l'entreprise
 * @throws {ApiError} Si entreprise introuvable
 */
export const getMyProfile = async (id) => {
  const entreprise = await entrepriseModel.findEntrepriseById(id);

  if (!entreprise) {
    throw new ApiError("Entreprise introuvable", 404);
  }

  return {
    id: entreprise.id,
    nom_entreprise: entreprise.nom_entreprise,
    secteur_activite: entreprise.secteur_activite,
    taille_entreprise: entreprise.taille_entreprise,
    numero_rccm_ifu: entreprise.numero_rccm_ifu,
    email_entreprise: entreprise.email_entreprise,
    telephone_entreprise: entreprise.telephone_entreprise,
    whatsapp_entreprise: entreprise.whatsapp_entreprise,
    adresse_professionnelle: entreprise.adresse_professionnelle,
    site_internet: entreprise.site_internet,
    linkedin: entreprise.linkedin,
    prenom_responsable: entreprise.prenom_responsable,
    nom_responsable: entreprise.nom_responsable,
    email_responsable: entreprise.email_responsable,
    est_active: entreprise.est_active,
    date_creation: entreprise.date_creation,
    dernier_login: entreprise.dernier_login,
  };
};

// ==================== UPDATE PROFILE ====================

/**
 * Met à jour le profil d'une entreprise (infos publiques uniquement)
 * @param {string} id - ID de l'entreprise
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} Profil mis à jour
 * @throws {ApiError} Si mise à jour échoue
 */
export const updateProfile = async (id, data) => {
  const allowedUpdates = {
    nom_entreprise: data.nom_entreprise,
    secteur_activite: data.secteur_activite,
    taille_entreprise: data.taille_entreprise,
    telephone_entreprise: data.telephone_entreprise,
    whatsapp_entreprise: data.whatsapp_entreprise,
    adresse_professionnelle: data.adresse_professionnelle,
    site_internet: data.site_internet,
    linkedin: data.linkedin,
  };

  // Nettoyer les champs vides
  Object.keys(allowedUpdates).forEach(
    (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
  );

  if (Object.keys(allowedUpdates).length === 0) {
    return getMyProfile(id);
  }

  const updated = await entrepriseModel.updateEntreprise(id, allowedUpdates);
  if (!updated) {
    throw new ApiError("Erreur lors de la mise à jour du profil", 500);
  }

  return getMyProfile(id);
};

export default {
  registerEntreprise,
  loginEntreprise,
  getMyProfile,
  updateProfile,
};
