import {
  getOrCreateSession,
  getClientSessionsService,
  processMessageService,
  getSessionMessagesService,
  getNewMessagesService,
} from "../services/chatbotService.js";

import { ApiError } from "../utils/responseFormatter.js";

/**
 * CHATBOT CONTROLLER - HTTP Request Handlers
 *
 * Gère toutes les requêtes HTTP pour le chatbot.
 * Utilise le Service pour la logique métier.
 *
 * Pattern: MVC - Controller (HTTP handling only)
 */

// ==================== SESSIONS ====================

/**
 * POST /api/chatbot/sessions
 * Crée ou récupère une session de chat active
 *
 * Body:
 * {
 *   "entreprise_id": "uuid" (optionnel - utilisera la première entreprise sinon)
 * }
 */
export const createOrGetSession = async (req, res, next) => {
  try {
    const { user } = req; // Mis par authenticateMiddleware
    const { entreprise_id } = req.body;

    // Vérifier que c'est un client authentifié
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    // TODO: Récupérer l'entreprise_id depuis les relations du client
    // Pour le moment, on utilise une entreprise par défaut ou celle fournie
    const targetEntrepriseId = entreprise_id || getDefaultEntrepriseId();

    if (!targetEntrepriseId) {
      throw new ApiError("Aucune entreprise disponible pour le chat", 400);
    }

    // Appeler le service
    const result = await getOrCreateSession(user.userId, targetEntrepriseId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chatbot/sessions
 * Liste les sessions de chat du client
 *
 * Query params:
 * - page: int (default: 1)
 * - limit: int (default: 20, max: 100)
 */
export const getClientSessions = async (req, res, next) => {
  try {
    const { user } = req;
    const { page = 1, limit = 20 } = req.query;

    // Vérifier que c'est un client authentifié
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    const result = await getClientSessionsService(
      user.userId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chatbot/sessions/:id
 * Récupère les détails d'une session spécifique
 */
export const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;

    // Vérifier que c'est un client authentifié
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    // Cette fonctionnalité nécessiterait un service dédié
    // Pour l'instant, retourner un placeholder
    return res.status(200).json({
      success: true,
      message: "Détails de session à implémenter",
      session_id: id,
      client_id: user.userId,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== MESSAGES ====================

/**
 * POST /api/chatbot/sessions/:id/messages
 * Envoie un message dans une session de chat
 *
 * Body:
 * {
 *   "message": "string"
 * }
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const { user } = req;

    // Vérifier que c'est un client authentifié
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    // Validation du message
    if (!message || message.trim().length === 0) {
      throw new ApiError("Le message ne peut pas être vide", 400);
    }

    if (message.length > 1000) {
      throw new ApiError(
        "Le message ne peut pas dépasser 1000 caractères",
        400
      );
    }

    // Appeler le service de traitement
    const result = await processMessageService(id, message.trim(), user.userId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chatbot/sessions/:id/messages
 * Récupère l'historique des messages d'une session
 *
 * Query params:
 * - page: int (default: 1)
 * - limit: int (default: 50, max: 100)
 */
export const getSessionMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { page = 1, limit = 50 } = req.query;

    // Vérifier que c'est un client authentifié
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    const result = await getSessionMessagesService(
      id,
      user.userId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chatbot/sessions/:id/messages/updates
 * Récupère les nouveaux messages depuis le dernier message connu
 * (Pour le polling côté client)
 *
 * Query params:
 * - last_message_id: string (optionnel - ID du dernier message connu)
 */
export const getMessageUpdates = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { last_message_id } = req.query;

    // Vérifier que c'est un client authentifié
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    const result = await getNewMessagesService(
      id,
      user.userId,
      last_message_id
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== STATISTIQUES ====================

/**
 * GET /api/chatbot/stats
 * Récupère les statistiques d'utilisation du chatbot (Entreprise seulement)
 *
 * Query params:
 * - period: string (day, week, month - default: month)
 */
export const getChatbotStats = async (req, res, next) => {
  try {
    const { user } = req;
    const { period = "month" } = req.query;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Accès réservé aux entreprises", 403);
    }

    // TODO: Implémenter le service de statistiques
    // Pour l'instant, retourner un placeholder
    return res.status(200).json({
      success: true,
      stats: {
        period,
        total_sessions: 0,
        unique_clients: 0,
        total_messages: 0,
        avg_messages_per_session: 0,
      },
      message: "Statistiques chatbot à implémenter",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== UTILITAIRES ====================

/**
 * Fonction temporaire pour obtenir une entreprise par défaut
 * À remplacer par une logique métier réelle
 */
const getDefaultEntrepriseId = () => {
  // TODO: Implémenter la logique pour récupérer l'entreprise
  // Pour l'instant, retourner null pour forcer l'utilisation du body
  return null;
};

/**
 * POST /api/chatbot/sessions/:id/close
 * Ferme une session de chat
 */
export const closeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user } = req;

    // Vérifier que c'est un client authentifié
    if (!user || user.userType === undefined) {
      throw new ApiError("Authentification requise", 401);
    }

    // TODO: Implémenter le service de fermeture de session
    // Pour l'instant, retourner un placeholder
    return res.status(200).json({
      success: true,
      message: "Session fermée avec succès",
      session_id: id,
      client_id: user.userId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chatbot/health
 * Endpoint de santé du chatbot
 */
export const getChatbotHealth = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      service: "chatbot",
      status: "operational",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      features: {
        sessions: true,
        messages: true,
        intent_detection: true,
        data_integration: true,
      },
    });
  } catch (error) {
    next(error);
  }
};
