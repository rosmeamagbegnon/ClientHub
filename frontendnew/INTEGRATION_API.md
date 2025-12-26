# 📚 Documentation - Intégration API Frontend

## 🎯 Objectif

Intégrer complètement l'API backend au frontend React de manière **modulaire, claire, efficace, sécurisée et fonctionnelle**, en suivant les bonnes pratiques React.js et le principe **DRY (Don't Repeat Yourself)**.

## 📁 Structure Mise en Place

### 1. **Hooks React Génériques** (`src/hooks/`)

#### `useApiData.ts`
Hook générique pour gérer les données API avec états de chargement et erreurs.

**Avantages :**
- ✅ Évite la duplication de code (DRY)
- ✅ Gestion d'erreur uniforme
- ✅ États de chargement cohérents
- ✅ Facile à maintenir

**Utilisation :**
```typescript
const { data, loading, error, refetch } = useApiData(
  () => ticketService.listTickets({ page: 1, limit: 10 }),
  { errorMessage: "Erreur lors du chargement" }
);
```

#### `useApiMutation.ts`
Hook pour gérer les mutations (POST, PUT, PATCH, DELETE).

**Utilisation :**
```typescript
const { mutate, loading, error } = useApiMutation(
  (data) => ticketService.createTicket(data)
);

const handleSubmit = async () => {
  try {
    const result = await mutate(ticketData);
    // Succès
  } catch (error) {
    // Erreur gérée automatiquement
  }
};
```

### 2. **Services API** (`src/services/`)

Chaque domaine métier a son propre service :

#### `tickets/ticketService.ts`
- `createTicket()` - Créer un ticket
- `listTickets()` - Lister les tickets avec filtres
- `getTicket()` - Récupérer un ticket par ID
- `updateTicketStatus()` - Mettre à jour le statut
- `addNote()` - Ajouter une note
- `getNotes()` - Récupérer les notes

#### `bonus/bonusService.ts`
- `createBonus()` - Créer un bonus (entreprise)
- `listBonus()` - Lister les bonus
- `getBonus()` - Récupérer un bonus
- `updateBonus()` - Mettre à jour un bonus
- `toggleBonusActif()` - Activer/désactiver
- `deleteBonus()` - Supprimer un bonus
- `getMesBonus()` - Bonus applicables (client)
- `applyBonus()` - Appliquer un bonus (client)

#### `commandes/commandeService.ts`
- `createCommande()` - Créer une commande
- `listCommandes()` - Lister les commandes
- `getCommande()` - Récupérer une commande
- `updateCommandeStatus()` - Mettre à jour le statut
- `updateCommandeEtape()` - Mettre à jour l'étape
- `updateCoutFinal()` - Renseigner le coût final
- `addNote()` - Ajouter une note
- `getNotes()` - Récupérer les notes

#### `dashboard/dashboardService.ts`
- `getDashboard()` - Dashboard complet
- `getOverview()` - Statistiques générales
- `getTrends()` - Données de tendance
- `getQuickStats()` - Métriques rapides

### 3. **Types TypeScript** (`src/types/api.types.ts`)

Tous les types sont centralisés dans un seul fichier pour :
- ✅ Éviter la duplication
- ✅ Assurer la cohérence
- ✅ Faciliter la maintenance

**Types principaux :**
- `Ticket`, `TicketNote`, `CreateTicketData`
- `Bonus`, `CreateBonusData`, `UpdateBonusData`
- `Commande`, `CommandeNote`, `CreateCommandeData`
- `DashboardData`, `DashboardOverview`, `TrendData`, `QuickStats`
- `PaginatedResponse<T>` - Pour les listes paginées

### 4. **Configuration API** (`src/config/api.config.ts`)

Configuration centralisée :
- `API_BASE_URL` - URL de base (variable d'environnement)
- `API_ENDPOINTS` - Tous les endpoints centralisés
- `buildApiUrl()` - Fonction utilitaire pour construire les URLs

**Avantages :**
- ✅ Un seul endroit pour changer l'URL
- ✅ Support multi-environnements (dev, staging, prod)
- ✅ Type-safe avec TypeScript

## 🔄 Intégration dans les Composants

### Exemple : `ticketsClient.tsx`

**Avant (Mock) :**
```typescript
useEffect(() => {
  setTickets([...mockData]);
}, []);
```

**Après (API) :**
```typescript
const { data, loading, error, refetch } = useApiData(
  () => ticketService.listTickets({ page: 1, limit: 100 }),
  { errorMessage: "Erreur lors du chargement des tickets" }
);

const tickets = data?.items || [];
```

**Gestion des états :**
```typescript
{loading && <Loader2 className="animate-spin" />}
{error && <ErrorMessage message={error} onRetry={refetch} />}
{!loading && tickets.map(ticket => ...)}
```

## 🎨 Mapping des Données

### Statuts Backend → Frontend

Le backend utilise des statuts en snake_case (`en_cours_etude`), tandis que le frontend affiche des libellés lisibles (`En cours d'étude`).

**Fonction de mapping :**
```typescript
const mapStatusToDisplay = (status: Ticket["statut"]): string => {
  const statusMap: Record<Ticket["statut"], string> = {
    en_attente: "En attente",
    en_cours_etude: "En cours d'étude",
    rejete: "Rejetée",
    accepte: "Acceptée",
    assigne: "Assignée",
    en_cours_traitement: "En cours de traitement",
    traite: "Traitée",
  };
  return statusMap[status] || status;
};
```

## 🔒 Sécurité

1. **Authentification JWT** : Tous les appels API incluent automatiquement le token via `apiClient`
2. **Gestion d'erreurs** : Erreurs centralisées avec messages utilisateur-friendly
3. **Validation** : Types TypeScript pour éviter les erreurs à la compilation

## 📝 Bonnes Pratiques Appliquées

1. **DRY (Don't Repeat Yourself)**
   - Hook générique `useApiData` pour éviter la duplication
   - Services centralisés pour chaque domaine métier

2. **Séparation des Responsabilités**
   - Services : Logique API
   - Hooks : Gestion d'état
   - Composants : Affichage UI

3. **Type Safety**
   - TypeScript pour tous les types API
   - Interfaces strictes pour éviter les erreurs

4. **Gestion d'Erreurs**
   - Centralisée dans `errorHandler.ts`
   - Messages utilisateur-friendly
   - Logging pour le debugging

5. **Performance**
   - `useMemo` pour les filtres
   - Pagination côté backend
   - Chargement à la demande

## 🚀 Prochaines Étapes

### Pages à Intégrer (Priorité)

1. ✅ **ticketsClient.tsx** - Intégré
2. ⏳ **ticketsEntreprise.tsx** - À intégrer
3. ⏳ **bonusClient.tsx** - À intégrer
4. ⏳ **bonusEntreprise.tsx** - À intégrer
5. ⏳ **commandesClient.tsx** - À intégrer
6. ⏳ **dashboardClient.tsx** - À intégrer
7. ⏳ **dashboardEntreprise.tsx** - À intégrer

### Pattern à Suivre

Pour chaque page :

1. **Importer les dépendances :**
   ```typescript
   import { useApiData } from "../hooks/useApiData";
   import { ticketService } from "../services/tickets/ticketService";
   ```

2. **Remplacer les mocks :**
   ```typescript
   const { data, loading, error, refetch } = useApiData(
     () => service.listItems(),
     { errorMessage: "..." }
   );
   ```

3. **Gérer les états :**
   - Afficher un loader pendant le chargement
   - Afficher un message d'erreur si erreur
   - Afficher les données une fois chargées

4. **Mapper les données si nécessaire :**
   - Statuts backend → libellés frontend
   - Types backend → types frontend

## 📚 Ressources

- **Services API** : `src/services/`
- **Hooks** : `src/hooks/`
- **Types** : `src/types/api.types.ts`
- **Configuration** : `src/config/api.config.ts`
- **Gestion d'erreurs** : `src/utils/errorHandler.ts`
- **Logging** : `src/utils/logger.ts`

## ✅ Checklist d'Intégration

Pour chaque page à intégrer :

- [ ] Importer `useApiData` et le service correspondant
- [ ] Remplacer les données mockées par un appel API
- [ ] Ajouter la gestion des états (loading, error)
- [ ] Mapper les données backend → frontend si nécessaire
- [ ] Tester avec des données réelles
- [ ] Vérifier la gestion d'erreurs
- [ ] Documenter les changements

---

**Note :** Cette structure est conçue pour être facilement maintenable, même par un développeur junior. Chaque partie est documentée et suit les bonnes pratiques React.js.

