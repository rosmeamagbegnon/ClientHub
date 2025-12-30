# 📚 Guide Complet : Intégration API Frontend

## 🎯 Objectif de ce Guide

Ce guide explique **pas à pas** comment intégrer l'API backend dans le frontend React, en suivant la même logique que les autres features déjà intégrées (comme les tickets).

**Public cible :** Développeurs juniors  
**Style :** Explications détaillées avec exemples concrets

---

## 📋 Table des Matières

1. [Architecture Générale](#1-architecture-générale)
2. [Les Différents Fichiers et Leur Rôle](#2-les-différents-fichiers-et-leur-rôle)
3. [Étape 1 : Créer un Service](#3-étape-1-créer-un-service)
4. [Étape 2 : Intégrer dans un Composant](#4-étape-2-intégrer-dans-un-composant)
5. [Exemple Complet : Les Tickets](#5-exemple-complet-les-tickets)
6. [Bonnes Pratiques](#6-bonnes-pratiques)
7. [Dépannage](#7-dépannage)
8. [Résumé Visuel](#8-résumé-visuel)

---

## 1. Architecture Générale

### 🏗️ Comment ça fonctionne ?

```
┌─────────────────┐
│   Composant     │  (Page React : ticketsClient.tsx)
│   React         │
└────────┬────────┘
         │ utilise
         ▼
┌─────────────────┐
│   Hook          │  (useApiData, useApiMutation)
│   Custom        │
└────────┬────────┘
         │ appelle
         ▼
┌─────────────────┐
│   Service       │  (ticketService.ts)
│   Métier        │
└────────┬────────┘
         │ utilise
         ▼
┌─────────────────┐
│   API Client    │  (apiClient.ts)
│   HTTP          │
└────────┬────────┘
         │ fait des
         ▼
┌─────────────────┐
│   Backend API   │  (http://localhost:3000/api)
└─────────────────┘
```

### 📦 Les Couches

1. **Composant React** : Affiche les données à l'utilisateur
2. **Hook Custom** : Gère l'état (loading, error, data)
3. **Service** : Logique métier et appels API
4. **API Client** : Gère les requêtes HTTP (authentification, erreurs)

---

## 2. Les Différents Fichiers et Leur Rôle

### 📁 Structure des Fichiers

```
frontendnew/src/
├── services/              # Services métier
│   ├── api/
│   │   └── apiClient.ts   # Client HTTP centralisé
│   ├── tickets/
│   │   └── ticketService.ts  # Service pour les tickets
│   └── ...
├── hooks/
│   └── useApiData.ts      # Hook pour récupérer des données
├── types/
│   └── api.types.ts        # Types TypeScript pour l'API
├── config/
│   └── api.config.ts      # Configuration API (URLs, endpoints)
├── utils/
│   ├── logger.ts          # Système de logs
│   └── errorHandler.ts    # Gestion des erreurs
└── pages/
    └── ticketsClient.tsx  # Page qui utilise les services
```

### 📄 Rôle de Chaque Fichier

#### **1. `apiClient.ts`** - Le Client HTTP
**Rôle :** Fait toutes les requêtes HTTP vers le backend

**Ce qu'il fait :**
- Ajoute automatiquement le token JWT dans les headers
- Gère les erreurs HTTP (401, 404, 500, etc.)
- Transforme les réponses JSON
- Log les requêtes

**Exemple d'utilisation :**
```typescript
// Dans un service
const tickets = await apiClient.get<Ticket[]>("/tickets");
```

---

#### **2. `api.config.ts`** - Configuration API
**Rôle :** Définit tous les endpoints API de manière centralisée

**Pourquoi c'est important :**
- ✅ Un seul endroit pour changer les URLs
- ✅ Évite les erreurs de frappe
- ✅ Facile à maintenir

**Exemple :**
```typescript
export const API_ENDPOINTS = {
  TICKETS: {
    BASE: "/tickets",
    BY_ID: (id: string) => `/tickets/${id}`,
  },
};
```

---

#### **3. `api.types.ts`** - Types TypeScript
**Rôle :** Définit la structure des données de l'API

**Pourquoi c'est important :**
- ✅ TypeScript vérifie que les données sont correctes
- ✅ Autocomplétion dans l'IDE
- ✅ Évite les erreurs de typage

**Exemple :**
```typescript
export interface Ticket {
  id: string;
  titre: string;
  statut: "ouvert" | "en_cours" | "ferme";
  // ...
}
```

---

#### **4. `ticketService.ts`** - Service Métier
**Rôle :** Encapsule toute la logique liée aux tickets

**Ce qu'il fait :**
- Appelle l'API via `apiClient`
- Transforme les données si nécessaire
- Gère les erreurs
- Log les actions

**Exemple :**
```typescript
async listTickets(): Promise<Ticket[]> {
  const tickets = await apiClient.get<Ticket[]>("/tickets");
  return tickets;
}
```

---

#### **5. `useApiData.ts`** - Hook Custom
**Rôle :** Gère l'état d'une requête API (loading, error, data)

**Ce qu'il fait :**
- Appelle le service automatiquement
- Gère l'état `loading` (en cours de chargement)
- Gère l'état `error` (erreur)
- Gère l'état `data` (données récupérées)
- Permet de refaire la requête avec `refetch()`

**Exemple :**
```typescript
const { data, loading, error, refetch } = useApiData(
  () => ticketService.listTickets()
);
```

---

#### **6. `ticketsClient.tsx`** - Composant React
**Rôle :** Affiche les données à l'utilisateur

**Ce qu'il fait :**
- Utilise `useApiData` pour récupérer les données
- Affiche un loader pendant le chargement
- Affiche les erreurs
- Affiche les données quand elles sont disponibles

---

## 3. Étape 1 : Créer un Service

### 🎯 Objectif
Créer un service qui encapsule tous les appels API pour une feature (ex: tickets, commandes, bonus).

### 📝 Étapes Détaillées

#### **Étape 1.1 : Créer le fichier du service**

Créer un fichier dans `frontendnew/src/services/[feature]/[feature]Service.ts`

**Exemple :** `frontendnew/src/services/tickets/ticketService.ts`

---

#### **Étape 1.2 : Importer les dépendances**

```typescript
// 1. Importer le client API
import { apiClient } from "../api/apiClient";

// 2. Importer la configuration des endpoints
import { API_ENDPOINTS } from "../../config/api.config";

// 3. Importer le logger pour les logs
import { logger } from "../../utils/logger";

// 4. Importer les types TypeScript
import type { Ticket, PaginatedResponse } from "../../types/api.types";
```

**Explication :**
- `apiClient` : Pour faire les requêtes HTTP
- `API_ENDPOINTS` : Pour avoir les URLs des endpoints
- `logger` : Pour logger les actions (debug, erreurs)
- Types : Pour la sécurité de type TypeScript

---

#### **Étape 1.3 : Créer la classe du service**

```typescript
/**
 * Service de gestion des tickets
 * 
 * Ce service encapsule tous les appels API liés aux tickets.
 */
class TicketService {
  // Les méthodes vont ici
}
```

**Explication :**
- On crée une classe pour regrouper toutes les méthodes liées aux tickets
- C'est plus organisé qu'avoir des fonctions séparées

---

#### **Étape 1.4 : Créer une méthode pour lister les tickets**

```typescript
class TicketService {
  /**
   * Lister les tickets avec filtres et pagination
   * 
   * @param options - Options de filtrage (page, limit, statut, etc.)
   * @returns Liste paginée des tickets
   */
  async listTickets(
    options: {
      page?: number;
      limit?: number;
      statut?: Ticket["statut"];
    } = {}
  ): Promise<PaginatedResponse<Ticket>> {
    try {
      // 1. Construire les paramètres de requête
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      if (options.statut) params.append("statut", options.statut);

      // 2. Construire l'URL complète
      const queryString = params.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.TICKETS.BASE}?${queryString}`
        : API_ENDPOINTS.TICKETS.BASE;

      // 3. Logger l'action (pour le debug)
      logger.debug("Récupération de la liste des tickets", options);

      // 4. Faire la requête HTTP
      const response = await apiClient.get<{
        success: boolean;
        tickets: Ticket[];
        pagination: Pagination;
      }>(endpoint);

      // 5. Adapter la réponse backend vers le format frontend
      const adaptedResponse: PaginatedResponse<Ticket> = {
        items: response.tickets || [],
        pagination: response.pagination,
      };

      // 6. Logger le succès
      logger.debug("Tickets récupérés", {
        count: adaptedResponse.items.length,
      });

      // 7. Retourner les données
      return adaptedResponse;
    } catch (error) {
      // 8. Logger l'erreur
      logger.error("Erreur lors de la récupération des tickets", error);
      // 9. Relancer l'erreur pour que le composant puisse la gérer
      throw error;
    }
  }
}
```

**Explication ligne par ligne :**

1. **`async listTickets(...)`** : Méthode asynchrone qui retourne une Promise
2. **`const params = new URLSearchParams()`** : Crée les paramètres de requête (page=1&limit=20)
3. **`params.append(...)`** : Ajoute un paramètre si il existe
4. **`const endpoint = ...`** : Construit l'URL complète avec les paramètres
5. **`logger.debug(...)`** : Log pour le debug (visible dans la console)
6. **`await apiClient.get<...>(endpoint)`** : Fait la requête HTTP GET
   - Le `<{...}>` indique le type de la réponse attendue
7. **`const adaptedResponse = ...`** : Adapte la réponse backend au format frontend
   - Le backend retourne `{ tickets: [...], pagination: {...} }`
   - Le frontend attend `{ items: [...], pagination: {...} }`
8. **`logger.debug(...)`** : Log le succès
9. **`return adaptedResponse`** : Retourne les données
10. **`catch (error)`** : Si une erreur se produit
11. **`logger.error(...)`** : Log l'erreur
12. **`throw error`** : Relance l'erreur pour que le composant puisse la gérer

---

#### **Étape 1.5 : Exporter une instance du service**

```typescript
// Export d'une instance singleton
export const ticketService = new TicketService();
```

**Explication :**
- On crée une seule instance du service (singleton)
- Tous les composants utilisent la même instance
- Plus efficace que de créer une nouvelle instance à chaque fois

---

### ✅ Checklist : Service Créé

- [ ] Fichier créé dans `services/[feature]/[feature]Service.ts`
- [ ] Imports corrects (apiClient, API_ENDPOINTS, logger, types)
- [ ] Classe créée avec le nom `[Feature]Service`
- [ ] Méthodes async créées
- [ ] Gestion des erreurs avec try/catch
- [ ] Logs ajoutés (debug, error)
- [ ] Instance exportée

---

## 4. Étape 2 : Intégrer dans un Composant

### 🎯 Objectif
Utiliser le service dans un composant React pour afficher les données.

### 📝 Étapes Détaillées

#### **Étape 2.1 : Importer le hook et le service**

```typescript
import { useApiData } from "../hooks/useApiData";
import { ticketService } from "../services/tickets/ticketService";
import type { Ticket } from "../types/api.types";
```

**Explication :**
- `useApiData` : Hook pour gérer l'état de la requête
- `ticketService` : Service qu'on vient de créer
- `Ticket` : Type TypeScript pour la sécurité de type

---

#### **Étape 2.2 : Utiliser le hook dans le composant**

```typescript
export default function TicketsClient() {
  // Utiliser le hook pour récupérer les tickets
  const {
    data: ticketsData,      // Les données récupérées
    loading,                 // true si en cours de chargement
    error,                   // Message d'erreur si erreur
    refetch,                 // Fonction pour refaire la requête
  } = useApiData(
    () => ticketService.listTickets({ page: 1, limit: 100 }),
    { errorMessage: "Erreur lors du chargement des tickets" }
  );
}
```

**Explication :**
- `useApiData` prend 2 paramètres :
  1. **Une fonction** qui retourne une Promise (l'appel au service)
  2. **Des options** (message d'erreur personnalisé)

- Le hook retourne un objet avec :
  - `data` : Les données récupérées (ou `null` si pas encore chargées)
  - `loading` : `true` si la requête est en cours
  - `error` : Message d'erreur (ou `null` si pas d'erreur)
  - `refetch` : Fonction pour refaire la requête

---

#### **Étape 2.3 : Afficher un loader pendant le chargement**

```typescript
if (loading) {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
      <span className="ml-2 text-gray-600">
        Chargement des tickets...
      </span>
    </div>
  );
}
```

**Explication :**
- Si `loading` est `true`, on affiche un loader
- L'utilisateur sait que les données sont en cours de chargement

---

#### **Étape 2.4 : Afficher les erreurs**

```typescript
if (error && !loading) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p className="font-semibold">Erreur</p>
      <p>{typeof error === 'string' ? error : 'Une erreur inconnue est survenue.'}</p>
    </div>
  );
}
```

**Explication :**
- Si `error` existe et qu'on n'est plus en train de charger
- On affiche un message d'erreur à l'utilisateur
- On vérifie que `error` est une string avant de l'afficher

---

#### **Étape 2.5 : Afficher les données**

```typescript
// Extraire les tickets et la pagination
const tickets = ticketsData?.items || [];
const pagination = ticketsData?.pagination;

return (
  <div>
    <h1>Mes Tickets</h1>
    
    {/* Liste des tickets */}
    {tickets.length === 0 ? (
      <p>Aucun ticket trouvé</p>
    ) : (
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <h3>{ticket.titre}</h3>
            <p>Statut: {ticket.statut}</p>
          </li>
        ))}
      </ul>
    )}
  </div>
);
```

**Explication :**
- `ticketsData?.items` : Utilise l'optional chaining (`?`) pour éviter les erreurs si `ticketsData` est `null`
- `|| []` : Si `ticketsData` est `null`, on utilise un tableau vide
- On vérifie si le tableau est vide avant d'afficher
- On utilise `.map()` pour afficher chaque ticket

---

### ✅ Checklist : Composant Intégré

- [ ] Imports corrects (useApiData, service, types)
- [ ] Hook `useApiData` utilisé dans le composant
- [ ] Gestion de l'état `loading`
- [ ] Gestion de l'état `error`
- [ ] Affichage des données
- [ ] Gestion du cas "aucune donnée"

---

## 5. Exemple Complet : Les Tickets

### 📄 Fichier : `ticketsClient.tsx`

Voici un exemple complet et commenté :

```typescript
/**
 * Page de liste des tickets pour les clients
 * 
 * Cette page affiche tous les tickets du client connecté.
 */

// ===== IMPORTS =====

// 1. React et hooks
import { useState } from "react";

// 2. Composants UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// 3. Hook custom pour les données API
import { useApiData } from "../hooks/useApiData";

// 4. Service pour les tickets
import { ticketService } from "../services/tickets/ticketService";

// 5. Types TypeScript
import type { Ticket } from "../types/api.types";

// ===== COMPOSANT =====

export default function TicketsClient() {
  // État local pour les filtres (optionnel)
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ===== RÉCUPÉRATION DES DONNÉES =====
  
  // Utiliser le hook pour récupérer les tickets
  const {
    data: ticketsData,      // Les données (null si pas encore chargées)
    loading,                 // true si en cours de chargement
    error,                   // Message d'erreur (null si pas d'erreur)
    refetch,                 // Fonction pour refaire la requête
  } = useApiData(
    // Fonction qui retourne une Promise
    () => ticketService.listTickets({ 
      page: 1, 
      limit: 100,
      // statut: statusFilter !== "all" ? statusFilter : undefined,
    }),
    // Options
    { 
      errorMessage: "Erreur lors du chargement des tickets" 
    }
  );

  // ===== TRAITEMENT DES DONNÉES =====
  
  // Extraire les tickets et la pagination
  const tickets = ticketsData?.items || [];
  const pagination = ticketsData?.pagination;

  // Filtrer les tickets selon le filtre sélectionné (optionnel)
  const filteredTickets = statusFilter === "all"
    ? tickets
    : tickets.filter((ticket) => ticket.statut === statusFilter);

  // ===== AFFICHAGE =====

  // 1. Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
        <span className="ml-2 text-gray-600">
          Chargement des tickets...
        </span>
      </div>
    );
  }

  // 2. Afficher les erreurs
  if (error && !loading) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-semibold">Erreur</p>
        <p>{typeof error === 'string' ? error : 'Une erreur inconnue est survenue.'}</p>
        <button onClick={() => refetch()}>Réessayer</button>
      </div>
    );
  }

  // 3. Afficher les données
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mes Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres (optionnel) */}
          <div className="mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="ouvert">Ouvert</option>
              <option value="en_cours">En cours</option>
              <option value="ferme">Fermé</option>
            </select>
          </div>

          {/* Liste des tickets */}
          {filteredTickets.length === 0 ? (
            <p className="text-gray-500">Aucun ticket trouvé</p>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{ticket.titre}</h3>
                        <p className="text-gray-600">{ticket.description}</p>
                      </div>
                      <Badge>{ticket.statut}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination (optionnel) */}
          {pagination && (
            <div className="mt-4 text-sm text-gray-600">
              Page {pagination.page} sur {pagination.pages} 
              ({pagination.total} tickets au total)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 🔍 Explication Détaillée

#### **1. Imports**
- On importe tout ce dont on a besoin
- `useApiData` : Hook pour gérer l'état
- `ticketService` : Service pour appeler l'API
- `Ticket` : Type TypeScript

#### **2. État Local (optionnel)**
- `statusFilter` : Pour filtrer les tickets par statut
- Utilisé uniquement si on veut des filtres côté frontend

#### **3. Récupération des Données**
- `useApiData` appelle automatiquement `ticketService.listTickets()`
- Retourne `data`, `loading`, `error`, `refetch`

#### **4. Traitement des Données**
- On extrait `tickets` et `pagination` de `ticketsData`
- On filtre les tickets si nécessaire

#### **5. Affichage Conditionnel**
- Si `loading` : Afficher un loader
- Si `error` : Afficher l'erreur
- Sinon : Afficher les données

---

## 6. Bonnes Pratiques

### ✅ À Faire

1. **Toujours gérer les états `loading` et `error`**
   ```typescript
   if (loading) return <Loader />;
   if (error) return <Error message={error} />;
   ```

2. **Utiliser l'optional chaining (`?`) pour éviter les erreurs**
   ```typescript
   const tickets = ticketsData?.items || [];
   ```

3. **Logger les actions importantes**
   ```typescript
   logger.debug("Tickets récupérés", { count: tickets.length });
   ```

4. **Gérer le cas "aucune donnée"**
   ```typescript
   {tickets.length === 0 ? (
     <p>Aucun ticket trouvé</p>
   ) : (
     // Afficher les tickets
   )}
   ```

5. **Utiliser les types TypeScript**
   ```typescript
   import type { Ticket } from "../types/api.types";
   ```

### ❌ À Éviter

1. **Ne pas gérer les erreurs**
   ```typescript
   // ❌ MAUVAIS
   const tickets = ticketsData.items; // Peut crasher si ticketsData est null
   ```

2. **Ne pas afficher de loader**
   ```typescript
   // ❌ MAUVAIS
   return <div>{tickets.map(...)}</div>; // L'utilisateur ne sait pas que ça charge
   ```

3. **Ne pas utiliser les services**
   ```typescript
   // ❌ MAUVAIS
   fetch("/api/tickets").then(...); // Utilise directement fetch au lieu du service
   ```

---

## 7. Dépannage

### 🔧 Problèmes Courants

#### **Problème 1 : "Cannot read property 'items' of null"**

**Cause :** On essaie d'accéder à `ticketsData.items` alors que `ticketsData` est `null`

**Solution :**
```typescript
// ✅ BON
const tickets = ticketsData?.items || [];
```

---

#### **Problème 2 : "Trop de requêtes" (429 Too Many Requests)**

**Cause :** Le hook `useApiData` est appelé plusieurs fois

**Solution :** Vérifier que le hook n'est pas dans une boucle de re-render

---

#### **Problème 3 : "401 Unauthorized"**

**Cause :** Le token JWT est expiré ou invalide

**Solution :** Vérifier que l'utilisateur est bien connecté

---

#### **Problème 4 : Les données ne s'affichent pas**

**Vérifications :**
1. Vérifier que `loading` est `false`
2. Vérifier que `error` est `null`
3. Vérifier que `ticketsData` n'est pas `null`
4. Vérifier dans la console du navigateur (F12) les requêtes réseau

---

## 📝 Résumé

### Pour Créer un Service :

1. Créer le fichier dans `services/[feature]/[feature]Service.ts`
2. Importer `apiClient`, `API_ENDPOINTS`, `logger`, types
3. Créer une classe avec des méthodes `async`
4. Utiliser `try/catch` pour gérer les erreurs
5. Logger les actions
6. Exporter une instance

### Pour Intégrer dans un Composant :

1. Importer `useApiData`, le service, les types
2. Utiliser `useApiData(() => service.method())`
3. Gérer `loading` : Afficher un loader
4. Gérer `error` : Afficher l'erreur
5. Afficher les données avec `data?.items || []`

---

## 🎓 Questions Fréquentes

### Q1 : Pourquoi utiliser un service au lieu d'appeler directement l'API ?

**R :** 
- ✅ Code réutilisable (plusieurs composants peuvent utiliser le même service)
- ✅ Logique centralisée (plus facile à maintenir)
- ✅ Gestion des erreurs centralisée
- ✅ Logs centralisés

### Q2 : Pourquoi utiliser `useApiData` au lieu de `useState` + `useEffect` ?

**R :**
- ✅ Moins de code à écrire
- ✅ Gestion automatique de `loading` et `error`
- ✅ Évite les appels multiples
- ✅ Fonction `refetch()` pour refaire la requête

### Q3 : Quand utiliser `useApiData` vs `useApiMutation` ?

**R :**
- `useApiData` : Pour récupérer des données (GET)
- `useApiMutation` : Pour modifier des données (POST, PATCH, DELETE)

---

## 🚀 Prochaines Étapes

Maintenant que tu comprends comment ça fonctionne :

1. ✅ Créer un nouveau service pour une nouvelle feature
2. ✅ Intégrer le service dans un composant
3. ✅ Tester avec des vraies données
4. ✅ Gérer les erreurs et les cas limites

**Bon courage ! 🎉**

---

## 8. Résumé Visuel

### 🎯 Flux Complet d'une Requête API

```
┌─────────────────────────────────────────────────────────────┐
│ 1. UTILISATEUR OUVRE LA PAGE                                │
│    ticketsClient.tsx se charge                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. LE COMPOSANT UTILISE useApiData                          │
│                                                             │
│    const { data, loading, error } = useApiData(            │
│      () => ticketService.listTickets()                     │
│    );                                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. useApiData APPELLE LE SERVICE                            │
│                                                             │
│    ticketService.listTickets()                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. LE SERVICE UTILISE apiClient                             │
│                                                             │
│    await apiClient.get("/tickets")                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. apiClient FAIT LA REQUÊTE HTTP                          │
│                                                             │
│    GET http://localhost:3000/api/tickets                   │
│    Headers: { Authorization: "Bearer <token>" }            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. LE BACKEND RETOURNE LES DONNÉES                          │
│                                                             │
│    {                                                         │
│      success: true,                                         │
│      tickets: [...],                                        │
│      pagination: {...}                                      │
│    }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. apiClient TRANSFORME LA RÉPONSE                         │
│                                                             │
│    { tickets: [...], pagination: {...} }                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. LE SERVICE ADAPTE LE FORMAT                             │
│                                                             │
│    { items: [...], pagination: {...} }                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. useApiData MET À JOUR L'ÉTAT                            │
│                                                             │
│    setData({ items: [...], pagination: {...} })            │
│    setLoading(false)                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. LE COMPOSANT AFFICHE LES DONNÉES                       │
│                                                             │
│     {tickets.map(ticket => <TicketCard key={ticket.id} />)} │
└─────────────────────────────────────────────────────────────┘
```

### 📊 États du Composant

```
┌─────────────────────────────────────────────────────────────┐
│ ÉTAT INITIAL (loading = true)                              │
│                                                             │
│  ┌─────────────────────┐                                   │
│  │  🔄 Chargement...    │                                   │
│  └─────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────┐
        │ Requête réussie ?   │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌───────────────┐
│ SUCCÈS        │    │ ERREUR        │
│               │    │               │
│ loading=false │    │ loading=false │
│ error=null    │    │ error="..."   │
│ data={...}    │    │ data=null     │
│               │    │               │
│ Affiche les   │    │ Affiche le    │
│ données       │    │ message       │
│               │    │ d'erreur      │
└───────────────┘    └───────────────┘
```

### 🔄 Cycle de Vie d'une Requête

```
1. COMPOSANT SE MONTE
   └─> useApiData est appelé
       └─> loading = true
           └─> Affiche le loader

2. REQUÊTE EN COURS
   └─> ticketService.listTickets()
       └─> apiClient.get("/tickets")
           └─> Requête HTTP envoyée

3. RÉPONSE REÇUE
   └─> Données transformées
       └─> setData(...)
           └─> setLoading(false)
               └─> Affiche les données

4. SI ERREUR
   └─> setError("...")
       └─> setLoading(false)
           └─> Affiche l'erreur
```

---

## 🎓 Checklist Finale

Avant de considérer qu'une intégration est terminée, vérifier :

### ✅ Service
- [ ] Service créé dans `services/[feature]/[feature]Service.ts`
- [ ] Méthodes async avec gestion d'erreurs
- [ ] Logs ajoutés (debug, error)
- [ ] Types TypeScript corrects
- [ ] Instance exportée

### ✅ Composant
- [ ] `useApiData` utilisé correctement
- [ ] Gestion de `loading` (affiche un loader)
- [ ] Gestion de `error` (affiche l'erreur)
- [ ] Affichage des données avec `data?.items || []`
- [ ] Gestion du cas "aucune donnée"

### ✅ Tests
- [ ] Tester avec des données réelles
- [ ] Tester le cas d'erreur (déconnecter le backend)
- [ ] Tester le cas "aucune donnée"
- [ ] Vérifier les logs dans la console

---

**Félicitations ! Tu es maintenant prêt à intégrer l'API dans n'importe quelle page ! 🚀**

