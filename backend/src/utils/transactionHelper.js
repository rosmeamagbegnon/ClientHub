/**
 * Helper pour gérer les transactions PostgreSQL
 *
 * PROBLÈME RÉSOLU :
 * Avant : Pas de transactions, les opérations n'étaient pas atomiques
 * Pourquoi c'était mauvais :
 * - Si une erreur se produit après un INSERT, les données restent en base
 * - Pas de rollback automatique
 * - Risque de données incohérentes
 *
 * SOLUTION :
 * Helper qui gère les transactions PostgreSQL avec rollback automatique en cas d'erreur
 */

import pool from "../config/database.js";

/**
 * Exécute une fonction dans une transaction PostgreSQL
 *
 * @param {Function} callback - Fonction async qui reçoit le client de transaction
 * @returns {Promise<any>} Résultat de la fonction callback
 * @throws {Error} Relance l'erreur après rollback
 *
 * @example
 * await withTransaction(async (client) => {
 *   const result1 = await client.query('INSERT INTO ...');
 *   const result2 = await client.query('UPDATE ...');
 *   return { result1, result2 };
 * });
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();

  try {
    // Démarrer la transaction
    await client.query("BEGIN");

    // Exécuter la fonction callback avec le client de transaction
    const result = await callback(client);

    // Si tout va bien, commit
    await client.query("COMMIT");

    return result;
  } catch (error) {
    // En cas d'erreur, rollback
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Toujours libérer le client
    client.release();
  }
};
