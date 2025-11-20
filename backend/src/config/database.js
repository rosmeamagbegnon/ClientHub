/**
 * Configuration PostgreSQL - Database Connection
 *
 * Ce fichier gère la connexion à PostgreSQL avec un pool de connexions
 * pour optimiser les performances en production.
 *
 * Pool Connection : Réutilise les connexions existantes plutôt que d'en créer
 * une nouvelle à chaque requête (performance++)
 */

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Configuration du pool de connexions PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "ticketsmaster_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max: 20, // Nombre max de connexions simultanées
  idleTimeoutMillis: 30000, // Ferme une connexion inactive après 30s
  connectionTimeoutMillis: 2000, // Timeout de connexion
});

/**
 * Gestion des événements du pool
 */
pool.on("error", (err) => {
  console.error("❌ Erreur de pool PostgreSQL:", err);
});

pool.on("connect", () => {
  console.log("✅ Nouvelle connexion PostgreSQL établie");
});

/**
 * Test de connexion au démarrage
 * Vérifie que la base de données est accessible
 */
export const testDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connexion PostgreSQL réussie:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("❌ Impossible de se connecter à PostgreSQL:", error.message);
    return false;
  }
};

/**
 * Exporte le pool pour l'utiliser dans les models
 */
export default pool;
