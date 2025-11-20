import express from "express";
import { authenticateMiddleware } from "../middleware/authMiddleware.js";
import {
  createCommande,
  listCommandes,
  getCommande,
  updateCommandeStatus,
  updateCommandeEtape,
  updateCoutFinal,
  addNote,
  getNotes,
} from "../controllers/commandeController.js";

/**
 * 🛒 COMMANDE ROUTES - API Endpoints
 *
 * Endpoints pour la gestion des commandes
 * Tous les endpoints nécessitent une authentification JWT
 *
 * Routes:
 * POST   /api/commandes              - Créer une commande
 * GET    /api/commandes              - Lister les commandes
 * GET    /api/commandes/:id          - Voir une commande
 * PATCH  /api/commandes/:id/status   - Changer le statut
 * PATCH  /api/commandes/:id/etape    - Changer l'étape
 * PATCH  /api/commandes/:id/cout-final - Renseigner coût final
 * POST   /api/commandes/:id/notes    - Ajouter une note
 * GET    /api/commandes/:id/notes    - Voir les notes
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
 *     Commande:
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
 *         statut:
 *           type: string
 *         cout_estime:
 *           type: number
 *           format: float
 *         cout_final:
 *           type: number
 *           format: float
 *         etape_actuelle:
 *           type: integer
 *         nombre_etapes:
 *           type: integer
 *         date_creation:
 *           type: string
 *           format: date-time
 *         date_modification:
 *           type: string
 *           format: date-time
 *         date_livraison:
 *           type: string
 *           format: date-time
 *     NoteCommande:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         commande_id:
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

// ==================== CRÉER COMMANDE ====================

/**
 * @swagger
 * /api/commandes:
 *   post:
 *     tags:
 *       - 🛒 Commandes
 *     summary: Créer une nouvelle commande
 *     description: Crée une nouvelle commande. Le client authentifié devient le créateur.
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
 *             properties:
 *               entreprise_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de l'entreprise prestataire
 *               titre:
 *                 type: string
 *                 maxLength: 255
 *                 description: Titre de la commande
 *                 example: "Développement site web e-commerce"
 *               description:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Description détaillée du projet
 *                 example: "Création d'un site e-commerce avec panier, paiement et backoffice..."
 *               cout_estime:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Coût estimé du projet (optionnel)
 *                 example: 2500.00
 *               ticket_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID d'un ticket lié (optionnel)
 *           example:
 *             entreprise_id: "550e8400-e29b-41d4-a716-446655440000"
 *             titre: "Application mobile de gestion"
 *             description: "Développement d'une application mobile iOS et Android pour la gestion des stocks"
 *             cout_estime: 5000.00
 *     responses:
 *       201:
 *         description: Commande créée avec succès
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
 *                   example: "Commande créée avec succès"
 *                 commande:
 *                   $ref: '#/components/schemas/Commande'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Seul un client peut créer une commande
 */
router.post("/", createCommande);

// ==================== LISTER COMMANDES ====================

/**
 * @swagger
 * /api/commandes:
 *   get:
 *     tags:
 *       - 🛒 Commandes
 *     summary: Lister les commandes
 *     description: |
 *       Liste les commandes avec filtres optionnels et pagination.
 *
 *       - Les **clients** voient uniquement leurs propres commandes
 *       - Les **entreprises** voient les commandes qui leur sont adressées
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
 *         description: Commandes par page
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en_attente, contrat_accepte, en_cours_developpement, livraison, livree, annulee]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 commandes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Commande'
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
router.get("/", listCommandes);

// ==================== VOIR COMMANDE ====================

/**
 * @swagger
 * /api/commandes/{id}:
 *   get:
 *     tags:
 *       - 🛒 Commandes
 *     summary: Voir les détails d'une commande
 *     description: |
 *       Récupère les détails d'une commande et ses notes.
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
 *         description: ID de la commande
 *     responses:
 *       200:
 *         description: Détails de la commande
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 commande:
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
 *                     cout_estime:
 *                       type: number
 *                     cout_final:
 *                       type: number
 *                     etape_actuelle:
 *                       type: integer
 *                     nombre_etapes:
 *                       type: integer
 *                     notes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NoteCommande'
 *       403:
 *         description: Accès refusé à cette commande
 *       404:
 *         description: Commande non trouvée
 */
router.get("/:id", getCommande);

// ==================== CHANGER STATUT ====================

/**
 * @swagger
 * /api/commandes/{id}/status:
 *   patch:
 *     tags:
 *       - 🛒 Commandes
 *     summary: Changer le statut d'une commande
 *     description: |
 *       Fait passer la commande au statut suivant.
 *
 *       **Seulement les entreprises** peuvent changer le statut.
 *
 *       Workflow des statuts:
 *       1. en_attente → 2. contrat_accepte → 3. en_cours_developpement → 4. livraison → 5. livree
 *       OU annulee à tout moment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la commande
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
 *                 enum: [en_attente, contrat_accepte, en_cours_developpement, livraison, livree, annulee]
 *                 description: Nouveau statut
 *           example:
 *             statut: "contrat_accepte"
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
 *                   example: "Statut de la commande mis à jour: contrat_accepte"
 *                 commande:
 *                   $ref: '#/components/schemas/Commande'
 *       403:
 *         description: Seule l'entreprise responsable peut changer le statut
 *       404:
 *         description: Commande non trouvée
 */
router.patch("/:id/status", updateCommandeStatus);

// ==================== CHANGER ÉTAPE ====================

/**
 * @swagger
 * /api/commandes/{id}/etape:
 *   patch:
 *     tags:
 *       - 🛒 Commandes
 *     summary: Changer l'étape actuelle d'une commande
 *     description: |
 *       Met à jour l'étape de progression de la commande.
 *
 *       **Seulement les entreprises** peuvent changer l'étape.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - etape_actuelle
 *             properties:
 *               etape_actuelle:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 description: Nouvelle étape actuelle
 *           example:
 *             etape_actuelle: 3
 *     responses:
 *       200:
 *         description: Étape mise à jour
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
 *                   example: "Étape de la commande mise à jour: 3"
 *                 commande:
 *                   $ref: '#/components/schemas/Commande'
 *       403:
 *         description: Seule l'entreprise responsable peut changer l'étape
 *       404:
 *         description: Commande non trouvée
 */
router.patch("/:id/etape", updateCommandeEtape);

// ==================== RENSEIGNER COÛT FINAL ====================

/**
 * @swagger
 * /api/commandes/{id}/cout-final:
 *   patch:
 *     tags:
 *       - 🛒 Commandes
 *     summary: Renseigner le coût final d'une commande
 *     description: |
 *       Enregistre le coût final d'une commande livrée.
 *       Utilisé pour le calcul des revenus dans le dashboard.
 *
 *       **Seulement les entreprises** peuvent renseigner le coût final.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cout_final
 *             properties:
 *               cout_final:
 *                 type: number
 *                 format: float
 *                 minimum: 0.01
 *                 description: Coût final du projet
 *           example:
 *             cout_final: 4800.00
 *     responses:
 *       200:
 *         description: Coût final mis à jour
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
 *                   example: "Coût final de la commande mis à jour: 4800.00"
 *                 commande:
 *                   $ref: '#/components/schemas/Commande'
 *       403:
 *         description: Seule l'entreprise responsable peut renseigner le coût final
 *       404:
 *         description: Commande non trouvée
 */
router.patch("/:id/cout-final", updateCoutFinal);

// ==================== AJOUTER NOTE ====================

/**
 * @swagger
 * /api/commandes/{id}/notes:
 *   post:
 *     tags:
 *       - 🛒 Commandes
 *     summary: Ajouter une note à une commande
 *     description: |
 *       Ajoute une note/commentaire à la commande.
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
 *         description: ID de la commande
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
 *                 example: "Livraison prévue pour la fin du mois. Le client a validé les maquettes."
 *               est_publique:
 *                 type: boolean
 *                 description: Note visible par le client? (défaut pour clients: true)
 *           example:
 *             contenu: "Réunion de suivi prévue le 15/12"
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
 *                   $ref: '#/components/schemas/NoteCommande'
 *       400:
 *         description: Note invalide (vide ou trop longue)
 *       403:
 *         description: Accès refusé à cette commande
 *       404:
 *         description: Commande non trouvée
 */
router.post("/:id/notes", addNote);

// ==================== LISTER NOTES ====================

/**
 * @swagger
 * /api/commandes/{id}/notes:
 *   get:
 *     tags:
 *       - 🛒 Commandes
 *     summary: Lister les notes d'une commande
 *     description: |
 *       Liste les notes/commentaires de la commande.
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
 *         description: ID de la commande
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
 *                     $ref: '#/components/schemas/NoteCommande'
 *       403:
 *         description: Accès refusé à cette commande
 *       404:
 *         description: Commande non trouvée
 */
router.get("/:id/notes", getNotes);

export default router;
