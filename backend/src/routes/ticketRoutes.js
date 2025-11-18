import express from "express";
import { authenticateMiddleware } from "../middleware/authMiddleware.js";
import {
  createTicket,
  listTickets,
  getTicket,
  updateTicketStatus,
  addNote,
  getNotes,
} from "../controllers/ticketController.js";

/**
 * 🎫 TICKET ROUTES - API Endpoints
 *
 * Endpoints pour la gestion des tickets
 * Tous les endpoints nécessitent une authentification JWT
 *
 * Routes:
 * POST   /api/tickets              - Créer un ticket
 * GET    /api/tickets              - Lister les tickets
 * GET    /api/tickets/:id          - Voir un ticket
 * PATCH  /api/tickets/:id/status   - Changer le statut
 * POST   /api/tickets/:id/notes    - Ajouter une note
 * GET    /api/tickets/:id/notes    - Voir les notes
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
 *     Ticket:
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
 *         titre:
 *           type: string
 *         description:
 *           type: string
 *         type_ticket:
 *           type: string
 *         statut:
 *           type: string
 *         priorite:
 *           type: string
 *         date_creation:
 *           type: string
 *           format: date-time
 *         date_modification:
 *           type: string
 *           format: date-time
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         ticket_id:
 *           type: string
 *           format: uuid
 *         auteur_id:
 *           type: string
 *           format: uuid
 *         contenu:
 *           type: string
 *         est_publique:
 *           type: boolean
 *         date_creation:
 *           type: string
 *           format: date-time
 */

// Appliquer l'authentification à tous les endpoints
router.use(authenticateMiddleware());

// ==================== CRÉER TICKET ====================

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     tags:
 *       - 🎫 Tickets
 *     summary: Créer un nouveau ticket
 *     description: Crée un nouveau ticket. Le client authentifié devient le créateur.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entreprise_id
 *               - titre
 *               - description
 *               - type_ticket
 *             properties:
 *               entreprise_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de l'entreprise destinataire
 *               titre:
 *                 type: string
 *                 maxLength: 255
 *                 description: Titre du ticket
 *                 example: "Problème de facturation"
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Description détaillée
 *                 example: "J'ai reçu une facture avec un montant incorrecte..."
 *               type_ticket:
 *                 type: string
 *                 enum: [facturation, réclamation, technique, suggestion, autre]
 *                 description: Catégorie du ticket
 *               priorite:
 *                 type: string
 *                 enum: [basse, normal, haute, urgente]
 *                 description: Priorité (défaut: normal)
 *           example:
 *             entreprise_id: "550e8400-e29b-41d4-a716-446655440000"
 *             titre: "Problème de livraison"
 *             description: "La commande n'a pas été livrée à la date prévue"
 *             type_ticket: "réclamation"
 *             priorite: "haute"
 *     responses:
 *       201:
 *         description: Ticket créé avec succès
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
 *                   example: "Ticket créé avec succès"
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Seul un client peut créer un ticket
 */
router.post("/", createTicket);

// ==================== LISTER TICKETS ====================

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     tags:
 *       - 🎫 Tickets
 *     summary: Lister les tickets
 *     description: |
 *       Liste les tickets avec filtres optionnels et pagination.
 *
 *       - Les **clients** voient uniquement leurs propres tickets
 *       - Les **entreprises** voient les tickets adressés à leur entreprise
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
 *         description: Tickets par page
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en_attente, en_cours_etude, rejete, accepte, assigne, en_cours_traitement, traite]
 *         description: Filtrer par statut
 *       - in: query
 *         name: priorite
 *         schema:
 *           type: string
 *           enum: [basse, normal, haute, urgente]
 *         description: Filtrer par priorité
 *       - in: query
 *         name: type_ticket
 *         schema:
 *           type: string
 *           enum: [facturation, réclamation, technique, suggestion, autre]
 *         description: Filtrer par type
 *     responses:
 *       200:
 *         description: Liste des tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
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
 *       401:
 *         description: Non authentifié
 */
router.get("/", listTickets);

// ==================== VOIR TICKET ====================

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     tags:
 *       - 🎫 Tickets
 *     summary: Voir les détails d'un ticket
 *     description: |
 *       Récupère les détails d'un ticket et ses notes.
 *
 *       - Les **clients** ne voient que les notes **publiques**
 *       - Les **entreprises** voient toutes les notes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du ticket
 *     responses:
 *       200:
 *         description: Détails du ticket
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     titre:
 *                       type: string
 *                     description:
 *                       type: string
 *                     statut:
 *                       type: string
 *                     priorite:
 *                       type: string
 *                     notes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Note'
 *       403:
 *         description: Accès refusé à ce ticket
 *       404:
 *         description: Ticket non trouvé
 */
router.get("/:id", getTicket);

// ==================== CHANGER STATUT ====================

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   patch:
 *     tags:
 *       - 🎫 Tickets
 *     summary: Changer le statut d'un ticket
 *     description: |
 *       Fait passer le ticket au statut suivant.
 *
 *       **Seulement les entreprises** peuvent changer le statut.
 *
 *       Statuts disponibles (workflow):
 *       1. en_attente → 2. en_cours_etude → 3. accepte OU rejete
 *       4. assigne → 5. en_cours_traitement → 6. traite
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [en_attente, en_cours_etude, rejete, accepte, assigne, en_cours_traitement, traite]
 *                 description: Nouveau statut
 *           example:
 *             statut: "en_cours_etude"
 *     responses:
 *       200:
 *         description: Statut mis à jour
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
 *                   example: "Statut du ticket mis à jour: en_cours_etude"
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       403:
 *         description: Seule l'entreprise responsable peut changer le statut
 *       404:
 *         description: Ticket non trouvé
 */
router.patch("/:id/status", updateTicketStatus);

// ==================== AJOUTER NOTE ====================

/**
 * @swagger
 * /api/tickets/{id}/notes:
 *   post:
 *     tags:
 *       - 🎫 Tickets
 *     summary: Ajouter une note à un ticket
 *     description: |
 *       Ajoute une note/commentaire au ticket.
 *
 *       - Les **clients** ajoutent toujours des notes **publiques** (visibles par l'entreprise)
 *       - Les **entreprises** peuvent ajouter des notes publiques ou privées
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenu
 *             properties:
 *               contenu:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Contenu de la note
 *                 example: "Merci d'avoir contacté notre support. Nous examinons votre demande..."
 *               est_publique:
 *                 type: boolean
 *                 description: Note visible par le client? (défaut pour clients: true)
 *           example:
 *             contenu: "Ticket assigné à John pour traitement"
 *             est_publique: false
 *     responses:
 *       201:
 *         description: Note ajoutée avec succès
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
 *                   example: "Note ajoutée avec succès"
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Note invalide (vide ou trop longue)
 *       403:
 *         description: Accès refusé à ce ticket
 *       404:
 *         description: Ticket non trouvé
 */
router.post("/:id/notes", addNote);

// ==================== LISTER NOTES ====================

/**
 * @swagger
 * /api/tickets/{id}/notes:
 *   get:
 *     tags:
 *       - 🎫 Tickets
 *     summary: Lister les notes d'un ticket
 *     description: |
 *       Liste les notes/commentaires du ticket.
 *
 *       - Les **clients** ne voient que les notes **publiques**
 *       - Les **entreprises** voient toutes les notes (publiques + privées)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du ticket
 *     responses:
 *       200:
 *         description: Liste des notes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 notes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       403:
 *         description: Accès refusé à ce ticket
 *       404:
 *         description: Ticket non trouvé
 */
router.get("/:id/notes", getNotes);

export default router;
