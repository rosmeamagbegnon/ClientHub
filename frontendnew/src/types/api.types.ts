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

/**
 * Bonus (système de fidélisation)
 */
export interface Bonus {
  id: string;
  entreprise_id: string;
  titre: string;
  description?: string;
  valeur: number;
  appliquer_a: "tous" | "specifique" | "filtre";
  client_id?: string;
  type_client_filtre?: "particulier" | "entreprise";
  secteur_filtre?: string;
  taille_filtre?: string;
  date_debut: string;
  date_fin: string;
  conditions?: string;
  est_actif: boolean;
  date_creation: string;
}

/**
 * Données pour créer un bonus
 */
export interface CreateBonusData {
  titre: string;
  description?: string;
  valeur: number;
  appliquer_a?: "tous" | "specifique" | "filtre";
  client_id?: string;
  type_client_filtre?: "particulier" | "entreprise";
  secteur_filtre?: string;
  taille_filtre?: string;
  date_debut: string;
  date_fin: string;
  conditions?: string;
}

/**
 * Données pour mettre à jour un bonus
 */
export interface UpdateBonusData extends Partial<CreateBonusData> {
  est_actif?: boolean;
}

/**
 * Commande
 */
export interface Commande {
  id: string;
  client_id: string;
  entreprise_id: string;
  titre: string;
  description?: string;
  statut:
    | "en_attente"
    | "contrat_accepte"
    | "en_cours_developpement"
    | "livraison"
    | "livree"
    | "annulee";
  cout_estime?: number;
  cout_final?: number;
  etape_actuelle?: number;
  nombre_etapes?: number;
  date_creation: string;
  date_modification?: string;
  date_livraison?: string;
  notes?: CommandeNote[];
}

/**
 * Note sur une commande
 */
export interface CommandeNote {
  id: string;
  commande_id: string;
  auteur_id: string;
  contenu: string;
  est_publique: boolean;
  date_creation: string;
}

/**
 * Données pour créer une commande
 */
export interface CreateCommandeData {
  entreprise_id: string;
  titre: string;
  description?: string;
  cout_estime?: number;
  ticket_id?: string;
}

/**
 * Données pour mettre à jour le statut d'une commande
 */
export interface UpdateCommandeStatusData {
  statut: Commande["statut"];
}

/**
 * Données pour mettre à jour l'étape d'une commande
 */
export interface UpdateCommandeEtapeData {
  etape_actuelle: number;
}

/**
 * Données pour renseigner le coût final d'une commande
 */
export interface UpdateCommandeCoutFinalData {
  cout_final: number;
}

/**
 * Données pour ajouter une note à une commande
 */
export interface AddCommandeNoteData {
  contenu: string;
  est_publique?: boolean;
}

/**
 * Statistiques du dashboard
 */
export interface DashboardOverview {
  clients: {
    total: number;
    new: number;
    growth: number;
  };
  tickets: {
    total: number;
    resolved: number;
    pending: number;
    in_progress: number;
    resolution_rate: number;
  };
  orders: {
    total: number;
    delivered: number;
    in_progress: number;
    delivery_rate: number;
  };
  revenue: {
    total: number;
    period: number;
    growth: number;
  };
}

/**
 * Données de tendance
 */
export interface TrendData {
  labels: string[];
  values: number[];
  total: number;
  growth: number;
  period: string;
}

/**
 * Dashboard complet
 */
export interface DashboardData {
  period: string;
  entreprise_id: string;
  timestamp: string;
  overview: DashboardOverview;
  trends: {
    tickets: TrendData;
    orders: TrendData;
    revenue: TrendData;
  };
  distributions: {
    tickets_by_status: Array<{ status: string; count: number; percentage: number }>;
    orders_by_status: Array<{ status: string; count: number; percentage: number }>;
  };
  performance: {
    average_resolution_time: number;
    average_order_value: number;
    client_satisfaction: number;
  };
  lists: {
    recent_tickets: Ticket[];
    recent_orders: Commande[];
    top_clients: Array<{
      id: string;
      nom: string;
      email: string;
      total_orders: number;
      total_revenue: number;
    }>;
  };
  kpis: {
    ticket_resolution_rate: number;
    order_delivery_rate: number;
    average_order_value: number;
    average_resolution_time: number;
    client_acquisition: number;
    satisfaction_score: number;
  };
}

/**
 * Métriques rapides du dashboard
 */
export interface QuickStats {
  period: string;
  timestamp: string;
  metrics: {
    total_clients: number;
    new_clients: number;
    total_tickets: number;
    resolved_tickets: number;
    total_orders: number;
    delivered_orders: number;
    total_revenue: number;
    period_revenue: number;
  };
  kpis: {
    ticket_resolution_rate: number;
    order_delivery_rate: number;
    average_order_value: number;
    average_resolution_time: number;
  };
}

/**
 * Client (pour les entreprises)
 */
export interface Client {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  type_client: "particulier" | "entreprise";
  nom_entreprise?: string;
  secteur_activite?: string;
  taille_entreprise?: string;
  numero_rccm?: string;
  poste_occupe?: string;
  est_actif: boolean;
  date_creation: string;
  dernier_login?: string;
}
