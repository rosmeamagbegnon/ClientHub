/**
 * Script SQL pour initialiser la base de données TicketsMaster
 * 
 * ⚠️ À exécuter une seule fois au démarrage du projet
 * 
 * Utilisez pgAdmin ou psql :
 * psql -U postgres -h localhost < src/config/schema.sql
 */

-- ====================================
-- 📋 TABLES - CLIENTS (Particuliers/Entreprises)
-- ====================================

/**
 * Table: clients
 * Stocke tous les clients (particuliers ET entreprises) de la plateforme
 * 
 * Types:
 * - "particulier": Client individuel
 * - "entreprise": Client entreprise
 */
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Infos personnelles
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telephone VARCHAR(20),
  canal_contact VARCHAR(50) DEFAULT 'email', -- 'email', 'whatsapp', 'sms'
  
  -- Authentification
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  
  -- Type de client
  type_client VARCHAR(50) NOT NULL DEFAULT 'particulier', -- 'particulier' | 'entreprise'
  
  -- Infos supplémentaires pour les entreprises
  nom_entreprise VARCHAR(255),
  secteur_activite VARCHAR(100), -- 'Technologie', 'Agriculture', etc.
  taille_entreprise VARCHAR(50), -- '1 - 10 employés', etc.
  poste_occupe VARCHAR(100),
  numero_rccm VARCHAR(50) UNIQUE,
  adresse_physique TEXT,
  email_professionnel VARCHAR(255),
  telephone_entreprise VARCHAR(20),
  site_internet VARCHAR(255),
  linkedin VARCHAR(255),
  
  -- État du compte
  est_actif BOOLEAN DEFAULT true,
  email_verifiee BOOLEAN DEFAULT false,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dernier_login TIMESTAMP,
  
  -- Indice pour recherches rapides
  CONSTRAINT valid_type CHECK (type_client IN ('particulier', 'entreprise'))
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_type ON clients(type_client);
CREATE INDEX idx_clients_actif ON clients(est_actif);


-- ====================================
-- 🏢 TABLES - ENTREPRISES (Qui utilisent le CRM)
-- ====================================

/**
 * Table: entreprises
 * Entreprises qui utilisent TicketsMaster (administrateurs du CRM)
 */
CREATE TABLE IF NOT EXISTS entreprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Infos entreprise
  nom VARCHAR(255) NOT NULL,
  secteur_activite VARCHAR(100) NOT NULL,
  taille_entreprise VARCHAR(50) NOT NULL,
  numero_rccm VARCHAR(50) NOT NULL UNIQUE,
  
  -- Contacts
  contact_principal VARCHAR(100) NOT NULL,
  email_principal VARCHAR(255) NOT NULL UNIQUE,
  telephone_principal VARCHAR(20),
  
  -- Infos additionnelles
  site_internet VARCHAR(255),
  linkedin VARCHAR(255),
  adresse_siege TEXT,
  
  -- Responsable (celui qui a créé le compte)
  prenom_responsable VARCHAR(100) NOT NULL,
  nom_responsable VARCHAR(100) NOT NULL,
  email_responsable VARCHAR(255) NOT NULL,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  
  -- État
  est_actif BOOLEAN DEFAULT true,
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dernier_login TIMESTAMP,
  
  -- Abonnement (bonus)
  plan_abonnement VARCHAR(50) DEFAULT 'standard', -- 'free', 'starter', 'pro'
  date_fin_abonnement TIMESTAMP
);

CREATE INDEX idx_entreprises_email ON entreprises(email_principal);
CREATE INDEX idx_entreprises_rccm ON entreprises(numero_rccm);


-- ====================================
-- 🎫 TABLES - TICKETS
-- ====================================

/**
 * Table: tickets
 * Demandes/réclamations des clients
 */
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  
  -- Contenu
  titre VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type_ticket VARCHAR(50) NOT NULL, -- 'facturation', 'réclamation', 'technique', 'suggestion', 'autre'
  
  -- Statut
  statut VARCHAR(50) NOT NULL DEFAULT 'en_attente',
  /**
   * Statuts possibles:
   * - en_attente: Ticket créé, pas encore étudié
   * - en_cours_etude: Entreprise étudie le ticket
   * - rejete: Ticket refusé
   * - accepte: Accepté par l'entreprise
   * - assigne: Assigné à un agent
   * - en_cours_traitement: En traitement
   * - traite: Résolu
   */
  
  -- Pièce jointe (optionnel)
  fichier_path VARCHAR(500),
  fichier_original_name VARCHAR(255),
  
  -- Dates
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_resolution TIMESTAMP,
  
  -- Metadata
  priorite VARCHAR(20) DEFAULT 'normal', -- 'basse', 'normal', 'haute', 'urgente'
  tags TEXT[], -- Pour catégoriser rapidement
  
  CONSTRAINT valid_statut CHECK (statut IN ('en_attente', 'en_cours_etude', 'rejete', 'accepte', 'assigne', 'en_cours_traitement', 'traite')),
  CONSTRAINT valid_type CHECK (type_ticket IN ('facturation', 'réclamation', 'technique', 'suggestion', 'autre')),
  CONSTRAINT valid_priorite CHECK (priorite IN ('basse', 'normal', 'haute', 'urgente'))
);

CREATE INDEX idx_tickets_client ON tickets(client_id);
CREATE INDEX idx_tickets_entreprise ON tickets(entreprise_id);
CREATE INDEX idx_tickets_statut ON tickets(statut);
CREATE INDEX idx_tickets_date ON tickets(date_creation);


-- ====================================
-- 📝 TABLES - NOTES SUR TICKETS
-- ====================================

/**
 * Table: notes_tickets
 * Notes/commentaires sur les tickets (visibles par les clients)
 */
CREATE TABLE IF NOT EXISTS notes_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  auteur_id UUID NOT NULL,
  
  contenu TEXT NOT NULL,
  est_publique BOOLEAN DEFAULT true, -- visible par le client?
  
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_tickets_ticket ON notes_tickets(ticket_id);


-- ====================================
-- 🛒 TABLES - COMMANDES
-- ====================================

/**
 * Table: commandes
 * Commandes/projets des clients
 */
CREATE TABLE IF NOT EXISTS commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  
  -- Titre et description
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Statut
  statut VARCHAR(50) NOT NULL DEFAULT 'en_attente',
  /**
   * Statuts:
   * - en_attente: En étude
   * - contrat_accepte: Contrat accepté
   * - en_cours_developpement: En développement
   * - livraison: En livraison
   * - livree: Livrée
   * - annulee: Annulée
   */
  
  -- Coûts
  cout_estime DECIMAL(12, 2),
  cout_final DECIMAL(12, 2), -- Rempli à la livraison
  
  -- Étapes
  etape_actuelle INT DEFAULT 1,
  nombre_etapes INT DEFAULT 5,
  
  -- Ticket lié (optionnel)
  ticket_id UUID REFERENCES tickets(id),
  
  -- Dates
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_livraison TIMESTAMP,
  
  CONSTRAINT valid_statut CHECK (statut IN ('en_attente', 'contrat_accepte', 'en_cours_developpement', 'livraison', 'livree', 'annulee'))
);

CREATE INDEX idx_commandes_client ON commandes(client_id);
CREATE INDEX idx_commandes_entreprise ON commandes(entreprise_id);
CREATE INDEX idx_commandes_statut ON commandes(statut);


-- ====================================
-- 📋 TABLES - NOTES SUR COMMANDES
-- ====================================

/**
 * Table: notes_commandes
 * Notes/commentaires sur les commandes
 */
CREATE TABLE IF NOT EXISTS notes_commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  commande_id UUID NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  auteur_id UUID NOT NULL,
  
  contenu TEXT NOT NULL,
  est_publique BOOLEAN DEFAULT true,
  
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_commandes_commande ON notes_commandes(commande_id);


-- ====================================
-- 🎁 TABLES - BONUS/FIDÉLISATION
-- ====================================

/**
 * Table: bonus
 * Bonus créés par l'entreprise pour récompenser les clients
 */
CREATE TABLE IF NOT EXISTS bonus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  
  -- Infos bonus
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  valeur DECIMAL(12, 2),
  
  -- Filtres d'application
  appliquer_a VARCHAR(50) NOT NULL DEFAULT 'tous', -- 'tous', 'specifique', 'filtre'
  client_id UUID REFERENCES clients(id),
  
  -- Filtres optionnels
  type_client_filtre VARCHAR(50), -- 'particulier', 'entreprise', null = tous
  secteur_filtre VARCHAR(100),
  taille_filtre VARCHAR(50),
  
  -- Validité
  date_debut TIMESTAMP NOT NULL,
  date_fin TIMESTAMP NOT NULL,
  conditions TEXT,
  
  -- État
  est_actif BOOLEAN DEFAULT true,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bonus_entreprise ON bonus(entreprise_id);
CREATE INDEX idx_bonus_client ON bonus(client_id);


-- ====================================
-- 💬 TABLES - CHATBOT
-- ====================================

/**
 * Table: sessions_chatbot
 * Sessions de conversation avec le chatbot
 */
CREATE TABLE IF NOT EXISTS sessions_chatbot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  
  date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_fin TIMESTAMP,
  statut VARCHAR(50) DEFAULT 'active' -- 'active', 'fermee'
);

/**
 * Table: messages_chatbot
 * Messages échangés dans une session
 */
CREATE TABLE IF NOT EXISTS messages_chatbot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  session_id UUID NOT NULL REFERENCES sessions_chatbot(id) ON DELETE CASCADE,
  
  role VARCHAR(20) NOT NULL, -- 'client' ou 'bot'
  contenu TEXT NOT NULL,
  type_contenu VARCHAR(50) DEFAULT 'texte', -- 'texte', 'lien', 'suggestion'
  
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_chatbot_session ON messages_chatbot(session_id);


-- ====================================
-- 📊 TABLES - AUDIT ET LOGS
-- ====================================

/**
 * Table: audit_log
 * Journal d'audit pour tracer toutes les actions importantes
 */
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  utilisateur_id UUID,
  entreprise_id UUID,
  
  action VARCHAR(100) NOT NULL, -- 'create_ticket', 'update_order', etc.
  entite_type VARCHAR(100), -- 'ticket', 'commande', 'client', etc.
  entite_id UUID,
  
  details JSONB, -- Changements effectués
  
  adresse_ip VARCHAR(50),
  user_agent TEXT,
  
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_utilisateur ON audit_log(utilisateur_id);
CREATE INDEX idx_audit_log_date ON audit_log(date_creation);


-- ====================================
-- ✅ CONFIRMATION CRÉATION
-- ====================================

SELECT 'Database initialized successfully! ✅' as status;
