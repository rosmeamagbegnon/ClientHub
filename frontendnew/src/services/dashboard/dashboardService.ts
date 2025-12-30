/**
 * Service de gestion du dashboard
 * 
 * PROBLÈME RÉSOLU :
 * Avant : Les pages dashboard utilisaient des données hardcodées
 * Pourquoi c'était mauvais :
 * - Pas de vraies données depuis l'API
 * - Statistiques non synchronisées avec le backend
 * - Pas de données en temps réel
 * 
 * SOLUTION :
 * Service centralisé qui :
 * - Encapsule tous les appels API liés au dashboard
 * - Gère la transformation des données
 * - Fournit des méthodes simples et typées
 */

import { apiClient } from "../api/apiClient";
import { API_ENDPOINTS } from "../../config/api.config";
import { logger } from "../../utils/logger";
import type {
  DashboardData,
  DashboardOverview,
  TrendData,
  QuickStats,
} from "../../types/api.types";

/**
 * Période d'analyse
 */
export type Period = "day" | "week" | "month" | "year";

/**
 * Métrique pour les tendances
 */
export type Metric = "tickets" | "commandes" | "revenus" | "clients";

/**
 * Service de gestion du dashboard
 */
class DashboardService {
  /**
   * Récupérer toutes les données du dashboard (entreprise seulement)
   * 
   * @param period - Période d'analyse (défaut: "month")
   * @returns Dashboard complet avec toutes les données
   */
  async getDashboard(period: Period = "month"): Promise<DashboardData> {
    try {
      logger.debug("Récupération du dashboard complet", { period });
      // Le backend retourne { success: true, ...data }
      const response = await apiClient.get<{ success: boolean } & DashboardData>(
        `${API_ENDPOINTS.DASHBOARD.BASE}?period=${period}`
      );
      // Extraire les données (sans success)
      const { success, ...dashboard } = response;
      logger.debug("Dashboard récupéré", { period });
      return dashboard as DashboardData;
    } catch (error) {
      logger.error("Erreur lors de la récupération du dashboard", error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques générales et KPIs (entreprise seulement)
   * 
   * @param period - Période d'analyse (défaut: "month")
   * @returns Statistiques générales
   */
  async getOverview(period: Period = "month"): Promise<{
    overview: DashboardOverview;
    kpis: DashboardData["kpis"];
  }> {
    try {
      logger.debug("Récupération des statistiques générales", { period });
      const response = await apiClient.get<{
        overview: DashboardOverview;
        kpis: DashboardData["kpis"];
      }>(`${API_ENDPOINTS.DASHBOARD.OVERVIEW}?period=${period}`);
      logger.debug("Statistiques générales récupérées");
      return response;
    } catch (error) {
      logger.error("Erreur lors de la récupération des statistiques", error);
      throw error;
    }
  }

  /**
   * Récupérer les données de tendance pour un métrique (entreprise seulement)
   * 
   * @param metric - Métrique à analyser
   * @param period - Période d'analyse (défaut: "month")
   * @returns Données de tendance
   */
  async getTrends(metric: Metric, period: Period = "month"): Promise<TrendData> {
    try {
      logger.debug("Récupération des données de tendance", { metric, period });
      const response = await apiClient.get<{ data: TrendData }>(
        `${API_ENDPOINTS.DASHBOARD.TRENDS}?metric=${metric}&period=${period}`
      );
      logger.debug("Données de tendance récupérées", { metric });
      return response.data;
    } catch (error) {
      logger.error("Erreur lors de la récupération des tendances", error);
      throw error;
    }
  }

  /**
   * Récupérer les métriques rapides (entreprise seulement)
   * 
   * @param period - Période d'analyse (défaut: "month")
   * @returns Métriques rapides
   */
  async getQuickStats(period: Period = "month"): Promise<QuickStats> {
    try {
      logger.debug("Récupération des métriques rapides", { period });
      const stats = await apiClient.get<QuickStats>(
        `${API_ENDPOINTS.DASHBOARD.QUICK_STATS}?period=${period}`
      );
      logger.debug("Métriques rapides récupérées");
      return stats;
    } catch (error) {
      logger.error("Erreur lors de la récupération des métriques rapides", error);
      throw error;
    }
  }
}

// Export d'une instance singleton
export const dashboardService = new DashboardService();

