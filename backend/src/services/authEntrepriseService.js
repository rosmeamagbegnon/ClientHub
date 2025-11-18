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

  // Validation emails
  const emailValidated = validateEmail(email_entreprise);
  if (!emailValidated) {
    throw new ApiError("Email entreprise invalide", 400);
  }

  const emailResponsableValidated = validateEmail(email_responsable);
  if (!emailResponsableValidated) {
    throw new ApiError("Email responsable invalide", 400);
  }

  // Validation RCCM/IFU (format basique)
  if (numero_rccm_ifu.length < 5) {
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
export const registerEntreprise = async (data) => {
  // Valider les données
  validateRegistrationData(data);

  const { nom_entreprise, email_entreprise, numero_rccm_ifu, password } = data;

  // Vérifier si email existe déjà
  const emailAlreadyExists = await entrepriseModel.emailExists(
    email_entreprise
  );
  if (emailAlreadyExists) {
    throw new ApiError("Cet email entreprise est déjà utilisé", 409);
  }

  // Vérifier si RCCM/IFU existe déjà
  const rcmmAlreadyExists = await entrepriseModel.rcmmExists(numero_rccm_ifu);
  if (rcmmAlreadyExists) {
    throw new ApiError("Ce numéro RCCM/IFU est déjà utilisé", 409);
  }

  // Créer l'entreprise en base
  const entreprise = await entrepriseModel.createEntreprise({
    ...data,
    mot_de_passe: password,
  });

  if (!entreprise) {
    throw new ApiError("Erreur lors de la création de l'entreprise", 500);
  }

  // Générer le token JWT
  const token = generateToken({
    userId: entreprise.id,
    email: entreprise.email_entreprise,
    userType: "entreprise_crm", // Distinguer des clients qui sont des entreprises
  });

  return {
    entreprise: {
      id: entreprise.id,
      nom_entreprise: entreprise.nom_entreprise,
      email_entreprise: entreprise.email_entreprise,
      secteur_activite: entreprise.secteur_activite,
      prenom_responsable: entreprise.prenom_responsable,
      nom_responsable: entreprise.nom_responsable,
    },
    token,
  };
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
    entreprise: {
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
