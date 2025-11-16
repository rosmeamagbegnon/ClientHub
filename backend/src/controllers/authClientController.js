/**
 * Contrôleur d'Authentification Clients
 *
 * Gère les requêtes HTTP pour :
 * - Inscription particulier
 * - Inscription entreprise
 * - Connexion
 * - Récupération du profil
 *
 * Valide les inputs, appelle le service, et formate les réponses.
 */

import * as authClientService from "../services/authClientService.js";
import { successResponse } from "../utils/responseFormatter.js";
import { ApiError } from "../middleware/errorMiddleware.js";

/**
 * POST /api/auth/clients/register/particulier
 * Inscription d'un client particulier
 *
 * Body requis:
 * - prenom, nom, email, telephone
 * - password, confirmPassword
 * - canal_contact (optional)
 */
export const registerParticulierController = async (req, res) => {
  try {
    const {
      prenom,
      nom,
      email,
      telephone,
      password,
      confirmPassword,
      canal_contact,
    } = req.body;

    // Validation basique des champs requis
    if (
      !prenom ||
      !nom ||
      !email ||
      !telephone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs requis doivent être remplis",
        required: [
          "prenom",
          "nom",
          "email",
          "telephone",
          "password",
          "confirmPassword",
        ],
      });
    }

    const result = await authClientService.registerParticulier({
      prenom,
      nom,
      email,
      telephone,
      canal_contact,
      password,
      confirmPassword,
    });

    return res.status(201).json(successResponse(result, "Inscription réussie"));
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("❌ Erreur inscription particulier:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
    });
  }
};

/**
 * POST /api/auth/clients/register/entreprise
 * Inscription d'une entreprise
 *
 * Body requis:
 * - Infos responsable: prenom, nom, email, telephone, password, confirmPassword
 * - Infos entreprise: nom_entreprise, secteur_activite, taille_entreprise,
 *   poste_occupe, numero_rccm, adresse_physique, email_professionnel,
 *   telephone_entreprise, site_internet, linkedin (optionnel)
 */
export const registerEntrepriseController = async (req, res) => {
  try {
    const data = req.body;

    // Validation des champs requis
    const requiredFields = [
      "prenom",
      "nom",
      "email",
      "password",
      "confirmPassword",
      "nom_entreprise",
      "secteur_activite",
      "taille_entreprise",
      "numero_rccm",
    ];

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Champs manquants",
        missing: missingFields,
      });
    }

    const result = await authClientService.registerEntreprise(data);

    return res
      .status(201)
      .json(successResponse(result, "Inscription entreprise réussie"));
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("❌ Erreur inscription entreprise:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
    });
  }
};

/**
 * POST /api/auth/clients/login
 * Connexion d'un client
 *
 * Body:
 * - email: Email du client
 * - password: Mot de passe
 */
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
      });
    }

    const result = await authClientService.loginClient(email, password);

    return res.status(200).json(successResponse(result, "Connexion réussie"));
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("❌ Erreur connexion:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
    });
  }
};

/**
 * GET /api/auth/clients/me
 * Récupère les infos du client actuellement connecté
 *
 * Authentification requise (JWT dans Authorization header)
 */
export const getProfileController = async (req, res) => {
  try {
    // req.user est défini par le middleware d'authentification
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      });
    }

    const client = await authClientService.getMyProfile(req.user.userId);

    return res.status(200).json(successResponse(client, "Profil récupéré"));
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("❌ Erreur récupération profil:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
    });
  }
};
