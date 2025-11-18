import {
  getGeneralStats,
  getTrendData,
  getTicketsByStatus,
  getOrdersByStatus,
  getRecentActivity,
  getTopClients,
  getPerformanceMetrics,
  getSectorData,
  entrepriseExists,
} from "../models/dashboardModel.js";

import { ApiError } from "../utils/responseFormatter.js";

/**
 * DASHBOARD SERVICE - Business Logic Layer
 *
 * Gère les calculs métier, agrégations et transformations des données dashboard.
 * Utilise le Model pour accéder aux données analytiques.
 *
 * Pattern: MVC - Service (business logic only)
 */

// ==================== DASHBOARD COMPLET ====================

/**
 * Récupère toutes les données du dashboard pour une entreprise
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {string} period - Période (day, week, month, year)
 * @returns {Promise<Object>} Données complètes du dashboard
 */
export const getDashboardDataService = async (
  entrepriseId,
  period = "month"
) => {
  // Validation de l'UUID
  if (!isValidUUID(entrepriseId)) {
    throw new ApiError("ID entreprise invalide", 400);
  }

  // Vérifier que l'entreprise existe
  const exists = await entrepriseExists(entrepriseId);
  if (!exists) {
    throw new ApiError("Entreprise non trouvée", 404);
  }

  // Validation de la période
  const validPeriods = ["day", "week", "month", "year"];
  if (!validPeriods.includes(period)) {
    throw new ApiError(
      `Période invalide. Valides: ${validPeriods.join(", ")}`,
      400
    );
  }

  try {
    // Exécuter toutes les requêtes en parallèle pour performance
    const [
      generalStats,
      ticketsTrend,
      ordersTrend,
      revenueTrend,
      ticketsByStatus,
      ordersByStatus,
      recentActivity,
      topClients,
      performanceMetrics,
      sectorData,
    ] = await Promise.all([
      getGeneralStats(entrepriseId, period),
      getTrendData(entrepriseId, period, "tickets"),
      getTrendData(entrepriseId, period, "commandes"),
      getTrendData(entrepriseId, period, "revenus"),
      getTicketsByStatus(entrepriseId),
      getOrdersByStatus(entrepriseId),
      getRecentActivity(entrepriseId, 15),
      getTopClients(entrepriseId, 10),
      getPerformanceMetrics(entrepriseId),
      getSectorData(entrepriseId),
    ]);

    // Transformer et enrichir les données
    return {
      success: true,
      period,
      entreprise_id: entrepriseId,
      timestamp: new Date().toISOString(),

      // Statistiques générales
      overview: transformOverviewStats(generalStats, period),

      // Tendances et évolutions
      trends: {
        tickets: transformTrendData(ticketsTrend, period),
        orders: transformTrendData(ordersTrend, period),
        revenue: transformTrendData(revenueTrend, period),
      },

      // Répartitions
      distributions: {
        tickets_by_status: transformStatusDistribution(ticketsByStatus),
        orders_by_status: transformStatusDistribution(ordersByStatus),
        clients_by_sector: transformSectorData(sectorData),
      },

      // Performance
      performance: transformPerformanceMetrics(performanceMetrics),

      // Listes et activités
      lists: {
        recent_activity: transformRecentActivity(recentActivity),
        top_clients: transformTopClients(topClients),
      },

      // KPIs calculés
      kpis: calculateKPIs(generalStats, performanceMetrics, period),
    };
  } catch (error) {
    console.error("Erreur service dashboard:", error);
    throw error;
  }
};

// ==================== DONNÉES SPÉCIFIQUES ====================

/**
 * Récupère uniquement les statistiques générales
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {string} period - Période
 * @returns {Promise<Object>} Statistiques générales
 */
export const getOverviewStatsService = async (
  entrepriseId,
  period = "month"
) => {
  validateDashboardInput(entrepriseId, period);

  try {
    const generalStats = await getGeneralStats(entrepriseId, period);
    const performanceMetrics = await getPerformanceMetrics(entrepriseId);

    return {
      success: true,
      overview: transformOverviewStats(generalStats, period),
      kpis: calculateKPIs(generalStats, performanceMetrics, period),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les données de tendance pour un métrique spécifique
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {string} period - Période
 * @param {string} metric - Métrique (tickets, commandes, revenus, clients)
 * @returns {Promise<Object>} Données de tendance
 */
export const getTrendDataService = async (
  entrepriseId,
  period = "month",
  metric = "tickets"
) => {
  validateDashboardInput(entrepriseId, period);

  const validMetrics = ["tickets", "commandes", "revenus", "clients"];
  if (!validMetrics.includes(metric)) {
    throw new ApiError(
      `Métrique invalide. Valides: ${validMetrics.join(", ")}`,
      400
    );
  }

  try {
    const trendData = await getTrendData(entrepriseId, period, metric);

    return {
      success: true,
      metric,
      period,
      data: transformTrendData(trendData, period),
    };
  } catch (error) {
    throw error;
  }
};

// ==================== TRANSFORMATIONS DE DONNÉES ====================

/**
 * Transforme les statistiques générales pour l'affichage
 * @param {Object} stats - Statistiques brutes
 * @param {string} period - Période
 * @returns {Object} Statistiques transformées
 */
const transformOverviewStats = (stats, period) => {
  const {
    total_clients = 0,
    new_clients = 0,
    total_tickets = 0,
    tickets_traites = 0,
    tickets_en_attente = 0,
    tickets_en_cours = 0,
    total_commandes = 0,
    commandes_livrees = 0,
    commandes_en_cours = 0,
    revenus_totaux = 0,
    revenus_periode = 0,
  } = stats;

  return {
    clients: {
      total: total_clients,
      new: new_clients,
      growth: calculateGrowthRate(total_clients, new_clients),
    },
    tickets: {
      total: total_tickets,
      resolved: tickets_traites,
      pending: tickets_en_attente,
      in_progress: tickets_en_cours,
      resolution_rate: calculatePercentage(tickets_traites, total_tickets),
    },
    orders: {
      total: total_commandes,
      delivered: commandes_livrees,
      in_progress: commandes_en_cours,
      delivery_rate: calculatePercentage(commandes_livrees, total_commandes),
    },
    revenue: {
      total: Math.round(revenus_totaux * 100) / 100,
      period: Math.round(revenus_periode * 100) / 100,
      growth: calculateGrowthRate(revenus_totaux, revenus_periode),
    },
  };
};

/**
 * Transforme les données de tendance
 * @param {Array} trendData - Données brutes de tendance
 * @param {string} period - Période
 * @returns {Object} Données de tendance transformées
 */
const transformTrendData = (trendData, period) => {
  if (!trendData || trendData.length === 0) {
    return {
      labels: [],
      values: [],
      total: 0,
      growth: 0,
    };
  }

  const values = trendData.map((item) => parseInt(item.value) || 0);
  const labels = trendData.map((item) => formatTrendLabel(item.period, period));

  // Calculer la croissance
  const total = values.reduce((sum, value) => sum + value, 0);
  const growth = calculateTrendGrowth(values);

  return {
    labels,
    values,
    total,
    growth,
    period,
  };
};

/**
 * Transforme la répartition par statut
 * @param {Array} statusData - Données brutes de statut
 * @returns {Array} Répartition transformée
 */
const transformStatusDistribution = (statusData) => {
  return statusData.map((item) => ({
    status: item.statut,
    count: parseInt(item.count),
    percentage: parseFloat(item.percentage) || 0,
  }));
};

/**
 * Transforme les données sectorielles
 * @param {Array} sectorData - Données brutes sectorielles
 * @returns {Array} Données sectorielles transformées
 */
const transformSectorData = (sectorData) => {
  return sectorData.map((item) => ({
    sector: item.secteur,
    client_count: parseInt(item.client_count),
    ticket_count: parseInt(item.ticket_count),
    order_count: parseInt(item.order_count),
    revenue: parseFloat(item.revenue) || 0,
  }));
};

/**
 * Transforme les métriques de performance
 * @param {Object} metrics - Métriques brutes
 * @returns {Object} Métriques transformées
 */
const transformPerformanceMetrics = (metrics) => {
  return {
    ticket_resolution: {
      average_hours:
        Math.round(metrics.avg_ticket_resolution_hours * 100) / 100,
      total_resolved: parseInt(metrics.resolved_tickets_count) || 0,
    },
    order_delivery: {
      average_days: Math.round(metrics.avg_order_delivery_days * 100) / 100,
      total_delivered: parseInt(metrics.delivered_orders_count) || 0,
    },
  };
};

/**
 * Transforme l'activité récente
 * @param {Array} activityData - Données brutes d'activité
 * @returns {Array} Activité transformée
 */
const transformRecentActivity = (activityData) => {
  return activityData.map((item) => ({
    type: item.type,
    id: item.id,
    title: item.titre,
    status: item.statut,
    date: item.date,
    client_name: item.client_nom,
    amount: item.cout_final ? parseFloat(item.cout_final) : null,
    status_emoji: getStatusEmoji(item.type, item.statut),
  }));
};

/**
 * Transforme les top clients
 * @param {Array} clientsData - Données brutes clients
 * @returns {Array} Top clients transformés
 */
const transformTopClients = (clientsData) => {
  return clientsData.map((item) => ({
    id: item.id,
    name: `${item.prenom} ${item.nom}`,
    email: item.email,
    type: item.type_client,
    ticket_count: parseInt(item.ticket_count),
    order_count: parseInt(item.order_count),
    total_revenue: parseFloat(item.total_revenue) || 0,
    value_emoji: getValueEmoji(parseFloat(item.total_revenue)),
  }));
};

// ==================== CALCULS MÉTIER ====================

/**
 * Calcule les KPIs principaux
 * @param {Object} stats - Statistiques générales
 * @param {Object} performance - Métriques performance
 * @param {string} period - Période
 * @returns {Object} KPIs calculés
 */
const calculateKPIs = (stats, performance, period) => {
  const {
    total_tickets = 0,
    tickets_traites = 0,
    total_commandes = 0,
    commandes_livrees = 0,
    revenus_periode = 0,
    new_clients = 0,
  } = stats;

  return {
    // Taux de résolution tickets
    ticket_resolution_rate: calculatePercentage(tickets_traites, total_tickets),

    // Taux de livraison commandes
    order_delivery_rate: calculatePercentage(
      commandes_livrees,
      total_commandes
    ),

    // Revenu moyen par commande
    average_order_value:
      commandes_livrees > 0
        ? Math.round((revenus_periode / commandes_livrees) * 100) / 100
        : 0,

    // Temps moyen résolution
    average_resolution_time: performance.avg_ticket_resolution_hours
      ? Math.round(performance.avg_ticket_resolution_hours * 100) / 100
      : 0,

    // Acquisition clients
    client_acquisition: new_clients,

    // Satisfaction (placeholder - à calculer avec notes)
    satisfaction_score: calculateSatisfactionScore(stats),
  };
};

/**
 * Calcule un pourcentage sécurisé
 * @param {number} part - Partie
 * @param {number} total - Total
 * @returns {number} Pourcentage
 */
const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 10000) / 100; // 2 décimales
};

/**
 * Calcule le taux de croissance
 * @param {number} previous - Valeur précédente
 * @param {number} current - Valeur actuelle
 * @returns {number} Taux croissance
 */
const calculateGrowthRate = (previous, current) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
};

/**
 * Calcule la croissance d'une tendance
 * @param {Array} values - Valeurs de la tendance
 * @returns {number} Croissance
 */
const calculateTrendGrowth = (values) => {
  if (values.length < 2) return 0;

  const first = values[0] || 0;
  const last = values[values.length - 1] || 0;

  if (first === 0) return last > 0 ? 100 : 0;
  return Math.round(((last - first) / first) * 10000) / 100;
};

/**
 * Calcule un score de satisfaction (placeholder)
 * @param {Object} stats - Statistiques
 * @returns {number} Score satisfaction
 */
const calculateSatisfactionScore = (stats) => {
  // Logique simplifiée - à améliorer avec les notes réelles
  const { tickets_traites = 0, total_tickets = 0 } = stats;
  const resolutionRate = calculatePercentage(tickets_traites, total_tickets);

  // Base sur le taux de résolution + facteur aléatoire pour la démo
  return Math.min(100, Math.round(resolutionRate * 0.8 + Math.random() * 20));
};

// ==================== UTILITAIRES ====================

/**
 * Formate les labels de tendance selon la période
 * @param {string} date - Date
 * @param {string} period - Période
 * @returns {string} Label formaté
 */
const formatTrendLabel = (date, period) => {
  const dateObj = new Date(date);

  switch (period) {
    case "day":
      return dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit" });
    case "week":
    case "month":
      return dateObj.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
    case "year":
      return dateObj.toLocaleDateString("fr-FR", { month: "short" });
    default:
      return dateObj.toLocaleDateString("fr-FR");
  }
};

/**
 * Retourne l'emoji correspondant au statut
 * @param {string} type - Type (ticket/commande)
 * @param {string} status - Statut
 * @returns {string} Emoji
 */
const getStatusEmoji = (type, status) => {
  const emojis = {
    ticket: {
      en_attente: "⏳",
      en_cours_etude: "🔍",
      rejete: "❌",
      accepte: "✅",
      assigne: "👤",
      en_cours_traitement: "⚙️",
      traite: "🎉",
    },
    commande: {
      en_attente: "⏳",
      contrat_accepte: "📝",
      en_cours_developpement: "🚧",
      livraison: "🚚",
      livree: "🎉",
      annulee: "❌",
    },
  };

  return emojis[type]?.[status] || "📋";
};

/**
 * Retourne l'emoji de valeur pour les clients
 * @param {number} revenue - Revenu
 * @returns {string} Emoji
 */
const getValueEmoji = (revenue) => {
  if (revenue >= 10000) return "💰";
  if (revenue >= 5000) return "💵";
  if (revenue >= 1000) return "💳";
  return "💸";
};

/**
 * Valide les inputs du dashboard
 * @param {string} entrepriseId - ID entreprise
 * @param {string} period - Période
 */
const validateDashboardInput = (entrepriseId, period) => {
  if (!isValidUUID(entrepriseId)) {
    throw new ApiError("ID entreprise invalide", 400);
  }

  const validPeriods = ["day", "week", "month", "year"];
  if (!validPeriods.includes(period)) {
    throw new ApiError(
      `Période invalide. Valides: ${validPeriods.join(", ")}`,
      400
    );
  }
};

/**
 * Valide si un UUID est valide
 * @param {string} uuid - UUID à valider
 * @returns {boolean}
 */
const isValidUUID = (uuid) => {
  if (!uuid) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
