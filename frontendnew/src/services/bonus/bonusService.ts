/**
 * Service de gestion des bonus
 * 
 * PROBLÈME RÉSOLU :
 * Avant : Les pages bonus utilisaient des données mockées
 * Pourquoi c'était mauvais :
 * - Pas de vraies données depuis l'API
 * - Impossible de créer/modifier des bonus
 * - Pas de synchronisation avec le backend
 * 
 * SOLUTION :
 * Service centralisé qui :
 * - Encapsule tous les appels API liés aux bonus
 * - Gère la transformation des données
 * - Fournit des méthodes simples et typées
 */

import { apiClient } from "../api/apiClient";
import { API_ENDPOINTS } from "../../config/api.config";
import { logger } from "../../utils/logger";
import type {
  Bonus,
  CreateBonusData,
  UpdateBonusData,
  PaginatedResponse,
} from "../../types/api.types";

/**
 * Options pour lister les bonus
 */
export interface ListBonusOptions {
  page?: number;
  limit?: number;
  est_actif?: boolean;
}

/**
 * Service de gestion des bonus
 */
class BonusService {
  /**
   * Créer un nouveau bonus (entreprise seulement)
   * 
   * @param data - Données du bonus à créer
   * @returns Bonus créé
   */
  async createBonus(data: CreateBonusData): Promise<Bonus> {
    try {
      logger.info("Création d'un bonus", { titre: data.titre });
      const bonus = await apiClient.post<Bonus>(API_ENDPOINTS.BONUS.BASE, data);
      logger.info("Bonus créé avec succès", { bonus_id: bonus.id });
      return bonus;
    } catch (error) {
      logger.error("Erreur lors de la création du bonus", error);
      throw error;
    }
  }

  /**
   * Lister les bonus avec filtres et pagination
   * 
   * Comportement différent selon le type d'utilisateur:
   * - Entreprise: voit ses propres bonus
   * - Client: voit les bonus qui lui sont applicables
   * 
   * @param options - Options de filtrage et pagination
   * @returns Liste paginée des bonus
   */
  async listBonus(options: ListBonusOptions = {}): Promise<PaginatedResponse<Bonus>> {
    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.est_actif !== undefined) {
        params.append("est_actif", options.est_actif.toString());
      }

      const queryString = params.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.BONUS.BASE}?${queryString}`
        : API_ENDPOINTS.BONUS.BASE;

      logger.debug("Récupération de la liste des bonus", options);
      const response = await apiClient.get<{
        success: boolean;
        bonus: Bonus[];
        pagination: Pagination;
      }>(endpoint);

      // Adapter la structure de réponse backend vers le format attendu
      const adaptedResponse: PaginatedResponse<Bonus> = {
        items: response.bonus || [],
        pagination: response.pagination,
      };

      logger.debug("Bonus récupérés", {
        count: adaptedResponse.items.length,
      });
      return adaptedResponse;
    } catch (error) {
      logger.error("Erreur lors de la récupération des bonus", error);
      throw error;
    }
  }

  /**
   * Récupérer un bonus par son ID
   * 
   * @param id - ID du bonus
   * @returns Bonus avec ses détails
   */
  async getBonus(id: string): Promise<Bonus> {
    try {
      logger.debug("Récupération du bonus", { bonus_id: id });
      const bonus = await apiClient.get<Bonus>(`${API_ENDPOINTS.BONUS.BASE}/${id}`);
      logger.debug("Bonus récupéré", { bonus_id: bonus.id });
      return bonus;
    } catch (error) {
      logger.error("Erreur lors de la récupération du bonus", error);
      throw error;
    }
  }

  /**
   * Mettre à jour un bonus (entreprise seulement)
   * 
   * @param id - ID du bonus
   * @param data - Données à mettre à jour
   * @returns Bonus mis à jour
   */
  async updateBonus(id: string, data: UpdateBonusData): Promise<Bonus> {
    try {
      logger.info("Mise à jour du bonus", { bonus_id: id });
      const bonus = await apiClient.put<Bonus>(
        `${API_ENDPOINTS.BONUS.BASE}/${id}`,
        data
      );
      logger.info("Bonus mis à jour", { bonus_id: bonus.id });
      return bonus;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du bonus", error);
      throw error;
    }
  }

  /**
   * Activer/désactiver un bonus (entreprise seulement)
   * 
   * @param id - ID du bonus
   * @returns Bonus mis à jour
   */
  async toggleBonusActif(id: string): Promise<Bonus> {
    try {
      logger.info("Changement du statut actif du bonus", { bonus_id: id });
      const bonus = await apiClient.patch<Bonus>(
        `${API_ENDPOINTS.BONUS.BASE}/${id}/toggle-actif`
      );
      logger.info("Statut du bonus changé", { bonus_id: bonus.id });
      return bonus;
    } catch (error) {
      logger.error("Erreur lors du changement de statut du bonus", error);
      throw error;
    }
  }

  /**
   * Supprimer un bonus (entreprise seulement)
   * 
   * @param id - ID du bonus
   */
  async deleteBonus(id: string): Promise<void> {
    try {
      logger.info("Suppression du bonus", { bonus_id: id });
      await apiClient.delete(`${API_ENDPOINTS.BONUS.BASE}/${id}`);
      logger.info("Bonus supprimé", { bonus_id: id });
    } catch (error) {
      logger.error("Erreur lors de la suppression du bonus", error);
      throw error;
    }
  }

  /**
   * Récupérer les bonus applicables pour le client connecté
   * 
   * @returns Liste des bonus applicables
   */
  async getMesBonus(): Promise<Bonus[]> {
    try {
      logger.debug("Récupération des bonus applicables");
      const response = await apiClient.get<{ bonus: Bonus[] }>(
        `${API_ENDPOINTS.BONUS.BASE}/client/mes-bonus`
      );
      logger.debug("Bonus applicables récupérés", { count: response.bonus.length });
      return response.bonus;
    } catch (error) {
      logger.error("Erreur lors de la récupération des bonus applicables", error);
      throw error;
    }
  }

  /**
   * Appliquer/utiliser un bonus (client seulement)
   * 
   * @param id - ID du bonus
   * @param commande_id - ID de la commande (optionnel)
   */
  async applyBonus(id: string, commande_id?: string): Promise<void> {
    try {
      logger.info("Application d'un bonus", { bonus_id: id, commande_id });
      await apiClient.post(`${API_ENDPOINTS.BONUS.BASE}/${id}/apply`, {
        commande_id,
      });
      logger.info("Bonus appliqué", { bonus_id: id });
    } catch (error) {
      logger.error("Erreur lors de l'application du bonus", error);
      throw error;
    }
  }
}

// Export d'une instance singleton
export const bonusService = new BonusService();

