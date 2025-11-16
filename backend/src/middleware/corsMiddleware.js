/**
 * Middleware de Sécurité - CORS
 *
 * CORS (Cross-Origin Resource Sharing) permet aux requêtes depuis des domaines
 * front-end autorisés d'accéder à notre API.
 *
 * Sécurité: Seuls les domaines listés dans CORS_ORIGIN peuvent faire des requêtes.
 */

import cors from "cors";
import config from "../config/config.js";

// Configuration CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (Postman, mobile, etc.)
    if (!origin || config.cors.origin.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ CORS: Domaine non autorisé"));
    }
  },
  credentials: true, // Autoriser les cookies
  optionsSuccessStatus: 200, // Pour les anciens navigateurs
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const corsMiddleware = cors(corsOptions);
