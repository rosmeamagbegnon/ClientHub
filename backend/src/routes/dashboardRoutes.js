import express from "express";
import { authenticateMiddleware } from "../middleware/authMiddleware.js";
import {
  getDashboard,
  getOverview,
  getTrends,
  getTicketsDistribution,
  getOrdersDistribution,
  getPerformance,
  getRecentActivity,
  getTopClients,
  getDashboardHealth,
  getQuickStats,
} from "../controllers/dashboardController.js";

/**
 * DASHBOARD ROUTES - API Endpoints
 *
 * Endpoints pour le dashboard analytique entreprise.
 * Données en temps réel sur clients, tickets, commandes, revenus.
 *
 * Routes Entreprise:
 * GET /api/dashboard                 - Dashboard complet
 * GET /api/dashboard/overview        - Statistiques générales
 * GET /api/dashboard/trends          - Données de tendance
 * GET /api/dashboard/quick-stats     - Métriques rapides
 * GET /api/dashboard/performance     - Métriques performance
 * GET /api/dashboard/activity        - Activité récente
 * GET /api/dashboard/top-clients     - Clients les plus actifs
 *
 * Public:
 * GET /api/dashboard/health          - Santé du service
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
 *     DashboardOverview:
 *       type: object
 *       properties:
 *         clients:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             new:
 *               type: integer
 *             growth:
 *               type: number
 *         tickets:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             resolved:
 *               type: integer
 *             pending:
 *               type: integer
 *             in_progress:
 *               type: integer
 *             resolution_rate:
 *               type: number
 *         orders:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             delivered:
 *               type: integer
 *             in_progress:
 *               type: integer
 *             delivery_rate:
 *               type: number
 *         revenue:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *             period:
 *               type: number
 *             growth:
 *               type: number
 *     TrendData:
 *       type: object
 *       properties:
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *         values:
 *           type: array
 *           items:
 *             type: integer
 *         total:
 *           type: integer
 *         growth:
 *           type: number
 *         period:
 *           type: string
 */

// ==================== DASHBOARD COMPLET ====================

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags:
 *       - 📊 Dashboard
 *     summary: Dashboard complet entreprise
 *     description: |
 *       Récupère toutes les données du dashboard pour l'entreprise authentifiée.
 *       Inclut statistiques, tendances, répartitions, performance et activité.
 *
 *       **Réservé aux entreprises authentifiées**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Période d'analyse
 *     responses:
 *       200:
 *         description: Données complètes du dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 period:
 *                   type: string
 *                   example: "month"
 *                 entreprise_id:
 *                   type: string
 *                   format: uuid
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 overview:
 *                   $ref: '#/components/schemas/DashboardOverview'
 *                 trends:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       $ref: '#/components/schemas/TrendData'
 *                     orders:
 *                       $ref: '#/components/schemas/TrendData'
 *                     revenue:
 *                       $ref: '#/components/schemas/TrendData'
 *                 distributions:
 *                   type: object
 *                   properties:
 *                     tickets_by_status:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           percentage:
 *                             type: number
 *                     orders_by_status:
 *                       type: array
 *                 performance:
 *                   type: object
 *                 lists:
 *                   type: object
 *                 kpis:
 *                   type: object
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.get("/", authenticateMiddleware(), getDashboard);

// ==================== STATISTIQUES GÉNÉRALES ====================

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     tags:
 *       - 📊 Dashboard
 *     summary: Statistiques générales et KPIs
 *     description: |
 *       Récupère uniquement les statistiques générales et indicateurs clés.
 *       Plus rapide que le dashboard complet.
 *
 *       **Réservé aux entreprises authentifiées**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Période d'analyse
 *     responses:
 *       200:
 *         description: Statistiques générales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 overview:
 *                   $ref: '#/components/schemas/DashboardOverview'
 *                 kpis:
 *                   type: object
 *                   properties:
 *                     ticket_resolution_rate:
 *                       type: number
 *                       example: 85.5
 *                     order_delivery_rate:
 *                       type: number
 *                       example: 92.0
 *                     average_order_value:
 *                       type: number
 *                       example: 1250.50
 *                     average_resolution_time:
 *                       type: number
 *                       example: 24.5
 *                     client_acquisition:
 *                       type: integer
 *                       example: 12
 *                     satisfaction_score:
 *                       type: number
 *                       example: 88.5
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.get("/overview", authenticateMiddleware(), getOverview);

// ==================== TENDANCES ====================

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     tags:
 *       - 📊 Dashboard
 *     summary: Données de tendance
 *     description: |
 *       Récupère les données de tendance pour un métrique spécifique.
 *       Utilisé pour les graphiques d'évolution.
 *
 *       **Réservé aux entreprises authentifiées**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Période d'analyse
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [tickets, commandes, revenus, clients]
 *           default: tickets
 *         description: Métrique à analyser
 *     responses:
 *       200:
 *         description: Données de tendance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 metric:
 *                   type: string
 *                   example: "tickets"
 *                 period:
 *                   type: string
 *                   example: "month"
 *                 data:
 *                   $ref: '#/components/schemas/TrendData'
 *       400:
 *         description: Paramètres invalides
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.get("/trends", authenticateMiddleware(), getTrends);

// ==================== MÉTRIQUES RAPIDES ====================

/**
 * @swagger
 * /api/dashboard/quick-stats:
 *   get:
 *     tags:
 *       - 📊 Dashboard
 *     summary: Métriques rapides
 *     description: |
 *       Récupère les métriques les plus importantes pour affichage rapide.
 *       Optimisé pour les widgets en temps réel.
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
 *         description: Période d'analyse
 *     responses:
 *       200:
 *         description: Métriques rapides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 period:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     total_clients:
 *                       type: integer
 *                     new_clients:
 *                       type: integer
 *                     total_tickets:
 *                       type: integer
 *                     resolved_tickets:
 *                       type: integer
 *                     total_orders:
 *                       type: integer
 *                     delivered_orders:
 *                       type: integer
 *                     total_revenue:
 *                       type: number
 *                     period_revenue:
 *                       type: number
 *                 kpis:
 *                   type: object
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.get("/quick-stats", authenticateMiddleware(), getQuickStats);

// ==================== RÉPARTITIONS ====================

/**
 * @swagger
 * /api/dashboard/distributions/tickets:
 *   get:
 *     tags:
 *       - 📊 Dashboard
 *     summary: Répartition des tickets par statut
 *     description: |
 *       Récupère la distribution des tickets selon leur statut.
 *
 *       **Réservé aux entreprises authentifiées**
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Redirection vers dashboard complet
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
 *                 endpoint:
 *                   type: string
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.get(
  "/distributions/tickets",
  authenticateMiddleware(),
  getTicketsDistribution
);

/**
 * @swagger
 * /api/dashboard/distributions/commandes:
 *   get:
 *     tags:
 *       - 📊 Dashboard
 *     summary: Répartition des commandes par statut
 *     description: |
 *       Récupère la distribution des commandes selon leur statut.
 *
 *       **Réservé aux entreprises authentifiées**
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Redirection vers dashboard complet
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.get(
  "/distributions/commandes",
  authenticateMiddleware(),
  getOrdersDistribution
);

// ==================== PERFORMANCE ====================

/**
 * @swagger
 * /api/dashboard/performance:
 *   get:
 *     tags:
 *       - 📊 Dashboard
 *     summary: Métriques de performance
 *     description: |
 *       Récupère les indicateurs de performance (temps résolution, etc.).
 *
 *       **Réservé aux entreprises authentifiées**
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Redirection vers dashboard complet
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.get("/performance", authenticateMiddleware(), getPerformance);

// ==================== ACTIVITÉ RÉCENTE ====================

/**
 * @swagger
 * /api/dashboard/activity:
 *   get:
 *     tags:
 *       - 📊 Dashboard
 *     summary: Activité récente
 *     description: |
 *       Récupère les dernières activités (tickets et commandes récents).
 *
 *       **Réservé aux entreprises authentifiées**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 50
 *         description: Nombre maximum d'activités
 *     responses:
 *       200:
 *         description: Redirection vers dashboard complet
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.get("/activity", authenticateMiddleware(), getRecentActivity);

// ==================== TOP CLIENTS ====================

/**
 * @swagger
 * /api/dashboard/top-clients:
 *   get:
 *     tags:
 *       - 📊 Dashboard
 *     summary: Clients les plus actifs
 *     description: |
 *       Récupère la liste des clients les plus actifs et rentables.
 *
 *       **Réservé aux entreprises authentifiées**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 25
 *         description: Nombre maximum de clients
 *     responses:
 *       200:
 *         description: Redirection vers dashboard complet
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.get("/top-clients", authenticateMiddleware(), getTopClients);

// ==================== SANTÉ DU SERVICE ====================

/**
 * @swagger
 * /api/dashboard/health:
 *   get:
 *     tags:
 *       - 📊 Dashboard
 *     summary: Santé du service dashboard
 *     description: Vérifie l'état du service dashboard et ses données
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
 *                   example: "dashboard"
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
 *                     overview:
 *                       type: boolean
 *                     trends:
 *                       type: boolean
 *                     distributions:
 *                       type: boolean
 *                     performance:
 *                       type: boolean
 *                     activity:
 *                       type: boolean
 *                     kpis:
 *                       type: boolean
 *                 data_sources:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: boolean
 *                     commandes:
 *                       type: boolean
 *                     clients:
 *                       type: boolean
 *                     bonus:
 *                       type: boolean
 *                     chatbot:
 *                       type: boolean
 */
router.get("/health", getDashboardHealth);

export default router;
