import {
  createBonusService,
  getBonusService,
  listBonusService,
  updateBonusService,
  toggleBonusActifService,
  deleteBonusService,
  getBonusForClientService,
} from "../services/bonusService.js";
import { ApiError } from "../utils/responseFormatter.js";

/**
 * BONUS CONTROLLER - HTTP Request Handlers
 *
 * Gère toutes les requêtes HTTP pour les bonus.
 * Utilise le Service pour la logique métier.
 *
 * Pattern: MVC - Controller (HTTP handling only)
 */

// ==================== CRÉER BONUS ====================

/**
 * POST /api/bonus
 * Crée un nouveau bonus (entreprise seulement)
 *
 * Body:
 * {
 *   "titre": "string",
 *   "description": "string" (optionnel),
 *   "valeur": number,
 *   "appliquer_a": "tous|specifique|filtre" (default: tous),
 *   "client_id": "uuid" (optionnel - si appliquer_a = "specifique"),
 *   "type_client_filtre": "particulier|entreprise" (optionnel - si appliquer_a = "filtre"),
 *   "secteur_filtre": "Technologie|Agriculture|..." (optionnel - si appliquer_a = "filtre"),
 *   "taille_filtre": "1 - 10 employés|..." (optionnel - si appliquer_a = "filtre"),
 *   "date_debut": "YYYY-MM-DD",
 *   "date_fin": "YYYY-MM-DD",
 *   "conditions": "string" (optionnel)
 * }
 */
export const createBonus = async (req, res, next) => {
  try {
    const { user } = req; // Mis par authenticateMiddleware
    const {
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
    } = req.body;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Seule une entreprise peut créer un bonus", 403);
    }

    // Appeler le service
    const result = await createBonusService({
      entreprise_id: user.userId,
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

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== LISTER BONUS ====================

/**
 * GET /api/bonus
 * Liste les bonus avec filtres optionnels
 *
 * Comportement différent selon le type d'utilisateur:
 * - Entreprise: voit ses propres bonus
 * - Client: voit les bonus qui lui sont applicables
 *
 * Query params:
 * - page: int (default: 1)
 * - limit: int (default: 20, max: 100)
 * - est_actif: boolean (optionnel - filtre par statut)
 */
export const listBonus = async (req, res, next) => {
  try {
    const { user } = req;
    const { page = 1, limit = 20, est_actif } = req.query;

    // Construire les filtres
    let filters = {};

    if (est_actif !== undefined) {
      filters.est_actif = est_actif === "true";
    }

    const result = await listBonusService(
      filters,
      parseInt(page),
      parseInt(limit),
      user.userType === "entreprise_crm" ? "entreprise" : "client",
      user.userId
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== VOIR BONUS ====================

/**
 * GET /api/bonus/:id
 * Récupère les détails d'un bonus
 *
 * Accès:
 * - Entreprise: seulement ses propres bonus
 * - Client: tous les bonus (mais filtrage automatique dans la liste)
 */
export const getBonus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;

    // Déterminer le type d'utilisateur pour le service
    let userType = "client"; // Par défaut
    if (user.userType === "entreprise_crm") {
      userType = "entreprise";
    }

    const result = await getBonusService(id, user.userId, userType);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== METTRE À JOUR BONUS ====================

/**
 * PUT /api/bonus/:id
 * Met à jour un bonus (entreprise seulement)
 *
 * Body (tous les champs optionnels - seuls ceux fournis sont mis à jour):
 * {
 *   "titre": "string",
 *   "description": "string",
 *   "valeur": number,
 *   "appliquer_a": "tous|specifique|filtre",
 *   "client_id": "uuid",
 *   "type_client_filtre": "particulier|entreprise",
 *   "secteur_filtre": "Technologie|Agriculture|...",
 *   "taille_filtre": "1 - 10 employés|...",
 *   "date_debut": "YYYY-MM-DD",
 *   "date_fin": "YYYY-MM-DD",
 *   "conditions": "string",
 *   "est_actif": boolean
 * }
 */
export const updateBonus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { user } = req;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Seule une entreprise peut modifier un bonus", 403);
    }

    const result = await updateBonusService(id, updateData, user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== ACTIVER/DÉSACTIVER BONUS ====================

/**
 * PATCH /api/bonus/:id/toggle-actif
 * Active ou désactive un bonus (entreprise seulement)
 *
 * Body:
 * {
 *   "est_actif": boolean
 * }
 */
export const toggleBonusActif = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { est_actif } = req.body;
    const { user } = req;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Seule une entreprise peut modifier un bonus", 403);
    }

    // Validation du paramètre est_actif
    if (typeof est_actif !== "boolean") {
      throw new ApiError("Le paramètre 'est_actif' doit être un boolean", 400);
    }

    const result = await toggleBonusActifService(id, est_actif, user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== SUPPRIMER BONUS ====================

/**
 * DELETE /api/bonus/:id
 * Supprime un bonus (entreprise seulement)
 */
export const deleteBonus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Seule une entreprise peut supprimer un bonus", 403);
    }

    const result = await deleteBonusService(id, user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== BONUS POUR CLIENT ====================

/**
 * GET /api/bonus/client/mes-bonus
 * Récupère les bonus applicables pour le client authentifié
 *
 * Retourne seulement les bonus:
 * - Actifs
 * - Dans la période de validité
 * - Qui correspondent aux critères du client (type, secteur, taille)
 * - Ou qui sont destinés à tous les clients
 * - Ou qui sont spécifiquement pour ce client
 */
export const getMesBonus = async (req, res, next) => {
  try {
    const { user } = req;

    // Vérifier que c'est un client authentifié
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    const result = await getBonusForClientService(user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== APPLIQUER BONUS ====================

/**
 * POST /api/bonus/:id/apply
 * Applique/utilise un bonus (client seulement)
 *
 * Body:
 * {
 *   "commande_id": "uuid" (optionnel - pour lier à une commande)
 * }
 */
export const applyBonus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { commande_id } = req.body;
    const { user } = req;

    // Vérifier que c'est un client authentifié
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    // TODO: Implémenter la logique d'application du bonus
    // Cette fonctionnalité nécessitera une table supplémentaire pour tracker l'utilisation

    return res.status(200).json({
      success: true,
      message: "Fonctionnalité d'application des bonus à implémenter",
      bonus_id: id,
      client_id: user.userId,
      commande_id: commande_id || null,
    });
  } catch (error) {
    next(error);
  }
};
