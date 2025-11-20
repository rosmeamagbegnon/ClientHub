import {
  createCommandeService,
  getCommandeService,
  listCommandesService,
  updateCommandeStatusService,
  updateCommandeEtapeService,
  updateCoutFinalService,
  addNoteCommandeService,
  getNotesByCommandeService,
} from "../services/commandeService.js";

import { ApiError } from "../utils/responseFormatter.js";

/**
 * 🛒 COMMANDE CONTROLLER - HTTP Request Handlers
 *
 * Gère toutes les requêtes HTTP pour les commandes.
 * Utilise le Service pour la logique métier.
 *
 * Pattern: MVC - Controller (HTTP handling only)
 */

// ==================== CRÉER COMMANDE ====================

/**
 * POST /api/commandes
 * Crée une nouvelle commande
 *
 * Body:
 * {
 *   "entreprise_id": "uuid",
 *   "titre": "string",
 *   "description": "string",
 *   "cout_estime": number (optionnel),
 *   "ticket_id": "uuid" (optionnel - pour lier à un ticket existant)
 * }
 */
export const createCommande = async (req, res, next) => {
  try {
    const { user } = req; // Mis par authenticateMiddleware
    const { entreprise_id, titre, description, cout_estime, ticket_id } =
      req.body;

    // Vérifier que c'est un client authentifié
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    // Appeler le service
    const result = await createCommandeService({
      client_id: user.userId,
      entreprise_id,
      titre,
      description,
      cout_estime,
      ticket_id,
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== LISTER COMMANDES ====================

/**
 * GET /api/commandes
 * Liste les commandes avec filtres optionnels
 *
 * Query params:
 * - page: int (default: 1)
 * - limit: int (default: 20, max: 100)
 * - statut: string (en_attente, contrat_accepte, en_cours_developpement, livraison, livree, annulee)
 * - entreprise_id: uuid (pour filtrer par entreprise)
 * - client_id: uuid (pour filtrer par client)
 */
export const listCommandes = async (req, res, next) => {
  try {
    const { user } = req;
    const {
      page = 1,
      limit = 20,
      statut,
      entreprise_id,
      client_id,
    } = req.query;

    // Construire les filtres selon le type d'utilisateur
    let filters = {};

    if (statut) filters.statut = statut;

    // Filtrage automatique selon le type d'utilisateur
    if (user.userType === "client") {
      // Un client ne voit que ses propres commandes
      filters.client_id = user.userId;
    } else if (user.userType === "entreprise") {
      // Une entreprise voit les commandes qui lui sont adressées
      filters.entreprise_id = user.userId;
    }

    // Permettre des filtres supplémentaires si fournis
    if (entreprise_id) {
      filters.entreprise_id = entreprise_id;
    }
    if (client_id) {
      filters.client_id = client_id;
    }

    const result = await listCommandesService(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== VOIR COMMANDE ====================

/**
 * GET /api/commandes/:id
 * Récupère les détails d'une commande
 */
export const getCommande = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const result = await getCommandeService(id, user.userId, user.userType);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== CHANGER STATUT ====================

/**
 * PATCH /api/commandes/:id/status
 * Change le statut d'une commande (entreprise seulement)
 *
 * Body:
 * {
 *   "statut": "en_attente|contrat_accepte|en_cours_developpement|livraison|livree|annulee"
 * }
 */
export const updateCommandeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const { user } = req;

    // Vérifier que c'est une entreprise CRM
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError(
        "Seule une entreprise CRM peut changer le statut d'une commande",
        403
      );
    }

    const result = await updateCommandeStatusService(id, statut, user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== CHANGER ÉTAPE ====================

/**
 * PATCH /api/commandes/:id/etape
 * Change l'étape actuelle d'une commande (entreprise seulement)
 *
 * Body:
 * {
 *   "etape_actuelle": number (1-20)
 * }
 */
export const updateCommandeEtape = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { etape_actuelle } = req.body;
    const { user } = req;

    // Vérifier que c'est une entreprise CRM
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError(
        "Seule une entreprise CRM peut changer l'étape d'une commande",
        403
      );
    }

    const result = await updateCommandeEtapeService(
      id,
      etape_actuelle,
      user.userId
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== RENSEIGNER COÛT FINAL ====================

/**
 * PATCH /api/commandes/:id/cout-final
 * Renseigne le coût final d'une commande livrée (entreprise seulement)
 *
 * Body:
 * {
 *   "cout_final": number (doit être > 0)
 * }
 */
export const updateCoutFinal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cout_final } = req.body;
    const { user } = req;

    // Vérifier que c'est une entreprise CRM
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError(
        "Seule une entreprise CRM peut renseigner le coût final",
        403
      );
    }

    const result = await updateCoutFinalService(id, cout_final, user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== AJOUTER NOTE ====================

/**
 * POST /api/commandes/:id/notes
 * Ajoute une note à une commande
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

    const result = await addNoteCommandeService(
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
 * GET /api/commandes/:id/notes
 * Liste les notes d'une commande
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

    const result = await getNotesByCommandeService(id, user.userId, userType);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
