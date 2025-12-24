# 📋 DONNÉES FICTIVES POUR CRÉER DES COMPTES

Ce fichier contient des données fictives prêtes à l'emploi pour tester l'inscription de différents types de comptes.

---

## 👤 CLIENT PARTICULIER

### Exemple 1 : Client Particulier Standard

```json
{
  "prenom": "Koffi",
  "nom": "Adjanohoun",
  "email": "koffi.adjanohoun@example.com",
  "telephone": "+22968123456",
  "canal_contact": "whatsapp",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

### Exemple 2 : Client Particulier avec Email

```json
{
  "prenom": "Marie",
  "nom": "Soglo",
  "email": "marie.soglo@example.com",
  "telephone": "+22970123456",
  "canal_contact": "email",
  "password": "MySecure2024!",
  "confirmPassword": "MySecure2024!"
}
```

### Exemple 3 : Client Particulier SMS

```json
{
  "prenom": "Jean",
  "nom": "Boko",
  "email": "jean.boko@example.com",
  "telephone": "+22969123456",
  "canal_contact": "sms",
  "password": "Password123@",
  "confirmPassword": "Password123@"
}
```

### Exemple 4 : Client Particulier (Sans canal_contact - utilise défaut)

```json
{
  "prenom": "Aminatou",
  "nom": "Diallo",
  "email": "aminatou.diallo@example.com",
  "telephone": "+22967123456",
  "password": "TestPass123!",
  "confirmPassword": "TestPass123!"
}
```

---

## 🏢 CLIENT ENTREPRISE

### Exemple 1 : Petite Entreprise (Technologie)

```json
{
  "prenom": "Sébastien",
  "nom": "Kouassi",
  "email": "sebastien.kouassi@techstart.bj",
  "password": "TechStart2024!",
  "confirmPassword": "TechStart2024!",
  "nom_entreprise": "TechStart Bénin SA",
  "secteur_activite": "Technologie",
  "taille_entreprise": "1 - 10 employés",
  "numero_rccm": "BJ-2024-TECH-001",
  "poste_occupe": "Directeur Technique",
  "adresse_physique": "123 Avenue de la République, Cotonou",
  "email_professionnel": "contact@techstart.bj",
  "telephone_entreprise": "+22921234567",
  "site_internet": "https://www.techstart.bj",
  "linkedin": "https://linkedin.com/company/techstart-benin"
}
```

### Exemple 2 : Moyenne Entreprise (Commerce)

```json
{
  "prenom": "Fatou",
  "nom": "Traoré",
  "email": "fatou.traore@commercesa.bj",
  "password": "Commerce2024!",
  "confirmPassword": "Commerce2024!",
  "nom_entreprise": "Commerce SA",
  "secteur_activite": "Commerce",
  "taille_entreprise": "11 - 50 employés",
  "numero_rccm": "BJ-2023-COMM-045",
  "poste_occupe": "Directrice Commerciale",
  "adresse_physique": "456 Boulevard de la Paix, Porto-Novo",
  "email_professionnel": "info@commercesa.bj",
  "telephone_entreprise": "+22921345678",
  "site_internet": "https://www.commercesa.bj",
  "linkedin": "https://linkedin.com/company/commercesa"
}
```

### Exemple 3 : Grande Entreprise (Finance)

```json
{
  "prenom": "Pierre",
  "nom": "Agbessi",
  "email": "pierre.agbessi@financegroup.bj",
  "password": "Finance2024!",
  "confirmPassword": "Finance2024!",
  "nom_entreprise": "Finance Group Bénin",
  "secteur_activite": "Finance",
  "taille_entreprise": "51 - 200 employés",
  "numero_rccm": "BJ-2022-FIN-128",
  "poste_occupe": "Directeur Général",
  "adresse_physique": "789 Rue du Commerce, Cotonou",
  "email_professionnel": "contact@financegroup.bj",
  "telephone_entreprise": "+22921456789",
  "site_internet": "https://www.financegroup.bj",
  "linkedin": "https://linkedin.com/company/financegroup-benin"
}
```

### Exemple 4 : Entreprise (Agriculture) - Sans site/linkedin

```json
{
  "prenom": "Yacouba",
  "nom": "Ouedraogo",
  "email": "yacouba.ouedraogo@agriplus.bj",
  "password": "AgriPlus2024!",
  "confirmPassword": "AgriPlus2024!",
  "nom_entreprise": "AgriPlus Bénin",
  "secteur_activite": "Agriculture",
  "taille_entreprise": "11 - 50 employés",
  "numero_rccm": "BJ-2024-AGRI-012",
  "poste_occupe": "Gérant",
  "adresse_physique": "Route de Parakou, Km 15, Bénin",
  "email_professionnel": "contact@agriplus.bj",
  "telephone_entreprise": "+22921567890"
}
```

---

## 🏢 ENTREPRISE CRM

### Exemple 1 : Entreprise CRM (Technologie)

```json
{
  "nom_entreprise": "Digital Solutions Bénin SARL",
  "secteur_activite": "Technologie",
  "taille_entreprise": "11 - 50 employés",
  "numero_rccm_ifu": "BJ-2021-DIGI-089",
  "email_entreprise": "contact@digitalsolutions.bj",
  "telephone_entreprise": "+22921678901",
  "whatsapp_entreprise": "+22967654321",
  "adresse_professionnelle": "Immeuble Tech Hub, 1er étage, Cotonou",
  "site_internet": "https://www.digitalsolutions.bj",
  "linkedin": "https://linkedin.com/company/digital-solutions-benin",
  "prenom_responsable": "David",
  "nom_responsable": "Gbedo",
  "email_responsable": "david.gbedo@digitalsolutions.bj",
  "password": "DigitalCRM2024!",
  "confirmPassword": "DigitalCRM2024!"
}
```

### Exemple 2 : Entreprise CRM (Commerce)

```json
{
  "nom_entreprise": "E-Commerce Pro Bénin",
  "secteur_activite": "Commerce",
  "taille_entreprise": "51 - 200 employés",
  "numero_rccm_ifu": "BJ-2020-ECO-156",
  "email_entreprise": "info@ecommercepro.bj",
  "telephone_entreprise": "+22921789012",
  "whatsapp_entreprise": "+22967543210",
  "adresse_professionnelle": "Zone Industrielle, Lot 45, Cotonou",
  "site_internet": "https://www.ecommercepro.bj",
  "linkedin": "https://linkedin.com/company/ecommerce-pro-benin",
  "prenom_responsable": "Aicha",
  "nom_responsable": "Moussa",
  "email_responsable": "aicha.moussa@ecommercepro.bj",
  "password": "EcomCRM2024!",
  "confirmPassword": "EcomCRM2024!"
}
```

### Exemple 3 : Entreprise CRM (Transport & Logistique)

```json
{
  "nom_entreprise": "LogiTrans Bénin",
  "secteur_activite": "Transport & Logistique",
  "taille_entreprise": "201 - 500 employés",
  "numero_rccm_ifu": "BJ-2019-LOGI-234",
  "email_entreprise": "contact@logitrans.bj",
  "telephone_entreprise": "+22921890123",
  "whatsapp_entreprise": "+22967432109",
  "adresse_professionnelle": "Gare Routière, Porte 12, Cotonou",
  "site_internet": "https://www.logitrans.bj",
  "linkedin": "https://linkedin.com/company/logitrans-benin",
  "prenom_responsable": "Moussa",
  "nom_responsable": "Diallo",
  "email_responsable": "moussa.diallo@logitrans.bj",
  "password": "LogiTrans2024!",
  "confirmPassword": "LogiTrans2024!"
}
```

### Exemple 4 : Entreprise CRM (Santé)

```json
{
  "nom_entreprise": "Santé Plus Bénin",
  "secteur_activite": "Santé",
  "taille_entreprise": "11 - 50 employés",
  "numero_rccm_ifu": "BJ-2023-SANT-067",
  "email_entreprise": "contact@santeplus.bj",
  "telephone_entreprise": "+22921901234",
  "whatsapp_entreprise": "+22967321098",
  "adresse_professionnelle": "Avenue de la Santé, Quartier Médical, Cotonou",
  "site_internet": "https://www.santeplus.bj",
  "linkedin": "https://linkedin.com/company/sante-plus-benin",
  "prenom_responsable": "Dr. Grace",
  "nom_responsable": "Kouassi",
  "email_responsable": "grace.kouassi@santeplus.bj",
  "password": "SantePlus2024!",
  "confirmPassword": "SantePlus2024!"
}
```

### Exemple 5 : Entreprise CRM (Éducation)

```json
{
  "nom_entreprise": "EduTech Bénin",
  "secteur_activite": "Éducation",
  "taille_entreprise": "1 - 10 employés",
  "numero_rccm_ifu": "BJ-2024-EDU-023",
  "email_entreprise": "info@edutech.bj",
  "telephone_entreprise": "+22921012345",
  "whatsapp_entreprise": "+22967210987",
  "adresse_professionnelle": "Campus Universitaire, Bâtiment A, Cotonou",
  "site_internet": "https://www.edutech.bj",
  "linkedin": "https://linkedin.com/company/edutech-benin",
  "prenom_responsable": "Prof. Koffi",
  "nom_responsable": "Adjovi",
  "email_responsable": "koffi.adjovi@edutech.bj",
  "password": "EduTech2024!",
  "confirmPassword": "EduTech2024!"
}
```

### Exemple 6 : Entreprise CRM (Industrie) - Sans site/linkedin

```json
{
  "nom_entreprise": "Industrie Moderne Bénin",
  "secteur_activite": "Industrie",
  "taille_entreprise": "500+ employés",
  "numero_rccm_ifu": "BJ-2018-INDU-345",
  "email_entreprise": "contact@industriemoderne.bj",
  "telephone_entreprise": "+22921123456",
  "whatsapp_entreprise": "+22967109876",
  "adresse_professionnelle": "Zone Industrielle, Parcelle 78, Cotonou",
  "site_internet": "",
  "linkedin": "",
  "prenom_responsable": "Jean",
  "nom_responsable": "Baptiste",
  "email_responsable": "jean.baptiste@industriemoderne.bj",
  "password": "Industrie2024!",
  "confirmPassword": "Industrie2024!"
}
```

---

## 🔑 RÈGLES POUR LES MOTS DE PASSE

Tous les mots de passe doivent respecter ces critères :

- ✅ Minimum 8 caractères
- ✅ Au moins 1 lettre majuscule
- ✅ Au moins 1 chiffre
- ✅ Au moins 1 caractère spécial (!, @, #, $, %, etc.)

**Exemples de mots de passe valides :**

- `SecurePass123!`
- `MyPassword2024@`
- `Test123#Pass`
- `Admin2024!Secure`

---

## 📝 NOTES IMPORTANTES

### Pour les Clients Particuliers :

- Le champ `canal_contact` est optionnel (défaut: "email")
- Valeurs possibles : `"email"`, `"whatsapp"`, `"sms"`
- Le téléphone doit être au format international : `+229XXXXXXXX`

### Pour les Clients Entreprise :

- Les champs `site_internet` et `linkedin` sont optionnels
- Le `numero_rccm` doit être unique
- Les secteurs d'activité possibles :
  - "Technologie"
  - "Agriculture"
  - "Commerce"
  - "Finance"
  - "Transport & Logistique"
  - "Industrie"
  - "Éducation"
  - "Santé"

### Pour les Entreprises CRM :

- Tous les champs sont requis SAUF `site_internet` et `linkedin` (peuvent être vides "")
- Le `numero_rccm_ifu` doit être unique
- L'`email_responsable` doit être unique
- Les mêmes secteurs d'activité que pour les clients entreprise

---

## 🧪 UTILISATION POUR LES TESTS

### Via Postman ou cURL :

**Client Particulier :**

```bash
curl -X POST http://localhost:3000/api/auth/clients/register/particulier \
  -H "Content-Type: application/json" \
  -d '{
    "prenom": "Koffi",
    "nom": "Adjanohoun",
    "email": "koffi.adjanohoun@example.com",
    "telephone": "+22968123456",
    "canal_contact": "whatsapp",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

**Client Entreprise :**

```bash
curl -X POST http://localhost:3000/api/auth/clients/register/entreprise \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Entreprise CRM :**

```bash
curl -X POST http://localhost:3000/api/auth/entreprises/register \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## ⚠️ ATTENTION

- **Chaque email doit être unique** dans la base de données
- **Chaque RCCM/IFU doit être unique** pour les entreprises
- Changez les emails et RCCM si vous testez plusieurs fois
- Les numéros de téléphone suivent le format béninois : `+229XXXXXXXX`
