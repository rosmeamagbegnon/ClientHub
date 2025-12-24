import bcryptjs from "bcryptjs";
import pool from "../config/database.js";
import { ApiError } from "../utils/responseFormatter.js";

/**
 * 📦 ENTREPRISE MODEL - Data Access Layer
 *
 * Gère toutes les opérations de base de données pour les entreprises CRM.
 * Une entreprise CRM est une entité qui utilise la plateforme pour gérer ses clients/tickets/commandes.
 *
 * Pattern: MVC - Model (database operations only)
 * Max 300 lignes ✅
 */

// ==================== CREATE ====================

/**
 * Crée une nouvelle entreprise CRM en base de données
 * @param {Object} entrepriseData - Données de l'entreprise
 * @returns {Promise<Object>} Entreprise créée (sans hash)
 * @throws {ApiError} Si email ou RCCM/IFU déjà utilisés
 */
export const createEntreprise = async (entrepriseData) => {
  const {
    nom_entreprise,
    secteur_activite,
    taille_entreprise,
    numero_rccm_ifu,
    email_entreprise,
    telephone_entreprise,
    whatsapp_entreprise,
    adresse_professionnelle,
    site_internet,
    linkedin,
    prenom_responsable,
    nom_responsable,
    email_responsable,
    mot_de_passe,
  } = entrepriseData;

  try {
    // Hash le mot de passe
    const salt = await bcryptjs.genSalt(10);
    const mot_de_passe_hash = await bcryptjs.hash(mot_de_passe, salt);

    // INSERT simple - PostgreSQL gère les contraintes UNIQUE automatiquement
    const query = `
      INSERT INTO entreprises (
        nom_entreprise,
        secteur_activite,
        taille_entreprise,
        numero_rccm_ifu,
        email_entreprise,
        telephone_entreprise,
        whatsapp_entreprise,
        adresse_professionnelle,
        site_internet,
        linkedin,
        prenom_responsable,
        nom_responsable,
        email_responsable,
        mot_de_passe_hash,
        est_active,
        date_creation
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW()
      )
      RETURNING 
        id, 
        nom_entreprise, 
        secteur_activite, 
        email_entreprise, 
        prenom_responsable, 
        nom_responsable,
        est_active,
        date_creation
    `;

    const values = [
      nom_entreprise,
      secteur_activite,
      taille_entreprise,
      numero_rccm_ifu,
      email_entreprise,
      telephone_entreprise,
      whatsapp_entreprise,
      adresse_professionnelle,
      site_internet,
      linkedin,
      prenom_responsable,
      nom_responsable,
      email_responsable,
      mot_de_passe_hash,
      true,
    ];

    const result = await pool.query(query, values);

    // IMPORTANT : Si on arrive ici, l'INSERT a RÉUSSI
    // Le compte EST créé dans la base de données
    if (!result.rows || result.rows.length === 0) {
      // Cas improbable : INSERT réussi mais aucune ligne retournée
      console.error("❌ INSERT réussi mais aucune ligne retournée");
      throw new ApiError("Erreur lors de la création de l'entreprise", 500);
    }

    return result.rows[0];
  } catch (error) {
    // IMPORTANT : Cette erreur est levée SEULEMENT si l'INSERT échoue
    // Si on arrive ici, l'INSERT a ÉCHOUÉ et aucune ligne n'a été insérée
    // Le compte n'est PAS créé dans la base de données

    // Logger l'erreur complète pour debugging
    console.error("❌ Erreur lors de createEntreprise:", {
      code: error.code,
      constraint: error.constraint,
      message: error.message,
      detail: error.detail,
    });

    // Transformer les erreurs PostgreSQL de contrainte unique en ApiError avec messages clairs
    if (error.code === "23505") {
      // Erreur de contrainte unique - l'INSERT a ÉCHOUÉ
      // Cela signifie qu'un doublon existe déjà dans la base
      const constraint = error.constraint;

      if (constraint === "entreprises_email_entreprise_key") {
        throw new ApiError("Cet email entreprise est déjà utilisé", 409);
      }
      if (constraint === "entreprises_numero_rccm_ifu_key") {
        throw new ApiError("Ce numéro RCCM/IFU est déjà utilisé", 409);
      }
      if (constraint === "entreprises_nom_entreprise_key") {
        throw new ApiError("Ce nom d'entreprise est déjà utilisé", 409);
      }

      // Erreur de contrainte unique générique (si constraint est undefined ou autre)
      console.error("❌ Contrainte unique inconnue:", constraint);
      throw new ApiError(
        "Cette ressource existe déjà dans la base de données",
        409
      );
    }

    // Pour les autres erreurs PostgreSQL, les logger et les relancer
    console.error(
      "❌ Erreur PostgreSQL inattendue lors de la création d'entreprise:",
      error
    );
    throw error;
  }
};

// ==================== READ ====================

/**
 * Trouve une entreprise par son email
 * @param {string} email - Email de l'entreprise (sera normalisé en lowercase)
 * @returns {Promise<Object|null>} Entreprise trouvée ou null
 *
 * IMPORTANT : Utilise LOWER() pour être insensible à la casse
 */
export const findEntrepriseByEmail = async (email) => {
  // Normaliser l'email en lowercase pour la recherche
  const emailNormalized = email.toLowerCase().trim();
  const query =
    "SELECT * FROM entreprises WHERE LOWER(email_entreprise) = LOWER($1)";
  const result = await pool.query(query, [emailNormalized]);
  return result.rows[0] || null;
};

/**
 * Trouve une entreprise par son ID
 * @param {string} id - ID UUID de l'entreprise
 * @returns {Promise<Object|null>} Entreprise trouvée ou null
 */
export const findEntrepriseById = async (id) => {
  const query = `
    SELECT 
      id,
      nom_entreprise,
      secteur_activite,
      taille_entreprise,
      numero_rccm_ifu,
      email_entreprise,
      telephone_entreprise,
      whatsapp_entreprise,
      adresse_professionnelle,
      site_internet,
      linkedin,
      prenom_responsable,
      nom_responsable,
      email_responsable,
      est_active,
      date_creation,
      dernier_login
    FROM entreprises 
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Vérifie si un email est déjà utilisé
 * @param {string} email - Email à vérifier (sera normalisé en lowercase)
 * @param {Object} [client] - Client de transaction optionnel (pour atomicité)
 * @returns {Promise<boolean>} true si email existe
 *
 * IMPORTANT : Utilise LOWER() pour être insensible à la casse
 * Cela évite les doublons comme "Test@Example.com" vs "test@example.com"
 */
export const emailExists = async (email, client = null) => {
  // Normaliser l'email en lowercase pour la comparaison
  const emailNormalized = email.toLowerCase().trim();
  const query =
    "SELECT id FROM entreprises WHERE LOWER(email_entreprise) = LOWER($1)";
  const dbClient = client || pool;
  const result = await dbClient.query(query, [emailNormalized]);
  return result.rows.length > 0;
};

/**
 * Vérifie si un RCCM/IFU est déjà utilisé
 * @param {string} numeroRccm - Numéro RCCM/IFU à vérifier
 * @param {Object} [client] - Client de transaction optionnel (pour atomicité)
 * @returns {Promise<boolean>} true si RCCM existe
 */
export const rcmmExists = async (numeroRccm, client = null) => {
  const query = "SELECT id FROM entreprises WHERE numero_rccm_ifu = $1";
  const dbClient = client || pool;
  const result = await dbClient.query(query, [numeroRccm]);
  return result.rows.length > 0;
};

/**
 * Vérifie si un nom d'entreprise est déjà utilisé
 * @param {string} nomEntreprise - Nom de l'entreprise à vérifier
 * @param {Object} [client] - Client de transaction optionnel (pour atomicité)
 * @returns {Promise<boolean>} true si nom existe
 */
export const nomEntrepriseExists = async (nomEntreprise, client = null) => {
  const query = "SELECT id FROM entreprises WHERE nom_entreprise = $1";
  const dbClient = client || pool;
  const result = await dbClient.query(query, [nomEntreprise]);
  return result.rows.length > 0;
};

// ==================== AUTHENTICATION ====================

/**
 * Vérifie le mot de passe d'une entreprise
 * @param {string} motDePasseFourni - Mot de passe fourni par l'utilisateur
 * @param {string} motDePasseHash - Hash stocké en base
 * @returns {Promise<boolean>} true si le mot de passe est correct
 */
export const verifyPassword = async (motDePasseFourni, motDePasseHash) => {
  return await bcryptjs.compare(motDePasseFourni, motDePasseHash);
};

// ==================== UPDATE ====================

/**
 * Met à jour la date du dernier login d'une entreprise
 * @param {string} id - ID de l'entreprise
 * @returns {Promise<Object>} Entreprise mise à jour
 */
export const updateLastLogin = async (id) => {
  const query = `
    UPDATE entreprises 
    SET dernier_login = NOW() 
    WHERE id = $1 
    RETURNING id, dernier_login
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/**
 * Met à jour le profil d'une entreprise
 * @param {string} id - ID de l'entreprise
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Promise<Object>} Entreprise mise à jour
 */
export const updateEntreprise = async (id, updateData) => {
  const allowedFields = [
    "nom_entreprise",
    "secteur_activite",
    "taille_entreprise",
    "telephone_entreprise",
    "whatsapp_entreprise",
    "adresse_professionnelle",
    "site_internet",
    "linkedin",
  ];

  const updates = [];
  const values = [id];
  let paramCount = 2;

  Object.entries(updateData).forEach(([key, value]) => {
    if (allowedFields.includes(key) && value !== undefined) {
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (updates.length === 0) {
    return findEntrepriseById(id);
  }

  const query = `
    UPDATE entreprises 
    SET ${updates.join(", ")}, date_modification = NOW()
    WHERE id = $1 
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Change le statut actif/inactif d'une entreprise
 * @param {string} id - ID de l'entreprise
 * @param {boolean} estActive - Nouveau statut
 * @returns {Promise<Object>} Entreprise mise à jour
 */
export const updateStatutEntreprise = async (id, estActive) => {
  const query = `
    UPDATE entreprises 
    SET est_active = $2 
    WHERE id = $1 
    RETURNING id, est_active
  `;
  const result = await pool.query(query, [id, estActive]);
  return result.rows[0];
};

// ==================== HELPERS ====================

/**
 * Compte le nombre total d'entreprises actives
 * @returns {Promise<number>} Nombre d'entreprises
 */
export const countEntreprises = async () => {
  const query =
    "SELECT COUNT(*) as count FROM entreprises WHERE est_active = true";
  const result = await pool.query(query);
  return parseInt(result.rows[0].count, 10);
};

/**
 * Liste les 10 dernières entreprises créées
 * @returns {Promise<Array>} Liste des entreprises
 */
export const getRecentEntreprises = async () => {
  const query = `
    SELECT 
      id,
      nom_entreprise,
      email_entreprise,
      est_active,
      date_creation
    FROM entreprises 
    WHERE est_active = true
    ORDER BY date_creation DESC 
    LIMIT 10
  `;
  const result = await pool.query(query);
  return result.rows;
};

export default {
  createEntreprise,
  findEntrepriseByEmail,
  findEntrepriseById,
  emailExists,
  rcmmExists,
  nomEntrepriseExists,
  verifyPassword,
  updateLastLogin,
  updateEntreprise,
  updateStatutEntreprise,
  countEntreprises,
  getRecentEntreprises,
};
