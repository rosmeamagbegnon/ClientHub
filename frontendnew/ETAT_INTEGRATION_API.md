# 📊 État de l'Intégration API - Frontend

## ✅ Pages Déjà Intégrées (10 pages)

### 🔐 Authentification (4 pages)
1. ✅ **connexionClient.tsx** - Utilise `authService.loginClient()`
2. ✅ **connexionEntreprise.tsx** - Utilise `authService.loginEntreprise()`
3. ✅ **inscriptionClient.tsx** - Utilise `authService.registerClient()` / `registerEntreprise()`
4. ✅ **inscriptionEntreprise.tsx** - Utilise `authService.registerEntreprise()`

### 📋 Tickets (2 pages)
5. ✅ **ticketsClient.tsx** - Utilise `ticketService.listTickets()`
6. ✅ **ticketsEntreprise.tsx** - Utilise `ticketService.listTickets()`, `updateTicketStatus()`, `addNote()` avec drag & drop

### 📦 Commandes (1 page)
7. ✅ **commandesClient.tsx** - Utilise `commandeService.listCommandes()`, `addNote()`

### 🎁 Bonus (2 pages)
8. ✅ **bonusClient.tsx** - Utilise `bonusService.getMesBonus()`, `applyBonus()`
9. ✅ **bonusEntreprise.tsx** - Utilise `bonusService.listBonus()`, `createBonus()`, `updateBonus()`, `deleteBonus()`, `toggleBonusActif()`

### 📊 Dashboard (1 page)
10. ✅ **dashboardClient.tsx** - Utilise `ticketService`, `commandeService`, `bonusService` pour afficher les statistiques

---

## ❌ Pages NON Intégrées (6 pages)

### 📊 Dashboard Entreprise (1 page)
1. ❌ **dashboardEntreprise.tsx**
   - **État actuel :** Données mockées (kpis, tickets, clients, graphiques)
   - **Service à utiliser :** `dashboardService.getDashboard()`
   - **Endpoints nécessaires :**
     - `GET /api/dashboard?period=month` - Récupérer toutes les données du dashboard
   - **Données mockées :**
     - KPIs (tickets reçus, ouverts, résolus, temps moyen)
     - Liste de tickets récents
     - Graphique des tickets par jour
     - Liste des clients actifs
   - **Actions requises :**
     - Remplacer les données mockées par `useApiData` avec `dashboardService.getDashboard()`
     - Adapter les types de données backend → frontend
     - Gérer les états loading/error
   - **Complexité :** ⭐⭐

### 👥 Clients Entreprise (1 page)
2. ❌ **clientsEntreprise.tsx**
   - **État actuel :** Données fake hardcodées dans `useMemo`
   - **Service à utiliser :** `dashboardService` (pour top clients) + `ticketService` + `commandeService` (pour extraire les clients)
   - **Endpoints nécessaires :**
     - `GET /api/dashboard/top-clients` - Top clients
     - `GET /api/tickets` - Pour extraire les clients uniques
     - `GET /api/commandes` - Pour extraire les clients uniques
   - **Données mockées :**
     - Liste de clients avec type (particulier/entreprise)
     - Filtres par type
     - Recherche
     - Pagination
   - **Actions requises :**
     - Récupérer les clients depuis le dashboard ou combiner tickets + commandes
     - Mapper les données backend → frontend
     - Implémenter la recherche et les filtres
   - **Complexité :** ⭐⭐⭐

### 💼 Opportunités (1 page)
3. ❌ **opportunites.tsx**
   - **État actuel :** Données mockées dans `useState`
   - **Service à utiliser :** `opportunityService` (qui mappe les commandes)
   - **Endpoints nécessaires :**
     - `GET /api/commandes` - Liste des commandes (mappées en opportunités)
     - `PATCH /api/commandes/:id/status` - Changer le statut (stage)
     - `POST /api/commandes/:id/notes` - Ajouter une note
   - **Données mockées :**
     - Liste d'opportunités avec stages (Kanban)
     - Drag & drop pour changer le stage
     - Filtres (entreprise, propriétaire, stage)
     - Modal pour voir les détails et ajouter des notes
   - **Actions requises :**
     - Utiliser `opportunityService.listOpportunities()` qui mappe les commandes
     - Implémenter le drag & drop avec `useApiMutation`
     - Adapter le mapping des statuts commande → stages opportunité
   - **Complexité :** ⭐⭐⭐ (Drag & drop + mapping)

### 👤 Profils (2 pages)
4. ❌ **profilClient.tsx**
   - **État actuel :** Données mockées dans un objet `client`
   - **Service à utiliser :** `useAuth()` depuis `AuthContext`
   - **Endpoints nécessaires :**
     - `GET /api/auth/clients/me` - Profil du client connecté
     - `GET /api/tickets` - Pour extraire les entreprises affiliées
     - `GET /api/commandes` - Pour extraire les entreprises affiliées
   - **Données mockées :**
     - Informations client (nom, email, téléphone, type)
     - Liste des entreprises affiliées
     - Contacts (si type = entreprise)
   - **Actions requises :**
     - Utiliser `useAuth()` pour récupérer le profil
     - Extraire les entreprises depuis tickets et commandes
     - Afficher dynamiquement selon le type (particulier/entreprise)
   - **Complexité :** ⭐⭐

5. ❌ **profilEmploye.tsx**
   - **État actuel :** Données mockées (profil employé, permissions, logs)
   - **Service à utiliser :** `useAuth()` + `authService.updateEntrepriseProfile()`
   - **Endpoints nécessaires :**
     - `GET /api/auth/entreprises/me` - Profil de l'entreprise CRM (responsable)
     - `PATCH /api/auth/entreprises/profile` - Mettre à jour le profil
   - **Données mockées :**
     - Profil employé (nom, email, téléphone, rôle, département)
     - Permissions selon le rôle
     - Logs d'activité
   - **Actions requises :**
     - Utiliser `useAuth()` pour récupérer le profil entreprise
     - Mapper le profil entreprise → profil employé
     - Implémenter la mise à jour du profil
   - **Complexité :** ⭐⭐

### 👥 Liste Employés (1 page)
6. ❌ **listeEmployes.tsx**
   - **État actuel :** Données mockées dans `useState`
   - **Service à utiliser :** Pas d'endpoint dédié, utiliser le profil entreprise
   - **Endpoints nécessaires :**
     - `GET /api/auth/entreprises/me` - Profil entreprise (pour le responsable)
     - ⚠️ **Note :** Il n'y a pas d'endpoint pour lister les employés. Cette page pourrait afficher uniquement le profil du responsable connecté, ou être désactivée si non nécessaire.
   - **Données mockées :**
     - Liste d'employés avec rôles, départements, statuts
     - Filtres et recherche
     - Modal pour ajouter/modifier un employé
   - **Actions requises :**
     - Vérifier si un endpoint existe pour les employés
     - Sinon, adapter la page pour afficher uniquement le profil du responsable
     - Ou désactiver la page si non nécessaire
   - **Complexité :** ⭐ (dépend de l'existence d'un endpoint)

---

## 📄 Pages Statiques (Pas besoin d'API)

- ✅ **landingPage.tsx** - Page d'accueil statique
- ✅ **accueilClient.tsx** - Page d'accueil client statique

---

## 📈 Résumé

- **Total de pages :** 18
- **Pages intégrées :** 10 (55.6%)
- **Pages à intégrer :** 6 (33.3%)
- **Pages statiques :** 2 (11.1%)

### Priorités d'intégration

1. 🔴 **HAUTE PRIORITÉ**
   - `dashboardEntreprise.tsx` - Dashboard principal de l'entreprise
   - `clientsEntreprise.tsx` - Gestion des clients

2. 🟡 **MOYENNE PRIORITÉ**
   - `opportunites.tsx` - Gestion des opportunités (CRM)
   - `profilClient.tsx` - Profil client
   - `profilEmploye.tsx` - Profil employé

3. 🟢 **BASSE PRIORITÉ**
   - `listeEmployes.tsx` - Vérifier si nécessaire (pas d'endpoint dédié)

---

## 🔧 Services Disponibles

- ✅ `authService` - Authentification (login, register, profile)
- ✅ `ticketService` - Gestion des tickets
- ✅ `commandeService` - Gestion des commandes
- ✅ `bonusService` - Gestion des bonus
- ✅ `dashboardService` - Dashboard (pour entreprise)
- ✅ `opportunityService` - Opportunités (mappe les commandes)

## 📝 Notes

- Tous les services utilisent `useApiData` et `useApiMutation` pour la gestion des états
- Les erreurs sont gérées via `errorHandler`
- Les logs sont centralisés via `logger`
- Les types sont définis dans `types/api.types.ts`

