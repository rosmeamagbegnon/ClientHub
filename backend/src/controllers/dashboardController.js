import {
  getDashboardDataService,
  getOverviewStatsService,
  getTrendDataService,
} from "../services/dashboardService.js";

import { ApiError } from "../utils/responseFormatter.js";

/**
 * DASHBOARD CONTROLLER - HTTP Request Handlers
 *
 * Gère toutes les requêtes HTTP pour le dashboard entreprise.
 * Utilise le Service pour la logique métier et analytics.
 *
 * Pattern: MVC - Controller (HTTP handling only)
 */

// ==================== DASHBOARD COMPLET ====================

/**
 * GET /api/dashboard
 * Récupère toutes les données du dashboard pour l'entreprise authentifiée
 *
 * Query params:
 * - period: string (day, week, month, year - default: month)
 */
export const getDashboard = async (req, res, next) => {
  try {
    const { user } = req; // Mis par authenticateMiddleware
    const { period = "month" } = req.query;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Accès réservé aux entreprises", 403);
    }

    // Appeler le service pour récupérer toutes les données
    const result = await getDashboardDataService(user.userId, period);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== STATISTIQUES GÉNÉRALES ====================

/**
 * GET /api/dashboard/overview
 * Récupère uniquement les statistiques générales et KPIs
 *
 * Query params:
 * - period: string (day, week, month, year - default: month)
 */
export const getOverview = async (req, res, next) => {
  try {
    const { user } = req;
    const { period = "month" } = req.query;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Accès réservé aux entreprises", 403);
    }

    const result = await getOverviewStatsService(user.userId, period);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== DONNÉES DE TENDANCE ====================

/**
 * GET /api/dashboard/trends
 * Récupère les données de tendance pour un métrique spécifique
 *
 * Query params:
 * - period: string (day, week, month, year - default: month)
 * - metric: string (tickets, commandes, revenus, clients - default: tickets)
 */
export const getTrends = async (req, res, next) => {
  try {
    const { user } = req;
    const { period = "month", metric = "tickets" } = req.query;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Accès réservé aux entreprises", 403);
    }

    const result = await getTrendDataService(user.userId, period, metric);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== RÉPARTITIONS ====================

/**
 * GET /api/dashboard/distributions/tickets
 * Récupère la répartition des tickets par statut
 */
export const getTicketsDistribution = async (req, res, next) => {
  try {
    const { user } = req;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Accès réservé aux entreprises", 403);
    }

    // Cette fonctionnalité nécessiterait un service dédié
    // Pour l'instant, intégré dans le dashboard complet
    return res.status(200).json({
      success: true,
      message: "Utilisez /api/dashboard pour les données complètes",
      endpoint: "/api/dashboard?period=month",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/distributions/commandes
 * Récupère la répartition des commandes par statut
 */
export const getOrdersDistribution = async (req, res, next) => {
  try {
    const { user } = req;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Accès réservé aux entreprises", 403);
    }

    return res.status(200).json({
      success: true,
      message: "Utilisez /api/dashboard pour les données complètes",
      endpoint: "/api/dashboard?period=month",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PERFORMANCE ====================

/**
 * GET /api/dashboard/performance
 * Récupère les métriques de performance (temps résolution, etc.)
 */
export const getPerformance = async (req, res, next) => {
  try {
    const { user } = req;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Accès réservé aux entreprises", 403);
    }

    return res.status(200).json({
      success: true,
      message: "Utilisez /api/dashboard pour les données complètes",
      endpoint: "/api/dashboard?period=month",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ACTIVITÉ RÉCENTE ====================

/**
 * GET /api/dashboard/activity
 * Récupère l'activité récente (tickets + commandes)
 *
 * Query params:
 * - limit: number (default: 20, max: 50)
 */
export const getRecentActivity = async (req, res, next) => {
  try {
    const { user } = req;
    const { limit = 20 } = req.query;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Accès réservé aux entreprises", 403);
    }

    // Validation de la limite
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      throw new ApiError("La limite doit être entre 1 et 50", 400);
    }

    return res.status(200).json({
      success: true,
      message: "Utilisez /api/dashboard pour les données complètes",
      endpoint: "/api/dashboard?period=month",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== TOP CLIENTS ====================

/**
 * GET /api/dashboard/top-clients
 * Récupère les clients les plus actifs/rentables
 *
 * Query params:
 * - limit: number (default: 10, max: 25)
 */
export const getTopClients = async (req, res, next) => {
  try {
    const { user } = req;
    const { limit = 10 } = req.query;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Accès réservé aux entreprises", 403);
    }

    // Validation de la limite
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 25) {
      throw new ApiError("La limite doit être entre 1 et 25", 400);
    }

    return res.status(200).json({
      success: true,
      message: "Utilisez /api/dashboard pour les données complètes",
      endpoint: "/api/dashboard?period=month",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SANTÉ DU SERVICE ====================

/**
 * GET /api/dashboard/health
 * Endpoint de santé du service dashboard
 */
export const getDashboardHealth = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      service: "dashboard",
      status: "operational",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      features: {
        overview: true,
        trends: true,
        distributions: true,
        performance: true,
        activity: true,
        kpis: true,
      },
      data_sources: {
        tickets: true,
        commandes: true,
        clients: true,
        bonus: true,
        chatbot: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== MÉTRIQUES RAPIDES ====================

/**
 * GET /api/dashboard/quick-stats
 * Récupère les métriques rapides pour affichage en temps réel
 *
 * Query params:
 * - period: string (day, week, month - default: month)
 */
export const getQuickStats = async (req, res, next) => {
  try {
    const { user } = req;
    const { period = "month" } = req.query;

    // Vérifier que c'est une entreprise authentifiée
    if (!user || user.userType !== "entreprise_crm") {
      throw new ApiError("Accès réservé aux entreprises", 403);
    }

    // Récupérer uniquement les stats générales pour rapidité
    const result = await getOverviewStatsService(user.userId, period);

    // Extraire les métriques les plus importantes
    const quickStats = {
      success: true,
      period,
      timestamp: new Date().toISOString(),
      metrics: {
        total_clients: result.overview?.clients?.total || 0,
        new_clients: result.overview?.clients?.new || 0,
        total_tickets: result.overview?.tickets?.total || 0,
        resolved_tickets: result.overview?.tickets?.resolved || 0,
        total_orders: result.overview?.orders?.total || 0,
        delivered_orders: result.overview?.orders?.delivered || 0,
        total_revenue: result.overview?.revenue?.total || 0,
        period_revenue: result.overview?.revenue?.period || 0,
      },
      kpis: result.kpis || {},
    };

    return res.status(200).json(quickStats);
  } catch (error) {
    next(error);
  }
};
