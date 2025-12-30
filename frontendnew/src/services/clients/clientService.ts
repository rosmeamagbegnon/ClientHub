/**
 * Service de gestion des clients (pour les entreprises)
 * 
 * PROBLÈME RÉSOLU :
 * Avant : Les pages clients utilisaient des données mockées
 * Pourquoi c'était mauvais :
 * - Pas de vraies données depuis l'API
 * - Impossible de voir les vrais clients
 * - Pas de synchronisation avec le backend
 * 
 * SOLUTION :
 * Service centralisé qui :
 * - Récupère les clients depuis le dashboard (top clients)
 * - Combine les données de tickets et commandes pour extraire les clients
 * - Encapsule tous les appels API liés aux clients
 * - Gère la transformation des données
 * - Fournit des méthodes simples et typées
 */

import { apiClient } from "../api/apiClient";
import { API_ENDPOINTS } from "../../config/api.config";
import { logger } from "../../utils/logger";
import { ticketService } from "../tickets/ticketService";
import { commandeService } from "../commandes/commandeService";
import type { Ticket, Commande } from "../../types/api.types";

/**
 * Type de client
 */
export type ClientType = "particulier" | "entreprise";

/**
 * Client (pour l'affichage dans la liste)
 */
export interface Client {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  type: ClientType;
  // Statistiques
  nombre_tickets?: number;
  nombre_commandes?: number;
  derniere_activite?: string;
}

/**
 * Top client depuis le dashboard
 */
export interface TopClient {
  client_id: string;
  client_nom: string;
  client_email?: string;
  client_telephone?: string;
  type_client: ClientType;
  nombre_tickets: number;
  nombre_commandes: number;
  total_revenus?: number;
  derniere_activite: string;
}

/**
 * Options pour lister les clients
 */
export interface ListClientsOptions {
  page?: number;
  limit?: number;
  type?: ClientType;
  search?: string;
}

/**
 * Service de gestion des clients
 */
class ClientService {
  /**
   * Récupérer les top clients depuis le dashboard
   * 
   * @param limit - Nombre de clients à récupérer (défaut: 100)
   * @returns Liste des top clients
   */
  async getTopClients(limit: number = 100): Promise<TopClient[]> {
    try {
      logger.debug("Récupération des top clients", { limit });
      
      const response = await apiClient.get<{
        success: boolean;
        clients: TopClient[];
      }>(`${API_ENDPOINTS.CLIENTS.BASE}?limit=${limit}`);

      logger.debug("Top clients récupérés", {
        count: response.clients?.length || 0,
      });

      return response.clients || [];
    } catch (error) {
      logger.error("Erreur lors de la récupération des top clients", error);
      throw error;
    }
  }

  /**
   * Extraire les clients uniques depuis les tickets et commandes
   * 
   * @param options - Options de filtrage
   * @returns Liste des clients uniques
   */
  async listClients(
    options: ListClientsOptions = {}
  ): Promise<Client[]> {
    try {
      logger.debug("Récupération de la liste des clients", options);

      // Récupérer les tickets et commandes pour extraire les clients
      const [ticketsData, commandesData] = await Promise.all([
        ticketService.listTickets({
          page: 1,
          limit: 100, // Limite max backend
        }),
        commandeService.listCommandes({
          page: 1,
          limit: 100, // Limite max backend
        }),
      ]);

      // Créer un Map pour stocker les clients uniques
      const clientsMap = new Map<string, Client>();

      // Extraire les clients depuis les tickets
      ticketsData.items.forEach((ticket: Ticket) => {
        if (ticket.client_id && !clientsMap.has(ticket.client_id)) {
          // TODO: Récupérer les détails du client depuis l'API si nécessaire
          // Pour l'instant, on utilise les données disponibles
          clientsMap.set(ticket.client_id, {
            id: ticket.client_id,
            nom: `Client ${ticket.client_id.slice(0, 8)}`, // Placeholder
            email: "", // À récupérer depuis l'API
            type: "particulier", // Par défaut, à déterminer depuis l'API
            nombre_tickets: 1,
          });
        } else if (ticket.client_id) {
          // Incrémenter le nombre de tickets
          const client = clientsMap.get(ticket.client_id)!;
          client.nombre_tickets = (client.nombre_tickets || 0) + 1;
        }
      });

      // Extraire les clients depuis les commandes
      commandesData.items.forEach((commande: Commande) => {
        if (commande.client_id && !clientsMap.has(commande.client_id)) {
          clientsMap.set(commande.client_id, {
            id: commande.client_id,
            nom: `Client ${commande.client_id.slice(0, 8)}`, // Placeholder
            email: "", // À récupérer depuis l'API
            type: "particulier", // Par défaut, à déterminer depuis l'API
            nombre_commandes: 1,
          });
        } else if (commande.client_id) {
          // Incrémenter le nombre de commandes
          const client = clientsMap.get(commande.client_id)!;
          client.nombre_commandes = (client.nombre_commandes || 0) + 1;
        }
      });

      // Convertir le Map en tableau
      let clients = Array.from(clientsMap.values());

      // Appliquer les filtres
      if (options.type) {
        clients = clients.filter((c) => c.type === options.type);
      }
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        clients = clients.filter(
          (c) =>
            c.nom.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower)
        );
      }

      logger.debug("Clients récupérés", { count: clients.length });

      return clients;
    } catch (error) {
      logger.error("Erreur lors de la récupération des clients", error);
      throw error;
    }
  }

  /**
   * Récupérer les clients combinés (top clients + clients extraits)
   * 
   * @param options - Options de filtrage
   * @returns Liste des clients combinés
   */
  async listAllClients(
    options: ListClientsOptions = {}
  ): Promise<Client[]> {
    try {
      logger.debug("Récupération de tous les clients", options);

      // Récupérer les top clients et les clients extraits
      const [topClients, extractedClients] = await Promise.all([
        this.getTopClients(100),
        this.listClients(options),
      ]);

      // Combiner et dédupliquer
      const clientsMap = new Map<string, Client>();

      // Ajouter les top clients
      topClients.forEach((topClient) => {
        clientsMap.set(topClient.client_id, {
          id: topClient.client_id,
          nom: topClient.client_nom,
          email: topClient.client_email || "",
          telephone: topClient.client_telephone,
          type: topClient.type_client,
          nombre_tickets: topClient.nombre_tickets,
          nombre_commandes: topClient.nombre_commandes,
          derniere_activite: topClient.derniere_activite,
        });
      });

      // Fusionner avec les clients extraits (mettre à jour les stats)
      extractedClients.forEach((client) => {
        if (clientsMap.has(client.id)) {
          const existing = clientsMap.get(client.id)!;
          existing.nombre_tickets = Math.max(
            existing.nombre_tickets || 0,
            client.nombre_tickets || 0
          );
          existing.nombre_commandes = Math.max(
            existing.nombre_commandes || 0,
            client.nombre_commandes || 0
          );
        } else {
          clientsMap.set(client.id, client);
        }
      });

      let clients = Array.from(clientsMap.values());

      // Appliquer les filtres
      if (options.type) {
        clients = clients.filter((c) => c.type === options.type);
      }
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        clients = clients.filter(
          (c) =>
            c.nom.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower)
        );
      }

      logger.debug("Tous les clients récupérés", { count: clients.length });

      return clients;
    } catch (error) {
      logger.error("Erreur lors de la récupération de tous les clients", error);
      throw error;
    }
  }
}

// Export d'une instance singleton
export const clientService = new ClientService();

