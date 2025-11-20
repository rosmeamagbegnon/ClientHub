# 🎫 TicketsMaster Backend - API

## 📋 Description

Backend API pour **TicketsMaster**, une plateforme CRM SaaS permettant la gestion des clients, tickets, commandes et bonus.

**Stack**: Node.js + Express.js + PostgreSQL + JWT + Swagger

---

## 🏗️ Architecture du Projet

```
backend/
├── src/
│   ├── config/           # Configuration (DB, JWT, etc.)
│   ├── controllers/      # Logique métier (traitent les requêtes)
│   ├── routes/           # Définition des endpoints
│   ├── models/           # Modèles de données (requêtes DB)
│   ├── middleware/       # Middlewares (auth, validation, etc.)
│   ├── services/         # Services métier réutilisables
│   ├── utils/            # Utilitaires et helpers
│   ├── swagger/          # Documentation Swagger
│   └── index.js          # Point d'entrée de l'app
├── public/               # Fichiers statiques
├── tests/                # Tests unitaires/intégration
├── docs/                 # Documentation supplémentaire
├── .env.example          # Variables d'environnement (template)
├── .gitignore            # Fichiers à ignorer Git
├── package.json          # Dépendances Node
└── README.md             # Ce fichier

```

---

## 🚀 Installation et Configuration

### 1. **Prérequis**

- Node.js v18+ installé
- PostgreSQL en local (pgAdmin fonctionnel)
- npm ou yarn

### 2. **Cloner et installer**

```bash
cd backend
npm install
```

### 3. **Configuration de la base de données**

Créez une base de données PostgreSQL nommée `ticketsmaster_db` :

```sql
CREATE DATABASE ticketsmaster_db;
```

### 4. **Variables d'environnement**

Copiez `.env.example` en `.env` et remplissez vos paramètres :

```bash
cp .env.example .env
```

Modifiez les valeurs, notamment :

- `DB_PASSWORD` : Votre mot de passe PostgreSQL
- `JWT_SECRET` : Une clé secrète forte (en prod)
- `CORS_ORIGIN` : Les domaines front autorisés

### 5. **Lancer le serveur**

```bash
# Mode développement (watch mode)
npm run dev

# Mode production
npm start
```

Le serveur démarrera sur `http://localhost:3000`

---

## 📚 Documentation API

Une fois le serveur lancé, accédez à la documentation Swagger :

👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

---

## 🔐 Sécurité

### Mesures implémentées :

1. **Hachage des mots de passe** - bcryptjs
2. **JWT pour l'authentification** - Tokens signés
3. **Rate Limiting** - Limitation des requêtes par IP
4. **CORS** - Restriction des domaines autorisés
5. **Validation des inputs** - Nettoyage et validation
6. **SQL Injection Prevention** - Requêtes paramétrées PostgreSQL

Chaque mesure est documentée dans le code.

---

## 📦 Features et État

- ✅ **Setup initial** - Structure et configuration (100%)
- ✅ **Authentification Clients** - Complète (100%)
- 🔄 **Authentification Entreprises** - Complète (100%)
- ⏳ **Gestion des Tickets** - Complète (100%)
- ⏳ **Gestion des Commandes** - Complète (100%)
- ⏳ **Gestion des Bonus** - Complète (100%)
- ⏳ **Chatbot** - Complète (100%)
- ⏳ **Dashboard Entreprise** - Complète (100%)

**Progression**: 2/8 features = **25%** ✅

---

## 🧪 Tests

```bash
npm test
```

---

## 📝 Convention de Code

- **Fichiers** : Nommage camelCase (e.g., `authController.js`)
- **Dossiers** : Nommage en minuscules (e.g., `controllers/`)
- **Max 300 lignes par fichier** pour maintenabilité
- **Commentaires** : Documenter les fonctions complexes
- **Erreurs** : Gérer tous les cas d'erreur

---

## 🐛 Troubleshooting

### Erreur de connexion DB

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

→ Vérifiez que PostgreSQL est lancé et que `.env` est correct.

### Port déjà utilisé

```bash
# Changer le port dans .env
PORT=3001
```

### Module not found

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

---

## 📧 Support

Pour toute question, consultez la documentation Swagger ou les fichiers dans `/docs`.

---

**Version** : 1.0.0  
**Dernière mise à jour** : 16 novembre 2025
