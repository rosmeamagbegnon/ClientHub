# 🧪 GUIDE TEST - FEATURE 2 (Entreprises Auth)

## 📋 Introduction

Ce guide vous permet de tester **COMPLÈTEMENT** la Feature 2 (Authentification Entreprises CRM) avec Postman.

**Important**: Une entreprise CRM est une **entité qui UTILISE la plateforme** pour gérer ses clients, tickets et commandes. C'est DIFFÉRENT d'un "client entreprise" (Feature 1).

---

## ✅ TEST 1: Inscription Entreprise CRM

### Endpoint

```
POST http://localhost:3000/api/auth/entreprises/register
```

### Body (JSON)

```json
{
  "nom_entreprise": "TechSolutions Bénin",
  "secteur_activite": "Technologie",
  "taille_entreprise": "11 - 50 employés",
  "numero_rccm_ifu": "BJ-2024-TECH-001",
  "email_entreprise": "contact@techsolutions.bj",
  "telephone_entreprise": "+22968123456",
  "whatsapp_entreprise": "+22968123456",
  "adresse_professionnelle": "123 Boulevard Cotonou, Bénin",
  "site_internet": "www.techsolutions.bj",
  "linkedin": "linkedin.com/company/techsolutions",
  "prenom_responsable": "Jean",
  "nom_responsable": "Arnould",
  "email_responsable": "jean.arnould@techsolutions.bj",
  "password": "EnterpriseSecure123!",
  "confirmPassword": "EnterpriseSecure123!"
}
```

### Réponse Attendue (201 Created)

```json
{
  "success": true,
  "message": "Inscription entreprise réussie",
  "data": {
    "entreprise": {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "nom_entreprise": "TechSolutions Bénin",
      "email_entreprise": "contact@techsolutions.bj",
      "secteur_activite": "Technologie",
      "prenom_responsable": "Jean",
      "nom_responsable": "Arnould"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx"
  }
}
```

### ✅ Valider

- [ ] Status: **201 Created**
- [ ] success: **true**
- [ ] entreprise.id: UUID valide
- [ ] token: Présent et non vide
- [ ] nom_entreprise: Correct

### ✅ Base de Données

Vérifiez en SQL:
```sql
SELECT id, nom_entreprise, email_entreprise, secteur_activite, est_active 
FROM entreprises 
WHERE email_entreprise = 'contact@techsolutions.bj';
```

Attendu:
```
id                                   | nom_entreprise        | email_entreprise              | secteur_activite | est_active
550e8400-e29b-41d4-a716-446655440101 | TechSolutions Bénin   | contact@techsolutions.bj      | Technologie      | true
```

---

## ✅ TEST 2: Connexion Entreprise

### Endpoint

```
POST http://localhost:3000/api/auth/entreprises/login
```

### Body (JSON)

```json
{
  "email": "contact@techsolutions.bj",
  "password": "EnterpriseSecure123!"
}
```

### Réponse Attendue (200 OK)

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "entreprise": {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "nom_entreprise": "TechSolutions Bénin",
      "email_entreprise": "contact@techsolutions.bj",
      "secteur_activite": "Technologie",
      "prenom_responsable": "Jean",
      "nom_responsable": "Arnould",
      "est_active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyy"
  }
}
```

### 🔑 **Sauvegarder le Token**

**Copier ce token** pour les tests suivants:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyy
```

### ✅ Valider

- [ ] Status: **200 OK**
- [ ] success: **true**
- [ ] Token: DIFFÉRENT du token d'inscription
- [ ] est_active: **true**

---

## ✅ TEST 3: Récupération Profil Entreprise (GET /me)

### Endpoint

```
GET http://localhost:3000/api/auth/entreprises/me
```

### Headers Requis

```
Authorization: Bearer <token_du_test_2>
```

### Réponse Attendue (200 OK)

```json
{
  "success": true,
  "message": "Profil récupéré",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440101",
    "nom_entreprise": "TechSolutions Bénin",
    "secteur_activite": "Technologie",
    "taille_entreprise": "11 - 50 employés",
    "numero_rccm_ifu": "BJ-2024-TECH-001",
    "email_entreprise": "contact@techsolutions.bj",
    "telephone_entreprise": "+22968123456",
    "whatsapp_entreprise": "+22968123456",
    "adresse_professionnelle": "123 Boulevard Cotonou, Bénin",
    "site_internet": "www.techsolutions.bj",
    "linkedin": "linkedin.com/company/techsolutions",
    "prenom_responsable": "Jean",
    "nom_responsable": "Arnould",
    "email_responsable": "jean.arnould@techsolutions.bj",
    "est_active": true,
    "date_creation": "2025-11-16T14:30:00.000Z",
    "dernier_login": "2025-11-16T14:31:00.000Z"
  }
}
```

### ✅ Valider

- [ ] Status: **200 OK**
- [ ] success: **true**
- [ ] Toutes les infos présentes
- [ ] dernier_login: Mis à jour

---

## ✅ TEST 4: Mise à Jour du Profil

### Endpoint

```
PATCH http://localhost:3000/api/auth/entreprises/profile
```

### Headers

```
Authorization: Bearer <token_du_test_2>
```

### Body (JSON)

```json
{
  "site_internet": "www.techsolutions-new.bj",
  "linkedin": "linkedin.com/company/techsolutions-bj",
  "telephone_entreprise": "+22969999999"
}
```

### Réponse Attendue (200 OK)

```json
{
  "success": true,
  "message": "Profil mis à jour",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440101",
    "nom_entreprise": "TechSolutions Bénin",
    "site_internet": "www.techsolutions-new.bj",
    "linkedin": "linkedin.com/company/techsolutions-bj",
    "telephone_entreprise": "+22969999999",
    "date_creation": "2025-11-16T14:30:00.000Z",
    "dernier_login": "2025-11-16T14:31:00.000Z"
  }
}
```

### ✅ Valider

- [ ] Status: **200 OK**
- [ ] success: **true**
- [ ] Champs mis à jour correctement
- [ ] date_modification: Récente

---

## ❌ TEST 5: Erreur - Email déjà utilisé

### Body (JSON)

```json
{
  "nom_entreprise": "Autre Entreprise",
  "secteur_activite": "Commerce",
  "taille_entreprise": "1 - 10 employés",
  "numero_rccm_ifu": "BJ-2024-UNIQUE-001",
  "email_entreprise": "contact@techsolutions.bj",
  "telephone_entreprise": "+22968111111",
  "whatsapp_entreprise": "+22968111111",
  "adresse_professionnelle": "456 Rue",
  "prenom_responsable": "Bob",
  "nom_responsable": "Smith",
  "email_responsable": "bob@other.bj",
  "password": "OtherSecure123!",
  "confirmPassword": "OtherSecure123!"
}
```

⚠️ **Email déjà utilisé**

### Réponse Attendue (409 Conflict)

```json
{
  "success": false,
  "message": "Cet email entreprise est déjà utilisé"
}
```

### ✅ Valider

- [ ] Status: **409 Conflict**
- [ ] success: **false**

---

## ❌ TEST 6: Erreur - RCCM/IFU déjà utilisé

### Body (JSON)

```json
{
  "nom_entreprise": "Autre Entreprise",
  "secteur_activite": "Commerce",
  "taille_entreprise": "1 - 10 employés",
  "numero_rccm_ifu": "BJ-2024-TECH-001",
  "email_entreprise": "other@company.bj",
  "telephone_entreprise": "+22968111111",
  "whatsapp_entreprise": "+22968111111",
  "adresse_professionnelle": "456 Rue",
  "prenom_responsable": "Alice",
  "nom_responsable": "Dupont",
  "email_responsable": "alice@company.bj",
  "password": "OtherSecure123!",
  "confirmPassword": "OtherSecure123!"
}
```

⚠️ **RCCM/IFU déjà utilisé**

### Réponse Attendue (409 Conflict)

```json
{
  "success": false,
  "message": "Ce numéro RCCM/IFU est déjà utilisé"
}
```

### ✅ Valider

- [ ] Status: **409 Conflict**

---

## ❌ TEST 7: Erreur - Mot de passe faible

### Body (JSON)

```json
{
  "nom_entreprise": "Startup",
  "secteur_activite": "Technologie",
  "taille_entreprise": "1 - 10 employés",
  "numero_rccm_ifu": "BJ-2024-STARTUP-001",
  "email_entreprise": "startup@tech.bj",
  "telephone_entreprise": "+22968222222",
  "whatsapp_entreprise": "+22968222222",
  "adresse_professionnelle": "789 Avenue",
  "prenom_responsable": "Marie",
  "nom_responsable": "Durand",
  "email_responsable": "marie@startup.bj",
  "password": "weak",
  "confirmPassword": "weak"
}
```

⚠️ **Mot de passe trop faible**

### Réponse Attendue (400 Bad Request)

```json
{
  "success": false,
  "message": "Mot de passe faible: min 8 caractères, 1 majuscule, 1 chiffre, 1 symbole"
}
```

### ✅ Valider

- [ ] Status: **400 Bad Request**
- [ ] Message explique les critères

---

## ❌ TEST 8: Erreur - Identifiants incorrects

### Endpoint

```
POST http://localhost:3000/api/auth/entreprises/login
```

### Body (JSON)

```json
{
  "email": "contact@techsolutions.bj",
  "password": "WrongPassword123!"
}
```

### Réponse Attendue (401 Unauthorized)

```json
{
  "success": false,
  "message": "Email ou mot de passe incorrect"
}
```

### ✅ Valider

- [ ] Status: **401 Unauthorized**
- [ ] Message générique (ne révèle pas si email existe)

---

## ❌ TEST 9: Erreur - Token invalide sur /me

### Endpoint

```
GET http://localhost:3000/api/auth/entreprises/me
```

### Headers

```
Authorization: Bearer invalid_token_xyz
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

---

## ❌ TEST 10: Erreur - Token absent sur /me

### Endpoint

```
GET http://localhost:3000/api/auth/entreprises/me
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

---

## 📊 RÉSUMÉ DES TESTS

| # | Test | Endpoint | Status Attendu | ✅ |
|---|------|----------|---|---|
| 1 | Register Entreprise | POST /register | 201 | [ ] |
| 2 | Login Entreprise | POST /login | 200 | [ ] |
| 3 | Get Profile (/me) | GET /me | 200 | [ ] |
| 4 | Update Profile | PATCH /profile | 200 | [ ] |
| 5 | Error: Email utilisé | POST /register | 409 | [ ] |
| 6 | Error: RCCM utilisé | POST /register | 409 | [ ] |
| 7 | Error: Mdp faible | POST /register | 400 | [ ] |
| 8 | Error: Identifiants incorrect | POST /login | 401 | [ ] |
| 9 | Error: Token invalide | GET /me | 401 | [ ] |
| 10 | Error: Token absent | GET /me | 401 | [ ] |

---

## ✅ SI TOUS LES TESTS PASSENT

**Feature 2 est 100% FONCTIONNELLE** ✅

La base de données contient maintenant:
- ✅ Clients particuliers et entreprises (Feature 1)
- ✅ Entreprises CRM (Feature 2)

**Prêt pour Feature 3: Gestion des Tickets** 🚀

---

**Bon test!** 🎯

