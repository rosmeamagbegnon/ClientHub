import pool from "../config/database.js";

/**
 * 🛒 COMMANDE MODEL - Data Access Layer
 *
 * Gère toutes les opérations de base de données pour les commandes.
 * Commandes = projets/services commandés par les clients aux entreprises.
 *
 * Relations:
 * - Une commande est créée par un CLIENT (table clients)
 * - Une commande est adressée à une ENTREPRISE (table entreprises)
 * - Une commande peut avoir plusieurs NOTES (table notes_commandes)
 * - Une commande peut être liée à un TICKET (optionnel)
 *
 * Pattern: MVC - Model (database operations only)
 */

// ==================== CREATE ====================

/**
 * Crée une nouvelle commande en base de données
 * @param {Object} commandeData - Données de la commande
 * @returns {Promise<Object>} Commande créée avec son ID
 */
export const createCommande = async (commandeData) => {
  const {
    client_id,
    entreprise_id,
    titre,
    description,
    cout_estime = null,
    ticket_id = null,
  } = commandeData;

  try {
    const query = `
      INSERT INTO commandes (
        client_id,
        entreprise_id,
        titre,
        description,
        cout_estime,
        ticket_id,
        statut,
        date_creation
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'en_attente', NOW()
      )
      RETURNING 
        id,
        client_id,
        entreprise_id,
        titre,
        description,
        statut,
        cout_estime,
        cout_final,
        etape_actuelle,
        nombre_etapes,
        ticket_id,
        date_creation,
        date_modification
    `;

    const result = await pool.query(query, [
      client_id,
      entreprise_id,
      titre,
      description,
      cout_estime,
      ticket_id,
    ]);

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// ==================== READ ====================

/**
 * Récupère une commande par son ID
 * @param {string} commandeId - ID de la commande
 * @returns {Promise<Object>} Commande trouvée
 */
export const getCommandeById = async (commandeId) => {
  try {
    const query = `
      SELECT 
        c.*,
        cl.prenom AS client_prenom,
        cl.nom AS client_nom,
        cl.email AS client_email,
        cl.type_client AS client_type,
        e.nom_entreprise,
        e.email_entreprise,
        t.titre AS ticket_titre
      FROM commandes c
      JOIN clients cl ON c.client_id = cl.id
      JOIN entreprises e ON c.entreprise_id = e.id
      LEFT JOIN tickets t ON c.ticket_id = t.id
      WHERE c.id = $1
    `;

    const result = await pool.query(query, [commandeId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Liste les commandes avec filtres optionnels
 * @param {Object} filters - Filtres (statut, entreprise_id, client_id)
 * @param {number} limit - Nombre max de résultats
 * @param {number} offset - Décalage pour pagination
 * @returns {Promise<Array>} Commandes trouvées
 */
export const listCommandes = async (filters = {}, limit = 20, offset = 0) => {
  try {
    let query = `
      SELECT 
        c.id,
        c.titre,
        c.description,
        c.statut,
        c.cout_estime,
        c.cout_final,
        c.etape_actuelle,
        c.nombre_etapes,
        c.date_creation,
        c.date_modification,
        c.date_livraison,
        cl.prenom AS client_prenom,
        cl.nom AS client_nom,
        cl.email AS client_email,
        e.nom_entreprise
      FROM commandes c
      JOIN clients cl ON c.client_id = cl.id
      JOIN entreprises e ON c.entreprise_id = e.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filtres optionnels
    if (filters.statut) {
      query += ` AND c.statut = $${paramIndex}`;
      params.push(filters.statut);
      paramIndex++;
    }

    if (filters.entreprise_id) {
      query += ` AND c.entreprise_id = $${paramIndex}`;
      params.push(filters.entreprise_id);
      paramIndex++;
    }

    if (filters.client_id) {
      query += ` AND c.client_id = $${paramIndex}`;
      params.push(filters.client_id);
      paramIndex++;
    }

    // Tri par date création (récent d'abord)
    query += ` ORDER BY c.date_creation DESC`;

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
 * Compte le total de commandes (pour pagination)
 * @param {Object} filters - Filtres
 * @returns {Promise<number>} Total de commandes
 */
export const countCommandes = async (filters = {}) => {
  try {
    let query = `
      SELECT COUNT(*) as total
      FROM commandes c
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (filters.statut) {
      query += ` AND c.statut = $${paramIndex}`;
      params.push(filters.statut);
      paramIndex++;
    }

    if (filters.entreprise_id) {
      query += ` AND c.entreprise_id = $${paramIndex}`;
      params.push(filters.entreprise_id);
      paramIndex++;
    }

    if (filters.client_id) {
      query += ` AND c.client_id = $${paramIndex}`;
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
 * Met à jour le statut d'une commande
 * @param {string} commandeId - ID de la commande
 * @param {string} newStatus - Nouveau statut
 * @returns {Promise<Object>} Commande mise à jour
 */
export const updateCommandeStatus = async (commandeId, newStatus) => {
  try {
    console.log("=== DEBUG updateCommandeStatus ===");
    console.log("commandeId:", commandeId, "type:", typeof commandeId);
    console.log("newStatus:", newStatus, "type:", typeof newStatus);

    // SOLUTION: Utiliser des casts explicites pour tous les paramètres
    const query = `
      UPDATE commandes
      SET 
        statut = $1::varchar,  -- CAST explicite pour éviter le conflit text/varchar
        date_modification = NOW(),
        date_livraison = CASE 
          WHEN statut != 'livree' AND $1::varchar = 'livree' THEN NOW()
          ELSE date_livraison
        END
      WHERE id = $2::uuid      -- CAST explicite pour l'UUID
      RETURNING 
        id,
        statut,
        date_modification,
        date_livraison
    `;

    console.log("Query:", query);
    console.log("Params:", [newStatus, commandeId]);

    const result = await pool.query(query, [newStatus, commandeId]);
    console.log("Résultat update:", result.rows[0]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Erreur détaillée dans updateCommandeStatus:", error);
    console.error("Code erreur:", error.code);
    console.error("Detail:", error.detail);
    throw error;
  }
};

/**
 * Met à jour l'étape actuelle d'une commande
 * @param {string} commandeId - ID de la commande
 * @param {number} nouvelleEtape - Nouvelle étape
 * @returns {Promise<Object>} Commande mise à jour
 */
export const updateCommandeEtape = async (commandeId, nouvelleEtape) => {
  try {
    console.log("=== DEBUG updateCommandeEtape ===");
    console.log("commandeId:", commandeId);
    console.log("nouvelleEtape:", nouvelleEtape, "type:", typeof nouvelleEtape);

    const query = `
      UPDATE commandes
      SET 
        etape_actuelle = $1,
        date_modification = NOW()
      WHERE id = $2
      RETURNING 
        id,
        etape_actuelle,
        nombre_etapes,
        date_modification
    `;

    const result = await pool.query(query, [nouvelleEtape, commandeId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Erreur dans updateCommandeEtape:", error);
    throw error;
  }
};

/**
 * Renseigne le coût final d'une commande
 * @param {string} commandeId - ID de la commande
 * @param {number} coutFinal - Coût final
 * @returns {Promise<Object>} Commande mise à jour
 */
export const updateCoutFinal = async (commandeId, coutFinal) => {
  try {
    console.log("=== DEBUG updateCoutFinal ===");
    console.log("commandeId:", commandeId);
    console.log("coutFinal:", coutFinal, "type:", typeof coutFinal);

    const query = `
      UPDATE commandes
      SET 
        cout_final = $1,
        date_modification = NOW()
      WHERE id = $2
      RETURNING 
        id,
        cout_estime,
        cout_final,
        date_modification
    `;

    const result = await pool.query(query, [coutFinal, commandeId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Erreur dans updateCoutFinal:", error);
    throw error;
  }
};

/**
 * Met à jour les infos d'une commande
 * @param {string} commandeId - ID de la commande
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Commande mise à jour
 */
export const updateCommande = async (commandeId, updateData) => {
  try {
    const { titre, description, cout_estime, nombre_etapes } = updateData;

    const query = `
      UPDATE commandes
      SET 
        titre = COALESCE($1, titre),
        description = COALESCE($2, description),
        cout_estime = COALESCE($3, cout_estime),
        nombre_etapes = COALESCE($4, nombre_etapes),
        date_modification = NOW()
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(query, [
      titre || null,
      description || null,
      cout_estime || null,
      nombre_etapes || null,
      commandeId,
    ]);

    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// ==================== NOTES ====================

/**
 * Ajoute une note à une commande
 * @param {string} commandeId - ID de la commande
 * @param {string} auteur_id - ID de l'auteur
 * @param {string} contenu - Contenu de la note
 * @param {boolean} est_publique - Visible par le client?
 * @returns {Promise<Object>} Note créée
 */
export const addNoteCommande = async (
  commandeId,
  auteur_id,
  contenu,
  est_publique = true
) => {
  try {
    const query = `
      INSERT INTO notes_commandes (
        commande_id,
        auteur_id,
        contenu,
        est_publique,
        date_creation
      ) VALUES (
        $1, $2, $3, $4, NOW()
      )
      RETURNING 
        id,
        commande_id,
        auteur_id,
        contenu,
        est_publique,
        date_creation
    `;

    const result = await pool.query(query, [
      commandeId,
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
 * Récupère les notes d'une commande
 * @param {string} commandeId - ID de la commande
 * @param {boolean} onlyPublic - Seulement les notes publiques?
 * @returns {Promise<Array>} Notes de la commande
 */
export const getNotesByCommande = async (commandeId, onlyPublic = false) => {
  try {
    let query = `
      SELECT 
        n.*,
        CASE 
          WHEN n.auteur_id IN (SELECT id FROM clients) THEN 'client'
          WHEN n.auteur_id IN (SELECT id FROM entreprises) THEN 'entreprise'
          ELSE 'unknown'
        END as auteur_type
      FROM notes_commandes n
      WHERE n.commande_id = $1
    `;

    const params = [commandeId];

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

// ==================== HELPERS ====================

/**
 * Vérifie si une commande existe
 * @param {string} commandeId - ID de la commande
 * @returns {Promise<boolean>} true si existe
 */
export const commandeExists = async (commandeId) => {
  try {
    const query = `SELECT 1 FROM commandes WHERE id = $1`;
    const result = await pool.query(query, [commandeId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si un client peut accéder à une commande
 * @param {string} clientId - ID du client
 * @param {string} commandeId - ID de la commande
 * @returns {Promise<boolean>} true si client est propriétaire
 */
export const isClientCommandeOwner = async (clientId, commandeId) => {
  try {
    const query = `SELECT 1 FROM commandes WHERE id = $1 AND client_id = $2`;
    const result = await pool.query(query, [commandeId, clientId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si une entreprise est responsable d'une commande
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {string} commandeId - ID de la commande
 * @returns {Promise<boolean>} true si entreprise gère cette commande
 */
export const isEntrepriseCommandeOwner = async (entrepriseId, commandeId) => {
  try {
    const query = `SELECT 1 FROM commandes WHERE id = $1 AND entreprise_id = $2`;
    const result = await pool.query(query, [commandeId, entrepriseId]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
};
