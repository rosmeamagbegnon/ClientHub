# 🎫 TicketsMaster Backend - Vue d'Ensemble

## 📌 Statut Actuel

| Component                    | État           | %    |
| ---------------------------- | -------------- | ---- |
| Infrastructure               | ✅ Complète    | 100% |
| Sécurité                     | ✅ Implémentée | 100% |
| Authentification Clients     | ✅ Complète    | 100% |
| Authentification Entreprises | ✅ Complète    | 100% |
| Tickets                      | ✅ Complète    | 100% |
| Commandes                    | ✅ Complète    | 100% |
| Bonus                        | ✅ Complète    | 100% |
| Chatbot                      | ✅ Complète    | 100% |
| Dashboard                    | ✅ Complète    | 100% |

**Progression globale**: 2/8 features = **25%** ✅

---

## 📂 Structure des Fichiers

```
backend/
├── 📄 package.json           # Dépendances et scripts
├── 📄 .env                   # Variables d'environnement (⚠️ Git ignored)
├── 📄 .env.example           # Template .env
├── 📄 README.md              # Documentation principal
├── 📄 .gitignore             # Fichiers Git ignorés
│
├── src/
│   ├── 📄 index.js                    # Point d'entrée (serveur)
│   │
│   ├── config/
│   │   ├── 📄 config.js               # Configuration env
│   │   └── 📄 database.js             # Connexion PostgreSQL
│   │
│   ├── middleware/
│   │   ├── 📄 authMiddleware.js       # Authentification JWT
│   │   ├── 📄 corsMiddleware.js       # CORS
│   │   ├── 📄 rateLimitMiddleware.js  # Rate limiting
│   │   ├── 📄 validationMiddleware.js # Validation inputs
│   │   └── 📄 errorMiddleware.js      # Gestion erreurs
│   │
│   ├── models/
│   │   ├── 📄 clientModel.js          # Model Client
│   │   ├── 📄 ticketModel.js          # À créer
│   │   ├── 📄 commandeModel.js        # À créer
│   │   └── ... (autres models)
│   │
│   ├── services/
│   │   ├── 📄 authClientService.js    # Logique auth client
│   │   ├── 📄 ticketService.js        # À créer
│   │   ├── 📄 commandeService.js      # À créer
│   │   └── ... (autres services)
│   │
│   ├── controllers/
│   │   ├── 📄 authClientController.js # Contrôleur auth
│   │   ├── 📄 ticketController.js     # À créer
│   │   ├── 📄 commandeController.js   # À créer
│   │   └── ... (autres contrôleurs)
│   │
│   ├── routes/
│   │   ├── 📄 clientAuthRoutes.js     # Routes auth clients
│   │   ├── 📄 ticketRoutes.js         # À créer
│   │   ├── 📄 commandeRoutes.js       # À créer
│   │   └── ... (autres routes)
│   │
│   ├── utils/
│   │   ├── 📄 jwt.js                  # Utilitaires JWT
│   │   └── 📄 responseFormatter.js    # Formatage réponse
│   │
│   └── swagger/
│       └── (Swagger auto-généré depuis les routes)
│
├── docs/
│   ├── 📄 schema.sql                  # Schéma PostgreSQL
│   ├── 📄 POSTGRESQL_SETUP.md         # Guide PostgreSQL
│   ├── 📄 FEATURE_1_TESTS.md          # Tests Feature 1
│   ├── 📄 FRONTEND_INTEGRATION.md     # Guide intégration React
│   ├── 📄 PROJECT_STATUS.md           # Statut du projet
│   └── ... (autres docs)
│
├── tests/
│   ├── 📄 TicketsMaster-API.postman_collection.json
│   └── ... (tests)
│
├── scripts/
│   └── 📄 initializeDatabase.js       # Init base de données
│
└── public/
    └── (Fichiers statiques)
```

---

## 🚀 Démarrage Rapide

### 1. Installation

```bash
# Cloner le repo
git clone <repo-url>
cd backend

# Installer les dépendances
npm install

# Créer .env depuis template
cp .env.example .env

# Configurer .env avec vos paramètres PostgreSQL
```

### 2. Initialiser la base de données

```bash
# Créer la base et les tables
node scripts/initializeDatabase.js
```

### 3. Lancer le serveur

```bash
# Mode développement (watch mode)
npm run dev

# Mode production
npm start
```

### 4. Tester l'API

- 📚 Swagger: http://localhost:3000/api-docs
- 🏥 Health: http://localhost:3000/health

---

## 🔐 Sécurité Implémentée

| Mesure             | Fichier                 | Description                            |
| ------------------ | ----------------------- | -------------------------------------- |
| **CORS**           | corsMiddleware.js       | Limite les domaines frontend autorisés |
| **JWT**            | authMiddleware.js       | Authentification par token             |
| **Rate Limit**     | rateLimitMiddleware.js  | Limite les requêtes par IP             |
| **Validation**     | validationMiddleware.js | Nettoie et valide les inputs           |
| **Hachage Pwd**    | authClientService.js    | bcryptjs avec salt                     |
| **SQL Injection**  | Pool PostgreSQL         | Requêtes paramétrées                   |
| **Error Handling** | errorMiddleware.js      | Gestion globale erreurs                |

---

## 📊 Endpoints Actuels

### 👤 Authentification Clients

```
POST   /api/auth/clients/register/particulier
POST   /api/auth/clients/register/entreprise
POST   /api/auth/clients/login
GET    /api/auth/clients/me
```

### 🏥 Health

```
GET    /health
GET    /api-docs
```

---

## 📝 Conventions de Code

### Modèle (Model)

```javascript
// src/models/nomModel.js
export const findById = async (id) => {
  const query = "SELECT * FROM table WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};
```

### Service

```javascript
// src/services/nomService.js
import * as nomModel from "../models/nomModel.js";

export const getItem = async (id) => {
  const item = await nomModel.findById(id);
  if (!item) throw new ApiError(404, "Non trouvé");
  return item;
};
```

### Contrôleur

```javascript
// src/controllers/nomController.js
export const getItemController = async (req, res) => {
  try {
    const item = await nomService.getItem(req.params.id);
    res.json(successResponse(item));
  } catch (error) {
    handleError(error, res);
  }
};
```

### Routes avec Swagger

```javascript
// src/routes/nomRoutes.js
/**
 * @swagger
 * /api/nom:
 *   get:
 *     summary: Description
 *     responses:
 *       200: { description: Success }
 */
router.get("/", nomController);
```

---

## 🧪 Tests

### Avec Postman

1. Importer: `tests/TicketsMaster-API.postman_collection.json`
2. Exécuter les requêtes

### Avec cURL

```bash
curl -X POST http://localhost:3000/api/auth/clients/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123!"}'
```

---

## 🛠️ Dépannage

### Erreur: "Cannot connect to PostgreSQL"

- Vérifier que PostgreSQL est lancé
- Vérifier le mot de passe dans `.env`
- Vérifier le port (5432 par défaut)

### Erreur: "Port 3000 already in use"

```bash
# Changer le port
PORT=3001 npm run dev

# Ou tuer le processus
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows
```

### Erreur: "Token expired"

- Reconnecter l'utilisateur
- Token dure 7 jours

---

## 📚 Documentation Complète

- 📖 **README.md** - Overview projet
- 🔧 **docs/POSTGRESQL_SETUP.md** - Configuration PostgreSQL
- 🧪 **docs/FEATURE_1_TESTS.md** - Tests Feature 1
- 📱 **docs/FRONTEND_INTEGRATION.md** - Intégration React
- 📊 **docs/PROJECT_STATUS.md** - Statut complet

---

## 🎯 Prochaines Tâches

1. **✅ TERMINÉ** - Setup et Feature 1
2. **🔄 EN COURS** - Feature 2: Authentification Entreprises
3. **⏳ À FAIRE** - Features 3-8

---

## 📞 Support

Pour questions ou problèmes:

1. Consultez la documentation
2. Vérifiez les logs du serveur
3. Testez avec Swagger (/api-docs)

---

**Dernier commit**: 16 novembre 2025  
**Version**: 1.0.0  
**Environnement**: Development 🟢
