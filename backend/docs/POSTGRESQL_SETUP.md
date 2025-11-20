# 🔧 Guide Configuration PostgreSQL Locale

## ⚠️ Problème d'authentification

Si vous recevez l'erreur:

```
password authentication failed for user "postgres"
```

Cela signifie que le mot de passe PostgreSQL dans `.env` est incorrect.

---

## 📋 Solutions

### Option 1: Vérifier/Réinitialiser le mot de passe PostgreSQL

#### Sur Windows (avec pgAdmin):

1. **Ouvrez pgAdmin** (interface web)
2. **Clic droit sur "Server"** → **Properties**
3. Onglet **Connection** → Voir le **Host**, **Port**, **Username**
4. Onglet **Definition** → Changer le mot de passe du user `postgres`
5. Mettre à jour `.env` avec le nouveau mot de passe

#### Ou via cmd/PowerShell (si PostgreSQL est en PATH):

```powershell
# Vous connecter à PostgreSQL (il demandera le mot de passe)
psql -U postgres -h localhost

# Une fois connecté, changer le mot de passe:
ALTER USER postgres WITH PASSWORD 'votre_nouveau_motdepasse';
```

Puis mettre à jour `.env`:

```
DB_PASSWORD=votre_nouveau_motdepasse
```

---

### Option 2: Créer un nouvel utilisateur PostgreSQL

Si vous préférez un nouvel utilisateur:

```sql
-- Dans psql (après connexion):
CREATE USER ticketsmaster WITH PASSWORD 'secure_password_123';
CREATE DATABASE ticketsmaster_db OWNER ticketsmaster;

-- Donner tous les droits:
GRANT ALL PRIVILEGES ON DATABASE ticketsmaster_db TO ticketsmaster;
```

Puis mettre à jour `.env`:

```
DB_USER=ticketsmaster
DB_PASSWORD=secure_password_123
DB_NAME=ticketsmaster_db
```

---

### Option 3: Vérifier que PostgreSQL est lancé

**Sur Windows:**

1. Appuyez sur `Win + R`
2. Tapez `services.msc`
3. Cherchez **PostgreSQL**
4. Vérifiez qu'il est en **Running**
5. Sinon, clic droit → **Start**

Ou en PowerShell:

```powershell
# Voir l'état
Get-Service | Select-String postgres

# Démarrer le service
Start-Service postgresql-x64-15
```

---

## ✅ Vérifier la connexion

Une fois `.env` mis à jour:

```bash
# Test de connexion simple
psql -U postgres -h localhost -d postgres

# Vous devriez voir: postgres=#
```

Puis lancez l'initialisation:

```bash
npm run db:init
# ou
node scripts/initializeDatabase.js
```

---

## 📚 Références

- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [pgAdmin](https://www.pgadmin.org/)
- [PostgreSQL sur Windows](https://www.postgresql.org/download/windows/)
