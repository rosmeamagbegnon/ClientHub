# 🎫 FEATURE 3: Tests POSTMAN - Gestion Tickets

**Statut**: ✅ À tester  
**Date**: 16 novembre 2025  
**API**: `http://localhost:3000`  
**Docs**: `http://localhost:3000/api-docs`

---

## 📋 Prerequis

1. **Serveur running**: `npm run dev` ✅
2. **Database initialized**: Tables créées ✅
3. **Un client authentifié**: Avoir un JWT client valide
4. **Une entreprise authentifiée**: Avoir un JWT entreprise valide

### Tokens d'exemple (à obtenir)

```bash
# Créer un client
POST /api/auth/clients/register

# Créer une entreprise
POST /api/auth/entreprises/register

# Se connecter pour avoir les tokens
POST /api/auth/clients/login
POST /api/auth/entreprises/login
```

---

## 🎯 Scénario de Test Complet

### Étape 1: Créer des Données de Test

**1.1 - Créer un client** (particulier ou entreprise)

```bash
POST http://localhost:3000/api/auth/clients/register
Content-Type: application/json

{
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean@example.bj",
  "type_client": "particulier",
  "mot_de_passe": "SecurePass123!"
}

Response: 201 Created
{
  "success": true,
  "client": {
    "id": "CLIENT_ID_1",
    ...
  }
}
```

**1.2 - Créer une entreprise CRM**

```bash
POST http://localhost:3000/api/auth/entreprises/register
Content-Type: application/json

{
  "nom_entreprise": "Support Pro Bénin",
  "secteur_activite": "Services",
  "taille_entreprise": "10-50",
  "numero_rccm_ifu": "RCCM_001",
  "email_entreprise": "support@supportpro.bj",
  "telephone_entreprise": "+22968123456",
  "adresse_professionnelle": "Cotonou, Bénin",
  "prenom_responsable": "Marie",
  "nom_responsable": "Martin",
  "email_responsable": "marie@supportpro.bj",
  "mot_de_passe": "SecurePass123!"
}

Response: 201 Created
{
  "success": true,
  "entreprise": {
    "id": "ENTREPRISE_ID_1",
    ...
  }
}
```

**1.3 - Connecter le client**

```bash
POST http://localhost:3000/api/auth/clients/login
Content-Type: application/json

{
  "email": "jean@example.bj",
  "mot_de_passe": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "client": {...},
  "token": "eyJhbGciOiJIUzI1NiIs..." ← Garder ce token!
}
```

**1.4 - Connecter l'entreprise**

```bash
POST http://localhost:3000/api/auth/entreprises/login
Content-Type: application/json

{
  "email_entreprise": "support@supportpro.bj",
  "mot_de_passe": "SecurePass123!"
}

Response: 200 OK
{
  "success": true,
  "entreprise": {...},
  "token": "eyJhbGciOiJIUzI1NiIs..." ← Garder ce token!
}
```

---

### Étape 2: Tester les Endpoints de Tickets

#### TEST 1: Créer un ticket (CLIENT)

```bash
POST http://localhost:3000/api/tickets
Authorization: Bearer CLIENT_TOKEN
Content-Type: application/json

{
  "entreprise_id": "ENTREPRISE_ID_1",
  "titre": "Problème de facturation",
  "description": "J'ai reçu une facture avec un montant incorrect. Le montant devrait être 50000 XOF au lieu de 75000 XOF.",
  "type_ticket": "facturation",
  "priorite": "haute"
}

Résultat attendu: 201 Created
{
  "success": true,
  "message": "Ticket créé avec succès",
  "ticket": {
    "id": "TICKET_ID_1",
    "client_id": "CLIENT_ID_1",
    "entreprise_id": "ENTREPRISE_ID_1",
    "titre": "Problème de facturation",
    "statut": "en_attente",
    "priorite": "haute",
    "type_ticket": "facturation",
    "date_creation": "2025-11-16T..."
  }
}
```

---

#### TEST 2: Lister les tickets (CLIENT voit ses tickets)

```bash
GET http://localhost:3000/api/tickets
Authorization: Bearer CLIENT_TOKEN

Résultat attendu: 200 OK
{
  "success": true,
  "tickets": [
    {
      "id": "TICKET_ID_1",
      "titre": "Problème de facturation",
      "statut": "en_attente",
      "priorite": "haute",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

#### TEST 3: Lister les tickets (ENTREPRISE voit ses tickets)

```bash
GET http://localhost:3000/api/tickets
Authorization: Bearer ENTREPRISE_TOKEN

Résultat attendu: 200 OK
{
  "success": true,
  "tickets": [
    {
      "id": "TICKET_ID_1",
      "titre": "Problème de facturation",
      "client_prenom": "Jean",
      "client_nom": "Dupont",
      "client_email": "jean@example.bj",
      "statut": "en_attente",
      ...
    }
  ]
}
```

---

#### TEST 4: Filtrer les tickets par statut

```bash
GET http://localhost:3000/api/tickets?statut=en_attente
Authorization: Bearer CLIENT_TOKEN

Résultat attendu: 200 OK
Seulement les tickets en "en_attente"
```

---

#### TEST 5: Filtrer les tickets par priorité

```bash
GET http://localhost:3000/api/tickets?priorite=haute&page=1&limit=10
Authorization: Bearer CLIENT_TOKEN

Résultat attendu: 200 OK
Seulement les tickets avec priorité "haute"
```

---

#### TEST 6: Voir les détails d'un ticket (CLIENT)

```bash
GET http://localhost:3000/api/tickets/TICKET_ID_1
Authorization: Bearer CLIENT_TOKEN

Résultat attendu: 200 OK
{
  "success": true,
  "ticket": {
    "id": "TICKET_ID_1",
    "titre": "Problème de facturation",
    "description": "J'ai reçu une facture...",
    "statut": "en_attente",
    "notes": [] ← Notes publiques seulement
  }
}
```

---

#### TEST 7: Voir les détails d'un ticket (ENTREPRISE)

```bash
GET http://localhost:3000/api/tickets/TICKET_ID_1
Authorization: Bearer ENTREPRISE_TOKEN

Résultat attendu: 200 OK
{
  "success": true,
  "ticket": {
    "id": "TICKET_ID_1",
    "titre": "Problème de facturation",
    "description": "J'ai reçu une facture...",
    "statut": "en_attente",
    "notes": [] ← Toutes les notes (publiques + privées)
  }
}
```

---

#### TEST 8: Changer le statut du ticket (ENTREPRISE)

```bash
PATCH http://localhost:3000/api/tickets/TICKET_ID_1/status
Authorization: Bearer ENTREPRISE_TOKEN
Content-Type: application/json

{
  "statut": "en_cours_etude"
}

Résultat attendu: 200 OK
{
  "success": true,
  "message": "Statut du ticket mis à jour: en_cours_etude",
  "ticket": {
    "id": "TICKET_ID_1",
    "statut": "en_cours_etude",
    "date_modification": "2025-11-16T..."
  }
}
```

---

#### TEST 9: Ajouter une note (CLIENT - publique)

```bash
POST http://localhost:3000/api/tickets/TICKET_ID_1/notes
Authorization: Bearer CLIENT_TOKEN
Content-Type: application/json

{
  "contenu": "Merci d'avoir signalé ce problème. J'attends votre réponse."
}

Résultat attendu: 201 Created
{
  "success": true,
  "message": "Note ajoutée avec succès",
  "note": {
    "id": "NOTE_ID_1",
    "ticket_id": "TICKET_ID_1",
    "auteur_id": "CLIENT_ID_1",
    "contenu": "Merci d'avoir...",
    "est_publique": true ← Toujours true pour les clients
  }
}
```

---

#### TEST 10: Ajouter une note (ENTREPRISE - privée)

```bash
POST http://localhost:3000/api/tickets/TICKET_ID_1/notes
Authorization: Bearer ENTREPRISE_TOKEN
Content-Type: application/json

{
  "contenu": "Ticket assigné à John pour investigation",
  "est_publique": false ← Les entreprises peuvent créer des notes privées
}

Résultat attendu: 201 Created
{
  "success": true,
  "message": "Note ajoutée avec succès",
  "note": {
    "id": "NOTE_ID_2",
    "ticket_id": "TICKET_ID_1",
    "auteur_id": "ENTREPRISE_ID_1",
    "contenu": "Ticket assigné à John...",
    "est_publique": false
  }
}
```

---

#### TEST 11: Lister les notes (CLIENT - voit notes publiques uniquement)

```bash
GET http://localhost:3000/api/tickets/TICKET_ID_1/notes
Authorization: Bearer CLIENT_TOKEN

Résultat attendu: 200 OK
{
  "success": true,
  "notes": [
    {
      "id": "NOTE_ID_1",
      "contenu": "Merci d'avoir...",
      "est_publique": true,
      "auteur_type": "client"
    }
    ← NOTE_ID_2 (privée) n'est pas visible ici!
  ]
}
```

---

#### TEST 12: Lister les notes (ENTREPRISE - voit toutes les notes)

```bash
GET http://localhost:3000/api/tickets/TICKET_ID_1/notes
Authorization: Bearer ENTREPRISE_TOKEN

Résultat attendu: 200 OK
{
  "success": true,
  "notes": [
    {
      "id": "NOTE_ID_1",
      "contenu": "Merci d'avoir...",
      "est_publique": true
    },
    {
      "id": "NOTE_ID_2",
      "contenu": "Ticket assigné à John...",
      "est_publique": false ← Visible pour l'entreprise
    }
  ]
}
```

---

#### TEST 13: Continuer le workflow - Accepter le ticket

```bash
PATCH http://localhost:3000/api/tickets/TICKET_ID_1/status
Authorization: Bearer ENTREPRISE_TOKEN
Content-Type: application/json

{
  "statut": "accepte"
}

Résultat attendu: 200 OK
Statut: "en_cours_etude" → "accepte"
```

---

#### TEST 14: Continuer - Assigner le ticket

```bash
PATCH http://localhost:3000/api/tickets/TICKET_ID_1/status
Authorization: Bearer ENTREPRISE_TOKEN
Content-Type: application/json

{
  "statut": "assigne"
}

Résultat attendu: 200 OK
```

---

#### TEST 15: Continuer - En cours de traitement

```bash
PATCH http://localhost:3000/api/tickets/TICKET_ID_1/status
Authorization: Bearer ENTREPRISE_TOKEN
Content-Type: application/json

{
  "statut": "en_cours_traitement"
}

Résultat attendu: 200 OK
```

---

#### TEST 16: Clore le ticket - Traité

```bash
PATCH http://localhost:3000/api/tickets/TICKET_ID_1/status
Authorization: Bearer ENTREPRISE_TOKEN
Content-Type: application/json

{
  "statut": "traite"
}

Résultat attendu: 200 OK
{
  "success": true,
  "ticket": {
    "id": "TICKET_ID_1",
    "statut": "traite",
    "date_resolution": "2025-11-16T..." ← Date de résolution remplie!
  }
}
```

---

## 🛡️ Tests de Sécurité

### TEST A: Accès non authentifié

```bash
GET http://localhost:3000/api/tickets

Résultat attendu: 401 Unauthorized
{
  "success": false,
  "error": "Token manquant ou invalide"
}
```

### TEST B: Client ne peut pas voir ticket d'un autre client

```bash
# Créer un 2e client
# Ce client essaie d'accéder au ticket du 1er client

GET http://localhost:3000/api/tickets/TICKET_ID_1
Authorization: Bearer CLIENT_TOKEN_2

Résultat attendu: 403 Forbidden
{
  "success": false,
  "error": "Accès refusé à ce ticket"
}
```

### TEST C: Client ne peut pas changer le statut

```bash
PATCH http://localhost:3000/api/tickets/TICKET_ID_1/status
Authorization: Bearer CLIENT_TOKEN
Content-Type: application/json

{
  "statut": "traite"
}

Résultat attendu: 403 Forbidden
{
  "success": false,
  "error": "Seule une entreprise peut changer le statut d'un ticket"
}
```

### TEST D: Client ne peut ajouter qu'une note publique

Le client peut créer des notes, mais elles sont toujours publiques (even if `est_publique: false` is sent)

---

## 📊 Résumé des Tests

| #   | Test                      | Méthode | Endpoint                  | Expected |
| --- | ------------------------- | ------- | ------------------------- | -------- |
| 1   | Créer ticket              | POST    | /api/tickets              | 201 ✅   |
| 2   | Lister (client)           | GET     | /api/tickets              | 200 ✅   |
| 3   | Lister (entreprise)       | GET     | /api/tickets              | 200 ✅   |
| 4   | Filtrer statut            | GET     | /api/tickets?statut=...   | 200 ✅   |
| 5   | Filtrer priorité          | GET     | /api/tickets?priorite=... | 200 ✅   |
| 6   | Voir détails (client)     | GET     | /api/tickets/:id          | 200 ✅   |
| 7   | Voir détails (entreprise) | GET     | /api/tickets/:id          | 200 ✅   |
| 8   | Changer statut            | PATCH   | /api/tickets/:id/status   | 200 ✅   |
| 9   | Ajouter note (client)     | POST    | /api/tickets/:id/notes    | 201 ✅   |
| 10  | Ajouter note (entreprise) | POST    | /api/tickets/:id/notes    | 201 ✅   |
| 11  | Lister notes (client)     | GET     | /api/tickets/:id/notes    | 200 ✅   |
| 12  | Lister notes (entreprise) | GET     | /api/tickets/:id/notes    | 200 ✅   |
| 13  | Workflow (accepte)        | PATCH   | /api/tickets/:id/status   | 200 ✅   |
| 14  | Workflow (assigne)        | PATCH   | /api/tickets/:id/status   | 200 ✅   |
| 15  | Workflow (en cours)       | PATCH   | /api/tickets/:id/status   | 200 ✅   |
| 16  | Workflow (traite)         | PATCH   | /api/tickets/:id/status   | 200 ✅   |
| A   | Non authentifié           | GET     | /api/tickets              | 401 ✅   |
| B   | Accès refusé autre client | GET     | /api/tickets/:id          | 403 ✅   |
| C   | Client change statut      | PATCH   | /api/tickets/:id/status   | 403 ✅   |

---

## 📝 Notes Importantes

1. **Tokens**: Toujours inclure `Authorization: Bearer TOKEN` dans les headers
2. **Content-Type**: Utiliser `application/json` pour les POST/PATCH
3. **Pagination**: Par défaut `page=1, limit=20`. Max 100 par page
4. **Filtres**: `statut`, `priorite`, `type_ticket` peuvent être combinés
5. **Notes publiques**: Les clients ne voient que les notes publiques
6. **Workflow**: Respecter l'ordre des statuts (pas de sauts directs)

---

**Statut**: ⏳ En attente de tests Postman
