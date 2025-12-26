# Correction : Requêtes API Multiples Consécutives

## 🔴 Problème Identifié

Lors de la récupération des tickets, plusieurs requêtes API étaient lancées consécutivement, causant une erreur **429 (Too Many Requests)** :

```
[ERROR] Erreur lors de la récupération des données ApiException: Trop de requêtes. Veuillez patienter quelques instants.
GET http://localhost:3000/api/tickets?page=1&limit=100 429 (Too Many Requests)
```

## 🔍 Cause Racine

Le problème venait du hook `useApiData` dans `frontendnew/src/hooks/useApiData.ts` :

1. **Fonction `fetchFn` recréée à chaque render** : Dans `ticketsEntreprise.tsx`, la fonction `() => ticketService.listTickets({ page: 1, limit: 100 })` est recréée à chaque render du composant.

2. **Dépendances de `useCallback`** : Le `useCallback` dans `useApiData` avait `fetchFn` dans ses dépendances :
   ```typescript
   const fetchData = useCallback(async () => {
     // ...
   }, [fetchFn, errorMessage]); // ❌ fetchFn change à chaque render
   ```

3. **Boucle infinie** : Comme `fetchFn` change à chaque render, `fetchData` est recréé, ce qui déclenche le `useEffect` à nouveau :
   ```typescript
   useEffect(() => {
     if (autoFetch) {
       fetchData(); // ❌ Se déclenche à chaque changement de fetchData
     }
   }, [autoFetch, fetchData]); // ❌ fetchData change à chaque render
   ```

4. **React StrictMode** : En mode développement, React StrictMode monte les composants deux fois, ce qui peut amplifier le problème.

## ✅ Solution Implémentée

### 1. Utilisation de `useRef` pour stocker la fonction

Au lieu de dépendre directement de `fetchFn` dans `useCallback`, on utilise `useRef` pour stocker la fonction :

```typescript
// Utiliser useRef pour stocker la fonction et éviter les re-créations
const fetchFnRef = useRef(fetchFn);
const errorMessageRef = useRef(errorMessage);

// Mettre à jour les refs à chaque changement
useEffect(() => {
  fetchFnRef.current = fetchFn;
  errorMessageRef.current = errorMessage;
}, [fetchFn, errorMessage]);
```

### 2. Protection contre les appels multiples simultanés

Ajout d'un flag `isFetchingRef` pour éviter les appels multiples simultanés :

```typescript
// Flags pour éviter les appels multiples
const isFetchingRef = useRef(false);
const hasFetchedRef = useRef(false);

const fetchData = useCallback(async () => {
  // Éviter les appels multiples simultanés
  if (isFetchingRef.current) {
    logger.debug("Requête déjà en cours, ignorée");
    return;
  }

  isFetchingRef.current = true;
  // ... logique de fetch
  isFetchingRef.current = false;
}, []); // Pas de dépendances, utilise les refs
```

### 3. Protection contre les appels multiples au montage

Ajout d'un flag `hasFetchedRef` pour éviter les appels multiples même en mode StrictMode :

```typescript
useEffect(() => {
  // Ne faire qu'un seul appel automatique au montage
  if (autoFetch && !hasFetchedRef.current && !isFetchingRef.current) {
    fetchData();
  }
}, [autoFetch]); // Seulement autoFetch comme dépendance
```

## 📝 Fichiers Modifiés

- `frontendnew/src/hooks/useApiData.ts` : Correction du hook pour éviter les requêtes multiples

## 🎯 Avantages de la Solution

1. **Stabilité** : Les requêtes ne sont plus déclenchées à chaque render
2. **Performance** : Réduction drastique du nombre de requêtes API
3. **Robustesse** : Protection contre les appels multiples simultanés
4. **Compatibilité** : Fonctionne correctement avec React StrictMode

## 🔄 Comportement Attendu

- **Un seul appel** au montage du composant (même avec StrictMode)
- **Pas d'appels multiples** lors des re-renders
- **Protection** contre les appels simultanés via `refetch()`

## ⚠️ Note Importante

Si vous avez besoin de passer des paramètres dynamiques à `fetchFn`, utilisez `useMemo` ou `useCallback` dans le composant parent pour mémoriser la fonction :

```typescript
// ✅ Bon exemple
const fetchTickets = useCallback(
  () => ticketService.listTickets({ page: currentPage, limit: 100 }),
  [currentPage] // Seulement recréer si currentPage change
);

const { data, loading, error } = useApiData(fetchTickets);
```

