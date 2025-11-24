import pool from "../config/database.js";

/**
 * DASHBOARD MODEL - Data Access Layer
 *
 * Gère toutes les requêtes analytiques pour le dashboard entreprise.
 * Optimisé avec des agrégations SQL performantes.
 *
 * Pattern: MVC - Model (database operations only)
 */

// ==================== STATISTIQUES GÉNÉRALES ====================

/**
 * Récupère les statistiques générales d'une entreprise
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {string} period - Période (day, week, month, year)
 * @returns {Promise<Object>} Statistiques générales
 */
export const getGeneralStats = async (entrepriseId, period = "month") => {
  try {
    // Définir l'intervalle directement dans la requête SQL
    const intervalMap = {
      day: "1 day",
      week: "1 week",
      month: "1 month",
      year: "1 year",
    };

    const interval = intervalMap[period] || "1 month";

    const query = `
      WITH stats AS (
        -- Clients totaux et nouveaux
        SELECT 
          COUNT(DISTINCT c.id) as total_clients,
          COUNT(DISTINCT CASE WHEN c.date_creation >= CURRENT_DATE - INTERVAL '${interval}' THEN c.id END) as new_clients,
          
          -- Tickets
          COUNT(DISTINCT t.id) as total_tickets,
          COUNT(DISTINCT CASE WHEN t.statut = 'traite' THEN t.id END) as tickets_traites,
          COUNT(DISTINCT CASE WHEN t.statut = 'en_attente' THEN t.id END) as tickets_en_attente,
          COUNT(DISTINCT CASE WHEN t.statut = 'en_cours_traitement' THEN t.id END) as tickets_en_cours,
          
          -- Commandes
          COUNT(DISTINCT cmd.id) as total_commandes,
          COUNT(DISTINCT CASE WHEN cmd.statut = 'livree' THEN cmd.id END) as commandes_livrees,
          COUNT(DISTINCT CASE WHEN cmd.statut = 'en_cours_developpement' THEN cmd.id END) as commandes_en_cours,
          
          -- Revenus
          COALESCE(SUM(CASE WHEN cmd.statut = 'livree' THEN cmd.cout_final ELSE 0 END), 0) as revenus_totaux,
          COALESCE(SUM(CASE WHEN cmd.date_livraison >= CURRENT_DATE - INTERVAL '${interval}' AND cmd.statut = 'livree' THEN cmd.cout_final ELSE 0 END), 0) as revenus_periode
          
        FROM entreprises e
        LEFT JOIN tickets t ON t.entreprise_id = e.id AND t.date_creation >= CURRENT_DATE - INTERVAL '${interval}'
        LEFT JOIN commandes cmd ON cmd.entreprise_id = e.id AND cmd.date_creation >= CURRENT_DATE - INTERVAL '${interval}'
        LEFT JOIN clients c ON c.id = t.client_id OR c.id = cmd.client_id
        WHERE e.id = $1
      )
      SELECT * FROM stats
    `;

    const result = await pool.query(query, [entrepriseId]);
    return result.rows[0] || {};
  } catch (error) {
    console.error("Erreur getGeneralStats:", error);
    throw error;
  }
};

// ==================== ÉVOLUTION TEMPORELLE ====================

/**
 * Récupère l'évolution des indicateurs sur une période
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {string} period - Période (week, month, year)
 * @param {string} metric - Métrique à suivre (tickets, commandes, revenus)
 * @returns {Promise<Array>} Données d'évolution
 */
export const getTrendData = async (
  entrepriseId,
  period = "month",
  metric = "tickets"
) => {
  try {
    const dateTrunc = getDateTrunc(period);
    let metricQuery = "";

    switch (metric) {
      case "tickets":
        metricQuery = `COUNT(t.id) as value`;
        break;
      case "commandes":
        metricQuery = `COUNT(cmd.id) as value`;
        break;
      case "revenus":
        metricQuery = `COALESCE(SUM(cmd.cout_final), 0) as value`;
        break;
      case "clients":
        metricQuery = `COUNT(DISTINCT c.id) as value`;
        break;
      default:
        metricQuery = `COUNT(t.id) as value`;
    }

    const intervalStep = getIntervalStep(period);

    const query = `
      SELECT 
        DATE_TRUNC($2, date_point) as period,
        ${metricQuery}
      FROM (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '1 ${period}', 
          CURRENT_DATE, 
          '1 ${intervalStep}'::interval
        ) as date_point
      ) dates
      LEFT JOIN tickets t ON 
        t.entreprise_id = $1 
        AND DATE_TRUNC($2, t.date_creation) = DATE_TRUNC($2, dates.date_point)
      LEFT JOIN commandes cmd ON 
        cmd.entreprise_id = $1 
        AND DATE_TRUNC($2, cmd.date_creation) = DATE_TRUNC($2, dates.date_point)
        ${metric === "revenus" ? "AND cmd.statut = 'livree'" : ""}
      LEFT JOIN clients c ON 
        (c.id = t.client_id OR c.id = cmd.client_id)
        AND DATE_TRUNC($2, c.date_creation) = DATE_TRUNC($2, dates.date_point)
      GROUP BY DATE_TRUNC($2, dates.date_point)
      ORDER BY period ASC
    `;

    const result = await pool.query(query, [entrepriseId, dateTrunc]);
    return result.rows;
  } catch (error) {
    console.error("Erreur getTrendData:", error);
    throw error;
  }
};

// ==================== RÉPARTITION STATUTS ====================

/**
 * Récupère la répartition des tickets par statut
 * @param {string} entrepriseId - ID de l'entreprise
 * @returns {Promise<Array>} Répartition statuts tickets
 */
export const getTicketsByStatus = async (entrepriseId) => {
  try {
    const query = `
      SELECT 
        statut,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0), 2) as percentage
      FROM tickets
      WHERE entreprise_id = $1
      GROUP BY statut
      ORDER BY count DESC
    `;

    const result = await pool.query(query, [entrepriseId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère la répartition des commandes par statut
 * @param {string} entrepriseId - ID de l'entreprise
 * @returns {Promise<Array>} Répartition statuts commandes
 */
export const getOrdersByStatus = async (entrepriseId) => {
  try {
    const query = `
      SELECT 
        statut,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0), 2) as percentage
      FROM commandes
      WHERE entreprise_id = $1
      GROUP BY statut
      ORDER BY count DESC
    `;

    const result = await pool.query(query, [entrepriseId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// ==================== ACTIVITÉ RÉCENTE ====================

/**
 * Récupère l'activité récente (tickets + commandes)
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {number} limit - Nombre d'activités
 * @returns {Promise<Array>} Activités récentes
 */
export const getRecentActivity = async (entrepriseId, limit = 20) => {
  try {
    const query = `
      (
        -- Tickets récents
        SELECT 
          'ticket' as type,
          t.id,
          t.titre,
          t.statut,
          t.date_creation as date,
          c.prenom || ' ' || c.nom as client_nom,
          NULL as cout_final
        FROM tickets t
        JOIN clients c ON t.client_id = c.id
        WHERE t.entreprise_id = $1
      )
      UNION ALL
      (
        -- Commandes récentes
        SELECT 
          'commande' as type,
          cmd.id,
          cmd.titre,
          cmd.statut,
          cmd.date_creation as date,
          c.prenom || ' ' || c.nom as client_nom,
          cmd.cout_final
        FROM commandes cmd
        JOIN clients c ON cmd.client_id = c.id
        WHERE cmd.entreprise_id = $1
      )
      ORDER BY date DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [entrepriseId, limit]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// ==================== TOP CLIENTS ====================

/**
 * Récupère les clients les plus actifs
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {number} limit - Nombre de clients
 * @returns {Promise<Array>} Top clients
 */
export const getTopClients = async (entrepriseId, limit = 10) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.prenom,
        c.nom,
        c.email,
        c.type_client,
        COUNT(DISTINCT t.id) as ticket_count,
        COUNT(DISTINCT cmd.id) as order_count,
        COALESCE(SUM(CASE WHEN cmd.statut = 'livree' THEN cmd.cout_final ELSE 0 END), 0) as total_revenue
      FROM clients c
      LEFT JOIN tickets t ON t.client_id = c.id AND t.entreprise_id = $1
      LEFT JOIN commandes cmd ON cmd.client_id = c.id AND cmd.entreprise_id = $1
      WHERE EXISTS (
        SELECT 1 FROM tickets t2 WHERE t2.client_id = c.id AND t2.entreprise_id = $1
        UNION
        SELECT 1 FROM commandes cmd2 WHERE cmd2.client_id = c.id AND cmd2.entreprise_id = $1
      )
      GROUP BY c.id, c.prenom, c.nom, c.email, c.type_client
      ORDER BY total_revenue DESC, ticket_count DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [entrepriseId, limit]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// ==================== PERFORMANCE TEMPS RÉSOLUTION ====================

/**
 * Récupère les métriques de performance (temps moyen résolution)
 * @param {string} entrepriseId - ID de l'entreprise
 * @returns {Promise<Object>} Métriques performance
 */
export const getPerformanceMetrics = async (entrepriseId) => {
  try {
    const query = `
      WITH resolution_times AS (
        SELECT 
          EXTRACT(EPOCH FROM (date_resolution - date_creation)) / 3600 as resolution_hours
        FROM tickets
        WHERE entreprise_id = $1 
          AND statut = 'traite' 
          AND date_resolution IS NOT NULL
      ),
      order_times AS (
        SELECT 
          EXTRACT(EPOCH FROM (date_livraison - date_creation)) / 86400 as delivery_days
        FROM commandes
        WHERE entreprise_id = $1 
          AND statut = 'livree' 
          AND date_livraison IS NOT NULL
      )
      SELECT 
        -- Temps moyen résolution tickets (heures)
        COALESCE(AVG(resolution_hours), 0) as avg_ticket_resolution_hours,
        COUNT(resolution_hours) as resolved_tickets_count,
        
        -- Temps moyen livraison commandes (jours)
        COALESCE(AVG(delivery_days), 0) as avg_order_delivery_days,
        COUNT(delivery_days) as delivered_orders_count
      FROM resolution_times, order_times
    `;

    const result = await pool.query(query, [entrepriseId]);
    return result.rows[0] || {};
  } catch (error) {
    throw error;
  }
};

// ==================== DONNÉES SECTORIELLES ====================

/**
 * Récupère les données par secteur client
 * @param {string} entrepriseId - ID de l'entreprise
 * @returns {Promise<Array>} Données par secteur
 */
export const getSectorData = async (entrepriseId) => {
  try {
    const query = `
      SELECT 
        COALESCE(c.secteur_activite, 'Non spécifié') as secteur,
        COUNT(DISTINCT c.id) as client_count,
        COUNT(DISTINCT t.id) as ticket_count,
        COUNT(DISTINCT cmd.id) as order_count,
        COALESCE(SUM(CASE WHEN cmd.statut = 'livree' THEN cmd.cout_final ELSE 0 END), 0) as revenue
      FROM clients c
      LEFT JOIN tickets t ON t.client_id = c.id AND t.entreprise_id = $1
      LEFT JOIN commandes cmd ON cmd.client_id = c.id AND cmd.entreprise_id = $1
      WHERE EXISTS (
        SELECT 1 FROM tickets t2 WHERE t2.client_id = c.id AND t2.entreprise_id = $1
        UNION
        SELECT 1 FROM commandes cmd2 WHERE cmd2.client_id = c.id AND cmd2.entreprise_id = $1
      )
      GROUP BY c.secteur_activite
      ORDER BY revenue DESC, client_count DESC
    `;

    const result = await pool.query(query, [entrepriseId]);
    return result.rows;
  } catch (error) {
    console.error("Erreur getSectorData:", error);
    throw error;
  }
};

// ==================== UTILITAIRES ====================

/**
 * Génère le filtre de date selon la période
 * @param {string} period - Période
 * @returns {string} Filtre SQL
 */
const getDateFilter = (period) => {
  const filters = {
    day: "1 day",
    week: "1 week",
    month: "1 month",
    year: "1 year",
  };

  // Retourne directement l'intervalle SQL
  return filters[period] || "1 month";
};

/**
 * Retourne le TRUNC SQL selon la période
 * @param {string} period - Période
 * @returns {string} Date trunc
 */
const getDateTrunc = (period) => {
  const truncs = {
    day: "day",
    week: "week",
    month: "month",
    year: "year",
  };
  return truncs[period] || "month";
};

/**
 * Retourne le pas d'intervalle pour generate_series
 * @param {string} period - Période
 * @returns {string} Interval step
 */
const getIntervalStep = (period) => {
  const steps = {
    day: "hour",
    week: "day",
    month: "day",
    year: "month",
  };
  return steps[period] || "day";
};

/**
 * Vérifie si une entreprise existe
 * @param {string} entrepriseId - ID de l'entreprise
 * @returns {Promise<boolean>} true si existe
 */
export const entrepriseExists = async (entrepriseId) => {
  try {
    const query = `SELECT 1 FROM entreprises WHERE id = $1`;
    const result = await pool.query(query, [entrepriseId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};
