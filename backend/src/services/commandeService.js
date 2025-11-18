import {
  createCommande,
  getCommandeById,
  listCommandes,
  countCommandes,
  updateCommandeStatus,
  updateCommandeEtape,
  updateCoutFinal,
  updateCommande,
  addNoteCommande,
  getNotesByCommande,
  commandeExists,
  isClientCommandeOwner,
  isEntrepriseCommandeOwner,
} from "../models/commandeModel.js";

import { ApiError } from "../utils/responseFormatter.js";

/**
 * 🛒 COMMANDE SERVICE - Business Logic Layer
 *
 * Gère toutes les validations et la logique métier pour les commandes.
 * Utilise le Model pour accéder à la BD.
 *
 * Pattern: MVC - Service (business logic only)
 */

// ==================== CRÉATION ====================

/**
 * Crée une nouvelle commande (avec validations)
 * @param {Object} commandeData - Données de la commande
 * @returns {Promise<Object>} Commande créée
 * @throws {ApiError} Si validation échoue
 */
export const createCommandeService = async (commandeData) => {
  const {
    client_id,
    entreprise_id,
    titre,
    description,
    cout_estime,
    ticket_id,
  } = commandeData;

  // 1. Validations
  validateCommandeCreation({
    titre,
    description,
    cout_estime,
    client_id,
    entreprise_id,
    ticket_id,
  });

  try {
    // 2. Créer la commande
    const commande = await createCommande({
      client_id,
      entreprise_id,
      titre: titre.trim(),
      description: description.trim(),
      cout_estime,
      ticket_id,
    });

    return {
      success: true,
      message: "Commande créée avec succès",
      commande,
    };
  } catch (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new ApiError("Données en doublon", 409);
    }
    throw error;
  }
};

// ==================== LECTURE ====================

/**
 * Récupère une commande par ID (avec vérifications d'accès)
 * @param {string} commandeId - ID de la commande
 * @param {string} userId - ID de l'utilisateur (client ou entreprise)
 * @param {string} userType - Type d'utilisateur ('client' ou 'entreprise')
 * @returns {Promise<Object>} Commande avec détails
 * @throws {ApiError} Si commande n'existe pas ou accès non autorisé
 */
export const getCommandeService = async (commandeId, userId, userType) => {
  // Vérifier l'existence de la commande
  const commande = await getCommandeById(commandeId);

  if (!commande) {
    throw new ApiError("Commande non trouvée", 404);
  }

  // Vérifier les droits d'accès
  if (userType === "client") {
    const isOwner = await isClientCommandeOwner(userId, commandeId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à cette commande", 403);
    }
  } else if (userType === "entreprise") {
    const isOwner = await isEntrepriseCommandeOwner(userId, commandeId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à cette commande", 403);
    }
  }

  // Récupérer les notes (publiques si client, toutes si entreprise)
  const notes = await getNotesByCommande(
    commandeId,
    userType === "client" // onlyPublic = true pour clients
  );

  return {
    success: true,
    commande: {
      ...commande,
      notes,
    },
  };
};

/**
 * Liste les commandes avec filtres
 * @param {Object} filters - Filtres
 * @param {number} page - Numéro de page
 * @param {number} limit - Commandes par page
 * @returns {Promise<Object>} Commandes et pagination
 */
export const listCommandesService = async (
  filters = {},
  page = 1,
  limit = 20
) => {
  // Validation pagination
  if (page < 1 || limit < 1 || limit > 100) {
    throw new ApiError("Paramètres de pagination invalides", 400);
  }

  const offset = (page - 1) * limit;

  try {
    // Récupérer les commandes
    const commandes = await listCommandes(filters, limit, offset);

    // Compter le total
    const total = await countCommandes(filters);

    return {
      success: true,
      commandes,
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

// ==================== MISE À JOUR ====================

/**
 * Met à jour le statut d'une commande
 * @param {string} commandeId - ID de la commande
 * @param {string} newStatus - Nouveau statut
 * @param {string} userId - ID de l'utilisateur (entreprise)
 * @returns {Promise<Object>} Commande mise à jour
 * @throws {ApiError} Si validation échoue
 */
export const updateCommandeStatusService = async (
  commandeId,
  newStatus,
  userId
) => {
  // Validation de l'UUID
  if (!isValidUUID(commandeId)) {
    throw new ApiError("ID de commande invalide", 400);
  }

  if (!isValidUUID(userId)) {
    throw new ApiError("ID utilisateur invalide", 400);
  }

  // Vérifier l'existence
  const exists = await commandeExists(commandeId);
  if (!exists) {
    throw new ApiError("Commande non trouvée", 404);
  }

  // Vérifier que c'est l'entreprise responsable
  const isOwner = await isEntrepriseCommandeOwner(userId, commandeId);
  if (!isOwner) {
    throw new ApiError(
      "Seule l'entreprise responsable peut changer le statut",
      403
    );
  }

  // Valider le statut
  const validStatuses = [
    "en_attente",
    "contrat_accepte",
    "en_cours_developpement",
    "livraison",
    "livree",
    "annulee",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(
      `Statut invalide. Valides: ${validStatuses.join(", ")}`,
      400
    );
  }

  try {
    const commande = await updateCommandeStatus(commandeId, newStatus);

    return {
      success: true,
      message: `Statut de la commande mis à jour: ${newStatus}`,
      commande,
    };
  } catch (error) {
    console.error("Erreur service updateCommandeStatus:", error);
    throw error;
  }
};

/**
 * Met à jour l'étape d'une commande
 * @param {string} commandeId - ID de la commande
 * @param {number} nouvelleEtape - Nouvelle étape
 * @param {string} userId - ID de l'utilisateur (entreprise)
 * @returns {Promise<Object>} Commande mise à jour
 * @throws {ApiError} Si validation échoue
 */
export const updateCommandeEtapeService = async (
  commandeId,
  nouvelleEtape,
  userId
) => {
  // Vérifier l'existence
  const exists = await commandeExists(commandeId);
  if (!exists) {
    throw new ApiError("Commande non trouvée", 404);
  }

  // Vérifier que c'est l'entreprise responsable
  const isOwner = await isEntrepriseCommandeOwner(userId, commandeId);
  if (!isOwner) {
    throw new ApiError(
      "Seule l'entreprise responsable peut changer l'étape",
      403
    );
  }

  // Valider l'étape
  if (nouvelleEtape < 1 || nouvelleEtape > 20) {
    throw new ApiError("L'étape doit être entre 1 et 20", 400);
  }

  try {
    const commande = await updateCommandeEtape(commandeId, nouvelleEtape);

    return {
      success: true,
      message: `Étape de la commande mise à jour: ${nouvelleEtape}`,
      commande,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Renseigne le coût final d'une commande
 * @param {string} commandeId - ID de la commande
 * @param {number} coutFinal - Coût final
 * @param {string} userId - ID de l'utilisateur (entreprise)
 * @returns {Promise<Object>} Commande mise à jour
 * @throws {ApiError} Si validation échoue
 */
export const updateCoutFinalService = async (commandeId, coutFinal, userId) => {
  // Vérifier l'existence
  const exists = await commandeExists(commandeId);
  if (!exists) {
    throw new ApiError("Commande non trouvée", 404);
  }

  // Vérifier que c'est l'entreprise responsable
  const isOwner = await isEntrepriseCommandeOwner(userId, commandeId);
  if (!isOwner) {
    throw new ApiError(
      "Seule l'entreprise responsable peut renseigner le coût final",
      403
    );
  }

  // Valider le coût
  if (coutFinal <= 0) {
    throw new ApiError("Le coût final doit être supérieur à 0", 400);
  }

  try {
    const commande = await updateCoutFinal(commandeId, coutFinal);

    return {
      success: true,
      message: `Coût final de la commande mis à jour: ${coutFinal}`,
      commande,
    };
  } catch (error) {
    throw error;
  }
};

// ==================== NOTES ====================

/**
 * Ajoute une note à une commande
 * @param {string} commandeId - ID de la commande
 * @param {string} userId - ID de l'auteur
 * @param {string} userType - Type d'utilisateur ('client' ou 'entreprise')
 * @param {string} contenu - Contenu de la note
 * @param {boolean} est_publique - Publique? (true par défaut)
 * @returns {Promise<Object>} Note créée
 * @throws {ApiError} Si validation échoue
 */
export const addNoteCommandeService = async (
  commandeId,
  userId,
  userType,
  contenu,
  est_publique = true
) => {
  // Vérifier l'existence de la commande
  const exists = await commandeExists(commandeId);
  if (!exists) {
    throw new ApiError("Commande non trouvée", 404);
  }

  // Vérifier les droits d'accès
  if (userType === "client") {
    const isOwner = await isClientCommandeOwner(userId, commandeId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à cette commande", 403);
    }
    // Les clients ajoutent toujours des notes publiques
    est_publique = true;
  } else if (userType === "entreprise") {
    const isOwner = await isEntrepriseCommandeOwner(userId, commandeId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à cette commande", 403);
    }
  }

  // Valider le contenu
  if (!contenu || contenu.trim().length === 0) {
    throw new ApiError("La note ne peut pas être vide", 400);
  }

  if (contenu.trim().length > 5000) {
    throw new ApiError("La note ne peut pas dépasser 5000 caractères", 400);
  }

  try {
    const note = await addNoteCommande(
      commandeId,
      userId,
      contenu.trim(),
      est_publique
    );

    return {
      success: true,
      message: "Note ajoutée avec succès",
      note,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les notes d'une commande
 * @param {string} commandeId - ID de la commande
 * @param {string} userId - ID de l'utilisateur
 * @param {string} userType - Type d'utilisateur ('client' ou 'entreprise')
 * @returns {Promise<Array>} Notes de la commande
 * @throws {ApiError} Si accès non autorisé
 */
export const getNotesByCommandeService = async (
  commandeId,
  userId,
  userType
) => {
  // Vérifier l'accès à la commande
  if (userType === "client") {
    const isOwner = await isClientCommandeOwner(userId, commandeId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à cette commande", 403);
    }
  } else if (userType === "entreprise") {
    const isOwner = await isEntrepriseCommandeOwner(userId, commandeId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à cette commande", 403);
    }
  }

  try {
    // Si client, seulement les notes publiques; si entreprise, toutes
    const onlyPublic = userType === "client";
    const notes = await getNotesByCommande(commandeId, onlyPublic);

    return {
      success: true,
      notes,
    };
  } catch (error) {
    throw error;
  }
};

// ==================== VALIDATIONS ====================

/**
 * Valide les données de création d'une commande
 * @param {Object} data - Données à valider
 * @throws {ApiError} Si validation échoue
 */
function validateCommandeCreation(data) {
  const {
    titre,
    description,
    cout_estime,
    client_id,
    entreprise_id,
    ticket_id,
  } = data;

  // Validation titre
  if (!titre || titre.trim().length === 0) {
    throw new ApiError("Le titre de la commande est requis", 400);
  }
  if (titre.length > 255) {
    throw new ApiError("Le titre ne peut pas dépasser 255 caractères", 400);
  }

  // Validation description (optionnelle mais recommandée)
  if (description && description.length > 5000) {
    throw new ApiError(
      "La description ne peut pas dépasser 5000 caractères",
      400
    );
  }

  // Validation coût estimé (optionnel)
  if (cout_estime && cout_estime <= 0) {
    throw new ApiError("Le coût estimé doit être supérieur à 0", 400);
  }

  // Validation UUIDs
  if (!isValidUUID(client_id)) {
    throw new ApiError("ID client invalide", 400);
  }
  if (!isValidUUID(entreprise_id)) {
    throw new ApiError("ID entreprise invalide", 400);
  }
  if (ticket_id && !isValidUUID(ticket_id)) {
    throw new ApiError("ID ticket invalide", 400);
  }
}

/**
 * Valide si une chaîne est un UUID valide
 * @param {string} uuid - UUID à valider
 * @returns {boolean}
 */
function isValidUUID(uuid) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
