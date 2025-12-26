# 📋 Plan d'Intégration API - Frontend

## 🎯 Objectif
Intégrer toutes les données API dans les pages frontend, en remplaçant les données mockées par de vraies données depuis le backend.

---

## 📊 Analyse des Pages

### ✅ **Pages Déjà Intégrées**
1. ✅ **ticketsClient.tsx** - Intégré avec `ticketService`
2. ✅ **inscriptionClient.tsx** - Utilise `authService`
3. ✅ **inscriptionEntreprise.tsx** - Utilise `authService`
4. ✅ **connexionClient.tsx** - Utilise `authService`
5. ✅ **connexionEntreprise.tsx** - Utilise `authService`

### ⏳ **Pages à Intégrer** (11 pages)

---

## 📦 Phase 1 : Tickets & Commandes (Priorité HAUTE)

### 1.1 **ticketsEntreprise.tsx** 🔴 CRITIQUE
**État actuel :** Données mockées dans `useState`
**Service à utiliser :** `ticketService`
**Endpoints nécessaires :**
- `listTickets()` - Liste des tickets avec filtres
- `getTicket(id)` - Détails d'un ticket
- `updateTicketStatus(id, data)` - Changer le statut (drag & drop)

**Données mockées :**
- Liste de tickets avec statuts
- Interface Kanban avec drag & drop

**Actions requises :**
- Remplacer `useState` par `useApiData`
- Adapter le mapping des statuts backend → frontend
- Implémenter la mise à jour du statut via drag & drop
- Gérer les états loading/error

**Complexité :** ⭐⭐⭐ (Drag & drop + API)

---

### 1.2 **commandesClient.tsx** 🔴 CRITIQUE
**État actuel :** Données hardcodées dans `useState`
**Service à utiliser :** `commandeService`
**Endpoints nécessaires :**
- `listCommandes()` - Liste des commandes du client
- `getCommande(id)` - Détails d'une commande
- `addNote(id, data)` - Ajouter une note

**Données mockées :**
- Liste de propositions/commandes avec statuts
- Modal de détails avec notes

**Actions requises :**
- Remplacer les données mockées par `useApiData`
- Mapper les statuts backend → frontend
- Intégrer le modal de détails avec vraies données
- Gérer l'ajout de notes

**Complexité :** ⭐⭐

---

## 📦 Phase 2 : Bonus (Priorité MOYENNE)

### 2.1 **bonusClient.tsx** 🟡 MOYENNE
**État actuel :** Données mockées dans `useEffect`
**Service à utiliser :** `bonusService`
**Endpoints nécessaires :**
- `getMesBonus()` - Bonus applicables au client
- `applyBonus(id, commande_id?)` - Appliquer un bonus

**Données mockées :**
- Liste de bonus avec types (points, réduction, cadeau)
- Filtres par type

**Actions requises :**
- Remplacer `useEffect` mock par `useApiData`
- Adapter les types de bonus (backend vs frontend)
- Implémenter l'application de bonus
- Gérer les états loading/error

**Complexité :** ⭐⭐

---

### 2.2 **bonusEntreprise.tsx** 🟡 MOYENNE
**État actuel :** Données mockées dans `useEffect`
**Service à utiliser :** `bonusService`
**Endpoints nécessaires :**
- `listBonus()` - Liste des bonus de l'entreprise
- `createBonus(data)` - Créer un bonus
- `updateBonus(id, data)` - Modifier un bonus
- `deleteBonus(id)` - Supprimer un bonus
- `toggleBonusActif(id)` - Activer/désactiver

**Données mockées :**
- Liste de bonus avec CRUD complet
- Modals d'ajout/édition/suppression

**Actions requises :**
- Remplacer les données mockées par `useApiData`
- Intégrer les modals CRUD avec `useApiMutation`
- Gérer la pagination
- Adapter les types de bonus

**Complexité :** ⭐⭐⭐ (CRUD complet)

---

## 📦 Phase 3 : Dashboard (Priorité MOYENNE)

### 3.1 **dashboardClient.tsx** 🟡 MOYENNE
**État actuel :** Données hardcodées (statistiques, listes)
**Service à utiliser :** `dashboardService`, `ticketService`, `commandeService`, `bonusService`
**Endpoints nécessaires :**
- `dashboardService.getQuickStats()` - Métriques rapides
- `ticketService.listTickets({ limit: 3 })` - Derniers tickets
- `commandeService.listCommandes({ limit: 3 })` - Dernières commandes
- `bonusService.getMesBonus()` - Derniers bonus

**Données mockées :**
- Statistiques (demandes ouvertes, commandes actives, bonus, chat)
- Listes récentes (demandes, commandes, bonus)

**Actions requises :**
- Remplacer les statistiques hardcodées par des appels API
- Récupérer les dernières données depuis chaque service
- Gérer les états loading pour chaque section
- Afficher des données réelles ou des placeholders si vide

**Complexité :** ⭐⭐ (Plusieurs services)

---

### 3.2 **dashboardEntreprise.tsx** 🟡 MOYENNE
**État actuel :** Données mockées (KPIs, graphiques, listes)
**Service à utiliser :** `dashboardService`, `ticketService`
**Endpoints nécessaires :**
- `dashboardService.getDashboard(period)` - Dashboard complet
- `dashboardService.getOverview(period)` - Statistiques générales
- `dashboardService.getTrends(metric, period)` - Données de tendance
- `ticketService.listTickets({ limit: 5 })` - Derniers tickets

**Données mockées :**
- KPIs (tickets reçus, ouverts, résolus, temps moyen)
- Graphique de tendance (tickets par jour)
- Liste des derniers tickets
- Liste des clients actifs

**Actions requises :**
- Remplacer toutes les données mockées par `useApiData`
- Intégrer le graphique avec de vraies données
- Gérer la sélection de période (day, week, month, year)
- Afficher les KPIs dynamiques

**Complexité :** ⭐⭐⭐ (Graphiques + multiples données)

---

## 📦 Phase 4 : Clients & Profils (Priorité BASSE)

### 4.1 **clientsEntreprise.tsx** 🟢 BASSE
**État actuel :** Données mockées dans `useMemo`
**Service à utiliser :** `dashboardService` (via top-clients) ou créer un service dédié
**Endpoints nécessaires :**
- `dashboardService.getDashboard()` - Récupère `lists.top_clients`
- OU créer un endpoint dédié `/api/clients` (si disponible)

**Données mockées :**
- Liste de clients avec type, contact, email
- Filtres par type et recherche
- Pagination

**Actions requises :**
- Remplacer les données mockées
- Utiliser les clients depuis le dashboard ou créer un service dédié
- Gérer la pagination côté API
- Adapter les filtres

**Complexité :** ⭐⭐

---

### 4.2 **profilClient.tsx** 🟢 BASSE
**État actuel :** Données hardcodées
**Service à utiliser :** `authService` (via `AuthContext`)
**Endpoints nécessaires :**
- `authService.getProfile()` - Profil du client connecté
- OU utiliser `AuthContext.user`

**Données mockées :**
- Informations personnelles
- Entreprises affiliées
- Contacts (si entreprise)

**Actions requises :**
- Utiliser les données depuis `AuthContext`
- Afficher le profil réel de l'utilisateur connecté
- Gérer l'affichage conditionnel selon le type de client

**Complexité :** ⭐ (Déjà disponible via AuthContext)

---

### 4.3 **profilEmploye.tsx** 🟢 BASSE
**État actuel :** Données mockées dans `useState`
**Service à utiliser :** À créer ou utiliser `AuthContext` si disponible
**Endpoints nécessaires :**
- Endpoint pour récupérer le profil employé (si disponible)
- OU utiliser `AuthContext.user` si l'employé est géré comme un utilisateur

**Données mockées :**
- Profil employé (nom, email, rôle, département)
- Permissions selon le rôle
- Historique d'activité

**Actions requises :**
- Vérifier si un endpoint existe pour les employés
- Sinon, utiliser `AuthContext` ou créer un service dédié
- Afficher les vraies permissions selon le rôle

**Complexité :** ⭐⭐ (Dépend de l'API backend)

---

## 📦 Phase 5 : Opportunités & Employés (Priorité BASSE)

### 5.1 **opportunites.tsx** 🟢 BASSE
**État actuel :** Données mockées dans `useState`
**Service à utiliser :** À créer `opportuniteService` (si l'endpoint existe)
**Endpoints nécessaires :**
- Vérifier si un endpoint `/api/opportunites` existe
- Sinon, utiliser `commandeService` (les opportunités peuvent être des commandes en attente)

**Données mockées :**
- Liste d'opportunités avec Kanban
- Drag & drop entre les stages
- Filtres et recherche

**Actions requises :**
- Vérifier l'existence d'un endpoint dédié
- Si oui, créer `opportuniteService`
- Si non, adapter `commandeService` pour les opportunités
- Implémenter la mise à jour du stage via drag & drop

**Complexité :** ⭐⭐⭐ (Drag & drop + vérification endpoint)

---

### 5.2 **listeEmployes.tsx** 🟢 BASSE
**État actuel :** Données mockées dans `useEffect`
**Service à utiliser :** À créer `employeService` (si l'endpoint existe)
**Endpoints nécessaires :**
- Vérifier si un endpoint `/api/employes` existe
- CRUD complet (create, read, update, delete, toggle status)

**Données mockées :**
- Liste d'employés avec rôles
- Modals d'ajout/édition
- Toggle statut actif/inactif

**Actions requises :**
- Vérifier l'existence d'un endpoint dédié
- Si oui, créer `employeService`
- Intégrer le CRUD complet
- Gérer les permissions selon le rôle

**Complexité :** ⭐⭐⭐ (CRUD complet + vérification endpoint)

---

## 📦 Phase 6 : Pages Statiques (Aucune intégration nécessaire)

### 6.1 **landingPage.tsx** ✅
**État :** Page statique, aucune intégration nécessaire

### 6.2 **accueilClient.tsx** ✅
**État :** Page d'accueil statique, aucune intégration nécessaire

---

## 📊 Résumé par Priorité

### 🔴 **Priorité HAUTE** (2 pages)
1. ticketsEntreprise.tsx
2. commandesClient.tsx

### 🟡 **Priorité MOYENNE** (4 pages)
3. bonusClient.tsx
4. bonusEntreprise.tsx
5. dashboardClient.tsx
6. dashboardEntreprise.tsx

### 🟢 **Priorité BASSE** (5 pages)
7. clientsEntreprise.tsx
8. profilClient.tsx
9. profilEmploye.tsx
10. opportunites.tsx
11. listeEmployes.tsx

---

## 🎯 Plan d'Exécution Recommandé

### **Étape 1 : Tickets & Commandes** (Fondation)
- ✅ ticketsClient.tsx (Déjà fait)
- ⏳ ticketsEntreprise.tsx
- ⏳ commandesClient.tsx

**Raison :** Ces pages sont les plus utilisées et critiques pour le fonctionnement de l'application.

---

### **Étape 2 : Bonus** (Fonctionnalité importante)
- ⏳ bonusClient.tsx
- ⏳ bonusEntreprise.tsx

**Raison :** Système de fidélisation important pour les clients.

---

### **Étape 3 : Dashboard** (Vue d'ensemble)
- ⏳ dashboardClient.tsx
- ⏳ dashboardEntreprise.tsx

**Raison :** Pages d'accueil importantes qui donnent une vue d'ensemble.

---

### **Étape 4 : Clients & Profils** (Gestion)
- ⏳ clientsEntreprise.tsx
- ⏳ profilClient.tsx
- ⏳ profilEmploye.tsx

**Raison :** Pages de gestion moins critiques mais importantes.

---

### **Étape 5 : Opportunités & Employés** (Fonctionnalités avancées)
- ⏳ opportunites.tsx
- ⏳ listeEmployes.tsx

**Raison :** Fonctionnalités avancées, nécessitent vérification des endpoints backend.

---

## 📝 Notes Importantes

1. **Vérification des Endpoints :**
   - Avant d'intégrer `opportunites.tsx` et `listeEmployes.tsx`, vérifier si les endpoints existent dans le backend
   - Si non, soit créer les endpoints, soit adapter les services existants

2. **Mapping des Données :**
   - Toujours mapper les statuts backend (snake_case) vers les libellés frontend
   - Créer des fonctions de mapping réutilisables

3. **Gestion d'Erreurs :**
   - Utiliser `useApiData` pour gérer automatiquement les états loading/error
   - Afficher des messages d'erreur utilisateur-friendly

4. **Performance :**
   - Utiliser `useMemo` pour les filtres
   - Implémenter la pagination côté backend quand possible

5. **Tests :**
   - Tester chaque page après intégration
   - Vérifier les cas d'erreur (réseau, API down, données vides)

---

## ✅ Checklist d'Intégration (Par Page)

Pour chaque page, cocher :

- [ ] Importer `useApiData` et le service correspondant
- [ ] Remplacer les données mockées par un appel API
- [ ] Ajouter la gestion des états (loading, error)
- [ ] Mapper les données backend → frontend si nécessaire
- [ ] Tester avec des données réelles
- [ ] Vérifier la gestion d'erreurs
- [ ] Vérifier les cas limites (données vides, erreurs réseau)
- [ ] Documenter les changements

---

**Dernière mise à jour :** 2025-01-XX
**Statut global :** 1/11 pages intégrées (9%)

