import {
  createTicketService,
  getTicketService,
  listTicketsService,
  updateTicketStatusService,
  addNoteService,
  getNotesByTicketService,
} from "../services/ticketService.js";
import { ApiError } from "../utils/responseFormatter.js";

/**
 * 🎫 TICKET CONTROLLER - HTTP Request Handlers
 *
 * Gère toutes les requêtes HTTP pour les tickets.
 * Utilise le Service pour la logique métier.
 *
 * Pattern: MVC - Controller (HTTP handling only)
 */

// ==================== CRÉER TICKET ====================

/**
 * POST /api/tickets
 * Crée un nouveau ticket
 *
 * Body:
 * {
 *   "entreprise_id": "uuid",
 *   "titre": "string",
 *   "description": "string",
 *   "type_ticket": "facturation|réclamation|technique|suggestion|autre",
 *   "priorite": "basse|normal|haute|urgente" (optionnel, default: normal)
 * }
 */
export const createTicket = async (req, res, next) => {
  try {
    const { user } = req; // Mis par authenticateMiddleware
    const { entreprise_id, titre, description, type_ticket, priorite } =
      req.body;

    // Vérifier que c'est un client authentifié
    // userType peut être "particulier" ou "entreprise" (ce sont les types de clients)
    // (les entreprises CRM ont une table séparée et utilisent authenticateMiddleware des entreprises)
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    // Appeler le service
    const result = await createTicketService({
      client_id: user.userId,
      entreprise_id,
      titre,
      description,
      type_ticket,
      priorite,
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== LISTER TICKETS ====================

/**
 * GET /api/tickets
 * Liste les tickets avec filtres optionnels
 *
 * Query params:
 * - page: int (default: 1)
 * - limit: int (default: 20, max: 100)
 * - statut: string (en_attente, en_cours_etude, rejete, accepte, assigne, en_cours_traitement, traite)
 * - priorite: string (basse, normal, haute, urgente)
 * - type_ticket: string (facturation, réclamation, technique, suggestion, autre)
 * - entreprise_id: uuid (pour filtrer par entreprise)
 * - client_id: uuid (pour filtrer par client)
 */
export const listTickets = async (req, res, next) => {
  try {
    const { user } = req;
    const {
      page = 1,
      limit = 20,
      statut,
      priorite,
      type_ticket,
      entreprise_id,
      client_id,
    } = req.query;

    // Construire les filtres
    let filters = {};

    if (statut) filters.statut = statut;
    if (priorite) filters.priorite = priorite;
    if (type_ticket) filters.type_ticket = type_ticket;

    // Filtrage selon le type d'utilisateur
    // Un client ne voit que ses propres tickets
    filters.client_id = user.userId;

    // Permettre des filtres supplémentaires si fournis (avec vérifications)
    if (entreprise_id) {
      filters.entreprise_id = entreprise_id;
    }

    const result = await listTicketsService(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== VOIR TICKET ====================

/**
 * GET /api/tickets/:id
 * Récupère les détails d'un ticket
 */
export const getTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const result = await getTicketService(id, user.userId, user.userType);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== CHANGER STATUT ====================

/**
 * PATCH /api/tickets/:id/status
 * Change le statut d'un ticket (entreprise seulement)
 *
 * Body:
 * {
 *   "statut": "en_attente|en_cours_etude|rejete|accepte|assigne|en_cours_traitement|traite"
 * }
 */
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const { user } = req;

    // Vérifier que c'est une entreprise CRM
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError(
        "Seule une entreprise CRM peut changer le statut d'un ticket",
        403
      );
    }

    const result = await updateTicketStatusService(id, statut, user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== AJOUTER NOTE ====================

/**
 * POST /api/tickets/:id/notes
 * Ajoute une note à un ticket
 *
 * Body:
 * {
 *   "contenu": "string",
 *   "est_publique": boolean (optionnel, default: true)
 * }
 */
export const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contenu, est_publique = true } = req.body;
    const { user } = req;

    // Déterminer le type d'utilisateur
    let userType = "client"; // Par défaut, c'est un client
    if (user.userType === "entreprise_crm") {
      userType = "entreprise"; // Sinon c'est une entreprise CRM
    }

    const result = await addNoteService(
      id,
      user.userId,
      userType,
      contenu,
      est_publique
    );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== LISTER NOTES ====================

/**
 * GET /api/tickets/:id/notes
 * Liste les notes d'un ticket
 *
 * Retourne:
 * - Pour les clients: seulement les notes publiques
 * - Pour les entreprises: toutes les notes
 */
export const getNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;

    // Déterminer le type d'utilisateur
    let userType = "client"; // Par défaut, c'est un client
    if (user.userType === "entreprise_crm") {
      userType = "entreprise"; // Sinon c'est une entreprise CRM
    }

    const result = await getNotesByTicketService(id, user.userId, userType);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
