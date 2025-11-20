/**
 * Script d'initialisation de la base de données
 *
 * Lance ce script une fois: node scripts/initializeDatabase.js
 * Crée automatiquement la base de données et toutes les tables
 */

import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const { Pool, Client } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 1. Crée la base de données (si elle n'existe pas)
 */
async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: "postgres", // Connexion à la DB par défaut
  });

  try {
    await client.connect();
    console.log("✅ Connecté au serveur PostgreSQL");

    const dbName = process.env.DB_NAME || "ticketsmaster_db";

    // Vérifie si la base existe
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (result.rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de données '${dbName}' créée`);
    } else {
      console.log(`ℹ️  Base de données '${dbName}' existe déjà`);
    }

    await client.end();
    return true;
  } catch (error) {
    console.error("❌ Erreur création base:", error.message);
    await client.end();
    return false;
  }
}

/**
 * 2. Exécute le schéma SQL
 */
async function initializeSchema() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    // Drop les tables existantes pour éviter les conflits
    console.log("🧹 Nettoyage des tables existantes...");
    await pool.query(`
      DROP TABLE IF EXISTS messages_chatbot CASCADE;
      DROP TABLE IF EXISTS sessions_chatbot CASCADE;
      DROP TABLE IF EXISTS notes_commandes CASCADE;
      DROP TABLE IF EXISTS commandes CASCADE;
      DROP TABLE IF EXISTS notes_tickets CASCADE;
      DROP TABLE IF EXISTS tickets CASCADE;
      DROP TABLE IF EXISTS bonus CASCADE;
      DROP TABLE IF EXISTS audit_log CASCADE;
      DROP TABLE IF EXISTS entreprises CASCADE;
      DROP TABLE IF EXISTS clients CASCADE;
    `);
    console.log("✅ Tables nettoyées");

    // Lit le fichier schema.sql
    const schemaPath = path.join(
      __dirname,
      "..",
      "src",
      "config",
      "schema.sql"
    );
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Exécute le schéma
    await pool.query(schema);
    console.log("✅ Schéma de base de données appliqué");

    await pool.end();
    return true;
  } catch (error) {
    console.error("❌ Erreur initialisation schéma:", error.message);
    await pool.end();
    return false;
  }
}

/**
 * 3. Lance l'initialisation complète
 */
async function initialize() {
  console.log(`
╔════════════════════════════════════════╗
║ 🔧 Initialisation Base de Données     ║
╚════════════════════════════════════════╝
  `);

  try {
    const dbCreated = await createDatabase();
    if (!dbCreated) throw new Error("Création base échouée");

    const schemaInitialized = await initializeSchema();
    if (!schemaInitialized) throw new Error("Initialisation schéma échouée");

    console.log(`
╔════════════════════════════════════════╗
║ ✅ Base de données prête!             ║
╚════════════════════════════════════════╝

La base de données a été initialisée avec succès.
Vous pouvez maintenant lancer: npm run dev
    `);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

// Lance le script
initialize();
