/**
 * Routes d'Authentification Clients
 *
 * Endpoints:
 * - POST /register/particulier - Inscription client particulier
 * - POST /register/entreprise - Inscription client entreprise
 * - POST /login - Connexion
 * - GET /me - Récupère profil connecté
 *
 * Documentation Swagger intégrée avec @swagger tags
 */

import express from "express";
import {
  registerParticulierController,
  registerEntrepriseController,
  loginController,
  getProfileController,
} from "../controllers/authClientController.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import { authenticateMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: 👤 Authentification Clients
 *     description: Inscription et connexion des clients (particuliers/entreprises)
 */

/**
 * @swagger
 * /api/auth/clients/register/particulier:
 *   post:
 *     tags:
 *       - 👤 Authentification Clients
 *     summary: Inscription d'un client particulier
 *     description: |
 *       Crée un nouveau compte client particulier.
 *       Le mot de passe doit respecter les critères de sécurité :
 *       - Minimum 8 caractères
 *       - 1 lettre majuscule
 *       - 1 chiffre
 *       - 1 caractère spécial
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prenom
 *               - nom
 *               - email
 *               - telephone
 *               - password
 *               - confirmPassword
 *             properties:
 *               prenom:
 *                 type: string
 *                 example: "Jean"
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               telephone:
 *                 type: string
 *                 example: "+22968123456"
 *               canal_contact:
 *                 type: string
 *                 enum: [email, whatsapp, sms]
 *                 default: "email"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *     responses:
 *       201:
 *         description: Client créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     client:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         prenom:
 *                           type: string
 *                         nom:
 *                           type: string
 *                         email:
 *                           type: string
 *                         type_client:
 *                           type: string
 *                     token:
 *                       type: string
 *                       description: JWT Bearer token à utiliser pour les requêtes authentifiées
 *       400:
 *         description: Validation échouée (champs manquants ou invalides)
 *       409:
 *         description: Email déjà utilisé
 */
router.post(
  "/register/particulier",
  authLimiter,
  registerParticulierController
);

/**
 * @swagger
 * /api/auth/clients/register/entreprise:
 *   post:
 *     tags:
 *       - 👤 Authentification Clients
 *     summary: Inscription d'une entreprise
 *     description: |
 *       Crée un nouveau compte entreprise.
 *       L'email du responsable doit être unique sur la plateforme.
 *       Le numéro RCCM/IFU doit également être unique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prenom
 *               - nom
 *               - email
 *               - password
 *               - confirmPassword
 *               - nom_entreprise
 *               - secteur_activite
 *               - taille_entreprise
 *               - numero_rccm
 *             properties:
 *               prenom:
 *                 type: string
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               nom_entreprise:
 *                 type: string
 *               secteur_activite:
 *                 type: string
 *                 enum:
 *                   - Technologie
 *                   - Agriculture
 *                   - Commerce
 *                   - Finance
 *                   - Transport & Logistique
 *                   - Industrie
 *                   - Éducation
 *                   - Santé
 *               taille_entreprise:
 *                 type: string
 *                 enum:
 *                   - "1 - 10 employés"
 *                   - "11 - 50 employés"
 *                   - "51 - 200 employés"
 *                   - "201 - 500 employés"
 *                   - "500+ employés"
 *               poste_occupe:
 *                 type: string
 *               numero_rccm:
 *                 type: string
 *               adresse_physique:
 *                 type: string
 *               email_professionnel:
 *                 type: string
 *               telephone_entreprise:
 *                 type: string
 *               site_internet:
 *                 type: string
 *               linkedin:
 *                 type: string
 *     responses:
 *       201:
 *         description: Entreprise créée avec succès
 *       400:
 *         description: Validation échouée
 *       409:
 *         description: Email ou RCCM déjà utilisé
 */
router.post("/register/entreprise", authLimiter, registerEntrepriseController);

/**
 * @swagger
 * /api/auth/clients/login:
 *   post:
 *     tags:
 *       - 👤 Authentification Clients
 *     summary: Connexion client
 *     description: |
 *       Authentifie un client (particulier ou entreprise) et retourne un JWT.
 *       Le JWT doit être utilisé dans le header Authorization : "Bearer <token>"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Email ou mot de passe manquant
 *       401:
 *         description: Identifiants incorrects
 *       403:
 *         description: Compte désactivé
 */
router.post("/login", authLimiter, loginController);

/**
 * @swagger
 * /api/auth/clients/me:
 *   get:
 *     tags:
 *       - 👤 Authentification Clients
 *     summary: Récupère le profil du client connecté
 *     description: Retourne les informations du client actuellement authentifié
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré
 *       401:
 *         description: Authentification requise ou token invalide
 *       404:
 *         description: Client non trouvé
 */
router.get(
  "/me",
  authenticateMiddleware(["particulier", "entreprise"]),
  getProfileController
);

export default router;
