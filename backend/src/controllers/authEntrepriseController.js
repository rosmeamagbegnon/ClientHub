import * as authEntrepriseService from "../services/authEntrepriseService.js";
import {
  successResponse,
  errorResponse,
  ApiError,
} from "../utils/responseFormatter.js";

/**
 * 📡 ENTREPRISE AUTHENTICATION CONTROLLER - HTTP Layer
 *
 * Gère les requêtes HTTP pour l'authentification des entreprises.
 * Récupère les requêtes, appelle les services, formate les réponses.
 *
 * Pattern: MVC - Controller (HTTP handling only)
 * Max 300 lignes ✅
 */

// ==================== REGISTRATION ====================

/**
 * Endpoint: POST /api/auth/entreprises/register
 * Enregistre une nouvelle entreprise CRM
 */
export const registerEntrepriseController = async (req, res) => {
  try {
    const {
      nom_entreprise,
      secteur_activite,
      taille_entreprise,
      numero_rccm_ifu,
      email_entreprise,
      telephone_entreprise,
      whatsapp_entreprise,
      adresse_professionnelle,
      site_internet,
      linkedin,
      prenom_responsable,
      nom_responsable,
      email_responsable,
      password,
      confirmPassword,
    } = req.body;

    // Appeler le service
    const result = await authEntrepriseService.registerEntreprise({
      nom_entreprise,
      secteur_activite,
      taille_entreprise,
      numero_rccm_ifu,
      email_entreprise,
      telephone_entreprise,
      whatsapp_entreprise,
      adresse_professionnelle,
      site_internet,
      linkedin,
      prenom_responsable,
      nom_responsable,
      email_responsable,
      password,
      confirmPassword,
    });

    return res
      .status(201)
      .json(successResponse(result, "Inscription entreprise réussie"));
  } catch (error) {
    console.error("❌ Erreur registerEntrepriseController:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(errorResponse(error.message));
    }

    return res.status(500).json(errorResponse("Erreur interne du serveur"));
  }
};

// ==================== LOGIN ====================

/**
 * Endpoint: POST /api/auth/entreprises/login
 * Authentifie une entreprise par email et mot de passe
 */
export const loginEntrepriseController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(errorResponse("Email et mot de passe requis"));
    }

    // Appeler le service
    const result = await authEntrepriseService.loginEntreprise(email, password);

    return res.status(200).json(successResponse(result, "Connexion réussie"));
  } catch (error) {
    console.error("❌ Erreur loginEntrepriseController:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(errorResponse(error.message));
    }

    return res.status(500).json(errorResponse("Erreur interne du serveur"));
  }
};

// ==================== PROFILE ====================

/**
 * Endpoint: GET /api/auth/entreprises/me
 * Récupère le profil de l'entreprise connectée
 * Protégé: Authentification JWT requise
 */
export const getProfileEntrepriseController = async (req, res) => {
  try {
    const entrepriseId = req.user.userId; // Du middleware authMiddleware

    if (!entrepriseId) {
      return res.status(401).json(errorResponse("Authentification requise"));
    }

    // Appeler le service
    const profil = await authEntrepriseService.getMyProfile(entrepriseId);

    return res.status(200).json(successResponse(profil, "Profil récupéré"));
  } catch (error) {
    console.error("❌ Erreur getProfileEntrepriseController:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(errorResponse(error.message));
    }

    return res.status(500).json(errorResponse("Erreur interne du serveur"));
  }
};

// ==================== UPDATE PROFILE ====================

/**
 * Endpoint: PATCH /api/auth/entreprises/profile
 * Met à jour le profil de l'entreprise (infos publiques uniquement)
 * Protégé: Authentification JWT requise
 */
export const updateProfileEntrepriseController = async (req, res) => {
  try {
    const entrepriseId = req.user.userId;

    if (!entrepriseId) {
      return res.status(401).json(errorResponse("Authentification requise"));
    }

    // Appeler le service
    const profilMisAJour = await authEntrepriseService.updateProfile(
      entrepriseId,
      req.body
    );

    return res
      .status(200)
      .json(successResponse(profilMisAJour, "Profil mis à jour"));
  } catch (error) {
    console.error("❌ Erreur updateProfileEntrepriseController:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(errorResponse(error.message));
    }

    return res.status(500).json(errorResponse("Erreur interne du serveur"));
  }
};

export default {
  registerEntrepriseController,
  loginEntrepriseController,
  getProfileEntrepriseController,
  updateProfileEntrepriseController,
};
