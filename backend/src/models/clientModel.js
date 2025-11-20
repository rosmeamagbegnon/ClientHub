/**
 * Modèle Client - Gestion des données clients
 *
 * Tous les clients (particuliers ET entreprises) sont stockés dans cette table.
 * Ce modèle gère les opérations CRUD et les requêtes spécialisées.
 *
 * ⚠️ SQL Injection Prevention: Toutes les requêtes utilisent les paramètres liés ($1, $2, etc.)
 */

import pool from "../config/database.js";
import bcryptjs from "bcryptjs";

/**
 * Crée un nouveau client dans la base de données
 *
 * @param {Object} clientData - Données du client
 * @returns {Object} Client créé avec son ID
 */
export const createClient = async (clientData) => {
  const {
    prenom,
    nom,
    email,
    telephone,
    canal_contact,
    mot_de_passe,
    type_client,
    // Pour les entreprises
    nom_entreprise,
    secteur_activite,
    taille_entreprise,
    poste_occupe,
    numero_rccm,
    adresse_physique,
    email_professionnel,
    telephone_entreprise,
    site_internet,
    linkedin,
  } = clientData;

  try {
    // Hash du mot de passe avec bcryptjs
    const salt = await bcryptjs.genSalt(10);
    const mot_de_passe_hash = await bcryptjs.hash(mot_de_passe, salt);

    const query = `
      INSERT INTO clients (
        prenom, nom, email, telephone, canal_contact,
        mot_de_passe_hash, type_client,
        nom_entreprise, secteur_activite, taille_entreprise, poste_occupe,
        numero_rccm, adresse_physique, email_professionnel, telephone_entreprise,
        site_internet, linkedin
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      RETURNING id, prenom, nom, email, type_client, date_creation
    `;

    const result = await pool.query(query, [
      prenom,
      nom,
      email,
      telephone,
      canal_contact,
      mot_de_passe_hash,
      type_client,
      nom_entreprise || null,
      secteur_activite || null,
      taille_entreprise || null,
      poste_occupe || null,
      numero_rccm || null,
      adresse_physique || null,
      email_professionnel || null,
      telephone_entreprise || null,
      site_internet || null,
      linkedin || null,
    ]);

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Trouve un client par email
 * Utilisé pour la connexion et la vérification d'unicité
 *
 * @param {string} email - Email du client
 * @returns {Object|null} Client trouvé ou null
 */
export const findClientByEmail = async (email) => {
  try {
    const query = `
      SELECT 
        id, prenom, nom, email, telephone, canal_contact,
        mot_de_passe_hash, type_client, nom_entreprise, secteur_activite,
        est_actif, email_verifiee, date_creation, dernier_login
      FROM clients
      WHERE LOWER(email) = LOWER($1)
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Trouve un client par ID
 *
 * @param {string} clientId - ID du client (UUID)
 * @returns {Object|null} Client trouvé ou null
 */
export const findClientById = async (clientId) => {
  try {
    const query = `
      SELECT 
        id, prenom, nom, email, telephone, canal_contact,
        type_client, nom_entreprise, secteur_activite,
        est_actif, email_verifiee, date_creation, dernier_login
      FROM clients
      WHERE id = $1
    `;

    const result = await pool.query(query, [clientId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si un email existe déjà
 *
 * @param {string} email - Email à vérifier
 * @returns {boolean} true si existe, false sinon
 */
export const emailExists = async (email) => {
  try {
    const query = "SELECT 1 FROM clients WHERE LOWER(email) = LOWER($1)";
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie le mot de passe d'un client
 * Compare le mot de passe en clair avec le hash stocké
 *
 * @param {string} mot_de_passe_plain - Mot de passe en clair
 * @param {string} mot_de_passe_hash - Hash du mot de passe
 * @returns {boolean} true si correct, false sinon
 */
export const verifyPassword = async (mot_de_passe_plain, mot_de_passe_hash) => {
  try {
    return await bcryptjs.compare(mot_de_passe_plain, mot_de_passe_hash);
  } catch (error) {
    throw error;
  }
};

/**
 * Met à jour le dernier login d'un client
 *
 * @param {string} clientId - ID du client
 */
export const updateLastLogin = async (clientId) => {
  try {
    const query = `
      UPDATE clients
      SET dernier_login = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await pool.query(query, [clientId]);
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les clients d'une entreprise (clients auxquels elle fournit des services)
 *
 * @param {string} entrepriseId - ID de l'entreprise
 * @param {number} page - Numéro de page
 * @param {number} limit - Éléments par page
 * @returns {Object} Liste des clients et total
 */
export const getClientsByEntreprise = async (
  entrepriseId,
  page = 1,
  limit = 20
) => {
  try {
    const offset = (page - 1) * limit;

    // Récupère les clients ayant des tickets ou commandes avec cette entreprise
    const query = `
      SELECT DISTINCT c.id, c.prenom, c.nom, c.email, c.type_client,
             c.nom_entreprise, c.date_creation
      FROM clients c
      WHERE EXISTS (
        SELECT 1 FROM tickets t WHERE t.client_id = c.id AND t.entreprise_id = $1
        UNION
        SELECT 1 FROM commandes co WHERE co.client_id = c.id AND co.entreprise_id = $1
      )
      ORDER BY c.date_creation DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM clients c
      WHERE EXISTS (
        SELECT 1 FROM tickets t WHERE t.client_id = c.id AND t.entreprise_id = $1
        UNION
        SELECT 1 FROM commandes co WHERE co.client_id = c.id AND co.entreprise_id = $1
      )
    `;

    const [resultClients, resultCount] = await Promise.all([
      pool.query(query, [entrepriseId, limit, offset]),
      pool.query(countQuery, [entrepriseId]),
    ]);

    return {
      clients: resultClients.rows,
      total: parseInt(resultCount.rows[0].total),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si un numero RCCM existe déjà
 * (pour éviter les doublons d'entreprises)
 *
 * @param {string} numero_rccm - Numéro RCCM
 * @returns {boolean} true si existe, false sinon
 */
export const rcmExists = async (numero_rccm) => {
  try {
    const query = "SELECT 1 FROM clients WHERE numero_rccm = $1";
    const result = await pool.query(query, [numero_rccm]);
    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};
