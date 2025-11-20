import {
  createTicket,
  getTicketById,
  listTickets,
  countTickets,
  updateTicketStatus,
  updateTicket,
  deleteTicket,
  addNote,
  getNotesByTicket,
  deleteNote,
  ticketExists,
  isClientTicketOwner,
  isEntrepriseTicketOwner,
} from "../models/ticketModel.js";
import { ApiError } from "../utils/responseFormatter.js";

/**
 * TICKET SERVICE - Business Logic Layer
 *
 * Gère toutes les validations et la logique métier pour les tickets.
 * Utilise le Model pour accéder à la BD.
 *
 * Pattern: MVC - Service (business logic only)
 */

// ==================== CRÉATION ====================

/**
 * Crée un nouveau ticket (avec validations)
 * @param {Object} ticketData - Données du ticket
 * @returns {Promise<Object>} Ticket créé
 * @throws {ApiError} Si validation échoue
 */
export const createTicketService = async (ticketData) => {
  const {
    client_id,
    entreprise_id,
    titre,
    description,
    type_ticket,
    priorite,
    fichier_path,
    fichier_original_name,
  } = ticketData;

  // 1. Validations
  validateTicketCreation({
    titre,
    description,
    type_ticket,
    priorite,
    client_id,
    entreprise_id,
  });

  try {
    // 2. Créer le ticket
    const ticket = await createTicket({
      client_id,
      entreprise_id,
      titre: titre.trim(),
      description: description.trim(),
      type_ticket,
      priorite: priorite || "normal",
      fichier_path,
      fichier_original_name,
    });

    return {
      success: true,
      message: "Ticket créé avec succès",
      ticket,
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
 * Récupère un ticket par ID (avec vérifications d'accès)
 * @param {string} ticketId - ID du ticket
 * @param {string} userId - ID de l'utilisateur (client ou entreprise)
 * @param {string} userType - Type d'utilisateur ('client' ou 'entreprise')
 * @returns {Promise<Object>} Ticket avec détails
 * @throws {ApiError} Si ticket n'existe pas ou accès non autorisé
 */
export const getTicketService = async (ticketId, userId, userType) => {
  // Vérifier l'existence du ticket
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    throw new ApiError("Ticket non trouvé", 404);
  }

  // Vérifier les droits d'accès
  if (userType === "client") {
    const isOwner = await isClientTicketOwner(userId, ticketId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à ce ticket", 403);
    }
  } else if (userType === "entreprise") {
    const isOwner = await isEntrepriseTicketOwner(userId, ticketId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à ce ticket", 403);
    }
  }

  // Récupérer les notes (publiques si client, toutes si entreprise)
  const notes = await getNotesByTicket(
    ticketId,
    userType === "client" // onlyPublic = true pour clients
  );

  return {
    success: true,
    ticket: {
      ...ticket,
      notes,
    },
  };
};

/**
 * Liste les tickets avec filtres
 * @param {Object} filters - Filtres
 * @param {number} page - Numéro de page
 * @param {number} limit - Tickets par page
 * @returns {Promise<Object>} Tickets et pagination
 */
export const listTicketsService = async (
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
    // Récupérer les tickets
    const tickets = await listTickets(filters, limit, offset);

    // Compter le total
    const total = await countTickets(filters);

    return {
      success: true,
      tickets,
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
 * Met à jour le statut d'un ticket
 * @param {string} ticketId - ID du ticket
 * @param {string} newStatus - Nouveau statut
 * @param {string} userId - ID de l'utilisateur (entreprise)
 * @returns {Promise<Object>} Ticket mis à jour
 * @throws {ApiError} Si validation échoue
 */
export const updateTicketStatusService = async (
  ticketId,
  newStatus,
  userId
) => {
  // Vérifier l'existence
  const exists = await ticketExists(ticketId);
  if (!exists) {
    throw new ApiError("Ticket non trouvé", 404);
  }

  // Vérifier que c'est l'entreprise responsable
  const isOwner = await isEntrepriseTicketOwner(userId, ticketId);
  if (!isOwner) {
    throw new ApiError(
      "Seule l'entreprise responsable peut changer le statut",
      403
    );
  }

  // Valider le statut
  const validStatuses = [
    "en_attente",
    "en_cours_etude",
    "rejete",
    "accepte",
    "assigne",
    "en_cours_traitement",
    "traite",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(
      `Statut invalide. Valides: ${validStatuses.join(", ")}`,
      400
    );
  }

  try {
    const ticket = await updateTicketStatus(ticketId, newStatus);

    return {
      success: true,
      message: `Statut du ticket mis à jour: ${newStatus}`,
      ticket,
    };
  } catch (error) {
    throw error;
  }
};

// ==================== NOTES ====================

/**
 * Ajoute une note à un ticket
 * @param {string} ticketId - ID du ticket
 * @param {string} userId - ID de l'auteur
 * @param {string} userType - Type d'utilisateur ('client' ou 'entreprise')
 * @param {string} contenu - Contenu de la note
 * @param {boolean} est_publique - Publique? (true par défaut)
 * @returns {Promise<Object>} Note créée
 * @throws {ApiError} Si validation échoue
 */
export const addNoteService = async (
  ticketId,
  userId,
  userType,
  contenu,
  est_publique = true
) => {
  // Vérifier l'existence du ticket
  const exists = await ticketExists(ticketId);
  if (!exists) {
    throw new ApiError("Ticket non trouvé", 404);
  }

  // Vérifier les droits d'accès
  if (userType === "client") {
    const isOwner = await isClientTicketOwner(userId, ticketId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à ce ticket", 403);
    }
    // Les clients ajoutent toujours des notes publiques
    est_publique = true;
  } else if (userType === "entreprise") {
    const isOwner = await isEntrepriseTicketOwner(userId, ticketId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à ce ticket", 403);
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
    const note = await addNote(ticketId, userId, contenu.trim(), est_publique);

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
 * Récupère les notes d'un ticket
 * @param {string} ticketId - ID du ticket
 * @param {string} userId - ID de l'utilisateur
 * @param {string} userType - Type d'utilisateur ('client' ou 'entreprise')
 * @returns {Promise<Array>} Notes du ticket
 * @throws {ApiError} Si accès non autorisé
 */
export const getNotesByTicketService = async (ticketId, userId, userType) => {
  // Vérifier l'accès au ticket
  if (userType === "client") {
    const isOwner = await isClientTicketOwner(userId, ticketId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à ce ticket", 403);
    }
  } else if (userType === "entreprise") {
    const isOwner = await isEntrepriseTicketOwner(userId, ticketId);
    if (!isOwner) {
      throw new ApiError("Accès refusé à ce ticket", 403);
    }
  }

  try {
    // Si client, seulement les notes publiques; si entreprise, toutes
    const onlyPublic = userType === "client";
    const notes = await getNotesByTicket(ticketId, onlyPublic);

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
 * Valide les données de création d'un ticket
 * @param {Object} data - Données à valider
 * @throws {ApiError} Si validation échoue
 */
function validateTicketCreation(data) {
  const {
    titre,
    description,
    type_ticket,
    priorite,
    client_id,
    entreprise_id,
  } = data;

  // Validation titre
  if (!titre || titre.trim().length === 0) {
    throw new ApiError("Le titre du ticket est requis", 400);
  }
  if (titre.length > 255) {
    throw new ApiError("Le titre ne peut pas dépasser 255 caractères", 400);
  }

  // Validation description
  if (!description || description.trim().length === 0) {
    throw new ApiError("La description du ticket est requise", 400);
  }
  if (description.length > 5000) {
    throw new ApiError(
      "La description ne peut pas dépasser 5000 caractères",
      400
    );
  }

  // Validation type_ticket
  const validTypes = [
    "facturation",
    "réclamation",
    "technique",
    "suggestion",
    "autre",
  ];
  if (!validTypes.includes(type_ticket)) {
    throw new ApiError(`Type invalide. Valides: ${validTypes.join(", ")}`, 400);
  }

  // Validation priorite (si fournie)
  if (priorite) {
    const validPriorities = ["basse", "normal", "haute", "urgente"];
    if (!validPriorities.includes(priorite)) {
      throw new ApiError(
        `Priorité invalide. Valides: ${validPriorities.join(", ")}`,
        400
      );
    }
  }

  // Validation UUIDs
  if (!isValidUUID(client_id)) {
    throw new ApiError("ID client invalide", 400);
  }
  if (!isValidUUID(entreprise_id)) {
    throw new ApiError("ID entreprise invalide", 400);
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
