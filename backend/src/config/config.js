/**
 * Configuration des variables d'environnement
 *
 * Centralise toutes les variables d'env pour un accès facile
 * et une validation au démarrage du serveur
 */

import dotenv from "dotenv";

dotenv.config();

const config = {
  // Environnement
  env: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",

  // Serveur
  port: process.env.PORT || 3000,
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`,

  // Base de données
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "ticketsmaster_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-key-change-in-production",
    expire: process.env.JWT_EXPIRE || "7d",
  },

  // CORS - Domaines autorisés
  cors: {
    origin: (process.env.CORS_ORIGIN || "http://localhost:3001").split(","),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  },

  // Logs
  logLevel: process.env.LOG_LEVEL || "debug",
};

/**
 * Validation des variables critiques
 */
export const validateConfig = () => {
  const requiredVars = ["DB_PASSWORD", "JWT_SECRET"];
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0 && config.env === "production") {
    throw new Error(`Variables manquantes: ${missing.join(", ")}`);
  }

  if (
    config.env === "production" &&
    process.env.JWT_SECRET === "dev-secret-key-change-in-production"
  ) {
    throw new Error("JWT_SECRET doit être changé en production!");
  }
};

export default config;
