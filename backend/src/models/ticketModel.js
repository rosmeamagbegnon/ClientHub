import pool from "../config/database.js";

/**
 * 🎫 TICKET MODEL - Data Access Layer
 *
 * Gère toutes les opérations de base de données pour les tickets.
 * Tickets = demandes/réclamations des clients auprès d'une entreprise CRM.
 *
 * Relations:
 * - Un ticket est créé par un CLIENT (table clients)
 * - Un ticket est adressé à une ENTREPRISE (table entreprises)
 * - Un ticket peut avoir plusieurs NOTES (table notes_tickets)
 *
 * Pattern: MVC - Model (database operations only)
 */

// ==================== CREATE ====================

/**
 * Crée un nouveau ticket en base de données
 * @param {Object} ticketData - Données du ticket
 * @returns {Promise<Object>} Ticket créé avec son ID
 */
export const createTicket = async (ticketData) => {
  const {
    client_id,
    entreprise_id,
    titre,
    description,
    type_ticket,
    priorite = "normal",
    fichier_path = null,
    fichier_original_name = null,
  } = ticketData;

  try {
    const query = `
      INSERT INTO tickets (
        client_id,
        entreprise_id,
        titre,
        description,
        type_ticket,
        priorite,
        statut,
        fichier_path,
        fichier_original_name,
        date_creation
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'en_attente', $7, $8, NOW()
      )
      RETURNING 
        id,
        client_id,
        entreprise_id,
        titre,
        description,
        type_ticket,
        statut,
        priorite,
        fichier_path,
        date_creation
    `;

    const result = await pool.query(query, [
      client_id,
      entreprise_id,
      titre,
      description,
      type_ticket,
      priorite,
      fichier_path,
      fichier_original_name,
    ]);

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// ==================== READ ====================

/**
 * Récupère un ticket par son ID
 * @param {string} ticketId - ID du ticket
 * @returns {Promise<Object>} Ticket trouvé
 */
export const getTicketById = async (ticketId) => {
  try {
    const query = `
      SELECT 
        t.*,
        c.prenom AS client_prenom,
        c.nom AS client_nom,
        c.email AS client_email,
        e.nom_entreprise,
        e.email_entreprise
      FROM tickets t
      JOIN clients c ON t.client_id = c.id
      JOIN entreprises e ON t.entreprise_id = e.id
      WHERE t.id = $1
    `;

    const result = await pool.query(query, [ticketId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Liste les tickets avec filtres optionnels
 * @param {Object} filters - Filtres (statut, priorite, entreprise_id, client_id, type_ticket)
 * @param {number} limit - Nombre max de résultats
 * @param {number} offset - Décalage pour pagination
 * @returns {Promise<Array>} Tickets trouvés
 */
export const listTickets = async (filters = {}, limit = 20, offset = 0) => {
  try {
    let query = `
      SELECT 
        t.id,
        t.titre,
        t.description,
        t.type_ticket,
        t.statut,
        t.priorite,
        t.date_creation,
        t.date_modification,
        c.prenom AS client_prenom,
        c.nom AS client_nom,
        c.email AS client_email,
        e.nom_entreprise
      FROM tickets t
      JOIN clients c ON t.client_id = c.id
      JOIN entreprises e ON t.entreprise_id = e.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filtres optionnels
    if (filters.statut) {
      query += ` AND t.statut = $${paramIndex}`;
      params.push(filters.statut);
      paramIndex++;
    }

    if (filters.priorite) {
      query += ` AND t.priorite = $${paramIndex}`;
      params.push(filters.priorite);
      paramIndex++;
    }

    if (filters.entreprise_id) {
      query += ` AND t.entreprise_id = $${paramIndex}`;
      params.push(filters.entreprise_id);
      paramIndex++;
    }

    if (filters.client_id) {
      query += ` AND t.client_id = $${paramIndex}`;
      params.push(filters.client_id);
      paramIndex++;
    }

    if (filters.type_ticket) {
      query += ` AND t.type_ticket = $${paramIndex}`;
      params.push(filters.type_ticket);
      paramIndex++;
    }

    // Tri par date création (récent d'abord)
    query += ` ORDER BY t.date_creation DESC`;

    // Pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Compte le total de tickets (pour pagination)
 * @param {Object} filters - Filtres
 * @returns {Promise<number>} Total de tickets
 */
export const countTickets = async (filters = {}) => {
  try {
    let query = `
      SELECT COUNT(*) as total
      FROM tickets t
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.statut) {
      query += ` AND t.statut = $${paramIndex}`;
      params.push(filters.statut);
      paramIndex++;
    }

    if (filters.priorite) {
      query += ` AND t.priorite = $${paramIndex}`;
      params.push(filters.priorite);
      paramIndex++;
    }

    if (filters.entreprise_id) {
      query += ` AND t.entreprise_id = $${paramIndex}`;
      params.push(filters.entreprise_id);
      paramIndex++;
    }

    if (filters.client_id) {
      query += ` AND t.client_id = $${paramIndex}`;
      params.push(filters.client_id);
      paramIndex++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].total, 10);
  } catch (error) {
    throw error;
  }
};

// ==================== UPDATE ====================

/**
 * Met à jour le statut d'un ticket
 * @param {string} ticketId - ID du ticket
 * @param {string} newStatus - Nouveau statut
 * @returns {Promise<Object>} Ticket mis à jour
 */
export const updateTicketStatus = async (ticketId, newStatus) => {
  try {
    console.log("=== DEBUG updateTicketStatus ===");
    console.log("ticketId:", ticketId, "type:", typeof ticketId);
    console.log("newStatus:", newStatus, "type:", typeof newStatus);

    const query = `
      UPDATE tickets
      SET 
        statut = $1::varchar,  -- CAST EXPLICITE pour le statut
        date_modification = NOW(),
        date_resolution = CASE 
          WHEN statut != 'traite' AND $1::varchar = 'traite' THEN NOW()
          ELSE date_resolution
        END
      WHERE id = $2::uuid      -- CAST EXPLICITE pour l'UUID
      RETURNING 
        id,
        statut,
        date_modification,
        date_resolution
    `;

    const result = await pool.query(query, [newStatus, ticketId]);
    console.log("Résultat update:", result.rows[0]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Erreur détaillée dans updateTicketStatus:", error);
    throw error;
  }
};

/**
 * Met à jour les infos d'un ticket
 * @param {string} ticketId - ID du ticket
 * @param {Object} updateData - Données à mettre à jour (titre, description, priorite, type_ticket)
 * @returns {Promise<Object>} Ticket mis à jour
 */
export const updateTicket = async (ticketId, updateData) => {
  try {
    const { titre, description, priorite, type_ticket } = updateData;

    const query = `
      UPDATE tickets
      SET 
        titre = COALESCE($1, titre),
        description = COALESCE($2, description),
        priorite = COALESCE($3, priorite),
        type_ticket = COALESCE($4, type_ticket),
        date_modification = NOW()
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(query, [
      titre || null,
      description || null,
      priorite || null,
      type_ticket || null,
      ticketId,
    ]);

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// ==================== DELETE ====================

/**
 * Supprime un ticket (soft delete)
 * @param {string} ticketId - ID du ticket
 * @returns {Promise<boolean>} true si suppression réussie
 */
export const deleteTicket = async (ticketId) => {
  try {
    const query = `
      DELETE FROM tickets
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [ticketId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

// ==================== NOTES ====================

/**
 * Ajoute une note à un ticket
 * @param {string} ticketId - ID du ticket
 * @param {string} auteur_id - ID de l'auteur (client ou entreprise)
 * @param {string} contenu - Contenu de la note
 * @param {boolean} est_publique - Visible par le client?
 * @returns {Promise<Object>} Note créée
 */
export const addNote = async (
  ticketId,
  auteur_id,
  contenu,
  est_publique = true
) => {
  try {
    const query = `
      INSERT INTO notes_tickets (
        ticket_id,
        auteur_id,
        contenu,
        est_publique,
        date_creation
      ) VALUES (
        $1, $2, $3, $4, NOW()
      )
      RETURNING 
        id,
        ticket_id,
        auteur_id,
        contenu,
        est_publique,
        date_creation
    `;

    const result = await pool.query(query, [
      ticketId,
      auteur_id,
      contenu,
      est_publique,
    ]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les notes d'un ticket
 * @param {string} ticketId - ID du ticket
 * @param {boolean} onlyPublic - Seulement les notes publiques?
 * @returns {Promise<Array>} Notes du ticket
 */
export const getNotesByTicket = async (ticketId, onlyPublic = false) => {
  try {
    let query = `
      SELECT 
        n.*,
        CASE 
          WHEN n.auteur_id IN (SELECT id FROM clients) THEN 'client'
          WHEN n.auteur_id IN (SELECT id FROM entreprises) THEN 'entreprise'
          ELSE 'unknown'
        END as auteur_type
      FROM notes_tickets n
      WHERE n.ticket_id = $1
    `;

    const params = [ticketId];

    if (onlyPublic) {
      query += ` AND n.est_publique = true`;
    }

    query += ` ORDER BY n.date_creation DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Supprime une note
 * @param {string} noteId - ID de la note
 * @returns {Promise<boolean>} true si suppression réussie
 */
export const deleteNote = async (noteId) => {
  try {
    const query = `
      DELETE FROM notes_tickets
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [noteId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

// ==================== HELPERS ====================

/**
 * Vérifie si un ticket existe
 * @param {string} ticketId - ID du ticket
 * @returns {Promise<boolean>} true si existe
 */
export const ticketExists = async (ticketId) => {
  try {
    const query = `SELECT 1 FROM tickets WHERE id = $1`;
    const result = await pool.query(query, [ticketId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si un client peut accéder à un ticket
 * @param {string} clientId - ID du client
 * @param {string} ticketId - ID du ticket
 * @returns {Promise<boolean>} true si client est propriétaire
 */
export const isClientTicketOwner = async (clientId, ticketId) => {
  try {
    const query = `SELECT 1 FROM tickets WHERE id = $1 AND client_id = $2`;
    const result = await pool.query(query, [ticketId, clientId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si une entreprise est responsable d'un ticket
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {string} ticketId - ID du ticket
 * @returns {Promise<boolean>} true si entreprise gère ce ticket
 */
export const isEntrepriseTicketOwner = async (entrepriseId, ticketId) => {
  try {
    const query = `SELECT 1 FROM tickets WHERE id = $1 AND entreprise_id = $2`;
    const result = await pool.query(query, [ticketId, entrepriseId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};
