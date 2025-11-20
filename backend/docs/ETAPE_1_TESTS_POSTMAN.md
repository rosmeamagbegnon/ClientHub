# 🧪 GUIDE COMPLET DE TEST - FEATURE 1 (Postman)

## 📋 Introduction

Ce guide vous explique comment tester COMPLÈTEMENT la Feature 1 (Authentification Clients) avec Postman pour s'assurer que tout fonctionne à **100%**.

---

## 🚀 Préparation

### 1. Importer la Collection Postman

1. Ouvrir Postman
2. Cliquer **File** → **Import**
3. Sélectionner: `tests/TicketsMaster-API.postman_collection.json`
4. Cliquer **Import**

### 2. Vérifier l'Environnement

- ✅ Le serveur doit être lancé: `npm run dev`
- ✅ Swagger doit être accessible: http://localhost:3000/api-docs
- ✅ Health check doit fonctionner: http://localhost:3000/health

---

## ✅ TEST 1: Health Check (Pas d'authentification)

### Endpoint

```
GET http://localhost:3000/health
```

### Dans Postman

1. **Créer une nouvelle requête** (ou utiliser celle fournie)
2. **Method**: `GET`
3. **URL**: `http://localhost:3000/health`
4. **Cliquer**: `Send`

### Réponse Attendue (200 OK)

```json
{
  "success": true,
  "message": "✅ API TicketsMaster est en ligne",
  "timestamp": "2025-11-16T12:05:30.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### ✅ Valider

- [ ] Status: **200 OK**
- [ ] success: **true**
- [ ] Message affiche "en ligne"

---

## ✅ TEST 2: Inscription Particulier

### Endpoint

```
POST http://localhost:3000/api/auth/clients/register/particulier
```

### Body (JSON)

```json
{
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean.dupont@test.com",
  "telephone": "+22968123456",
  "canal_contact": "email",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

### Dans Postman

1. **Créer une nouvelle requête**
2. **Method**: `POST`
3. **URL**: `http://localhost:3000/api/auth/clients/register/particulier`
4. **Tab Headers**: Ajouter `Content-Type: application/json`
5. **Tab Body** → **raw** → **JSON** (dropdown)
6. **Coller le JSON ci-dessus**
7. **Cliquer**: `Send`

### Réponse Attendue (201 Created)

```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean.dupont@test.com",
      "type_client": "particulier"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6ImplYW4uZHVwb250QHRlc3QuY29tIiwidXNlclR5cGUiOiJwYXJ0aWN1bGllciIsImlhdCI6MTczMTc1MDMzMCwiZXhwIjoxNzMyMzU1MTMwfQ.xyz"
  }
}
```

### 🔑 **IMPORTANT: Sauvegarder le Token**

**Copier le token** (sans les guillemets) pour les tests suivants:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6ImplYW4uZHVwb250QHRlc3QuY29tIiwidXNlclR5cGUiOiJwYXJ0aWN1bGllciIsImlhdCI6MTczMTc1MDMzMCwiZXhwIjoxNzMyMzU1MTMwfQ.xyz
```

### ✅ Valider

- [ ] Status: **201 Created**
- [ ] success: **true**
- [ ] client.id: UUID valide
- [ ] token: Présent et non vide
- [ ] client.type_client: **"particulier"**

### ✅ Base de Données

Vérifiez que le client a été créé:

**Dans pgAdmin ou psql:**

```sql
SELECT id, prenom, nom, email, type_client, est_actif FROM clients
WHERE email = 'jean.dupont@test.com';
```

Attendu:

```
id                                   | prenom | nom     | email                  | type_client | est_actif
550e8400-e29b-41d4-a716-446655440001 | Jean   | Dupont  | jean.dupont@test.com   | particulier | true
```

---

## ✅ TEST 3: Inscription Entreprise

### Endpoint

```
POST http://localhost:3000/api/auth/clients/register/entreprise
```

### Body (JSON)

```json
{
  "prenom": "Alice",
  "nom": "Martin",
  "email": "alice@techcompany.com",
  "telephone": "+22968999999",
  "password": "TechSecure123!",
  "confirmPassword": "TechSecure123!",
  "nom_entreprise": "TechCompany Bénin",
  "secteur_activite": "Technologie",
  "taille_entreprise": "11 - 50 employés",
  "poste_occupe": "Directrice Générale",
  "numero_rccm": "BJ-123456-789",
  "adresse_physique": "123 Avenue de Cotonou",
  "email_professionnel": "contact@techcompany.bj",
  "telephone_entreprise": "+22968999998",
  "site_internet": "www.techcompany.bj",
  "linkedin": "linkedin.com/company/techcompany"
}
```

### Dans Postman

1. **Créer une nouvelle requête**
2. **Method**: `POST`
3. **URL**: `http://localhost:3000/api/auth/clients/register/entreprise`
4. **Tab Headers**: `Content-Type: application/json`
5. **Tab Body** → **raw** → **JSON**
6. **Coller le JSON ci-dessus**
7. **Cliquer**: `Send`

### Réponse Attendue (201 Created)

```json
{
  "success": true,
  "message": "Inscription entreprise réussie",
  "data": {
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "prenom": "Alice",
      "nom": "Martin",
      "email": "alice@techcompany.com",
      "type_client": "entreprise",
      "nom_entreprise": "TechCompany Bénin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx"
  }
}
```

### 🔑 **Sauvegarder le Token Entreprise**

**Copier ce token aussi** pour les tests suivants (on en aura besoin):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx
```

### ✅ Valider

- [ ] Status: **201 Created**
- [ ] success: **true**
- [ ] client.type_client: **"entreprise"**
- [ ] nom_entreprise: **"TechCompany Bénin"**
- [ ] token: Présent

### ✅ Base de Données

```sql
SELECT id, prenom, nom, email, type_client, nom_entreprise, numero_rccm
FROM clients WHERE email = 'alice@techcompany.com';
```

Attendu:

```
id                                   | prenom | nom    | email                 | type_client | nom_entreprise         | numero_rccm
550e8400-e29b-41d4-a716-446655440002 | Alice  | Martin | alice@techcompany.com | entreprise  | TechCompany Bénin      | BJ-123456-789
```

---

## ✅ TEST 4: Connexion (Particulier)

### Endpoint

```
POST http://localhost:3000/api/auth/clients/login
```

### Body (JSON)

```json
{
  "email": "jean.dupont@test.com",
  "password": "SecurePass123!"
}
```

### Dans Postman

1. **Créer une nouvelle requête**
2. **Method**: `POST`
3. **URL**: `http://localhost:3000/api/auth/clients/login`
4. **Tab Headers**: `Content-Type: application/json`
5. **Tab Body** → **raw** → **JSON**
6. **Coller le JSON ci-dessus**
7. **Cliquer**: `Send`

### Réponse Attendue (200 OK)

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean.dupont@test.com",
      "type_client": "particulier"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx"
  }
}
```

### ✅ Valider

- [ ] Status: **200 OK**
- [ ] success: **true**
- [ ] client.id: Même ID qu'inscription
- [ ] token: NOUVEAU token (différent du précédent)

---

## ✅ TEST 5: Connexion (Entreprise)

### Body (JSON)

```json
{
  "email": "alice@techcompany.com",
  "password": "TechSecure123!"
}
```

### Réponse Attendue (200 OK)

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "prenom": "Alice",
      "nom": "Martin",
      "email": "alice@techcompany.com",
      "type_client": "entreprise",
      "nom_entreprise": "TechCompany Bénin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx"
  }
}
```

### ✅ Valider

- [ ] Status: **200 OK**
- [ ] success: **true**
- [ ] type_client: **"entreprise"**

---

## ✅ TEST 6: Récupération du Profil (GET /me)

### Endpoint

```
GET http://localhost:3000/api/auth/clients/me
```

### Headers Requis

```
Authorization: Bearer <token_du_test_4>
```

### Dans Postman

1. **Créer une nouvelle requête**
2. **Method**: `GET`
3. **URL**: `http://localhost:3000/api/auth/clients/me`
4. **Tab Headers**:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx` (remplacer par le token réel)
5. **Cliquer**: `Send`

### Réponse Attendue (200 OK)

```json
{
  "success": true,
  "message": "Profil récupéré",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean.dupont@test.com",
    "telephone": "+22968123456",
    "canal_contact": "email",
    "type_client": "particulier",
    "est_actif": true,
    "email_verifiee": false,
    "date_creation": "2025-11-16T12:05:30.000Z",
    "dernier_login": "2025-11-16T12:06:15.000Z"
  }
}
```

### ✅ Valider

- [ ] Status: **200 OK**
- [ ] success: **true**
- [ ] Data contient toutes les infos du client
- [ ] dernier_login: Mis à jour

---

## ❌ TEST 7: Erreur - Email déjà utilisé

### Endpoint

```
POST http://localhost:3000/api/auth/clients/register/particulier
```

### Body (JSON)

```json
{
  "prenom": "John",
  "nom": "Doe",
  "email": "jean.dupont@test.com",
  "telephone": "+22968111111",
  "canal_contact": "email",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

⚠️ **Email déjà utilisé (même que Test 2)**

### Réponse Attendue (409 Conflict)

```json
{
  "success": false,
  "message": "Cet email est déjà utilisé"
}
```

### ✅ Valider

- [ ] Status: **409 Conflict**
- [ ] success: **false**
- [ ] Message clairement expliqué

---

## ❌ TEST 8: Erreur - Mot de passe faible

### Body (JSON)

```json
{
  "prenom": "John",
  "nom": "Doe",
  "email": "john@test.com",
  "telephone": "+22968111111",
  "canal_contact": "email",
  "password": "weak",
  "confirmPassword": "weak"
}
```

⚠️ **Mot de passe "weak" : trop court et pas assez complexe**

### Réponse Attendue (400 Bad Request)

```json
{
  "success": false,
  "message": "Mot de passe faible: min 8 caractères, 1 majuscule, 1 chiffre, 1 symbole"
}
```

### ✅ Valider

- [ ] Status: **400 Bad Request**
- [ ] success: **false**
- [ ] Message explique les critères

---

## ❌ TEST 9: Erreur - Identifiants incorrects

### Endpoint

```
POST http://localhost:3000/api/auth/clients/login
```

### Body (JSON)

```json
{
  "email": "jean.dupont@test.com",
  "password": "WrongPassword123!"
}
```

⚠️ **Mot de passe incorrect**

### Réponse Attendue (401 Unauthorized)

```json
{
  "success": false,
  "message": "Email ou mot de passe incorrect"
}
```

### ✅ Valider

- [ ] Status: **401 Unauthorized**
- [ ] success: **false**
- [ ] Message générique (ne révèle pas si l'email existe)

---

## ❌ TEST 10: Erreur - Token invalide

### Endpoint

```
GET http://localhost:3000/api/auth/clients/me
```

### Headers

```
Authorization: Bearer invalid_token_here
```

### Réponse Attendue (401 Unauthorized)

```json
{
  "success": false,
  "message": "❌ Authentification échouée"
}
```

### ✅ Valider

- [ ] Status: **401 Unauthorized**
- [ ] success: **false**

---

## ❌ TEST 11: Erreur - Token absent

### Endpoint

```
GET http://localhost:3000/api/auth/clients/me
```

### Headers

```
(Aucun header Authorization)
```

### Réponse Attendue (401 Unauthorized)

```json
{
  "success": false,
  "message": "❌ Token manquant - Authentification requise"
}
```

### ✅ Valider

- [ ] Status: **401 Unauthorized**
- [ ] success: **false**
- [ ] Message clair

---

## ❌ TEST 12: Erreur - RCCM déjà utilisé (Entreprises)

### Endpoint

```
POST http://localhost:3000/api/auth/clients/register/entreprise
```

### Body (JSON)

```json
{
  "prenom": "Bob",
  "nom": "Smith",
  "email": "bob@company.com",
  "telephone": "+22968777777",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "nom_entreprise": "Another Company",
  "secteur_activite": "Commerce",
  "taille_entreprise": "1 - 10 employés",
  "poste_occupe": "Manager",
  "numero_rccm": "BJ-123456-789",
  "adresse_physique": "456 Rue Cotonou"
}
```

⚠️ **Même RCCM que Test 3: "BJ-123456-789"**

### Réponse Attendue (409 Conflict)

```json
{
  "success": false,
  "message": "Ce numéro RCCM est déjà utilisé"
}
```

### ✅ Valider

- [ ] Status: **409 Conflict**
- [ ] success: **false**

---

## 📊 RÉSUMÉ DES TESTS

| #   | Test                          | Endpoint                               | Method | Status Attendu | ✅  |
| --- | ----------------------------- | -------------------------------------- | ------ | -------------- | --- |
| 1   | Health Check                  | /health                                | GET    | 200            | [ ] |
| 2   | Register Particulier          | /api/auth/clients/register/particulier | POST   | 201            | [ ] |
| 3   | Register Entreprise           | /api/auth/clients/register/entreprise  | POST   | 201            | [ ] |
| 4   | Login Particulier             | /api/auth/clients/login                | POST   | 200            | [ ] |
| 5   | Login Entreprise              | /api/auth/clients/login                | POST   | 200            | [ ] |
| 6   | Get Profile                   | /api/auth/clients/me                   | GET    | 200            | [ ] |
| 7   | Error: Email utilisé          | /api/auth/clients/register/particulier | POST   | 409            | [ ] |
| 8   | Error: Mdp faible             | /api/auth/clients/register/particulier | POST   | 400            | [ ] |
| 9   | Error: Identifiants incorrect | /api/auth/clients/login                | POST   | 401            | [ ] |
| 10  | Error: Token invalide         | /api/auth/clients/me                   | GET    | 401            | [ ] |
| 11  | Error: Token absent           | /api/auth/clients/me                   | GET    | 401            | [ ] |
| 12  | Error: RCCM utilisé           | /api/auth/clients/register/entreprise  | POST   | 409            | [ ] |

---

## 🔍 Vérifications Base de Données

Après tous les tests, vérifiez la base:

```sql
-- Voir tous les clients créés
SELECT id, prenom, nom, email, type_client, est_actif, dernier_login
FROM clients
ORDER BY date_creation DESC;

-- Vérifier les mots de passe sont hashés (pas en clair)
SELECT email, LENGTH(mot_de_passe_hash) as hash_length
FROM clients;
-- Attendu: hash_length doit être ~60 (bcryptjs hash)

-- Vérifier les logs de connexion
SELECT email, dernier_login
FROM clients
WHERE dernier_login IS NOT NULL
ORDER BY dernier_login DESC;
```

---

## 🎯 Checklist Finale

- [ ] Test 1: Health check - **PASS**
- [ ] Test 2: Register particulier - **PASS**
- [ ] Test 3: Register entreprise - **PASS**
- [ ] Test 4: Login particulier - **PASS**
- [ ] Test 5: Login entreprise - **PASS**
- [ ] Test 6: Get profile - **PASS**
- [ ] Test 7: Email utilisé - **PASS**
- [ ] Test 8: Mdp faible - **PASS**
- [ ] Test 9: Identifiants incorrect - **PASS**
- [ ] Test 10: Token invalide - **PASS**
- [ ] Test 11: Token absent - **PASS**
- [ ] Test 12: RCCM utilisé - **PASS**
- [ ] Base de données: Clients créés - **VERIFIED**
- [ ] Mots de passe: Bien hashés - **VERIFIED**
- [ ] Logs: Dernier login mis à jour - **VERIFIED**

---

## ✅ SI TOUS LES TESTS PASSENT

**Feature 1 est 100% FONCTIONNELLE** ✅

Vous pouvez maintenant:

1. ✅ Démarrer **Feature 2** (Authentification Entreprises)
2. ✅ Commencer l'intégration **Frontend**
3. ✅ Documenter les succès

---

**Bon test! 🚀**
