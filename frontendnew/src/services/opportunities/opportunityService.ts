/**
 * Service de gestion des opportunités
 *
 * PROBLÈME RÉSOLU :
 * Avant : Les pages opportunités utilisaient des données mockées
 * Pourquoi c'était mauvais :
 * - Pas de vraies données depuis l'API
 * - Impossible de gérer les opportunités depuis les commandes
 * - Pas de synchronisation avec le backend
 *
 * SOLUTION :
 * Service centralisé qui :
 * - Mappe les commandes en opportunités (pas d'endpoint dédié)
 * - Encapsule tous les appels API liés aux opportunités
 * - Gère la transformation des données
 * - Fournit des méthodes simples et typées
 *
 * NOTE : Les opportunités sont mappées depuis les commandes car il n'y a pas
 * d'endpoint dédié pour les opportunités dans le backend.
 */

import { logger } from "../../utils/logger";
import { commandeService } from "../commandes/commandeService";
import type {
  Commande,
  PaginatedResponse,
  UpdateCommandeStatusData,
  AddCommandeNoteData,
} from "../../types/api.types";

/**
 * Stage d'une opportunité (mappé depuis le statut de la commande)
 */
export type OpportunityStage =
  | "Nouveau"
  | "En cours d'étude"
  | "Contrat accepté"
  | "En cours de développement"
  | "Livraison"
  | "Gagné"
  | "Perdu";

/**
 * Opportunité (mappée depuis une Commande)
 */
export interface Opportunity {
  id: string;
  title: string;
  company: string;
  owner: string;
  value: number;
  stage: OpportunityStage;
  closeDate: string;
  notes: string[];
  // Données supplémentaires de la commande
  commande: Commande;
}

/**
 * Options pour lister les opportunités
 */
export interface ListOpportunitiesOptions {
  page?: number;
  limit?: number;
  stage?: OpportunityStage;
  company?: string;
  owner?: string;
}

/**
 * Service de gestion des opportunités
 */
class OpportunityService {
  /**
   * Mapper une commande en opportunité
   *
   * @param commande - Commande à mapper
   * @returns Opportunité mappée
   */
  private mapCommandeToOpportunity(commande: Commande): Opportunity {
    // Mapper le statut de la commande vers le stage de l'opportunité
    const stageMap: Record<Commande["statut"], OpportunityStage> = {
      en_attente: "Nouveau",
      contrat_accepte: "Contrat accepté",
      en_cours_developpement: "En cours de développement",
      livraison: "Livraison",
      livree: "Gagné",
      annulee: "Perdu",
    };

    // Extraire les notes publiques
    const notes = (commande.notes || [])
      .filter((note) => note.est_publique)
      .map((note) => note.contenu);

    return {
      id: commande.id,
      title: commande.titre,
      company: commande.entreprise_id, // TODO: Récupérer le nom de l'entreprise si nécessaire
      owner: commande.client_id, // TODO: Récupérer le nom du client si nécessaire
      value: commande.cout_estime || commande.cout_final || 0,
      stage: stageMap[commande.statut] || "Nouveau",
      closeDate:
        commande.date_livraison ||
        commande.date_modification ||
        commande.date_creation,
      notes,
      commande,
    };
  }

  /**
   * Mapper un stage d'opportunité vers un statut de commande
   *
   * @param stage - Stage de l'opportunité
   * @returns Statut de la commande correspondant
   */
  private mapOpportunityStageToCommandeStatus(
    stage: OpportunityStage
  ): Commande["statut"] {
    const statusMap: Record<OpportunityStage, Commande["statut"]> = {
      Nouveau: "en_attente",
      "En cours d'étude": "en_attente", // Pas de statut exact, on garde en_attente
      "Contrat accepté": "contrat_accepte",
      "En cours de développement": "en_cours_developpement",
      Livraison: "livraison",
      Gagné: "livree",
      Perdu: "annulee",
    };

    return statusMap[stage] || "en_attente";
  }

  /**
   * Lister les opportunités (mappées depuis les commandes)
   *
   * @param options - Options de filtrage et pagination
   * @returns Liste paginée des opportunités
   */
  async listOpportunities(
    options: ListOpportunitiesOptions = {}
  ): Promise<PaginatedResponse<Opportunity>> {
    try {
      logger.debug(
        "Récupération des opportunités depuis les commandes",
        options
      );

      // Récupérer toutes les commandes
      // Limite max: 100 (selon le backend)
      const commandesData = await commandeService.listCommandes({
        page: options.page || 1,
        limit: options.limit || 100,
      });

      // Mapper les commandes en opportunités
      let opportunities = commandesData.items.map((commande) =>
        this.mapCommandeToOpportunity(commande)
      );

      // Appliquer les filtres
      if (options.stage) {
        opportunities = opportunities.filter((o) => o.stage === options.stage);
      }
      if (options.company) {
        opportunities = opportunities.filter((o) =>
          o.company.toLowerCase().includes(options.company!.toLowerCase())
        );
      }
      if (options.owner) {
        opportunities = opportunities.filter((o) => o.owner === options.owner);
      }

      logger.debug("Opportunités récupérées", {
        count: opportunities.length,
      });

      return {
        items: opportunities,
        pagination: commandesData.pagination,
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des opportunités", error);
      throw error;
    }
  }

  /**
   * Mettre à jour le stage d'une opportunité
   * (Met à jour le statut de la commande correspondante)
   *
   * @param id - ID de l'opportunité (ID de la commande)
   * @param stage - Nouveau stage
   * @returns Opportunité mise à jour
   */
  async updateOpportunityStage(
    id: string,
    stage: OpportunityStage
  ): Promise<Opportunity> {
    try {
      logger.info("Mise à jour du stage d'une opportunité", {
        opportunity_id: id,
        stage,
      });

      // Mapper le stage vers le statut de commande
      const statut = this.mapOpportunityStageToCommandeStatus(stage);

      // Mettre à jour le statut de la commande
      const updateData: UpdateCommandeStatusData = { statut };
      const commande = await commandeService.updateCommandeStatus(
        id,
        updateData
      );

      // Mapper la commande mise à jour en opportunité
      const opportunity = this.mapCommandeToOpportunity(commande);

      logger.info("Stage de l'opportunité mis à jour avec succès", {
        opportunity_id: id,
        stage,
      });

      return opportunity;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du stage", error);
      throw error;
    }
  }

  /**
   * Ajouter une note à une opportunité
   * (Ajoute une note à la commande correspondante)
   *
   * @param id - ID de l'opportunité (ID de la commande)
   * @param content - Contenu de la note
   * @returns Promise<void>
   */
  async addNote(id: string, content: string): Promise<void> {
    try {
      logger.info("Ajout d'une note à une opportunité", {
        opportunity_id: id,
      });

      const noteData: AddCommandeNoteData = {
        contenu: content,
        est_publique: true,
      };

      await commandeService.addNote(id, noteData);

      logger.info("Note ajoutée avec succès", { opportunity_id: id });
    } catch (error) {
      logger.error("Erreur lors de l'ajout de la note", error);
      throw error;
    }
  }

  /**
   * Récupérer une opportunité par son ID
   *
   * @param id - ID de l'opportunité (ID de la commande)
   * @returns Opportunité
   */
  async getOpportunityById(id: string): Promise<Opportunity> {
    try {
      logger.debug("Récupération d'une opportunité", { opportunity_id: id });

      const commande = await commandeService.getCommande(id);
      const opportunity = this.mapCommandeToOpportunity(commande);

      logger.debug("Opportunité récupérée", { opportunity_id: id });
      return opportunity;
    } catch (error) {
      logger.error("Erreur lors de la récupération de l'opportunité", error);
      throw error;
    }
  }
}

// Export d'une instance singleton
export const opportunityService = new OpportunityService();
