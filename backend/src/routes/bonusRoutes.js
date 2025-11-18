import express from "express";
import { authenticateMiddleware } from "../middleware/authMiddleware.js";
import {
  createBonus,
  listBonus,
  getBonus,
  updateBonus,
  toggleBonusActif,
  deleteBonus,
  getMesBonus,
  applyBonus,
} from "../controllers/bonusController.js";

/**
 * BONUS ROUTES - API Endpoints
 *
 * Endpoints pour la gestion des bonus (système de fidélisation)
 *
 * Routes Entreprise:
 * POST   /api/bonus                 - Créer un bonus
 * GET    /api/bonus                 - Lister les bonus de l'entreprise
 * GET    /api/bonus/:id             - Voir un bonus
 * PUT    /api/bonus/:id             - Modifier un bonus
 * PATCH  /api/bonus/:id/toggle-actif - Activer/désactiver
 * DELETE /api/bonus/:id             - Supprimer un bonus
 *
 * Routes Client:
 * GET    /api/bonus                 - Voir les bonus applicables
 * GET    /api/bonus/client/mes-bonus - Voir mes bonus applicables
 * POST   /api/bonus/:id/apply       - Appliquer un bonus
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
 *     Bonus:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         entreprise_id:
 *           type: string
 *           format: uuid
 *         titre:
 *           type: string
 *         description:
 *           type: string
 *         valeur:
 *           type: number
 *           format: float
 *         appliquer_a:
 *           type: string
 *           enum: [tous, specifique, filtre]
 *         client_id:
 *           type: string
 *           format: uuid
 *         type_client_filtre:
 *           type: string
 *           enum: [particulier, entreprise]
 *         secteur_filtre:
 *           type: string
 *           enum: [Technologie, Agriculture, Commerce, Finance, Transport & Logistique, Industrie, Éducation, Santé]
 *         taille_filtre:
 *           type: string
 *           enum: [1 - 10 employés, 11 - 50 employés, 51 - 200 employés, 201 - 500 employés, 500+ employés]
 *         date_debut:
 *           type: string
 *           format: date
 *         date_fin:
 *           type: string
 *           format: date
 *         conditions:
 *           type: string
 *         est_actif:
 *           type: boolean
 *         date_creation:
 *           type: string
 *           format: date-time
 */

// Appliquer l'authentification à tous les endpoints
router.use(authenticateMiddleware());

// ==================== CRÉER BONUS (ENTREPRISE) ====================

/**
 * @swagger
 * /api/bonus:
 *   post:
 *     tags:
 *       - 🎁 Bonus
 *     summary: Créer un nouveau bonus (Entreprise seulement)
 *     description: |
 *       Crée un nouveau bonus de fidélisation.
 *
 *       Types d'application:
 *       - **tous** : Pour tous les clients
 *       - **specifique** : Pour un client spécifique
 *       - **filtre** : Pour des clients répondant à des critères
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - valeur
 *               - date_debut
 *               - date_fin
 *             properties:
 *               titre:
 *                 type: string
 *                 maxLength: 255
 *                 description: Titre du bonus
 *                 example: "Réduction fidélité"
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Description détaillée
 *                 example: "10% de réduction sur votre prochaine commande"
 *               valeur:
 *                 type: number
 *                 format: float
 *                 minimum: 0.01
 *                 description: Valeur du bonus
 *                 example: 10.00
 *               appliquer_a:
 *                 type: string
 *                 enum: [tous, specifique, filtre]
 *                 description: Type d'application (défaut: tous)
 *               client_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID client si appliquer_a = "specifique"
 *               type_client_filtre:
 *                 type: string
 *                 enum: [particulier, entreprise]
 *                 description: Filtre type client si appliquer_a = "filtre"
 *               secteur_filtre:
 *                 type: string
 *                 enum: [Technologie, Agriculture, Commerce, Finance, Transport & Logistique, Industrie, Éducation, Santé]
 *                 description: Filtre secteur si appliquer_a = "filtre"
 *               taille_filtre:
 *                 type: string
 *                 enum: [1 - 10 employés, 11 - 50 employés, 51 - 200 employés, 201 - 500 employés, 500+ employés]
 *                 description: Filtre taille entreprise si appliquer_a = "filtre"
 *               date_debut:
 *                 type: string
 *                 format: date
 *                 description: Date de début de validité
 *                 example: "2024-01-01"
 *               date_fin:
 *                 type: string
 *                 format: date
 *                 description: Date de fin de validité
 *                 example: "2024-12-31"
 *               conditions:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Conditions d'utilisation
 *                 example: "Valable sur les commandes de plus de 100€"
 *           example:
 *             titre: "Offre de bienvenue"
 *             description: "15% de réduction sur votre première commande"
 *             valeur: 15.00
 *             appliquer_a: "tous"
 *             date_debut: "2024-01-01"
 *             date_fin: "2024-12-31"
 *             conditions: "Valable une seule fois par client"
 *     responses:
 *       201:
 *         description: Bonus créé avec succès
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
 *                   example: "Bonus créé avec succès"
 *                 bonus:
 *                   $ref: '#/components/schemas/Bonus'
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès réservé aux entreprises
 */
router.post("/", createBonus);

// ==================== LISTER BONUS ====================

/**
 * @swagger
 * /api/bonus:
 *   get:
 *     tags:
 *       - 🎁 Bonus
 *     summary: Lister les bonus
 *     description: |
 *       Liste les bonus avec comportement différent selon l'utilisateur:
 *
 *       - **Entreprise** : Voit ses propres bonus
 *       - **Client** : Voit les bonus qui lui sont applicables (automatiquement filtrés)
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
 *         description: Bonus par page
 *       - in: query
 *         name: est_actif
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif/inactif (entreprise seulement)
 *     responses:
 *       200:
 *         description: Liste des bonus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bonus:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bonus'
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
router.get("/", listBonus);

// ==================== VOIR BONUS ====================

/**
 * @swagger
 * /api/bonus/{id}:
 *   get:
 *     tags:
 *       - 🎁 Bonus
 *     summary: Voir les détails d'un bonus
 *     description: |
 *       Récupère les détails d'un bonus spécifique.
 *
 *       - **Entreprise** : Seulement ses propres bonus
 *       - **Client** : Tous les bonus (mais filtrage automatique dans la liste)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du bonus
 *     responses:
 *       200:
 *         description: Détails du bonus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bonus:
 *                   $ref: '#/components/schemas/Bonus'
 *       403:
 *         description: Accès refusé à ce bonus
 *       404:
 *         description: Bonus non trouvé
 */
router.get("/:id", getBonus);

// ==================== METTRE À JOUR BONUS (ENTREPRISE) ====================

/**
 * @swagger
 * /api/bonus/{id}:
 *   put:
 *     tags:
 *       - 🎁 Bonus
 *     summary: Modifier un bonus (Entreprise seulement)
 *     description: Met à jour les informations d'un bonus existant.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du bonus
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               valeur:
 *                 type: number
 *                 format: float
 *                 minimum: 0.01
 *               appliquer_a:
 *                 type: string
 *                 enum: [tous, specifique, filtre]
 *               client_id:
 *                 type: string
 *                 format: uuid
 *               type_client_filtre:
 *                 type: string
 *                 enum: [particulier, entreprise]
 *               secteur_filtre:
 *                 type: string
 *                 enum: [Technologie, Agriculture, Commerce, Finance, Transport & Logistique, Industrie, Éducation, Santé]
 *               taille_filtre:
 *                 type: string
 *                 enum: [1 - 10 employés, 11 - 50 employés, 51 - 200 employés, 201 - 500 employés, 500+ employés]
 *               date_debut:
 *                 type: string
 *                 format: date
 *               date_fin:
 *                 type: string
 *                 format: date
 *               conditions:
 *                 type: string
 *                 maxLength: 1000
 *               est_actif:
 *                 type: boolean
 *           example:
 *             titre: "Réduction spéciale Noël"
 *             valeur: 20.00
 *             date_fin: "2024-12-25"
 *     responses:
 *       200:
 *         description: Bonus mis à jour
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
 *                   example: "Bonus mis à jour avec succès"
 *                 bonus:
 *                   $ref: '#/components/schemas/Bonus'
 *       403:
 *         description: Seule l'entreprise propriétaire peut modifier
 *       404:
 *         description: Bonus non trouvé
 */
router.put("/:id", updateBonus);

// ==================== ACTIVER/DÉSACTIVER BONUS (ENTREPRISE) ====================

/**
 * @swagger
 * /api/bonus/{id}/toggle-actif:
 *   patch:
 *     tags:
 *       - 🎁 Bonus
 *     summary: Activer/désactiver un bonus (Entreprise seulement)
 *     description: Active ou désactive un bonus sans le supprimer.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du bonus
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - est_actif
 *             properties:
 *               est_actif:
 *                 type: boolean
 *                 description: Nouvel état du bonus
 *           example:
 *             est_actif: false
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
 *                   example: "Bonus désactivé avec succès"
 *                 bonus:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     titre:
 *                       type: string
 *                     est_actif:
 *                       type: boolean
 *       403:
 *         description: Seule l'entreprise propriétaire peut modifier
 *       404:
 *         description: Bonus non trouvé
 */
router.patch("/:id/toggle-actif", toggleBonusActif);

// ==================== SUPPRIMER BONUS (ENTREPRISE) ====================

/**
 * @swagger
 * /api/bonus/{id}:
 *   delete:
 *     tags:
 *       - 🎁 Bonus
 *     summary: Supprimer un bonus (Entreprise seulement)
 *     description: Supprime définitivement un bonus.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du bonus
 *     responses:
 *       200:
 *         description: Bonus supprimé
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
 *                   example: "Bonus supprimé avec succès"
 *       403:
 *         description: Seule l'entreprise propriétaire peut supprimer
 *       404:
 *         description: Bonus non trouvé
 */
router.delete("/:id", deleteBonus);

// ==================== MES BONUS (CLIENT) ====================

/**
 * @swagger
 * /api/bonus/client/mes-bonus:
 *   get:
 *     tags:
 *       - 🎁 Bonus
 *     summary: Voir mes bonus applicables (Client seulement)
 *     description: |
 *       Récupère tous les bonus applicables au client authentifié.
 *
 *       Inclus seulement les bonus:
 *       - Actifs
 *       - Dans la période de validité
 *       - Qui correspondent aux critères du client
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des bonus applicables
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bonus:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bonus'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Non authentifié
 */
router.get("/client/mes-bonus", getMesBonus);

// ==================== APPLIQUER BONUS (CLIENT) ====================

/**
 * @swagger
 * /api/bonus/{id}/apply:
 *   post:
 *     tags:
 *       - 🎁 Bonus
 *     summary: Appliquer un bonus (Client seulement)
 *     description: Utilise un bonus sur une commande (fonctionnalité à implémenter).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du bonus
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commande_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la commande sur laquelle appliquer le bonus
 *           example:
 *             commande_id: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Bonus appliqué (placeholder)
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
 *                 bonus_id:
 *                   type: string
 *                 client_id:
 *                   type: string
 *                 commande_id:
 *                   type: string
 *       403:
 *         description: Accès réservé aux clients
 *       404:
 *         description: Bonus non trouvé
 */
router.post("/:id/apply", applyBonus);

export default router;
