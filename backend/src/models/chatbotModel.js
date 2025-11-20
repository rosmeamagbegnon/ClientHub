import pool from "../config/database.js";

/**
 * CHATBOT MODEL - Data Access Layer
 *
 * Gère toutes les opérations de base de données pour le chatbot.
 * Utilise les tables sessions_chatbot et messages_chatbot du schema.
 *
 * Relations:
 * - Une session appartient à un CLIENT (table clients)
 * - Une session est liée à une ENTREPRISE (table entreprises)
 * - Une session contient plusieurs MESSAGES (table messages_chatbot)
 *
 * Pattern: MVC - Model (database operations only)
 */

// ==================== SESSIONS ====================

/**
 * Crée une nouvelle session de chat
 * @param {Object} sessionData - Données de la session
 * @returns {Promise<Object>} Session créée avec son ID
 */
export const createSession = async (sessionData) => {
  const { client_id, entreprise_id } = sessionData;

  try {
    const query = `
      INSERT INTO sessions_chatbot (
        client_id,
        entreprise_id,
        date_debut,
        statut
      ) VALUES (
        $1, $2, NOW(), 'active'
      )
      RETURNING 
        id,
        client_id,
        entreprise_id,
        date_debut,
        date_fin,
        statut
    `;

    const result = await pool.query(query, [client_id, entreprise_id]);

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère une session par son ID
 * @param {string} sessionId - ID de la session
 * @returns {Promise<Object>} Session trouvée
 */
export const getSessionById = async (sessionId) => {
  try {
    const query = `
      SELECT 
        s.*,
        c.prenom AS client_prenom,
        c.nom AS client_nom,
        c.email AS client_email,
        c.type_client AS client_type,
        e.nom_entreprise
      FROM sessions_chatbot s
      JOIN clients c ON s.client_id = c.id
      JOIN entreprises e ON s.entreprise_id = e.id
      WHERE s.id = $1
    `;

    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère la session active d'un client avec une entreprise
 * @param {string} clientId - ID du client
 * @param {string} entrepriseId - ID de l'entreprise
 * @returns {Promise<Object>} Session active trouvée
 */
export const getActiveSession = async (clientId, entrepriseId) => {
  try {
    const query = `
      SELECT *
      FROM sessions_chatbot
      WHERE client_id = $1 
        AND entreprise_id = $2 
        AND statut = 'active'
      ORDER BY date_debut DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [clientId, entrepriseId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Liste les sessions d'un client
 * @param {string} clientId - ID du client
 * @param {number} limit - Nombre max de résultats
 * @param {number} offset - Décalage pour pagination
 * @returns {Promise<Array>} Sessions trouvées
 */
export const listClientSessions = async (clientId, limit = 20, offset = 0) => {
  try {
    const query = `
      SELECT 
        s.*,
        e.nom_entreprise,
        COUNT(m.id) as message_count,
        MAX(m.date_creation) as last_message_date
      FROM sessions_chatbot s
      JOIN entreprises e ON s.entreprise_id = e.id
      LEFT JOIN messages_chatbot m ON s.id = m.session_id
      WHERE s.client_id = $1
      GROUP BY s.id, e.nom_entreprise
      ORDER BY MAX(m.date_creation) DESC NULLS LAST, s.date_debut DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [clientId, limit, offset]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Ferme une session de chat
 * @param {string} sessionId - ID de la session
 * @returns {Promise<Object>} Session fermée
 */
export const closeSession = async (sessionId) => {
  try {
    const query = `
      UPDATE sessions_chatbot
      SET 
        statut = 'fermee',
        date_fin = NOW()
      WHERE id = $1
      RETURNING 
        id,
        statut,
        date_fin
    `;

    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si une session existe et appartient au client
 * @param {string} sessionId - ID de la session
 * @param {string} clientId - ID du client
 * @returns {Promise<boolean>} true si session existe et appartient au client
 */
export const sessionBelongsToClient = async (sessionId, clientId) => {
  try {
    const query = `
      SELECT 1 
      FROM sessions_chatbot 
      WHERE id = $1 AND client_id = $2
    `;

    const result = await pool.query(query, [sessionId, clientId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

// ==================== MESSAGES ====================

/**
 * Ajoute un message à une session
 * @param {Object} messageData - Données du message
 * @returns {Promise<Object>} Message créé
 */
export const addMessage = async (messageData) => {
  const { session_id, role, contenu, type_contenu = "texte" } = messageData;

  try {
    const query = `
      INSERT INTO messages_chatbot (
        session_id,
        role,
        contenu,
        type_contenu,
        date_creation
      ) VALUES (
        $1, $2, $3, $4, NOW()
      )
      RETURNING 
        id,
        session_id,
        role,
        contenu,
        type_contenu,
        date_creation
    `;

    const result = await pool.query(query, [
      session_id,
      role,
      contenu,
      type_contenu,
    ]);

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les messages d'une session avec pagination
 * @param {string} sessionId - ID de la session
 * @param {number} limit - Nombre max de messages
 * @param {number} offset - Décalage pour pagination
 * @returns {Promise<Array>} Messages de la session
 */
export const getSessionMessages = async (sessionId, limit = 50, offset = 0) => {
  try {
    const query = `
      SELECT 
        id,
        session_id,
        role,
        contenu,
        type_contenu,
        date_creation
      FROM messages_chatbot
      WHERE session_id = $1
      ORDER BY date_creation ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [sessionId, limit, offset]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les nouveaux messages depuis un message ID
 * @param {string} sessionId - ID de la session
 * @param {string} lastMessageId - ID du dernier message connu
 * @returns {Promise<Array>} Nouveaux messages
 */
export const getNewMessages = async (sessionId, lastMessageId = null) => {
  try {
    let query = `
      SELECT 
        id,
        session_id,
        role,
        contenu,
        type_contenu,
        date_creation
      FROM messages_chatbot
      WHERE session_id = $1
    `;

    const params = [sessionId];

    if (lastMessageId) {
      query += ` AND id > $2 AND role = 'bot'`;
      params.push(lastMessageId);
    }

    query += ` ORDER BY date_creation ASC`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Compte le nombre total de messages dans une session
 * @param {string} sessionId - ID de la session
 * @returns {Promise<number>} Nombre total de messages
 */
export const countSessionMessages = async (sessionId) => {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM messages_chatbot
      WHERE session_id = $1
    `;

    const result = await pool.query(query, [sessionId]);
    return parseInt(result.rows[0].total, 10);
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère le dernier message d'une session
 * @param {string} sessionId - ID de la session
 * @returns {Promise<Object>} Dernier message
 */
export const getLastMessage = async (sessionId) => {
  try {
    const query = `
      SELECT *
      FROM messages_chatbot
      WHERE session_id = $1
      ORDER BY date_creation DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// ==================== STATISTIQUES ====================

/**
 * Récupère les statistiques d'utilisation du chatbot
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {string} period - Période (day, week, month)
 * @returns {Promise<Object>} Statistiques
 */
export const getChatbotStats = async (entrepriseId, period = "month") => {
  try {
    let dateFilter = "";
    const params = [entrepriseId];

    switch (period) {
      case "day":
        dateFilter = `AND s.date_debut >= CURRENT_DATE`;
        break;
      case "week":
        dateFilter = `AND s.date_debut >= CURRENT_DATE - INTERVAL '7 days'`;
        break;
      case "month":
        dateFilter = `AND s.date_debut >= CURRENT_DATE - INTERVAL '30 days'`;
        break;
      default:
        dateFilter = `AND s.date_debut >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    const query = `
      SELECT 
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT s.client_id) as unique_clients,
        COUNT(m.id) as total_messages,
        AVG(message_counts.msg_count) as avg_messages_per_session
      FROM sessions_chatbot s
      LEFT JOIN messages_chatbot m ON s.id = m.session_id
      LEFT JOIN (
        SELECT session_id, COUNT(*) as msg_count
        FROM messages_chatbot
        GROUP BY session_id
      ) message_counts ON s.id = message_counts.session_id
      WHERE s.entreprise_id = $1 ${dateFilter}
    `;

    const result = await pool.query(query, params);
    return result.rows[0] || {};
  } catch (error) {
    throw error;
  }
};

// ==================== MAINTENANCE ====================

/**
 * Nettoie les anciennes sessions (maintenance)
 * @param {number} daysOld - Nombre de jours avant suppression
 * @returns {Promise<number>} Nombre de sessions supprimées
 */
export const cleanupOldSessions = async (daysOld = 90) => {
  try {
    const query = `
      DELETE FROM sessions_chatbot 
      WHERE date_debut < NOW() - INTERVAL '${daysOld} days'
      RETURNING id
    `;

    const result = await pool.query(query);
    return result.rowCount;
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si une session existe
 * @param {string} sessionId - ID de la session
 * @returns {Promise<boolean>} true si session existe
 */
export const sessionExists = async (sessionId) => {
  try {
    const query = `SELECT 1 FROM sessions_chatbot WHERE id = $1`;
    const result = await pool.query(query, [sessionId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

// ==================== HELPERS ====================

/**
 * Valide si un UUID est valide
 * @param {string} uuid - UUID à valider
 * @returns {boolean}
 */
export const isValidUUID = (uuid) => {
  if (!uuid) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
