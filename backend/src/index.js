/**
 * TicketsMaster API - Point d'entrée principal
 *
 * Configure et démarre le serveur Express avec tous les middlewares,
 * routes et configurations de sécurité.
 */

import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// Import configurations
import config, { validateConfig } from "./config/config.js";
import { testDatabaseConnection } from "./config/database.js";

// Import middlewares de sécurité
import { corsMiddleware } from "./middleware/corsMiddleware.js";
import {
  generalLimiter,
  authLimiter,
} from "./middleware/rateLimitMiddleware.js";
import { validateInputsMiddleware } from "./middleware/validationMiddleware.js";
import {
  errorHandlerMiddleware,
  notFoundMiddleware,
} from "./middleware/errorMiddleware.js";

// Import routes
import clientAuthRoutes from "./routes/clientAuthRoutes.js";
import entrepriseAuthRoutes from "./routes/entrepriseAuthRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import commandeRoutes from "./routes/commandeRoutes.js";
import bonusRoutes from "./routes/bonusRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";

dotenv.config();

// Initialisation de l'app Express
const app = express();

/**
 * ===== CONFIGURATION SÉCURITÉ =====
 */

// 1. CORS - Autorise les domaines frontend
app.use(corsMiddleware);

// 2. Body parser - Parse le JSON/URL-encoded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 3. Rate Limiting - Protection brute force
app.use(generalLimiter);

// 4. Validation des inputs
app.use(validateInputsMiddleware);

/**
 * ===== SWAGGER DOCUMENTATION =====
 */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TicketsMaster API",
      version: "1.0.0",
      description: "Documentation complète de l'API TicketsMaster - CRM SaaS",
      contact: {
        name: "TicketsMaster Team",
        email: "support@ticketsmaster.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Serveur local de développement",
      },
      {
        url: "https://api.ticketsmaster.com",
        description: "Serveur production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Bearer token pour authentification",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/**/*.js"], // Chemin vers les fichiers avec annotations Swagger
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true, // Sauvegarde le token dans Swagger
    },
  })
);

/**
 * ===== ROUTES =====
 */

// Route de santé de l'API
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "✅ API TicketsMaster est en ligne",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: config.env,
  });
});

// Routes d'authentification clients
app.use("/api/auth/clients", clientAuthRoutes);

// Routes d'authentification entreprises CRM
app.use("/api/auth/entreprises", entrepriseAuthRoutes);

// Routes de tickets
app.use("/api/tickets", ticketRoutes);

// Routes de commandes
app.use("/api/commandes", commandeRoutes);

// Routes de bonus
app.use("/api/bonus", bonusRoutes);

// Routes de chatbot
app.use("/api/chatbot", chatbotRoutes);

/**
 * ===== GESTION ERREURS =====
 */

// Middleware pour les routes non trouvées
app.use(notFoundMiddleware);

// Middleware de gestion globale des erreurs (DOIT être en dernier)
app.use(errorHandlerMiddleware);

/**
 * ===== DÉMARRAGE DU SERVEUR =====
 */
export const startServer = async () => {
  try {
    // Valide les variables d'environnement
    validateConfig();
    console.log("✅ Configuration validée");

    // Teste la connexion à la base de données
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      throw new Error("Impossible de se connecter à PostgreSQL");
    }

    // Démarre le serveur HTTP
    const server = app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🎫 TicketsMaster API - Démarré     ║
╚════════════════════════════════════════╝

📡 Serveur: http://localhost:${config.port}
📚 Swagger: http://localhost:${config.port}/api-docs
🏥 Santé:  http://localhost:${config.port}/health

🔒 Sécurité: CORS, JWT, Rate Limiting, Input Validation
💾 Base de données: PostgreSQL
🌍 Environnement: ${config.env}

Prêt à recevoir des requêtes! 🚀
      `);
    });

    // Gestion arrêt gracieux du serveur
    process.on("SIGTERM", () => {
      console.log("⚠️  SIGTERM reçu, arrêt gracieux...");
      server.close(() => {
        console.log("✅ Serveur arrêté proprement");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Erreur démarrage serveur:", error.message);
    process.exit(1);
  }
};

// Lance le serveur si ce fichier est exécuté directement
startServer();

export default app;
