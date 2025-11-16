# 🔄 Guide de Développement - Prochaines Features

Comment ajouter les features suivantes en utilisant le pattern établi par Feature 1.

---

## 🎯 Pattern à Suivre

Tous les features suivent ce pattern:

```
Feature X
├── Model (src/models/xxxModel.js)
├── Service (src/services/xxxService.js)
├── Controller (src/controllers/xxxController.js)
└── Routes (src/routes/xxxRoutes.js)
```

### Étapes (Max 3 heures par feature)

1. **Créer le Model** (30 min)
2. **Créer le Service** (45 min)
3. **Créer le Controller** (30 min)
4. **Créer les Routes + Swagger** (45 min)
5. **Tester et documenter** (30 min)

---

## 📋 Feature 2: Authentification Entreprises (CRM)

Les **entreprises** qui UTILISENT le CRM (administrateurs du système).

### Différences avec Feature 1 (Clients)

- Clients: `particuliers` et `entreprises` qui **achètent des services**
- Entreprises: Qui **FOURNISSENT** les services CRM

### Model: `entrepriseModel.js`

```javascript
/**
 * Table: entreprises
 * - id (UUID)
 * - nom (String)
 * - numero_rccm (String, UNIQUE)
 * - secteur_activite
 * - taille_entreprise
 * - contact_principal
 * - email_principal (UNIQUE)
 * - password_hash
 * - est_actif
 * - date_inscription
 * - dernier_login
 */

export const createEnterprise = async (data) => {
  // Même logique que createClient mais pour table entreprises
};

export const findEntrepriseByEmail = async (email) => {
  // SELECT * FROM entreprises WHERE email = ...
};

export const verifyPassword = async (plain, hash) => {
  // bcryptjs.compare(...)
};
```

### Service: `authEntrepriseService.js`

```javascript
export const registerEntreprise = async (data) => {
  // Valide les données
  // Crée dans la base
  // Génère JWT
  return { entreprise, token };
};

export const loginEntreprise = async (email, password) => {
  // Authentifie
  // Retourne token
};

export const getMyEnterprise = async (entrepriseId) => {
  // Récupère infos entreprise
};
```

### Routes: `/api/auth/entreprises`

```
POST /api/auth/entreprises/register
POST /api/auth/entreprises/login
GET  /api/auth/entreprises/me
```

### Timeline

- **Modèle**: Copier `clientModel.js`, adapter pour table `entreprises`
- **Service**: Copier `authClientService.js`, adapter validations
- **Controller**: Copier `authClientController.js`, adapter
- **Routes**: Copier `clientAuthRoutes.js`, adapter URLs + Swagger

**Temps**: ~2 heures

---

## 🎫 Feature 3: Gestion des Tickets

### Endpoints

```
POST   /api/tickets                 # Créer ticket
GET    /api/tickets                 # Lister (client voit ses tickets)
GET    /api/tickets/:id             # Détail ticket
PUT    /api/tickets/:id             # Modifier statut
DELETE /api/tickets/:id             # Archiver/supprimer
POST   /api/tickets/:id/notes       # Ajouter note
GET    /api/tickets/:id/notes       # Lister notes
```

### Model: `ticketModel.js`

```javascript
export const createTicket = async (clientId, entrepriseId, data) => {
  // Insérer dans table tickets
  // titre, description, type_ticket, fichier (optionnel)
};

export const getClientTickets = async (clientId, page, limit) => {
  // SELECT * FROM tickets WHERE client_id = ...
};

export const getEntrepriseTickets = async (entrepriseId, page, limit) => {
  // SELECT * FROM tickets WHERE entreprise_id = ...
};

export const updateTicketStatus = async (ticketId, newStatus) => {
  // UPDATE tickets SET statut = ...
};

export const addNote = async (ticketId, auteurId, contenu) => {
  // INSERT INTO notes_tickets
};

export const getNotes = async (ticketId) => {
  // SELECT * FROM notes_tickets WHERE ticket_id = ...
};
```

### Statuts possibles

```javascript
const STATUTS = {
  EN_ATTENTE: "en_attente",
  EN_COURS_ETUDE: "en_cours_etude",
  REJETE: "rejete",
  ACCEPTE: "accepte",
  ASSIGNE: "assigne",
  EN_COURS_TRAITEMENT: "en_cours_traitement",
  TRAITE: "traite",
};
```

### Types de tickets

```javascript
const TYPES = [
  "facturation",
  "réclamation",
  "technique",
  "suggestion",
  "autre",
];
```

### Sécurité spécifique

- Les clients voient uniquement leurs tickets
- Les entreprises voient les tickets de leurs clients
- Seule l'entreprise peut modifier le statut
- Authentification requise sur tous les endpoints

### Timeline

**Temps**: ~4-5 heures

---

## 🛒 Feature 4: Gestion des Commandes

Très similaire aux tickets mais avec étapes et coûts.

### Endpoints

```
POST   /api/commandes
GET    /api/commandes
GET    /api/commandes/:id
PUT    /api/commandes/:id
POST   /api/commandes/:id/etapes    # Ajouter étape
POST   /api/commandes/:id/cout      # Renseigner coût final
POST   /api/commandes/:id/notes
GET    /api/commandes/:id/notes
```

### Statuts

```javascript
"en_attente",
  "contrat_accepte",
  "en_cours_developpement",
  "livraison",
  "livree",
  "annulee";
```

### Timeline

**Temps**: ~3-4 heures

---

## 🎁 Feature 5: Gestion des Bonus

Fidélisation des clients.

### Endpoints

```
POST   /api/bonus                  # Entreprise crée bonus
GET    /api/bonus                  # Clients voient bonus
GET    /api/bonus/:id              # Détail bonus
PUT    /api/bonus/:id              # Modifier bonus
DELETE /api/bonus/:id              # Supprimer bonus
POST   /api/bonus/:id/apply        # Client utilise bonus
```

### Filtres disponibles

- Type de client: tout, particulier, entreprise
- Secteur d'activité
- Taille entreprise
- Client spécifique

### Timeline

**Temps**: ~3-4 heures

---

## 💬 Feature 6: Chatbot

Conversaton automatique avec clients.

### Endpoints

```
POST   /api/chatbot/sessions       # Créer session
GET    /api/chatbot/sessions/:id   # Récupérer session
POST   /api/chatbot/sessions/:id/messages    # Envoyer message
GET    /api/chatbot/sessions/:id/messages    # Récupérer messages
```

### Tables

```
- sessions_chatbot
- messages_chatbot
```

### Capacités

- Répondre aux questions fréquentes (simple regex ou JSON)
- Informer sur statut tickets
- Informer sur statut commandes
- Informer sur bonus

### Timeline

**Temps**: ~5-6 heures (plus complexe)

---

## 📊 Feature 7: Dashboard Entreprise

Statistiques et KPIs.

### Endpoints

```
GET /api/dashboard/stats          # Stats générales
GET /api/dashboard/tickets        # Tickets par statut
GET /api/dashboard/commandes      # Commandes par statut
GET /api/dashboard/revenus        # Revenus par période
GET /api/dashboard/clients        # Nombre clients
GET /api/dashboard/activite       # Activité récente
```

### Calculs

```javascript
// Nombre total clients
SELECT COUNT(DISTINCT client_id) FROM tickets WHERE entreprise_id = ...

// Tickets par statut
SELECT statut, COUNT(*) FROM tickets WHERE entreprise_id = ... GROUP BY statut

// Revenus
SELECT SUM(cout_final) FROM commandes WHERE entreprise_id = ... AND statut = 'livree'

// Évolution (par jour/semaine/mois)
SELECT DATE_TRUNC('day', date_creation), COUNT(*)
FROM tickets WHERE entreprise_id = ...
GROUP BY DATE_TRUNC('day', date_creation)
```

### Timeline

**Temps**: ~4-5 heures

---

## ✅ Checklist pour chaque Feature

### Avant de coder

- [ ] Relire le cahier des charges
- [ ] Identifier les endpoints
- [ ] Lister les données requises
- [ ] Planner les validations

### Développement

- [ ] Model créé et testé
- [ ] Service avec logique métier
- [ ] Controller avec gestion erreurs
- [ ] Routes avec Swagger documentation
- [ ] Authentification/autorisation

### Tests

- [ ] Endpoints testés avec Postman
- [ ] Cas d'erreur testés
- [ ] Base de données vérifiée
- [ ] Documentation mise à jour
- [ ] Code commenté

---

## 🚀 Commandes Utiles

### Ajouter une nouvelle route

1. Créer fichier `/src/routes/xxxRoutes.js`
2. Importer dans `index.js`
3. Ajouter: `app.use('/api/xxx', xxxRoutes);`

### Tester en local

```javascript
// Dans Postman, ajouter avant toute requête authentifiée
Authorization: Bearer <token_reçu_lors_login>
```

### Vérifier la base de données

```sql
-- pgAdmin
SELECT * FROM clients;
SELECT * FROM tickets WHERE client_id = '...';
SELECT COUNT(*) FROM commandes WHERE entreprise_id = '...';
```

---

## 📈 Ordre de Développement Recommandé

1. **Feature 2** (Authentification Entreprises) - **FACILE** ⭐

   - Copier/adapter Feature 1
   - Temps: 2h

2. **Feature 3** (Tickets) - **MOYEN** ⭐⭐

   - Logique basique CRUD
   - Temps: 4-5h

3. **Feature 4** (Commandes) - **MOYEN** ⭐⭐

   - Similar à tickets
   - Temps: 3-4h

4. **Feature 5** (Bonus) - **FACILE** ⭐

   - CRUD simple
   - Filtres pas trop complexes
   - Temps: 3-4h

5. **Feature 7** (Dashboard) - **MOYEN** ⭐⭐

   - Principalement des requêtes SELECT complexes
   - Pas d'authentification spéciale
   - Temps: 4-5h

6. **Feature 6** (Chatbot) - **DIFFICILE** ⭐⭐⭐
   - Logique conversationnelle
   - Peut nécessiter API externe
   - Temps: 5-6h

---

## 💡 Tips

### Éviter la duplication de code

```javascript
// ❌ MAUVAIS - Code dupliqué
export const getClientTickets = async (clientId) => {
  const result = await pool.query(
    "SELECT * FROM tickets WHERE client_id = $1",
    [clientId]
  );
  return result.rows;
};

export const getEntrepriseTickets = async (entrepriseId) => {
  const result = await pool.query(
    "SELECT * FROM tickets WHERE entreprise_id = $1",
    [entrepriseId]
  );
  return result.rows;
};

// ✅ BON - Fonction générique
const getTickets = async (whereClause, params) => {
  const result = await pool.query(
    `SELECT * FROM tickets WHERE ${whereClause}`,
    params
  );
  return result.rows;
};

export const getClientTickets = (clientId) =>
  getTickets("client_id = $1", [clientId]);
export const getEntrepriseTickets = (entrepriseId) =>
  getTickets("entreprise_id = $1", [entrepriseId]);
```

### Pagination efficace

```javascript
const getTickets = async (page = 1, limit = 20, filters = {}) => {
  const offset = (page - 1) * limit;

  let query = "SELECT * FROM tickets";
  const params = [];
  let paramCount = 1;

  // Ajouter les filtres dynamiquement
  const whereClauses = [];
  if (filters.entrepriseId) {
    whereClauses.push(`entreprise_id = $${paramCount}`);
    params.push(filters.entrepriseId);
    paramCount++;
  }
  if (filters.statut) {
    whereClauses.push(`statut = $${paramCount}`);
    params.push(filters.statut);
    paramCount++;
  }

  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }

  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  return pool.query(query, params);
};
```

---

## 🎓 Ressources

- 📖 Feature 1 code comme référence
- 📚 Swagger docs pour comprendre les structures
- 🗄️ schema.sql pour les tables

---

**Bon développement! 🚀**
