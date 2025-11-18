import pool from "../config/database.js";

/**
 * 🎁 BONUS MODEL - Data Access Layer
 *
 * Gère toutes les opérations de base de données pour les bonus.
 * Bonus = système de fidélisation créé par les entreprises pour leurs clients.
 *
 * Relations:
 * - Un bonus est créé par une ENTREPRISE (table entreprises)
 * - Un bonus peut être destiné à un CLIENT spécifique (table clients)
 * - Un bonus peut avoir des FILTRES (type_client, secteur, taille)
 *
 * Pattern: MVC - Model (database operations only)
 */

// ==================== CREATE ====================

/**
 * Crée un nouveau bonus en base de données
 * @param {Object} bonusData - Données du bonus
 * @returns {Promise<Object>} Bonus créé avec son ID
 */
export const createBonus = async (bonusData) => {
  const {
    entreprise_id,
    titre,
    description,
    valeur,
    appliquer_a = "tous",
    client_id = null,
    type_client_filtre = null,
    secteur_filtre = null,
    taille_filtre = null,
    date_debut,
    date_fin,
    conditions = null,
  } = bonusData;

  try {
    const query = `
      INSERT INTO bonus (
        entreprise_id,
        titre,
        description,
        valeur,
        appliquer_a,
        client_id,
        type_client_filtre,
        secteur_filtre,
        taille_filtre,
        date_debut,
        date_fin,
        conditions,
        est_actif,
        date_creation
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW()
      )
      RETURNING 
        id,
        entreprise_id,
        titre,
        description,
        valeur,
        appliquer_a,
        client_id,
        type_client_filtre,
        secteur_filtre,
        taille_filtre,
        date_debut,
        date_fin,
        conditions,
        est_actif,
        date_creation
    `;

    const result = await pool.query(query, [
      entreprise_id,
      titre,
      description,
      valeur,
      appliquer_a,
      client_id,
      type_client_filtre,
      secteur_filtre,
      taille_filtre,
      date_debut,
      date_fin,
      conditions,
    ]);

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// ==================== READ ====================

/**
 * Récupère un bonus par son ID
 * @param {string} bonusId - ID du bonus
 * @returns {Promise<Object>} Bonus trouvé
 */
export const getBonusById = async (bonusId) => {
  try {
    const query = `
      SELECT 
        b.*,
        e.nom_entreprise,
        e.email_entreprise,
        c.prenom AS client_prenom,
        c.nom AS client_nom,
        c.email AS client_email
      FROM bonus b
      JOIN entreprises e ON b.entreprise_id = e.id
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.id = $1
    `;

    const result = await pool.query(query, [bonusId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Liste les bonus avec filtres optionnels
 * @param {Object} filters - Filtres (entreprise_id, client_id, est_actif, etc.)
 * @param {number} limit - Nombre max de résultats
 * @param {number} offset - Décalage pour pagination
 * @returns {Promise<Array>} Bonus trouvés
 */
export const listBonus = async (filters = {}, limit = 20, offset = 0) => {
  try {
    let query = `
      SELECT 
        b.*,
        e.nom_entreprise,
        e.email_entreprise
      FROM bonus b
      JOIN entreprises e ON b.entreprise_id = e.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filtres optionnels
    if (filters.entreprise_id) {
      query += ` AND b.entreprise_id = $${paramIndex}`;
      params.push(filters.entreprise_id);
      paramIndex++;
    }

    if (filters.est_actif !== undefined) {
      query += ` AND b.est_actif = $${paramIndex}`;
      params.push(filters.est_actif);
      paramIndex++;
    }

    if (filters.client_id) {
      // Pour un client spécifique, on veut les bonus qui lui sont destinés
      query += ` AND (
        b.appliquer_a = 'tous' 
        OR (b.appliquer_a = 'specifique' AND b.client_id = $${paramIndex})
        OR (b.appliquer_a = 'filtre' AND (
          (b.type_client_filtre IS NULL OR b.type_client_filtre = (SELECT type_client FROM clients WHERE id = $${paramIndex}))
          AND (b.secteur_filtre IS NULL OR b.secteur_filtre = (SELECT secteur_activite FROM clients WHERE id = $${paramIndex} AND secteur_activite IS NOT NULL))
          AND (b.taille_filtre IS NULL OR b.taille_filtre = (SELECT taille_entreprise FROM clients WHERE id = $${paramIndex} AND taille_entreprise IS NOT NULL))
        ))
      )`;
      params.push(filters.client_id);
      paramIndex++;
    }

    // Filtrer les bonus actifs et dans la période de validité
    if (filters.only_valid === true) {
      query += ` AND b.est_actif = true 
                AND b.date_debut <= NOW() 
                AND b.date_fin >= NOW()`;
    }

    // Tri par date de création (récent d'abord)
    query += ` ORDER BY b.date_creation DESC`;

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
 * Compte le total de bonus (pour pagination)
 * @param {Object} filters - Filtres
 * @returns {Promise<number>} Total de bonus
 */
export const countBonus = async (filters = {}) => {
  try {
    let query = `
      SELECT COUNT(*) as total
      FROM bonus b
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.entreprise_id) {
      query += ` AND b.entreprise_id = $${paramIndex}`;
      params.push(filters.entreprise_id);
      paramIndex++;
    }

    if (filters.est_actif !== undefined) {
      query += ` AND b.est_actif = $${paramIndex}`;
      params.push(filters.est_actif);
      paramIndex++;
    }

    if (filters.client_id) {
      query += ` AND (
        b.appliquer_a = 'tous' 
        OR (b.appliquer_a = 'specifique' AND b.client_id = $${paramIndex})
        OR (b.appliquer_a = 'filtre' AND (
          (b.type_client_filtre IS NULL OR b.type_client_filtre = (SELECT type_client FROM clients WHERE id = $${paramIndex}))
          AND (b.secteur_filtre IS NULL OR b.secteur_filtre = (SELECT secteur_activite FROM clients WHERE id = $${paramIndex} AND secteur_activite IS NOT NULL))
          AND (b.taille_filtre IS NULL OR b.taille_filtre = (SELECT taille_entreprise FROM clients WHERE id = $${paramIndex} AND taille_entreprise IS NOT NULL))
        ))
      )`;
      params.push(filters.client_id);
      paramIndex++;
    }

    if (filters.only_valid === true) {
      query += ` AND b.est_actif = true 
                AND b.date_debut <= NOW() 
                AND b.date_fin >= NOW()`;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].total, 10);
  } catch (error) {
    throw error;
  }
};

// ==================== UPDATE ====================

/**
 * Met à jour un bonus
 * @param {string} bonusId - ID du bonus
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Bonus mis à jour
 */
export const updateBonus = async (bonusId, updateData) => {
  try {
    const {
      titre,
      description,
      valeur,
      appliquer_a,
      client_id,
      type_client_filtre,
      secteur_filtre,
      taille_filtre,
      date_debut,
      date_fin,
      conditions,
      est_actif,
    } = updateData;

    const query = `
      UPDATE bonus
      SET 
        titre = COALESCE($1, titre),
        description = COALESCE($2, description),
        valeur = COALESCE($3, valeur),
        appliquer_a = COALESCE($4, appliquer_a),
        client_id = COALESCE($5, client_id),
        type_client_filtre = COALESCE($6, type_client_filtre),
        secteur_filtre = COALESCE($7, secteur_filtre),
        taille_filtre = COALESCE($8, taille_filtre),
        date_debut = COALESCE($9, date_debut),
        date_fin = COALESCE($10, date_fin),
        conditions = COALESCE($11, conditions),
        est_actif = COALESCE($12, est_actif)
      WHERE id = $13
      RETURNING *
    `;

    const result = await pool.query(query, [
      titre || null,
      description || null,
      valeur || null,
      appliquer_a || null,
      client_id || null,
      type_client_filtre || null,
      secteur_filtre || null,
      taille_filtre || null,
      date_debut || null,
      date_fin || null,
      conditions || null,
      est_actif !== undefined ? est_actif : null,
      bonusId,
    ]);

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Active/désactive un bonus
 * @param {string} bonusId - ID du bonus
 * @param {boolean} estActif - Nouvel état
 * @returns {Promise<Object>} Bonus mis à jour
 */
export const toggleBonusActif = async (bonusId, estActif) => {
  try {
    const query = `
      UPDATE bonus
      SET 
        est_actif = $1
      WHERE id = $2
      RETURNING 
        id,
        titre,
        est_actif
    `;

    const result = await pool.query(query, [estActif, bonusId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// ==================== DELETE ====================

/**
 * Supprime un bonus (soft delete)
 * @param {string} bonusId - ID du bonus
 * @returns {Promise<boolean>} true si suppression réussie
 */
export const deleteBonus = async (bonusId) => {
  try {
    const query = `
      DELETE FROM bonus
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [bonusId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

// ==================== HELPERS ====================

/**
 * Vérifie si un bonus existe
 * @param {string} bonusId - ID du bonus
 * @returns {Promise<boolean>} true si existe
 */
export const bonusExists = async (bonusId) => {
  try {
    const query = `SELECT 1 FROM bonus WHERE id = $1`;
    const result = await pool.query(query, [bonusId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si une entreprise est propriétaire d'un bonus
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {string} bonusId - ID du bonus
 * @returns {Promise<boolean>} true si entreprise est propriétaire
 */
export const isEntrepriseBonusOwner = async (entrepriseId, bonusId) => {
  try {
    const query = `SELECT 1 FROM bonus WHERE id = $1 AND entreprise_id = $2`;
    const result = await pool.query(query, [bonusId, entrepriseId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les bonus applicables pour un client
 * @param {string} clientId - ID du client
 * @returns {Promise<Array>} Bonus applicables
 */
export const getBonusForClient = async (clientId) => {
  try {
    const query = `
      SELECT 
        b.*,
        e.nom_entreprise
      FROM bonus b
      JOIN entreprises e ON b.entreprise_id = e.id
      WHERE b.est_actif = true
        AND b.date_debut <= NOW()
        AND b.date_fin >= NOW()
        AND (
          b.appliquer_a = 'tous' 
          OR (b.appliquer_a = 'specifique' AND b.client_id = $1)
          OR (b.appliquer_a = 'filtre' AND (
            (b.type_client_filtre IS NULL OR b.type_client_filtre = (SELECT type_client FROM clients WHERE id = $1))
            AND (b.secteur_filtre IS NULL OR b.secteur_filtre = (SELECT secteur_activite FROM clients WHERE id = $1 AND secteur_activite IS NOT NULL))
            AND (b.taille_filtre IS NULL OR b.taille_filtre = (SELECT taille_entreprise FROM clients WHERE id = $1 AND taille_entreprise IS NOT NULL))
          ))
        )
      ORDER BY b.valeur DESC, b.date_creation DESC
    `;

    const result = await pool.query(query, [clientId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};
