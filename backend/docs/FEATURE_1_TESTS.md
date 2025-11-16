# 🧪 Tests - Feature 1 : Authentification Clients

## ✅ État: COMPLÈTE ET FONCTIONNELLE

### Tests à effectuer avec Postman/Insomnia

---

## 📝 Test 1 : Inscription Particulier

**Endpoint**: `POST http://localhost:3000/api/auth/clients/register/particulier`

**Body (JSON)**:

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

**Réponse attendue** (201):

```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "client": {
      "id": "uuid-ici",
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean.dupont@test.com",
      "type_client": "particulier"
    },
    "token": "eyJhbGc..."
  }
}
```

---

## 🏢 Test 2 : Inscription Entreprise

**Endpoint**: `POST http://localhost:3000/api/auth/clients/register/entreprise`

**Body (JSON)**:

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

**Réponse attendue** (201):

```json
{
  "success": true,
  "message": "Inscription entreprise réussie",
  "data": {
    "client": {
      "id": "uuid-ici",
      "prenom": "Alice",
      "nom": "Martin",
      "email": "alice@techcompany.com",
      "type_client": "entreprise",
      "nom_entreprise": "TechCompany Bénin"
    },
    "token": "eyJhbGc..."
  }
}
```

---

## 🔐 Test 3 : Connexion

**Endpoint**: `POST http://localhost:3000/api/auth/clients/login`

**Body (JSON)**:

```json
{
  "email": "jean.dupont@test.com",
  "password": "SecurePass123!"
}
```

**Réponse attendue** (200):

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "client": {
      "id": "uuid-ici",
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean.dupont@test.com",
      "type_client": "particulier"
    },
    "token": "eyJhbGc..."
  }
}
```

---

## 👤 Test 4 : Récupération du Profil

**Endpoint**: `GET http://localhost:3000/api/auth/clients/me`

**Headers**:

```
Authorization: Bearer eyJhbGc...
```

Remplacez `eyJhbGc...` par le token reçu lors de la connexion.

**Réponse attendue** (200):

```json
{
  "success": true,
  "message": "Profil récupéré",
  "data": {
    "id": "uuid-ici",
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean.dupont@test.com",
    "telephone": "+22968123456",
    "canal_contact": "email",
    "type_client": "particulier",
    "est_actif": true,
    "email_verifiee": false,
    "date_creation": "2025-11-16T12:05:00.000Z"
  }
}
```

---

## 🏥 Test 5 : Health Check

**Endpoint**: `GET http://localhost:3000/health`

**Réponse attendue** (200):

```json
{
  "success": true,
  "message": "✅ API TicketsMaster est en ligne",
  "timestamp": "2025-11-16T12:05:30.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## ⚠️ Tests d'Erreurs

### Test 6 : Email déjà utilisé

Essayez de vous inscrire avec le même email qu'avant.

**Réponse attendue** (409):

```json
{
  "success": false,
  "message": "Cet email est déjà utilisé"
}
```

### Test 7 : Mot de passe faible

**Body**:

```json
{
  "prenom": "John",
  "nom": "Doe",
  "email": "john@test.com",
  "telephone": "+22968111111",
  "password": "weak",
  "confirmPassword": "weak"
}
```

**Réponse attendue** (400):

```json
{
  "success": false,
  "message": "Mot de passe faible: min 8 caractères, 1 majuscule, 1 chiffre, 1 symbole"
}
```

### Test 8 : Token invalide

**Endpoint**: `GET http://localhost:3000/api/auth/clients/me`

**Headers**:

```
Authorization: Bearer invalid_token
```

**Réponse attendue** (401):

```json
{
  "success": false,
  "message": "❌ Authentification échouée"
}
```

---

## 📊 Validations Implémentées

✅ **Email**:

- Format valide
- Unicité (pas de doublons)
- Case-insensitive

✅ **Mot de passe**:

- Min 8 caractères
- 1 lettre majuscule
- 1 chiffre
- 1 caractère spécial
- Hashage bcryptjs (sécurité)

✅ **Nom/Prénom**:

- Min 2 caractères
- Lettres et traits d'union autorisés

✅ **Téléphone (Bénin)**:

- Format: +229, 229, 20, 22, 96, 97, 98 + 8 chiffres

✅ **RCCM**:

- Unicité par entreprise

✅ **Authentification**:

- JWT Bearer token
- Expiration: 7 jours
- Validation automatique sur routes protégées

---

## 🔍 Vérifications Base de Données

Après les tests, vérifiez dans pgAdmin:

```sql
SELECT * FROM clients;

-- Pour voir les détails d'un client
SELECT id, prenom, nom, email, type_client, est_actif, date_creation FROM clients ORDER BY date_creation DESC;
```

---

## 🎯 Checklist - Feature 1 COMPLÈTE ✅

- ✅ Modèle Client créé
- ✅ Service d'authentification
- ✅ Contrôleur HTTP
- ✅ Routes avec Swagger
- ✅ Inscription particulier
- ✅ Inscription entreprise
- ✅ Connexion
- ✅ Récupération profil
- ✅ Validations complètes
- ✅ Sécurité (JWT, bcryptjs)
- ✅ Gestion d'erreurs
- ✅ Rate limiting
- ✅ Documentation Swagger

---

**Prochaine Feature** : Authentification Entreprises (CRM) - À commencer une fois Feature 1 validée à 100%
