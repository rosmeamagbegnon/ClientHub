# 🔧 Correction du Bug Critique : Email Entreprise Non Normalisé

## 📋 Problème Identifié

### Symptômes

- Message d'erreur : "Cet email entreprise est déjà utilisé"
- Mais l'email n'existe pas dans la base de données
- Le compte est quand même créé malgré l'erreur
- Problème de doublons avec différentes casses (ex: "Test@Example.com" vs "test@example.com")

### Cause Racine

Le problème avait **3 causes principales** :

#### 1. **Email Non Normalisé Après Validation**

**Avant (PROBLÉMATIQUE) :**

```javascript
// Dans authEntrepriseService.js
const emailValidated = validateEmail(email_entreprise); // Retourne "test@example.com" (normalisé)
if (!emailValidated) {
  throw new ApiError("Email entreprise invalide", 400);
}
// ❌ PROBLÈME : On n'utilise pas emailValidated, on continue avec email_entreprise original

const emailAlreadyExists = await entrepriseModel.emailExists(email_entreprise); // Utilise "Test@Example.com" (original)
```

**Pourquoi c'était mauvais :**

- `validateEmail()` normalise l'email en lowercase (`email.toLowerCase()`)
- Mais on ne récupérait pas cette valeur normalisée
- On continuait à utiliser l'email original du `data`
- PostgreSQL est **sensible à la casse** pour VARCHAR
- Donc "Test@Example.com" ≠ "test@example.com" dans les comparaisons

#### 2. **Requêtes SQL Sensibles à la Casse**

**Avant (PROBLÉMATIQUE) :**

```javascript
// Dans entrepriseModel.js
export const emailExists = async (email) => {
  const query = "SELECT id FROM entreprises WHERE email_entreprise = $1"; // ❌ Sensible à la casse
  const result = await pool.query(query, [email]);
  return result.rows.length > 0;
};
```

**Pourquoi c'était mauvais :**

- La comparaison `email_entreprise = $1` est sensible à la casse
- "Test@Example.com" ne correspond pas à "test@example.com"
- Si une requête précédente avait inséré "test@example.com", la vérification avec "Test@Example.com" ne le trouvait pas
- Mais l'insertion échouait avec une contrainte unique (si PostgreSQL avait une contrainte case-insensitive) OU créait un doublon

#### 3. **Pas de Transaction (Race Conditions)**

**Avant (PROBLÉMATIQUE) :**

```javascript
// Pas de transaction
const emailAlreadyExists = await entrepriseModel.emailExists(email_entreprise);
if (emailAlreadyExists) {
  throw new ApiError("Cet email entreprise est déjà utilisé", 409);
}
// ❌ PROBLÈME : Entre cette vérification et l'insertion, une autre requête peut insérer
const entreprise = await entrepriseModel.createEntreprise({...});
```

**Pourquoi c'était mauvais :**

- Deux requêtes simultanées peuvent toutes les deux passer `emailExists` avant que l'une n'insère
- Race condition classique : Time-of-check to time-of-use (TOCTOU)
- Si une erreur se produit après l'INSERT, les données restent en base (pas de rollback)

---

## ✅ Solution Implémentée

### 1. **Normalisation de l'Email AVANT Toutes les Opérations**

**Après (CORRECT) :**

```javascript
// Dans authEntrepriseService.js - validateRegistrationData()
const emailValidated = validateEmail(email_entreprise);
if (!emailValidated) {
  throw new ApiError("Email entreprise invalide", 400);
}
// ✅ CORRECTION : Utiliser l'email normalisé partout
data.email_entreprise = emailValidated; // Force l'utilisation de l'email normalisé
```

**Pourquoi c'est correct :**

- L'email est normalisé une seule fois au début
- On utilise cette valeur normalisée pour toutes les opérations (vérification, insertion)
- Garantit la cohérence : même email = même représentation en base

### 2. **Requêtes SQL Insensibles à la Casse**

**Après (CORRECT) :**

```javascript
// Dans entrepriseModel.js
export const emailExists = async (email, client = null) => {
  const emailNormalized = email.toLowerCase().trim(); // Normalisation supplémentaire
  const query =
    "SELECT id FROM entreprises WHERE LOWER(email_entreprise) = LOWER($1)"; // ✅ Insensible à la casse
  const dbClient = client || pool;
  const result = await dbClient.query(query, [emailNormalized]);
  return result.rows.length > 0;
};
```

**Pourquoi c'est correct :**

- Utilise `LOWER()` dans la requête SQL pour être insensible à la casse
- Double normalisation : dans le code ET dans la requête SQL
- Garantit qu'on trouve toujours l'email, quelle que soit sa casse

### 3. **Transaction pour Garantir l'Atomicité**

**Après (CORRECT) :**

```javascript
// Dans authEntrepriseService.js
import { withTransaction } from "../utils/transactionHelper.js";

export const registerEntreprise = async (data) => {
  validateRegistrationData(data); // Normalise les emails

  return await withTransaction(async (client) => {
    // ✅ Toutes les vérifications dans la transaction
    const emailAlreadyExists = await entrepriseModel.emailExists(email_entreprise, client);
    if (emailAlreadyExists) {
      throw new ApiError("Cet email entreprise est déjà utilisé", 409);
    }

    // ✅ L'insertion aussi dans la transaction
    const entreprise = await entrepriseModel.createEntreprise({...}, client);

    // Si une erreur se produit, rollback automatique
    return { entreprise, token };
  });
};
```

**Pourquoi c'est correct :**

- Toutes les opérations sont dans une transaction
- Si une erreur se produit, rollback automatique (pas de données partielles)
- Évite les race conditions : les vérifications et l'insertion sont atomiques
- Garantit la cohérence des données

---

## 🔍 Comparaison Avant/Après

### Avant (PROBLÉMATIQUE)

```javascript
// 1. Validation (normalise mais on n'utilise pas)
const emailValidated = validateEmail(email_entreprise); // "test@example.com"

// 2. Vérification avec email original (sensible à la casse)
const exists = await emailExists("Test@Example.com"); // Ne trouve pas "test@example.com"

// 3. Insertion avec email original
await createEntreprise({ email_entreprise: "Test@Example.com" }); // Crée un doublon ou échoue
```

### Après (CORRECT)

```javascript
// 1. Validation et normalisation (on utilise la valeur normalisée)
const emailValidated = validateEmail(email_entreprise); // "test@example.com"
data.email_entreprise = emailValidated; // Force l'utilisation normalisée

// 2. Vérification avec email normalisé (insensible à la casse)
const exists = await emailExists("test@example.com", client); // Trouve toujours, même si "Test@Example.com" existe

// 3. Insertion avec email normalisé (dans transaction)
await withTransaction(async (client) => {
  await createEntreprise({ email_entreprise: "test@example.com" }, client); // Atomique
});
```

---

## 📝 Fichiers Modifiés

1. **`backend/src/services/authEntrepriseService.js`**

   - Normalisation de l'email dans `validateRegistrationData()`
   - Utilisation d'une transaction dans `registerEntreprise()`
   - Passage du client de transaction aux fonctions de vérification

2. **`backend/src/models/entrepriseModel.js`**

   - Modification de `emailExists()` pour utiliser `LOWER()` et accepter un client de transaction
   - Modification de `findEntrepriseByEmail()` pour utiliser `LOWER()`
   - Modification de `rcmmExists()` et `nomEntrepriseExists()` pour accepter un client de transaction
   - Modification de `createEntreprise()` pour accepter un client de transaction

3. **`backend/src/utils/transactionHelper.js`**
   - Déjà créé précédemment, utilisé maintenant dans `registerEntreprise()`

---

## 🎯 Résultat

✅ **Plus de doublons** : L'email est toujours normalisé avant insertion  
✅ **Plus de faux positifs** : Les vérifications utilisent `LOWER()` pour être insensibles à la casse  
✅ **Plus de données partielles** : La transaction garantit l'atomicité  
✅ **Plus de race conditions** : Toutes les opérations sont dans une transaction

---

## 🔐 Bonnes Pratiques Appliquées

1. **Normalisation des données** : Toujours normaliser les emails en lowercase
2. **Requêtes insensibles à la casse** : Utiliser `LOWER()` dans les comparaisons SQL
3. **Transactions** : Utiliser des transactions pour les opérations multi-étapes
4. **Atomicité** : Garantir que toutes les opérations réussissent ou échouent ensemble
5. **Cohérence** : Utiliser la même représentation des données partout (normalisée)

---

## 📚 Références

- [PostgreSQL Case Sensitivity](https://www.postgresql.org/docs/current/collation.html)
- [SQL Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [Race Conditions in Databases](https://en.wikipedia.org/wiki/Race_condition#In_software)
