import {
  createBonus,
  getBonusById,
  listBonus,
  countBonus,
  updateBonus,
  toggleBonusActif,
  deleteBonus,
  bonusExists,
  isEntrepriseBonusOwner,
  getBonusForClient,
} from "../models/bonusModel.js";

import { ApiError } from "../utils/responseFormatter.js";

/**
 * BONUS SERVICE - Business Logic Layer
 *
 * Gère toutes les validations et la logique métier pour les bonus.
 * Utilise le Model pour accéder à la BD.
 *
 * Pattern: MVC - Service (business logic only)
 */

// ==================== CRÉATION ====================

/**
 * Crée un nouveau bonus (avec validations)
 * @param {Object} bonusData - Données du bonus
 * @returns {Promise<Object>} Bonus créé
 * @throws {ApiError} Si validation échoue
 */
export const createBonusService = async (bonusData) => {
  const {
    entreprise_id,
    titre,
    description,
    valeur,
    appliquer_a = "tous",
    client_id = null,
    type_client_filtre = null,
    secteur_filtre = null,
    taille_filtre = null,
    date_debut,
    date_fin,
    conditions = null,
  } = bonusData;

  // 1. Validations
  validateBonusCreation({
    entreprise_id,
    titre,
    description,
    valeur,
    appliquer_a,
    client_id,
    type_client_filtre,
    secteur_filtre,
    taille_filtre,
    date_debut,
    date_fin,
    conditions,
  });

  try {
    // 2. Créer le bonus
    const bonus = await createBonus({
      entreprise_id,
      titre: titre.trim(),
      description: description ? description.trim() : null,
      valeur,
      appliquer_a,
      client_id,
      type_client_filtre,
      secteur_filtre,
      taille_filtre,
      date_debut,
      date_fin,
      conditions: conditions ? conditions.trim() : null,
    });

    return {
      success: true,
      message: "Bonus créé avec succès",
      bonus,
    };
  } catch (error) {
    if (error.code === "23505") {
      throw new ApiError("Données en doublon", 409);
    } else if (error.code === "23503") {
      throw new ApiError(
        "Référence invalide - entreprise ou client inexistant",
        400
      );
    }
    throw error;
  }
};

// ==================== LECTURE ====================

/**
 * Récupère un bonus par ID (avec vérifications d'accès)
 * @param {string} bonusId - ID du bonus
 * @param {string} userId - ID de l'utilisateur
 * @param {string} userType - Type d'utilisateur ('client' ou 'entreprise')
 * @returns {Promise<Object>} Bonus avec détails
 * @throws {ApiError} Si bonus n'existe pas ou accès non autorisé
 */
export const getBonusService = async (bonusId, userId, userType) => {
  // Vérifier l'existence du bonus
  const bonus = await getBonusById(bonusId);

  if (!bonus) {
    throw new ApiError("Bonus non trouvé", 404);
  }

  // Vérifier les droits d'accès selon le type d'utilisateur
  if (userType === "entreprise") {
    // Une entreprise ne peut voir que ses propres bonus
    const isOwner = await isEntrepriseBonusOwner(userId, bonusId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à ce bonus", 403);
    }
  }
  // Les clients peuvent voir tous les bonus (filtrage fait au niveau de la liste)

  return {
    success: true,
    bonus,
  };
};

/**
 * Liste les bonus avec filtres
 * @param {Object} filters - Filtres
 * @param {number} page - Numéro de page
 * @param {number} limit - Bonus par page
 * @param {string} userType - Type d'utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Bonus et pagination
 */
export const listBonusService = async (
  filters = {},
  page = 1,
  limit = 20,
  userType = "entreprise",
  userId = null
) => {
  // Validation pagination
  if (page < 1 || limit < 1 || limit > 100) {
    throw new ApiError("Paramètres de pagination invalides", 400);
  }

  const offset = (page - 1) * limit;

  // Appliquer des filtres par défaut selon le type d'utilisateur
  const finalFilters = { ...filters };

  if (userType === "entreprise") {
    // Une entreprise ne voit que ses propres bonus
    finalFilters.entreprise_id = userId;
  } else if (userType === "client") {
    // Un client voit les bonus qui lui sont applicables
    finalFilters.client_id = userId;
    finalFilters.only_valid = true; // Seulement les bonus valides
  }

  try {
    // Récupérer les bonus
    const bonus = await listBonus(finalFilters, limit, offset);

    // Compter le total
    const total = await countBonus(finalFilters);

    return {
      success: true,
      bonus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les bonus applicables pour un client
 * @param {string} clientId - ID du client
 * @returns {Promise<Object>} Liste des bonus applicables
 */
export const getBonusForClientService = async (clientId) => {
  // Validation de l'UUID
  if (!isValidUUID(clientId)) {
    throw new ApiError("ID client invalide", 400);
  }

  try {
    const bonus = await getBonusForClient(clientId);

    return {
      success: true,
      bonus,
      count: bonus.length,
    };
  } catch (error) {
    throw error;
  }
};

// ==================== MISE À JOUR ====================

/**
 * Met à jour un bonus
 * @param {string} bonusId - ID du bonus
 * @param {Object} updateData - Données à mettre à jour
 * @param {string} userId - ID de l'utilisateur (entreprise)
 * @returns {Promise<Object>} Bonus mis à jour
 * @throws {ApiError} Si validation échoue
 */
export const updateBonusService = async (bonusId, updateData, userId) => {
  // Validation de l'UUID
  if (!isValidUUID(bonusId)) {
    throw new ApiError("ID bonus invalide", 400);
  }

  if (!isValidUUID(userId)) {
    throw new ApiError("ID utilisateur invalide", 400);
  }

  // Vérifier l'existence
  const exists = await bonusExists(bonusId);
  if (!exists) {
    throw new ApiError("Bonus non trouvé", 404);
  }

  // Vérifier que c'est l'entreprise propriétaire
  const isOwner = await isEntrepriseBonusOwner(userId, bonusId);
  if (!isOwner) {
    throw new ApiError(
      "Seule l'entreprise propriétaire peut modifier ce bonus",
      403
    );
  }

  // Valider les données de mise à jour
  validateBonusUpdate(updateData);

  try {
    const bonus = await updateBonus(bonusId, updateData);

    return {
      success: true,
      message: "Bonus mis à jour avec succès",
      bonus,
    };
  } catch (error) {
    console.error("Erreur service updateBonus:", error);
    throw error;
  }
};

/**
 * Active/désactive un bonus
 * @param {string} bonusId - ID du bonus
 * @param {boolean} estActif - Nouvel état
 * @param {string} userId - ID de l'utilisateur (entreprise)
 * @returns {Promise<Object>} Bonus mis à jour
 * @throws {ApiError} Si validation échoue
 */
export const toggleBonusActifService = async (bonusId, estActif, userId) => {
  // Validation de l'UUID
  if (!isValidUUID(bonusId)) {
    throw new ApiError("ID bonus invalide", 400);
  }

  // Vérifier l'existence
  const exists = await bonusExists(bonusId);
  if (!exists) {
    throw new ApiError("Bonus non trouvé", 404);
  }

  // Vérifier que c'est l'entreprise propriétaire
  const isOwner = await isEntrepriseBonusOwner(userId, bonusId);
  if (!isOwner) {
    throw new ApiError(
      "Seule l'entreprise propriétaire peut modifier ce bonus",
      403
    );
  }

  try {
    const bonus = await toggleBonusActif(bonusId, estActif);

    const statusMessage = estActif ? "activé" : "désactivé";
    return {
      success: true,
      message: `Bonus ${statusMessage} avec succès`,
      bonus,
    };
  } catch (error) {
    console.error("Erreur service toggleBonusActif:", error);
    throw error;
  }
};

// ==================== SUPPRESSION ====================

/**
 * Supprime un bonus
 * @param {string} bonusId - ID du bonus
 * @param {string} userId - ID de l'utilisateur (entreprise)
 * @returns {Promise<Object>} Résultat de la suppression
 * @throws {ApiError} Si validation échoue
 */
export const deleteBonusService = async (bonusId, userId) => {
  // Validation de l'UUID
  if (!isValidUUID(bonusId)) {
    throw new ApiError("ID bonus invalide", 400);
  }

  // Vérifier l'existence
  const exists = await bonusExists(bonusId);
  if (!exists) {
    throw new ApiError("Bonus non trouvé", 404);
  }

  // Vérifier que c'est l'entreprise propriétaire
  const isOwner = await isEntrepriseBonusOwner(userId, bonusId);
  if (!isOwner) {
    throw new ApiError(
      "Seule l'entreprise propriétaire peut supprimer ce bonus",
      403
    );
  }

  try {
    const deleted = await deleteBonus(bonusId);

    if (!deleted) {
      throw new ApiError("Erreur lors de la suppression du bonus", 500);
    }

    return {
      success: true,
      message: "Bonus supprimé avec succès",
    };
  } catch (error) {
    console.error("Erreur service deleteBonus:", error);
    throw error;
  }
};

// ==================== VALIDATIONS ====================

/**
 * Valide les données de création d'un bonus
 * @param {Object} data - Données à valider
 * @throws {ApiError} Si validation échoue
 */
function validateBonusCreation(data) {
  const {
    entreprise_id,
    titre,
    description,
    valeur,
    appliquer_a,
    client_id,
    type_client_filtre,
    secteur_filtre,
    taille_filtre,
    date_debut,
    date_fin,
  } = data;

  // Validation entreprise_id
  if (!isValidUUID(entreprise_id)) {
    throw new ApiError("ID entreprise invalide", 400);
  }

  // Validation titre
  if (!titre || titre.trim().length === 0) {
    throw new ApiError("Le titre du bonus est requis", 400);
  }
  if (titre.length > 255) {
    throw new ApiError("Le titre ne peut pas dépasser 255 caractères", 400);
  }

  // Validation description (optionnelle)
  if (description && description.length > 2000) {
    throw new ApiError(
      "La description ne peut pas dépasser 2000 caractères",
      400
    );
  }

  // Validation valeur
  if (valeur === undefined || valeur === null) {
    throw new ApiError("La valeur du bonus est requise", 400);
  }
  if (typeof valeur !== "number" || valeur <= 0) {
    throw new ApiError("La valeur doit être un nombre positif", 400);
  }

  // Validation appliquer_a
  const validApplicationTypes = ["tous", "specifique", "filtre"];
  if (!validApplicationTypes.includes(appliquer_a)) {
    throw new ApiError(
      `Type d'application invalide. Valides: ${validApplicationTypes.join(
        ", "
      )}`,
      400
    );
  }

  // Validation client_id si appliquer_a = 'specifique'
  if (appliquer_a === "specifique") {
    if (!client_id || !isValidUUID(client_id)) {
      throw new ApiError(
        "Un ID client valide est requis pour un bonus spécifique",
        400
      );
    }
  }

  // Validation des filtres si appliquer_a = 'filtre'
  if (appliquer_a === "filtre") {
    // Au moins un filtre doit être défini
    if (!type_client_filtre && !secteur_filtre && !taille_filtre) {
      throw new ApiError(
        "Au moins un filtre doit être défini pour un bonus par filtre",
        400
      );
    }

    // Validation type_client_filtre
    if (type_client_filtre) {
      const validClientTypes = ["particulier", "entreprise"];
      if (!validClientTypes.includes(type_client_filtre)) {
        throw new ApiError(
          `Type de client invalide. Valides: ${validClientTypes.join(", ")}`,
          400
        );
      }
    }

    // Validation secteur_filtre
    if (secteur_filtre) {
      const validSecteurs = [
        "Technologie",
        "Agriculture",
        "Commerce",
        "Finance",
        "Transport & Logistique",
        "Industrie",
        "Éducation",
        "Santé",
      ];
      if (!validSecteurs.includes(secteur_filtre)) {
        throw new ApiError(
          `Secteur d'activité invalide. Valides: ${validSecteurs.join(", ")}`,
          400
        );
      }
    }

    // Validation taille_filtre
    if (taille_filtre) {
      const validTailles = [
        "1 - 10 employés",
        "11 - 50 employés",
        "51 - 200 employés",
        "201 - 500 employés",
        "500+ employés",
      ];
      if (!validTailles.includes(taille_filtre)) {
        throw new ApiError(
          `Taille d'entreprise invalide. Valides: ${validTailles.join(", ")}`,
          400
        );
      }
    }
  }

  // Validation dates
  if (!date_debut) {
    throw new ApiError("La date de début est requise", 400);
  }
  if (!date_fin) {
    throw new ApiError("La date de fin est requise", 400);
  }

  const startDate = new Date(date_debut);
  const endDate = new Date(date_fin);
  const now = new Date();

  if (isNaN(startDate.getTime())) {
    throw new ApiError("Date de début invalide", 400);
  }
  if (isNaN(endDate.getTime())) {
    throw new ApiError("Date de fin invalide", 400);
  }
  if (endDate <= startDate) {
    throw new ApiError("La date de fin doit être après la date de début", 400);
  }
  if (endDate <= now) {
    throw new ApiError("La date de fin doit être dans le futur", 400);
  }
}

/**
 * Valide les données de mise à jour d'un bonus
 * @param {Object} data - Données à valider
 * @throws {ApiError} Si validation échoue
 */
function validateBonusUpdate(data) {
  const {
    titre,
    description,
    valeur,
    appliquer_a,
    client_id,
    type_client_filtre,
    secteur_filtre,
    taille_filtre,
    date_debut,
    date_fin,
    conditions,
  } = data;

  // Validation titre
  if (titre !== undefined) {
    if (!titre || titre.trim().length === 0) {
      throw new ApiError("Le titre du bonus ne peut pas être vide", 400);
    }
    if (titre.length > 255) {
      throw new ApiError("Le titre ne peut pas dépasser 255 caractères", 400);
    }
  }

  // Validation description
  if (description !== undefined && description.length > 2000) {
    throw new ApiError(
      "La description ne peut pas dépasser 2000 caractères",
      400
    );
  }

  // Validation valeur
  if (valeur !== undefined) {
    if (typeof valeur !== "number" || valeur <= 0) {
      throw new ApiError("La valeur doit être un nombre positif", 400);
    }
  }

  // Validation appliquer_a
  if (appliquer_a !== undefined) {
    const validApplicationTypes = ["tous", "specifique", "filtre"];
    if (!validApplicationTypes.includes(appliquer_a)) {
      throw new ApiError(
        `Type d'application invalide. Valides: ${validApplicationTypes.join(
          ", "
        )}`,
        400
      );
    }
  }

  // Validation dates
  if (date_debut !== undefined || date_fin !== undefined) {
    const startDate = date_debut ? new Date(date_debut) : null;
    const endDate = date_fin ? new Date(date_fin) : null;
    const now = new Date();

    if (date_debut && isNaN(startDate.getTime())) {
      throw new ApiError("Date de début invalide", 400);
    }
    if (date_fin && isNaN(endDate.getTime())) {
      throw new ApiError("Date de fin invalide", 400);
    }
    if (startDate && endDate && endDate <= startDate) {
      throw new ApiError(
        "La date de fin doit être après la date de début",
        400
      );
    }
    if (endDate && endDate <= now) {
      throw new ApiError("La date de fin doit être dans le futur", 400);
    }
  }

  // Validation conditions
  if (conditions !== undefined && conditions.length > 1000) {
    throw new ApiError(
      "Les conditions ne peuvent pas dépasser 1000 caractères",
      400
    );
  }
}

/**
 * Valide si une chaîne est un UUID valide
 * @param {string} uuid - UUID à valider
 * @returns {boolean}
 */
function isValidUUID(uuid) {
  if (!uuid) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
