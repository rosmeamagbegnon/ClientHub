/**
 * Types TypeScript pour les réponses API
 *
 * Ce fichier centralise tous les types liés aux réponses de l'API backend.
 * Cela évite la duplication et assure la cohérence dans tout le projet.
 */

/**
 * Structure standardisée des réponses API du backend
 * Le backend retourne toujours cette structure : { success, message, data }
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Structure d'erreur API standardisée
 */
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

/**
 * Informations d'authentification retournées après login/register
 */
export interface AuthResponse {
  token: string;
  user: ClientProfile | EntrepriseProfile;
}

/**
 * Profil client (particulier ou entreprise client)
 */
export interface ClientProfile {
  id: string;
  prenom?: string;
  nom?: string;
  email: string;
  telephone?: string;
  type_client: "particulier" | "entreprise";
  canal_contact?: "email" | "whatsapp" | "sms";
  // Pour les clients entreprise
  nom_entreprise?: string;
  secteur_activite?: string;
  taille_entreprise?: string;
  numero_rccm?: string;
  poste_occupe?: string;
}

/**
 * Profil entreprise CRM
 */
export interface EntrepriseProfile {
  id: string;
  nom_entreprise: string;
  secteur_activite: string;
  taille_entreprise: string;
  numero_rccm_ifu: string;
  email_entreprise: string;
  telephone_entreprise: string;
  whatsapp_entreprise: string;
  adresse_professionnelle: string;
  site_internet?: string;
  linkedin?: string;
  prenom_responsable: string;
  nom_responsable: string;
  email_responsable: string;
  est_active: boolean;
  date_creation: string;
  dernier_login?: string;
}

/**
 * Ticket
 */
export interface Ticket {
  id: string;
  client_id: string;
  entreprise_id: string;
  titre: string;
  description: string;
  type_ticket:
    | "facturation"
    | "réclamation"
    | "technique"
    | "suggestion"
    | "autre";
  statut:
    | "en_attente"
    | "en_cours_etude"
    | "rejete"
    | "accepte"
    | "assigne"
    | "en_cours_traitement"
    | "traite";
  priorite: "basse" | "normal" | "haute" | "urgente";
  date_creation: string;
  date_modification: string;
  notes?: TicketNote[];
}

/**
 * Note sur un ticket
 */
export interface TicketNote {
  id: string;
  ticket_id: string;
  auteur_id: string;
  contenu: string;
  est_publique: boolean;
  date_creation: string;
}

/**
 * Données pour créer un ticket
 */
export interface CreateTicketData {
  entreprise_id: string;
  titre: string;
  description: string;
  type_ticket:
    | "facturation"
    | "réclamation"
    | "technique"
    | "suggestion"
    | "autre";
  priorite?: "basse" | "normal" | "haute" | "urgente";
}

/**
 * Données pour mettre à jour le statut d'un ticket
 */
export interface UpdateTicketStatusData {
  statut: Ticket["statut"];
}

/**
 * Données pour ajouter une note à un ticket
 */
export interface AddTicketNoteData {
  contenu: string;
  est_publique?: boolean;
}

/**
 * Pagination
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Réponse paginée
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}
