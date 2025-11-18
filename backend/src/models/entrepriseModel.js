import bcryptjs from "bcryptjs";
import pool from "../config/database.js";

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
      ) RETURNING 
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
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// ==================== READ ====================

/**
 * Trouve une entreprise par son email
 * @param {string} email - Email de l'entreprise
 * @returns {Promise<Object|null>} Entreprise trouvée ou null
 */
export const findEntrepriseByEmail = async (email) => {
  const query = "SELECT * FROM entreprises WHERE email_entreprise = $1";
  const result = await pool.query(query, [email]);
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
 * @param {string} email - Email à vérifier
 * @returns {Promise<boolean>} true si email existe
 */
export const emailExists = async (email) => {
  const query = "SELECT id FROM entreprises WHERE email_entreprise = $1";
  const result = await pool.query(query, [email]);
  return result.rows.length > 0;
};

/**
 * Vérifie si un RCCM/IFU est déjà utilisé
 * @param {string} numeroRccm - Numéro RCCM/IFU à vérifier
 * @returns {Promise<boolean>} true si RCCM existe
 */
export const rcmmExists = async (numeroRccm) => {
  const query = "SELECT id FROM entreprises WHERE numero_rccm_ifu = $1";
  const result = await pool.query(query, [numeroRccm]);
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
  verifyPassword,
  updateLastLogin,
  updateEntreprise,
  updateStatutEntreprise,
  countEntreprises,
  getRecentEntreprises,
};
