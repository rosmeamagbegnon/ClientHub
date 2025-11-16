# 🔗 Guide d'Intégration Fronend - API TicketsMaster

Pour les développeurs React.js qui vont intégrer cette API.

---

## 🚀 Démarrage

### 1. URL de base

```javascript
const API_BASE_URL = "http://localhost:3000/api"; // développement
const API_BASE_URL = "https://api.ticketsmaster.com/api"; // production
```

### 2. Configuration Axios

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 👤 Authentification Clients

### Inscription Particulier

```javascript
const registerParticulier = async (data) => {
  try {
    const response = await api.post("/auth/clients/register/particulier", {
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      canal_contact: data.canal_contact || "email",
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    const { token, client } = response.data.data;

    // Sauvegarde le token
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(client));

    return { success: true, client, token };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Erreur inscription",
    };
  }
};
```

### Inscription Entreprise

```javascript
const registerEntreprise = async (data) => {
  try {
    const response = await api.post("/auth/clients/register/entreprise", {
      // Responsable
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      telephone: data.telephone,

      // Entreprise
      nom_entreprise: data.nom_entreprise,
      secteur_activite: data.secteur_activite,
      taille_entreprise: data.taille_entreprise,
      poste_occupe: data.poste_occupe,
      numero_rccm: data.numero_rccm,
      adresse_physique: data.adresse_physique,
      email_professionnel: data.email_professionnel,
      telephone_entreprise: data.telephone_entreprise,
      site_internet: data.site_internet,
      linkedin: data.linkedin,
    });

    const { token, client } = response.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(client));

    return { success: true, client, token };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Erreur inscription",
    };
  }
};
```

### Connexion

```javascript
const login = async (email, password) => {
  try {
    const response = await api.post("/auth/clients/login", {
      email,
      password,
    });

    const { token, client } = response.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(client));

    return { success: true, client, token };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Email ou mot de passe incorrect",
    };
  }
};
```

### Récupération du Profil

```javascript
const getProfile = async () => {
  try {
    const response = await api.get("/auth/clients/me");
    return response.data.data;
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    return null;
  }
};
```

### Déconnexion

```javascript
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Rediriger vers login
};
```

---

## 🔐 Stockage du Token

### Recommandé: localStorage

```javascript
// Sauvegarde
localStorage.setItem("token", token);

// Récupération
const token = localStorage.getItem("token");

// Suppression
localStorage.removeItem("token");
```

### ⚠️ Alternative sécurisée: HttpOnly Cookie

Si le backend envoie les cookies, ils seront automatiquement envoyés avec chaque requête.

```javascript
// Dans axios config
const api = axios.create({
  withCredentials: true, // Important pour les cookies
});
```

---

## 📋 Gestion des Erreurs

```javascript
try {
  const response = await api.get("/some/endpoint");
} catch (error) {
  if (error.response?.status === 401) {
    // Token expiré ou invalide - rediriger vers login
    logout();
  } else if (error.response?.status === 403) {
    // Accès refusé
    console.error("Permission refusée");
  } else if (error.response?.status === 400) {
    // Validation échouée
    console.error(error.response.data.message);
  } else if (error.response?.status === 409) {
    // Conflit (email déjà utilisé, etc.)
    console.error(error.response.data.message);
  } else if (error.response?.status === 429) {
    // Rate limit atteint
    console.error("Trop de requêtes, réessayez plus tard");
  } else {
    // Erreur serveur ou réseau
    console.error("Erreur serveur");
  }
}
```

---

## 🔄 Gestion de l'Authentification Persistante

### Avec React Context

```javascript
// AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifie si l'utilisateur est connecté au démarrage
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/clients/me")
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/clients/login", { email, password });
    const { token, client } = response.data.data;
    localStorage.setItem("token", token);
    setUser(client);
    return client;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Utilisation dans les composants

```javascript
function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;
  if (!user) return <Navigate to="/login" />;

  return <div>Bienvenue {user.prenom}!</div>;
}
```

---

## 🛡️ Bonnes Pratiques Sécurité

### 1. Ne jamais stocker le token en Variable JavaScript

```javascript
// ❌ MAUVAIS
let globalToken;

// ✅ BON
localStorage.setItem("token", token); // ou sessionStorage
```

### 2. Toujours utiliser HTTPS en production

```javascript
// ❌ Développement seulement
const API_URL = "http://localhost:3000";

// ✅ Production
const API_URL = "https://api.ticketsmaster.com";
```

### 3. Valider côté client aussi

```javascript
// Avant d'envoyer à l'API
if (password.length < 8) {
  setError("Mot de passe trop court");
  return;
}
```

### 4. Gérer l'expiration du token

```javascript
// Token expire dans 7 jours, mais vérifier avant usage
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## 📊 Structure de Réponse API

Toutes les réponses suivent ce format:

```javascript
{
  "success": true/false,
  "message": "Message de réponse",
  "data": { /* Données spécifiques */ },

  // En cas d'erreur:
  "error": {
    "message": "Description erreur",
    "statusCode": 400
  }
}
```

---

## 📚 Documentation Complète

Accédez à la documentation interactive Swagger:

👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

---

## 🧪 Tester l'API

### Avec Postman

1. Importer: `tests/TicketsMaster-API.postman_collection.json`
2. Définir l'environnement (localhost:3000)
3. Exécuter les requêtes

### Avec cURL

```bash
# Inscription
curl -X POST http://localhost:3000/api/auth/clients/register/particulier \
  -H "Content-Type: application/json" \
  -d '{
    "prenom":"Jean",
    "nom":"Dupont",
    "email":"jean@test.com",
    "telephone":"+22968123456",
    "password":"SecurePass123!",
    "confirmPassword":"SecurePass123!"
  }'

# Connexion
curl -X POST http://localhost:3000/api/auth/clients/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean@test.com","password":"SecurePass123!"}'
```

---

## ❓ Dépannage

### "Token expiré"

Le token dure 7 jours. Après, il faut se reconnecter.

### "CORS error"

Vérifiez que l'API a le domaine frontend en whitelist dans `.env`:

```
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### "Email déjà utilisé"

Chaque email doit être unique. Utilisez un email différent pour tester.

### "Mot de passe faible"

Doit contenir:

- Min 8 caractères
- 1 majuscule (A-Z)
- 1 chiffre (0-9)
- 1 symbole (!@#$%^&\*, etc.)

Exemple: `MyPass123!`

---

## 🎯 Checklist Intégration

- [ ] Créer le fichier `api.js` avec configuration Axios
- [ ] Implémenter AuthContext
- [ ] Créer écran d'inscription particulier
- [ ] Créer écran d'inscription entreprise
- [ ] Créer écran de connexion
- [ ] Protéger les routes non authentifiées
- [ ] Afficher le profil utilisateur
- [ ] Implémenter la déconnexion
- [ ] Gérer les erreurs API
- [ ] Tester avec Postman d'abord
