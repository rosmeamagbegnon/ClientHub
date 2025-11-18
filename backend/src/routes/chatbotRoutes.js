import express from "express";
import { authenticateMiddleware } from "../middleware/authMiddleware.js";
import {
  createOrGetSession,
  getClientSessions,
  getSession,
  sendMessage,
  getSessionMessages,
  getMessageUpdates,
  getChatbotStats,
  closeSession,
  getChatbotHealth,
} from "../controllers/chatbotController.js";

/**
 * CHATBOT ROUTES - API Endpoints
 *
 * Endpoints pour le système de chatbot intelligent.
 * Réservé aux clients authentifiés.
 *
 * Routes Client:
 * POST   /api/chatbot/sessions                    - Créer/récupérer session
 * GET    /api/chatbot/sessions                    - Lister mes sessions
 * GET    /api/chatbot/sessions/:id                - Voir une session
 * POST   /api/chatbot/sessions/:id/messages       - Envoyer message
 * GET    /api/chatbot/sessions/:id/messages       - Historique messages
 * GET    /api/chatbot/sessions/:id/messages/updates - Nouveaux messages (polling)
 * POST   /api/chatbot/sessions/:id/close          - Fermer session
 *
 * Routes Entreprise:
 * GET    /api/chatbot/stats                       - Statistiques (entreprise)
 *
 * Public:
 * GET    /api/chatbot/health                      - Santé du service
 */

const router = express.Router();

// ==================== MIDDLEWARE ====================

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ChatbotSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         client_id:
 *           type: string
 *           format: uuid
 *         entreprise_id:
 *           type: string
 *           format: uuid
 *         date_debut:
 *           type: string
 *           format: date-time
 *         date_fin:
 *           type: string
 *           format: date-time
 *         statut:
 *           type: string
 *           enum: [active, fermee]
 *         nom_entreprise:
 *           type: string
 *         message_count:
 *           type: integer
 *         last_message_date:
 *           type: string
 *           format: date-time
 *     ChatbotMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         session_id:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *           enum: [client, bot]
 *         contenu:
 *           type: string
 *         type_contenu:
 *           type: string
 *           enum: [texte, suggestion, lien]
 *         date_creation:
 *           type: string
 *           format: date-time
 */

// ==================== SESSIONS ====================

/**
 * @swagger
 * /api/chatbot/sessions:
 *   post:
 *     tags:
 *       - 💬 Chatbot
 *     summary: Créer ou récupérer une session de chat
 *     description: |
 *       Crée une nouvelle session ou récupère la session active existante.
 *       Déclenche un message de bienvenue automatique.
 *
 *       **Réservé aux clients authentifiés**
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entreprise_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de l'entreprise (optionnel)
 *           example:
 *             entreprise_id: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Session créée ou récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 session:
 *                   $ref: '#/components/schemas/ChatbotSession'
 *                 is_new:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux clients
 */
router.post("/sessions", authenticateMiddleware(), createOrGetSession);

/**
 * @swagger
 * /api/chatbot/sessions:
 *   get:
 *     tags:
 *       - 💬 Chatbot
 *     summary: Lister mes sessions de chat
 *     description: |
 *       Récupère la liste des sessions de chat de l'client authentifié.
 *
 *       **Réservé aux clients authentifiés**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Sessions par page
 *     responses:
 *       200:
 *         description: Liste des sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatbotSession'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 */
router.get("/sessions", authenticateMiddleware(), getClientSessions);

/**
 * @swagger
 * /api/chatbot/sessions/{id}:
 *   get:
 *     tags:
 *       - 💬 Chatbot
 *     summary: Voir les détails d'une session
 *     description: |
 *       Récupère les détails d'une session spécifique.
 *
 *       **Réservé aux clients authentifiés**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la session
 *     responses:
 *       200:
 *         description: Détails de la session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 session_id:
 *                   type: string
 *                 client_id:
 *                   type: string
 *                 message:
 *                   type: string
 *       403:
 *         description: Accès non autorisé à cette session
 *       404:
 *         description: Session non trouvée
 */
router.get("/sessions/:id", authenticateMiddleware(), getSession);

// ==================== MESSAGES ====================

/**
 * @swagger
 * /api/chatbot/sessions/{id}/messages:
 *   post:
 *     tags:
 *       - 💬 Chatbot
 *     summary: Envoyer un message dans une session
 *     description: |
 *       Envoie un message au chatbot et reçoit une réponse intelligente.
 *       Le chatbot peut répondre sur les tickets, commandes, bonus, etc.
 *
 *       **Réservé aux clients authentifiés**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Message à envoyer au chatbot
 *                 example: "Quel est le statut de mon ticket #12345 ?"
 *           example:
 *             message: "Quels sont mes bonus disponibles ?"
 *     responses:
 *       200:
 *         description: Message traité et réponse reçue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user_message:
 *                   $ref: '#/components/schemas/ChatbotMessage'
 *                 bot_response:
 *                   $ref: '#/components/schemas/ChatbotMessage'
 *                 intent:
 *                   type: string
 *                   example: "TICKET_STATUS_SUCCESS"
 *                 data:
 *                   type: object
 *                   description: Données supplémentaires (ticket, commande, etc.)
 *       400:
 *         description: Message vide ou trop long
 *       403:
 *         description: Accès non autorisé à cette session
 */
router.post("/sessions/:id/messages", authenticateMiddleware(), sendMessage);

/**
 * @swagger
 * /api/chatbot/sessions/{id}/messages:
 *   get:
 *     tags:
 *       - 💬 Chatbot
 *     summary: Récupérer l'historique des messages
 *     description: |
 *       Récupère l'historique complet des messages d'une session.
 *
 *       **Réservé aux clients authentifiés**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la session
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Messages par page
 *     responses:
 *       200:
 *         description: Historique des messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatbotMessage'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       403:
 *         description: Accès non autorisé à cette session
 */
router.get(
  "/sessions/:id/messages",
  authenticateMiddleware(),
  getSessionMessages
);

/**
 * @swagger
 * /api/chatbot/sessions/{id}/messages/updates:
 *   get:
 *     tags:
 *       - 💬 Chatbot
 *     summary: Vérifier les nouveaux messages (Polling)
 *     description: |
 *       Vérifie s'il y a de nouveaux messages depuis le dernier message connu.
 *       Utilisé pour le polling côté client.
 *
 *       **Réservé aux clients authentifiés**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la session
 *       - in: query
 *         name: last_message_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du dernier message connu
 *     responses:
 *       200:
 *         description: État des mises à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 has_updates:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatbotMessage'
 *                 last_message_id:
 *                   type: string
 *                   format: uuid
 *       403:
 *         description: Accès non autorisé à cette session
 */
router.get(
  "/sessions/:id/messages/updates",
  authenticateMiddleware(),
  getMessageUpdates
);

// ==================== GESTION SESSIONS ====================

/**
 * @swagger
 * /api/chatbot/sessions/{id}/close:
 *   post:
 *     tags:
 *       - 💬 Chatbot
 *     summary: Fermer une session de chat
 *     description: |
 *       Ferme une session de chat active.
 *
 *       **Réservé aux clients authentifiés**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la session
 *     responses:
 *       200:
 *         description: Session fermée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Session fermée avec succès"
 *                 session_id:
 *                   type: string
 *                 client_id:
 *                   type: string
 *       403:
 *         description: Accès non autorisé à cette session
 */
router.post("/sessions/:id/close", authenticateMiddleware(), closeSession);

// ==================== STATISTIQUES (ENTREPRISE) ====================

/**
 * @swagger
 * /api/chatbot/stats:
 *   get:
 *     tags:
 *       - 💬 Chatbot
 *     summary: Statistiques d'utilisation du chatbot (Entreprise seulement)
 *     description: |
 *       Récupère les statistiques d'utilisation du chatbot pour l'entreprise.
 *
 *       **Réservé aux entreprises authentifiées**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: month
 *         description: Période des statistiques
 *     responses:
 *       200:
 *         description: Statistiques du chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                     total_sessions:
 *                       type: integer
 *                     unique_clients:
 *                       type: integer
 *                     total_messages:
 *                       type: integer
 *                     avg_messages_per_session:
 *                       type: number
 *                       format: float
 *                 message:
 *                   type: string
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.get("/stats", authenticateMiddleware(), getChatbotStats);

// ==================== SANTÉ ====================

/**
 * @swagger
 * /api/chatbot/health:
 *   get:
 *     tags:
 *       - 💬 Chatbot
 *     summary: Santé du service chatbot
 *     description: Vérifie l'état du service chatbot
 *     responses:
 *       200:
 *         description: Service opérationnel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 service:
 *                   type: string
 *                   example: "chatbot"
 *                 status:
 *                   type: string
 *                   example: "operational"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 features:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: boolean
 *                     messages:
 *                       type: boolean
 *                     intent_detection:
 *                       type: boolean
 *                     data_integration:
 *                       type: boolean
 */
router.get("/health", getChatbotHealth);

export default router;
