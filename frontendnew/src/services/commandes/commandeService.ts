/**
 * Service de gestion des commandes
 * 
 * PROBLÈME RÉSOLU :
 * Avant : Les pages commandes utilisaient des données mockées
 * Pourquoi c'était mauvais :
 * - Pas de vraies données depuis l'API
 * - Impossible de créer/modifier des commandes
 * - Pas de synchronisation avec le backend
 * 
 * SOLUTION :
 * Service centralisé qui :
 * - Encapsule tous les appels API liés aux commandes
 * - Gère la transformation des données
 * - Fournit des méthodes simples et typées
 */

import { apiClient } from "../api/apiClient";
import { API_ENDPOINTS } from "../../config/api.config";
import { logger } from "../../utils/logger";
import type {
  Commande,
  CreateCommandeData,
  UpdateCommandeStatusData,
  UpdateCommandeEtapeData,
  UpdateCommandeCoutFinalData,
  AddCommandeNoteData,
  CommandeNote,
  PaginatedResponse,
} from "../../types/api.types";

/**
 * Options pour lister les commandes
 */
export interface ListCommandesOptions {
  page?: number;
  limit?: number;
  statut?: Commande["statut"];
}

/**
 * Service de gestion des commandes
 */
class CommandeService {
  /**
   * Créer une nouvelle commande
   * 
   * @param data - Données de la commande à créer
   * @returns Commande créée
   */
  async createCommande(data: CreateCommandeData): Promise<Commande> {
    try {
      logger.info("Création d'une commande", { entreprise_id: data.entreprise_id });
      const commande = await apiClient.post<Commande>(
        API_ENDPOINTS.COMMANDES.BASE,
        data
      );
      logger.info("Commande créée avec succès", { commande_id: commande.id });
      return commande;
    } catch (error) {
      logger.error("Erreur lors de la création de la commande", error);
      throw error;
    }
  }

  /**
   * Lister les commandes avec filtres et pagination
   * 
   * Comportement différent selon le type d'utilisateur:
   * - Client: voit uniquement ses propres commandes
   * - Entreprise: voit les commandes qui lui sont adressées
   * 
   * @param options - Options de filtrage et pagination
   * @returns Liste paginée des commandes
   */
  async listCommandes(
    options: ListCommandesOptions = {}
  ): Promise<PaginatedResponse<Commande>> {
    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.statut) params.append("statut", options.statut);

      const queryString = params.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.COMMANDES.BASE}?${queryString}`
        : API_ENDPOINTS.COMMANDES.BASE;

      logger.debug("Récupération de la liste des commandes", options);
      const response = await apiClient.get<{
        success: boolean;
        commandes: Commande[];
        pagination: Pagination;
      }>(endpoint);

      // Adapter la structure de réponse backend vers le format attendu
      const adaptedResponse: PaginatedResponse<Commande> = {
        items: response.commandes || [],
        pagination: response.pagination,
      };

      logger.debug("Commandes récupérées", {
        count: adaptedResponse.items.length,
      });
      return adaptedResponse;
    } catch (error) {
      logger.error("Erreur lors de la récupération des commandes", error);
      throw error;
    }
  }

  /**
   * Récupérer une commande par son ID
   * 
   * @param id - ID de la commande
   * @returns Commande avec ses notes
   */
  async getCommande(id: string): Promise<Commande> {
    try {
      logger.debug("Récupération de la commande", { commande_id: id });
      const commande = await apiClient.get<Commande>(
        API_ENDPOINTS.COMMANDES.BY_ID(id)
      );
      logger.debug("Commande récupérée", { commande_id: commande.id });
      return commande;
    } catch (error) {
      logger.error("Erreur lors de la récupération de la commande", error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'une commande (entreprise seulement)
   * 
   * @param id - ID de la commande
   * @param data - Nouveau statut
   * @returns Commande mise à jour
   */
  async updateCommandeStatus(
    id: string,
    data: UpdateCommandeStatusData
  ): Promise<Commande> {
    try {
      logger.info("Mise à jour du statut de la commande", {
        commande_id: id,
        statut: data.statut,
      });
      const commande = await apiClient.patch<Commande>(
        `${API_ENDPOINTS.COMMANDES.BY_ID(id)}/status`,
        data
      );
      logger.info("Statut de la commande mis à jour", { commande_id: commande.id });
      return commande;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du statut", error);
      throw error;
    }
  }

  /**
   * Mettre à jour l'étape d'une commande (entreprise seulement)
   * 
   * @param id - ID de la commande
   * @param data - Nouvelle étape
   * @returns Commande mise à jour
   */
  async updateCommandeEtape(
    id: string,
    data: UpdateCommandeEtapeData
  ): Promise<Commande> {
    try {
      logger.info("Mise à jour de l'étape de la commande", {
        commande_id: id,
        etape: data.etape_actuelle,
      });
      const commande = await apiClient.patch<Commande>(
        `${API_ENDPOINTS.COMMANDES.BY_ID(id)}/etape`,
        data
      );
      logger.info("Étape de la commande mise à jour", { commande_id: commande.id });
      return commande;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de l'étape", error);
      throw error;
    }
  }

  /**
   * Renseigner le coût final d'une commande (entreprise seulement)
   * 
   * @param id - ID de la commande
   * @param data - Coût final
   * @returns Commande mise à jour
   */
  async updateCoutFinal(
    id: string,
    data: UpdateCommandeCoutFinalData
  ): Promise<Commande> {
    try {
      logger.info("Mise à jour du coût final de la commande", {
        commande_id: id,
        cout_final: data.cout_final,
      });
      const commande = await apiClient.patch<Commande>(
        `${API_ENDPOINTS.COMMANDES.BY_ID(id)}/cout-final`,
        data
      );
      logger.info("Coût final de la commande mis à jour", { commande_id: commande.id });
      return commande;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du coût final", error);
      throw error;
    }
  }

  /**
   * Ajouter une note à une commande
   * 
   * @param id - ID de la commande
   * @param data - Contenu de la note
   * @returns Note créée
   */
  async addNote(id: string, data: AddCommandeNoteData): Promise<CommandeNote> {
    try {
      logger.info("Ajout d'une note à la commande", { commande_id: id });
      const note = await apiClient.post<CommandeNote>(
        `${API_ENDPOINTS.COMMANDES.BY_ID(id)}/notes`,
        data
      );
      logger.info("Note ajoutée à la commande", { note_id: note.id });
      return note;
    } catch (error) {
      logger.error("Erreur lors de l'ajout de la note", error);
      throw error;
    }
  }

  /**
   * Récupérer les notes d'une commande
   * 
   * @param id - ID de la commande
   * @returns Liste des notes
   */
  async getNotes(id: string): Promise<CommandeNote[]> {
    try {
      logger.debug("Récupération des notes de la commande", { commande_id: id });
      const response = await apiClient.get<{ notes: CommandeNote[] }>(
        `${API_ENDPOINTS.COMMANDES.BY_ID(id)}/notes`
      );
      logger.debug("Notes récupérées", { count: response.notes.length });
      return response.notes;
    } catch (error) {
      logger.error("Erreur lors de la récupération des notes", error);
      throw error;
    }
  }
}

// Export d'une instance singleton
export const commandeService = new CommandeService();

