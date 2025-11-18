import express from "express";
import * as authEntrepriseController from "../controllers/authEntrepriseController.js";
import { authenticateMiddleware } from "../middleware/authMiddleware.js";
import {
  generalLimiter,
  authLimiter,
} from "../middleware/rateLimitMiddleware.js";

/**
 * 🛣️ ENTREPRISE AUTHENTICATION ROUTES
 *
 * Définit tous les endpoints pour l'authentification des entreprises CRM.
 * Inclut la documentation Swagger complète.
 *
 * Prefix: /api/auth/entreprises
 */

const router = express.Router();

// ==================== SWAGGER SCHEMAS ====================

/**
 * @swagger
 * components:
 *   schemas:
 *     RegistrationEntreprise:
 *       type: object
 *       required:
 *         - nom_entreprise
 *         - secteur_activite
 *         - taille_entreprise
 *         - numero_rccm_ifu
 *         - email_entreprise
 *         - telephone_entreprise
 *         - whatsapp_entreprise
 *         - adresse_professionnelle
 *         - prenom_responsable
 *         - nom_responsable
 *         - email_responsable
 *         - password
 *         - confirmPassword
 *       properties:
 *         nom_entreprise:
 *           type: string
 *           example: "TechCompany Bénin"
 *         secteur_activite:
 *           type: string
 *           example: "Technologie"
 *         taille_entreprise:
 *           type: string
 *           example: "11 - 50 employés"
 *         numero_rccm_ifu:
 *           type: string
 *           example: "BJ-123456-789"
 *         email_entreprise:
 *           type: string
 *           format: email
 *           example: "contact@techcompany.bj"
 *         telephone_entreprise:
 *           type: string
 *           example: "+22968123456"
 *         whatsapp_entreprise:
 *           type: string
 *           example: "+22968123456"
 *         adresse_professionnelle:
 *           type: string
 *           example: "123 Avenue Cotonou"
 *         site_internet:
 *           type: string
 *           example: "www.techcompany.bj"
 *         linkedin:
 *           type: string
 *           example: "linkedin.com/company/techcompany"
 *         prenom_responsable:
 *           type: string
 *           example: "Alice"
 *         nom_responsable:
 *           type: string
 *           example: "Martin"
 *         email_responsable:
 *           type: string
 *           format: email
 *           example: "alice@techcompany.bj"
 *         password:
 *           type: string
 *           format: password
 *           example: "SecurePass123!"
 *         confirmPassword:
 *           type: string
 *           format: password
 *           example: "SecurePass123!"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EntrepriseProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nom_entreprise:
 *           type: string
 *         secteur_activite:
 *           type: string
 *         taille_entreprise:
 *           type: string
 *         numero_rccm_ifu:
 *           type: string
 *         email_entreprise:
 *           type: string
 *         telephone_entreprise:
 *           type: string
 *         whatsapp_entreprise:
 *           type: string
 *         adresse_professionnelle:
 *           type: string
 *         site_internet:
 *           type: string
 *         linkedin:
 *           type: string
 *         prenom_responsable:
 *           type: string
 *         nom_responsable:
 *           type: string
 *         email_responsable:
 *           type: string
 *         est_active:
 *           type: boolean
 *         date_creation:
 *           type: string
 *           format: date-time
 *         dernier_login:
 *           type: string
 *           format: date-time
 */

// ==================== ENDPOINTS ====================

/**
 * @swagger
 * /api/auth/entreprises/register:
 *   post:
 *     tags:
 *       - "🏢 Entreprises Auth"
 *     summary: "Inscription d'une nouvelle entreprise CRM"
 *     description: "Crée un compte entreprise CRM avec toutes ses informations. L'entreprise pourra ensuite gérer ses clients, tickets et commandes."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationEntreprise'
 *     responses:
 *       201:
 *         description: "✅ Inscription réussie"
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
 *                     entreprise:
 *                       $ref: '#/components/schemas/EntrepriseProfile'
 *                     token:
 *                       type: string
 *                       description: "JWT token valide 7 jours"
 *       400:
 *         description: "❌ Données invalides"
 *       409:
 *         description: "❌ Email ou RCCM/IFU déjà utilisés"
 *       500:
 *         description: "❌ Erreur serveur"
 */
router.post(
  "/register",
  authLimiter,
  authEntrepriseController.registerEntrepriseController
);

/**
 * @swagger
 * /api/auth/entreprises/login:
 *   post:
 *     tags:
 *       - "🏢 Entreprises Auth"
 *     summary: "Connexion d'une entreprise"
 *     description: "Authentifie une entreprise par son email et mot de passe. Retourne un token JWT."
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
 *                 example: "contact@techcompany.bj"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *     responses:
 *       200:
 *         description: "✅ Connexion réussie"
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
 *                     entreprise:
 *                       $ref: '#/components/schemas/EntrepriseProfile'
 *                     token:
 *                       type: string
 *       401:
 *         description: "❌ Email ou mot de passe incorrect"
 *       403:
 *         description: "❌ Compte désactivé"
 *       500:
 *         description: "❌ Erreur serveur"
 */
router.post(
  "/login",
  authLimiter,
  authEntrepriseController.loginEntrepriseController
);

/**
 * @swagger
 * /api/auth/entreprises/me:
 *   get:
 *     tags:
 *       - "🏢 Entreprises Auth"
 *     summary: "Récupère le profil de l'entreprise connectée"
 *     description: "Retourne les informations complètes de l'entreprise authentifiée."
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: "✅ Profil récupéré"
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
 *                   $ref: '#/components/schemas/EntrepriseProfile'
 *       401:
 *         description: "❌ Token manquant ou invalide"
 *       404:
 *         description: "❌ Entreprise non trouvée"
 *       500:
 *         description: "❌ Erreur serveur"
 */
router.get(
  "/me",
  authenticateMiddleware(),
  generalLimiter,
  authEntrepriseController.getProfileEntrepriseController
);

/**
 * @swagger
 * /api/auth/entreprises/profile:
 *   patch:
 *     tags:
 *       - "🏢 Entreprises Auth"
 *     summary: "Met à jour le profil de l'entreprise"
 *     description: "Permet à une entreprise de modifier ses informations publiques (téléphone, adresse, site, etc.)"
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom_entreprise:
 *                 type: string
 *               secteur_activite:
 *                 type: string
 *               telephone_entreprise:
 *                 type: string
 *               whatsapp_entreprise:
 *                 type: string
 *               adresse_professionnelle:
 *                 type: string
 *               site_internet:
 *                 type: string
 *               linkedin:
 *                 type: string
 *     responses:
 *       200:
 *         description: "✅ Profil mis à jour"
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
 *                   $ref: '#/components/schemas/EntrepriseProfile'
 *       401:
 *         description: "❌ Token manquant ou invalide"
 *       500:
 *         description: "❌ Erreur serveur"
 */
router.patch(
  "/profile",
  authenticateMiddleware(),
  generalLimiter,
  authEntrepriseController.updateProfileEntrepriseController
);

export default router;
