/**
 * Service de gestion des tickets
 * 
 * PROBLÈME RÉSOLU :
 * Avant : Les pages tickets utilisaient des données mockées
 * Pourquoi c'était mauvais :
 * - Pas de vraies données depuis l'API
 * - Impossible de créer/modifier des tickets
 * - Pas de synchronisation avec le backend
 * 
 * SOLUTION :
 * Service centralisé qui :
 * - Encapsule tous les appels API liés aux tickets
 * - Gère la transformation des données
 * - Fournit des méthodes simples et typées
 */

import { apiClient } from "../api/apiClient";
import { API_ENDPOINTS } from "../../config/api.config";
import { logger } from "../../utils/logger";
import {
  Ticket,
  CreateTicketData,
  UpdateTicketStatusData,
  AddTicketNoteData,
  TicketNote,
  PaginatedResponse,
} from "../../types/api.types";

/**
 * Options pour lister les tickets
 */
export interface ListTicketsOptions {
  page?: number;
  limit?: number;
  statut?: Ticket["statut"];
  priorite?: Ticket["priorite"];
  type_ticket?: Ticket["type_ticket"];
}

/**
 * Service de gestion des tickets
 */
class TicketService {
  /**
   * Créer un nouveau ticket
   * 
   * @param data - Données du ticket à créer
   * @returns Ticket créé
   */
  async createTicket(data: CreateTicketData): Promise<Ticket> {
    try {
      logger.info("Création d'un ticket", { entreprise_id: data.entreprise_id });
      const ticket = await apiClient.post<Ticket>(API_ENDPOINTS.TICKETS.BASE, data);
      logger.info("Ticket créé avec succès", { ticket_id: ticket.id });
      return ticket;
    } catch (error) {
      logger.error("Erreur lors de la création du ticket", error);
      throw error;
    }
  }

  /**
   * Lister les tickets avec filtres et pagination
   * 
   * @param options - Options de filtrage et pagination
   * @returns Liste paginée des tickets
   */
  async listTickets(options: ListTicketsOptions = {}): Promise<PaginatedResponse<Ticket>> {
    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.statut) params.append("statut", options.statut);
      if (options.priorite) params.append("priorite", options.priorite);
      if (options.type_ticket) params.append("type_ticket", options.type_ticket);

      const queryString = params.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.TICKETS.BASE}?${queryString}`
        : API_ENDPOINTS.TICKETS.BASE;

      logger.debug("Récupération de la liste des tickets", options);
      const response = await apiClient.get<PaginatedResponse<Ticket>>(endpoint);
      logger.debug("Tickets récupérés", { count: response.items.length });
      return response;
    } catch (error) {
      logger.error("Erreur lors de la récupération des tickets", error);
      throw error;
    }
  }

  /**
   * Récupérer un ticket par son ID
   * 
   * @param id - ID du ticket
   * @returns Ticket avec ses notes
   */
  async getTicket(id: string): Promise<Ticket> {
    try {
      logger.debug("Récupération du ticket", { ticket_id: id });
      const ticket = await apiClient.get<Ticket>(API_ENDPOINTS.TICKETS.BY_ID(id));
      logger.debug("Ticket récupéré", { ticket_id: ticket.id });
      return ticket;
    } catch (error) {
      logger.error("Erreur lors de la récupération du ticket", error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un ticket
   * 
   * @param id - ID du ticket
   * @param data - Nouveau statut
   * @returns Ticket mis à jour
   */
  async updateTicketStatus(id: string, data: UpdateTicketStatusData): Promise<Ticket> {
    try {
      logger.info("Mise à jour du statut du ticket", { ticket_id: id, statut: data.statut });
      const ticket = await apiClient.patch<Ticket>(
        API_ENDPOINTS.TICKETS.STATUS(id),
        data
      );
      logger.info("Statut du ticket mis à jour", { ticket_id: ticket.id });
      return ticket;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du statut", error);
      throw error;
    }
  }

  /**
   * Ajouter une note à un ticket
   * 
   * @param id - ID du ticket
   * @param data - Contenu de la note
   * @returns Note créée
   */
  async addNote(id: string, data: AddTicketNoteData): Promise<TicketNote> {
    try {
      logger.info("Ajout d'une note au ticket", { ticket_id: id });
      const note = await apiClient.post<TicketNote>(
        API_ENDPOINTS.TICKETS.NOTES(id),
        data
      );
      logger.info("Note ajoutée au ticket", { note_id: note.id });
      return note;
    } catch (error) {
      logger.error("Erreur lors de l'ajout de la note", error);
      throw error;
    }
  }

  /**
   * Récupérer les notes d'un ticket
   * 
   * @param id - ID du ticket
   * @returns Liste des notes
   */
  async getNotes(id: string): Promise<TicketNote[]> {
    try {
      logger.debug("Récupération des notes du ticket", { ticket_id: id });
      const response = await apiClient.get<{ notes: TicketNote[] }>(
        API_ENDPOINTS.TICKETS.NOTES(id)
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
export const ticketService = new TicketService();

