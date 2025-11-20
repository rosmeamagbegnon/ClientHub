/**
 * Service d'Authentification Clients
 *
 * Logique métier centralisée pour :
 * - Inscription (particuliers et entreprises)
 * - Connexion
 * - Génération de tokens JWT
 *
 * Séparation des préoccupations: Le service contient la logique,
 * le contrôleur gère les requêtes HTTP.
 */

import * as clientModel from "../models/clientModel.js";
import { generateToken } from "../utils/jwt.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhoneNumber,
} from "../middleware/validationMiddleware.js";

/**
 * Inscription d'un nouveau client (particulier)
 *
 * @param {Object} data - Données d'inscription
 * @returns {Object} Client créé + token JWT
 */
export const registerParticulier = async (data) => {
  const {
    prenom,
    nom,
    email,
    telephone,
    canal_contact,
    password,
    confirmPassword,
  } = data;

  // ===== VALIDATIONS =====

  // Email valide?
  const emailValidated = validateEmail(email);
  if (!emailValidated) {
    throw new ApiError(400, "Email invalide");
  }

  // Email déjà utilisé?
  const emailAlreadyExists = await clientModel.emailExists(emailValidated);
  if (emailAlreadyExists) {
    throw new ApiError(409, "Cet email est déjà utilisé");
  }

  // Prenom et nom valides?
  const prenomValidated = validateName(prenom);
  const nomValidated = validateName(nom);
  if (!prenomValidated || !nomValidated) {
    throw new ApiError(400, "Prenom et nom invalides");
  }

  // Numéro de téléphone valide?
  const telephoneValidated = validatePhoneNumber(telephone);
  if (!telephoneValidated) {
    throw new ApiError(400, "Numéro de téléphone invalide");
  }

  // Mot de passe valide et confirmé?
  if (password !== confirmPassword) {
    throw new ApiError(400, "Les mots de passe ne correspondent pas");
  }

  if (!validatePassword(password)) {
    throw new ApiError(
      400,
      "Mot de passe faible: min 8 caractères, 1 majuscule, 1 chiffre, 1 symbole"
    );
  }

  // ===== CRÉER LE CLIENT =====

  try {
    const client = await clientModel.createClient({
      prenom: prenomValidated,
      nom: nomValidated,
      email: emailValidated,
      telephone: telephoneValidated,
      canal_contact: canal_contact || "email",
      mot_de_passe: password,
      type_client: "particulier",
    });

    // Génère un JWT
    const token = generateToken({
      userId: client.id,
      email: client.email,
      userType: "particulier",
      prenom: client.prenom,
      nom: client.nom,
    });

    return {
      client: {
        id: client.id,
        prenom: client.prenom,
        nom: client.nom,
        email: client.email,
        type_client: client.type_client,
      },
      token,
      message: "Inscription réussie",
    };
  } catch (error) {
    if (error.code === "23505") {
      // Violation de contrainte unique
      throw new ApiError(409, "Email déjà utilisé");
    }
    throw error;
  }
};

/**
 * Inscription d'une entreprise
 *
 * @param {Object} data - Données d'inscription
 * @returns {Object} Client entreprise créé + token JWT
 */
export const registerEntreprise = async (data) => {
  const {
    prenom,
    nom,
    email,
    telephone,
    password,
    confirmPassword,
    nom_entreprise,
    secteur_activite,
    taille_entreprise,
    poste_occupe,
    numero_rccm,
    adresse_physique,
    email_professionnel,
    telephone_entreprise,
    site_internet,
    linkedin,
  } = data;

  // ===== VALIDATIONS =====

  // Infos responsable
  const prenomValidated = validateName(prenom);
  const nomValidated = validateName(nom);
  if (!prenomValidated || !nomValidated) {
    throw new ApiError(400, "Prenom et nom du responsable invalides");
  }

  const emailValidated = validateEmail(email);
  if (!emailValidated) {
    throw new ApiError(400, "Email invalide");
  }

  if (await clientModel.emailExists(emailValidated)) {
    throw new ApiError(409, "Cet email est déjà utilisé");
  }

  // Infos entreprise
  if (!nom_entreprise || nom_entreprise.trim().length < 2) {
    throw new ApiError(400, "Nom entreprise requis");
  }

  if (!secteur_activite || secteur_activite.trim().length === 0) {
    throw new ApiError(400, "Secteur d'activité requis");
  }

  if (!taille_entreprise || taille_entreprise.trim().length === 0) {
    throw new ApiError(400, "Taille entreprise requise");
  }

  if (!numero_rccm || numero_rccm.trim().length < 3) {
    throw new ApiError(400, "Numéro RCCM/IFU invalide");
  }

  if (await clientModel.rcmExists(numero_rccm)) {
    throw new ApiError(409, "Ce numéro RCCM est déjà utilisé");
  }

  // Mot de passe
  if (password !== confirmPassword) {
    throw new ApiError(400, "Les mots de passe ne correspondent pas");
  }

  if (!validatePassword(password)) {
    throw new ApiError(400, "Mot de passe faible");
  }

  // ===== CRÉER LE CLIENT ENTREPRISE =====

  try {
    const client = await clientModel.createClient({
      prenom: prenomValidated,
      nom: nomValidated,
      email: emailValidated,
      telephone: telephone || null,
      canal_contact: "email",
      mot_de_passe: password,
      type_client: "entreprise",
      nom_entreprise,
      secteur_activite,
      taille_entreprise,
      poste_occupe,
      numero_rccm,
      adresse_physique,
      email_professionnel: email_professionnel || null,
      telephone_entreprise: telephone_entreprise || null,
      site_internet: site_internet || null,
      linkedin: linkedin || null,
    });

    const token = generateToken({
      userId: client.id,
      email: client.email,
      userType: "entreprise",
      nom_entreprise,
      prenom: client.prenom,
      nom: client.nom,
    });

    return {
      client: {
        id: client.id,
        prenom: client.prenom,
        nom: client.nom,
        email: client.email,
        type_client: client.type_client,
        nom_entreprise,
      },
      token,
      message: "Inscription entreprise réussie",
    };
  } catch (error) {
    if (error.code === "23505") {
      throw new ApiError(409, "Email ou RCCM déjà utilisé");
    }
    throw error;
  }
};

/**
 * Connexion d'un client
 *
 * @param {string} email - Email du client
 * @param {string} password - Mot de passe en clair
 * @returns {Object} Client + token JWT
 */
export const loginClient = async (email, password) => {
  // ===== VALIDATIONS =====

  const emailValidated = validateEmail(email);
  if (!emailValidated) {
    throw new ApiError(400, "Email invalide");
  }

  if (!password || password.trim().length === 0) {
    throw new ApiError(400, "Mot de passe requis");
  }

  // ===== VÉRIFICATION IDENTIFIANTS =====

  const client = await clientModel.findClientByEmail(emailValidated);

  if (!client) {
    // Sécurité: Ne pas révéler si l'email existe
    throw new ApiError(401, "Email ou mot de passe incorrect");
  }

  if (!client.est_actif) {
    throw new ApiError(403, "Compte désactivé. Contactez le support");
  }

  // Vérifie le mot de passe
  const passwordValid = await clientModel.verifyPassword(
    password,
    client.mot_de_passe_hash
  );
  if (!passwordValid) {
    throw new ApiError(401, "Email ou mot de passe incorrect");
  }

  // ===== MISE À JOUR DERNIER LOGIN =====

  await clientModel.updateLastLogin(client.id);

  // ===== GÉNÈRE LE TOKEN =====

  const token = generateToken({
    userId: client.id,
    email: client.email,
    userType: client.type_client,
    prenom: client.prenom,
    nom: client.nom,
    nom_entreprise: client.nom_entreprise || null,
  });

  return {
    client: {
      id: client.id,
      prenom: client.prenom,
      nom: client.nom,
      email: client.email,
      type_client: client.type_client,
      nom_entreprise: client.nom_entreprise,
    },
    token,
    message: "Connexion réussie",
  };
};

/**
 * Récupère les infos du client actuellement connecté
 *
 * @param {string} clientId - ID du client (depuis le JWT)
 * @returns {Object} Infos du client
 */
export const getMyProfile = async (clientId) => {
  const client = await clientModel.findClientById(clientId);

  if (!client) {
    throw new ApiError(404, "Client non trouvé");
  }

  return client;
};
