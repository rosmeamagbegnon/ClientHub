import {
  createSession,
  getSessionById,
  getActiveSession,
  listClientSessions,
  closeSession,
  sessionBelongsToClient,
  addMessage,
  getSessionMessages,
  getNewMessages,
  countSessionMessages,
  getLastMessage,
  sessionExists,
  isValidUUID,
} from "../models/chatbotModel.js";

import { getTicketService, listTicketsService } from "./ticketService.js";

import { getCommandeService, listCommandesService } from "./commandeService.js";

import { getBonusForClientService } from "./bonusService.js";

import { ApiError } from "../utils/responseFormatter.js";

/**
 * 💬 CHATBOT SERVICE - Business Logic Layer
 *
 * Gère le moteur de conversation intelligent et l'intégration des données.
 * Utilise les models pour accéder aux données et fournit des réponses contextuelles.
 *
 * Pattern: MVC - Service (business logic only)
 */

// ==================== BASE DE CONNAISSANCES ====================

/**
 * Base de connaissances FAQ - Questions fréquentes et réponses
 */
const FAQ_KNOWLEDGE_BASE = {
  // Accueil et présentation
  bonjour: {
    response:
      "Bonjour ! Je suis l'assistant virtuel de TicketsMaster. Je peux vous aider avec :\n• Le statut de vos tickets\n• Le suivi de vos commandes\n• Vos bonus disponibles\n• Questions générales\n\nComment puis-je vous aider aujourd'hui ?",
    intent: "WELCOME",
  },
  salut: {
    response:
      "Salut ! 👋 Je suis là pour vous aider. Que souhaitez-vous savoir ?",
    intent: "WELCOME",
  },
  aide: {
    response:
      "Bien sûr ! Voici ce que je peux faire pour vous :\n\n🔹 **Tickets** : Consulter le statut, créer un nouveau ticket\n🔹 **Commandes** : Suivre l'avancement, connaître les délais\n🔹 **Bonus** : Voir vos réductions disponibles\n🔹 **Support** : Questions sur nos services\n\nQue cherchez-vous précisément ?",
    intent: "HELP",
  },

  // Tickets
  ticket: {
    response:
      "Je peux vous aider avec vos tickets. Souhaitez-vous :\n• Connaître le statut d'un ticket spécifique ? (dites-moi le numéro)\n• Voir la liste de tous vos tickets ?\n• Créer un nouveau ticket ?",
    intent: "TICKET_HELP",
  },
  "statut ticket": {
    response:
      "Pour consulter le statut d'un ticket, donnez-moi son numéro (ex: #12345) ou dites 'mes tickets' pour voir la liste.",
    intent: "TICKET_STATUS_HELP",
  },
  "mes tickets": {
    response: "Je vais chercher la liste de vos tickets...",
    intent: "LIST_TICKETS",
  },

  // Commandes
  commande: {
    response:
      "Je peux vous aider avec vos commandes. Voulez-vous :\n• Connaître le statut d'une commande ?\n• Voir toutes vos commandes en cours ?\n• Savoir les délais de livraison ?",
    intent: "ORDER_HELP",
  },
  "statut commande": {
    response:
      "Pour consulter le statut d'une commande, donnez-moi son numéro ou dites 'mes commandes' pour voir toutes vos commandes.",
    intent: "ORDER_STATUS_HELP",
  },
  "mes commandes": {
    response: "Je recherche vos commandes en cours...",
    intent: "LIST_ORDERS",
  },

  // Bonus
  bonus: {
    response: "Je vais vérifier vos bonus disponibles...",
    intent: "LIST_BONUS",
  },
  réduction: {
    response: "Je consulte vos offres promotionnelles...",
    intent: "LIST_BONUS",
  },
  promotion: {
    response: "Je regarde quelles promotions s'appliquent à vous...",
    intent: "LIST_BONUS",
  },

  // Support général
  contact: {
    response:
      "Vous pouvez contacter notre support :\n📧 Email : support@ticketsmaster.com\n📞 Téléphone : +229 XX XX XX XX\n💬 Via l'interface de tickets\n\nQuel canal préférez-vous ?",
    intent: "CONTACT_INFO",
  },
  heure: {
    response:
      "Nos horaires d'ouverture :\n🕘 Lundi - Vendredi : 8h-18h\n🕘 Samedi : 9h-13h\n❌ Dimanche : Fermé\n\nNous sommes actuellement ouverts !",
    intent: "BUSINESS_HOURS",
  },

  // Fallback
  default: {
    response:
      "Je n'ai pas bien compris. Je peux vous aider avec :\n• Vos tickets et commandes\n• Vos bonus et promotions\n• Informations sur nos services\n\nPouvez-vous reformuler votre question ?",
    intent: "FALLBACK",
  },
};

/**
 * Patterns pour la détection d'intentions avancée
 */
const INTENT_PATTERNS = {
  TICKET_STATUS: [
    /ticket[ ]*#?([0-9a-f-]+)/i,
    /statut.*ticket[ ]*#?([0-9a-f-]+)/i,
    /où.*en.*est.*ticket[ ]*#?([0-9a-f-]+)/i,
    /ticket[ ]*([0-9a-f-]+)/i,
  ],
  ORDER_STATUS: [
    /commande[ ]*#?([0-9a-f-]+)/i,
    /statut.*commande[ ]*#?([0-9a-f-]+)/i,
    /où.*en.*est.*commande[ ]*#?([0-9a-f-]+)/i,
    /commande[ ]*([0-9a-f-]+)/i,
  ],
  CREATE_TICKET: [
    /crée.*ticket/i,
    /nouveau.*ticket/i,
    /ouvrir.*ticket/i,
    /déposer.*ticket/i,
  ],
};

// ==================== GESTION SESSIONS ====================

/**
 * Crée ou récupère une session active pour un client
 * @param {string} clientId - ID du client
 * @param {string} entrepriseId - ID de l'entreprise
 * @returns {Promise<Object>} Session active
 */
export const getOrCreateSession = async (clientId, entrepriseId) => {
  // Validation des UUID
  if (!isValidUUID(clientId) || !isValidUUID(entrepriseId)) {
    throw new ApiError("IDs client ou entreprise invalides", 400);
  }

  try {
    // Chercher une session active existante
    let session = await getActiveSession(clientId, entrepriseId);

    // Si pas de session active, en créer une nouvelle
    if (!session) {
      session = await createSession({
        client_id: clientId,
        entreprise_id: entrepriseId,
      });

      // Ajouter le message de bienvenue
      await addMessage({
        session_id: session.id,
        role: "bot",
        contenu: FAQ_KNOWLEDGE_BASE.bonjour.response,
        type_contenu: "texte",
      });
    }

    return {
      success: true,
      session,
      is_new: !session.date_debut, // Simplifié pour détection nouvelle session
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les sessions d'un client
 * @param {string} clientId - ID du client
 * @param {number} page - Page
 * @param {number} limit - Limite par page
 * @returns {Promise<Object>} Sessions et pagination
 */
export const getClientSessionsService = async (
  clientId,
  page = 1,
  limit = 20
) => {
  if (!isValidUUID(clientId)) {
    throw new ApiError("ID client invalide", 400);
  }

  if (page < 1 || limit < 1 || limit > 100) {
    throw new ApiError("Paramètres de pagination invalides", 400);
  }

  const offset = (page - 1) * limit;

  try {
    const sessions = await listClientSessions(clientId, limit, offset);

    return {
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        // Note: Le count total serait utile ici pour une pagination complète
      },
    };
  } catch (error) {
    throw error;
  }
};

// ==================== MOTEUR DE CONVERSATION ====================

/**
 * Traite un message utilisateur et génère une réponse
 * @param {string} sessionId - ID de la session
 * @param {string} message - Message de l'utilisateur
 * @param {string} clientId - ID du client (pour validation)
 * @returns {Promise<Object>} Réponse du chatbot
 */
export const processMessageService = async (sessionId, message, clientId) => {
  // Validation
  if (!sessionId || !message || !clientId) {
    throw new ApiError("Données manquantes", 400);
  }

  if (!isValidUUID(sessionId) || !isValidUUID(clientId)) {
    throw new ApiError("IDs invalides", 400);
  }

  // Vérifier que la session appartient au client
  const isOwner = await sessionBelongsToClient(sessionId, clientId);
  if (!isOwner) {
    throw new ApiError("Accès non autorisé à cette session", 403);
  }

  // Vérifier que la session existe
  const sessionExists = await getSessionById(sessionId);
  if (!sessionExists) {
    throw new ApiError("Session non trouvée", 404);
  }

  try {
    // 1. Ajouter le message de l'utilisateur à l'historique
    const userMessage = await addMessage({
      session_id: sessionId,
      role: "client",
      contenu: message.trim(),
      type_contenu: "texte",
    });

    // 2. Analyser l'intention et générer une réponse
    const botResponse = await generateResponse(
      sessionId,
      message,
      clientId,
      sessionExists.entreprise_id
    );

    // 3. Ajouter la réponse du bot à l'historique
    const botMessage = await addMessage({
      session_id: sessionId,
      role: "bot",
      contenu: botResponse.response,
      type_contenu: botResponse.type_contenu || "texte",
    });

    return {
      success: true,
      user_message: userMessage,
      bot_response: botMessage,
      intent: botResponse.intent,
      data: botResponse.data || null,
    };
  } catch (error) {
    // En cas d'erreur, ajouter un message d'erreur générique
    await addMessage({
      session_id: sessionId,
      role: "bot",
      contenu: "Désolé, une erreur s'est produite. Veuillez réessayer.",
      type_contenu: "texte",
    });

    throw error;
  }
};

/**
 * Génère une réponse intelligente basée sur le message
 * @param {string} sessionId - ID de la session
 * @param {string} message - Message utilisateur
 * @param {string} clientId - ID du client
 * @param {string} entrepriseId - ID de l'entreprise
 * @returns {Promise<Object>} Réponse générée
 */
const generateResponse = async (sessionId, message, clientId, entrepriseId) => {
  const normalizedMessage = message.toLowerCase().trim();

  // 1. Détection d'intention avancée avec patterns
  const detectedIntent = detectIntent(normalizedMessage);

  if (detectedIntent) {
    return await handleDetectedIntent(detectedIntent, clientId, entrepriseId);
  }

  // 2. Recherche dans la base de connaissances FAQ
  const faqResponse = findFAQResponse(normalizedMessage);
  if (faqResponse) {
    return faqResponse;
  }

  // 3. Fallback vers réponse par défaut
  return FAQ_KNOWLEDGE_BASE.default;
};

/**
 * Détecte l'intention du message avec patterns avancés
 * @param {string} message - Message normalisé
 * @returns {Object|null} Intention détectée
 */
const detectIntent = (message) => {
  // Détection statut ticket avec numéro
  for (const pattern of INTENT_PATTERNS.TICKET_STATUS) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return {
        type: "TICKET_STATUS",
        ticketId: match[1],
        confidence: 0.9,
      };
    }
  }

  // Détection statut commande avec numéro
  for (const pattern of INTENT_PATTERNS.ORDER_STATUS) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return {
        type: "ORDER_STATUS",
        orderId: match[1],
        confidence: 0.9,
      };
    }
  }

  // Détection création ticket
  for (const pattern of INTENT_PATTERNS.CREATE_TICKET) {
    if (pattern.test(message)) {
      return {
        type: "CREATE_TICKET",
        confidence: 0.8,
      };
    }
  }

  return null;
};

/**
 * Gère les intentions détectées avec données réelles
 * @param {Object} intent - Intention détectée
 * @param {string} clientId - ID du client
 * @param {string} entrepriseId - ID de l'entreprise
 * @returns {Promise<Object>} Réponse avec données
 */
const handleDetectedIntent = async (intent, clientId, entrepriseId) => {
  switch (intent.type) {
    case "TICKET_STATUS":
      return await handleTicketStatusIntent(intent.ticketId, clientId);

    case "ORDER_STATUS":
      return await handleOrderStatusIntent(intent.orderId, clientId);

    case "CREATE_TICKET":
      return {
        response:
          "Pour créer un nouveau ticket, veuillez utiliser la section 'Tickets' dans votre interface et cliquer sur 'Créer un ticket'. Je ne peux pas créer de tickets directement, mais je peux vous aider à suivre ceux existants !",
        intent: "CREATE_TICKET_REDIRECT",
        type_contenu: "suggestion",
      };

    default:
      return FAQ_KNOWLEDGE_BASE.default;
  }
};

/**
 * Gère la demande de statut de ticket
 * @param {string} ticketId - ID du ticket
 * @param {string} clientId - ID du client
 * @returns {Promise<Object>} Réponse avec statut
 */
const handleTicketStatusIntent = async (ticketId, clientId) => {
  try {
    // Nettoyer l'ID du ticket (enlever # etc.)
    const cleanTicketId = ticketId.replace("#", "").trim();

    if (!isValidUUID(cleanTicketId)) {
      return {
        response: `Le numéro de ticket "${ticketId}" ne semble pas valide. Les numéros de ticket sont des UUID (ex: 550e8400-e29b-41d4-a716-446655440000). Pouvez-vous vérifier le numéro ?`,
        intent: "TICKET_STATUS_ERROR",
        type_contenu: "texte",
      };
    }

    // Récupérer les infos du ticket
    const ticketInfo = await getTicketService(
      cleanTicketId,
      clientId,
      "client"
    );

    if (ticketInfo.success) {
      const ticket = ticketInfo.ticket;
      const statusEmoji = getTicketStatusEmoji(ticket.statut);

      return {
        response: `🎫 **Ticket #${cleanTicketId.substring(
          0,
          8
        )}**\n\n📋 **Titre** : ${
          ticket.titre
        }\n📊 **Statut** : ${statusEmoji} ${
          ticket.statut
        }\n📅 **Créé le** : ${new Date(ticket.date_creation).toLocaleDateString(
          "fr-FR"
        )}\n🏢 **Entreprise** : ${ticket.nom_entreprise}\n\n${
          ticket.notes && ticket.notes.length > 0
            ? `💬 **Dernières notes** : ${ticket.notes
                .slice(0, 2)
                .map((n) => n.contenu)
                .join(", ")}`
            : "Aucune note récente"
        }`,
        intent: "TICKET_STATUS_SUCCESS",
        type_contenu: "texte",
        data: ticket,
      };
    }
  } catch (error) {
    if (error.statusCode === 404) {
      return {
        response: `Je n'ai pas trouvé de ticket avec le numéro "${ticketId}". Vérifiez le numéro ou essayez "mes tickets" pour voir la liste de tous vos tickets.`,
        intent: "TICKET_NOT_FOUND",
        type_contenu: "texte",
      };
    }

    // Erreur autre que 404
    return {
      response:
        "Désolé, je n'ai pas pu récupérer les informations du ticket. Veuillez réessayer plus tard.",
      intent: "TICKET_STATUS_ERROR",
      type_contenu: "texte",
    };
  }
};

/**
 * Gère la demande de statut de commande
 * @param {string} orderId - ID de la commande
 * @param {string} clientId - ID du client
 * @returns {Promise<Object>} Réponse avec statut
 */
const handleOrderStatusIntent = async (orderId, clientId) => {
  try {
    const cleanOrderId = orderId.replace("#", "").trim();

    if (!isValidUUID(cleanOrderId)) {
      return {
        response: `Le numéro de commande "${orderId}" ne semble pas valide. Les numéros de commande sont des UUID. Pouvez-vous vérifier le numéro ?`,
        intent: "ORDER_STATUS_ERROR",
        type_contenu: "texte",
      };
    }

    const orderInfo = await getCommandeService(
      cleanOrderId,
      clientId,
      "client"
    );

    if (orderInfo.success) {
      const commande = orderInfo.commande;
      const statusEmoji = getOrderStatusEmoji(commande.statut);
      const progressBar = generateProgressBar(
        commande.etape_actuelle,
        commande.nombre_etapes
      );

      return {
        response: `🛒 **Commande #${cleanOrderId.substring(
          0,
          8
        )}**\n\n📋 **Titre** : ${
          commande.titre
        }\n📊 **Statut** : ${statusEmoji} ${
          commande.statut
        }\n📈 **Progression** : ${progressBar} (Étape ${
          commande.etape_actuelle
        }/${commande.nombre_etapes})\n💰 **Coût estimé** : ${
          commande.cout_estime ? `${commande.cout_estime}€` : "Non précisé"
        }\n📅 **Créée le** : ${new Date(
          commande.date_creation
        ).toLocaleDateString("fr-FR")}`,
        intent: "ORDER_STATUS_SUCCESS",
        type_contenu: "texte",
        data: commande,
      };
    }
  } catch (error) {
    if (error.statusCode === 404) {
      return {
        response: `Je n'ai pas trouvé de commande avec le numéro "${orderId}". Vérifiez le numéro ou essayez "mes commandes" pour voir la liste de toutes vos commandes.`,
        intent: "ORDER_NOT_FOUND",
        type_contenu: "texte",
      };
    }

    return {
      response:
        "Désolé, je n'ai pas pu récupérer les informations de la commande. Veuillez réessayer plus tard.",
      intent: "ORDER_STATUS_ERROR",
      type_contenu: "texte",
    };
  }
};

/**
 * Recherche une réponse dans la base de connaissances FAQ
 * @param {string} message - Message normalisé
 * @returns {Object|null} Réponse FAQ
 */
const findFAQResponse = (message) => {
  // Recherche exacte d'abord
  for (const [keyword, response] of Object.entries(FAQ_KNOWLEDGE_BASE)) {
    if (keyword !== "default" && message.includes(keyword)) {
      return response;
    }
  }

  // Recherche par intentions spécifiques
  if (message.includes("mes tickets") || message.includes("liste tickets")) {
    return FAQ_KNOWLEDGE_BASE["mes tickets"];
  }

  if (
    message.includes("mes commandes") ||
    message.includes("liste commandes")
  ) {
    return FAQ_KNOWLEDGE_BASE["mes commandes"];
  }

  if (
    message.includes("bonus") ||
    message.includes("réduction") ||
    message.includes("promotion")
  ) {
    return FAQ_KNOWLEDGE_BASE.bonus;
  }

  return null;
};

// ==================== GESTION MESSAGES ====================

/**
 * Récupère l'historique des messages d'une session
 * @param {string} sessionId - ID de la session
 * @param {string} clientId - ID du client (validation)
 * @param {number} page - Page
 * @param {number} limit - Limite par page
 * @returns {Promise<Object>} Messages et pagination
 */
export const getSessionMessagesService = async (
  sessionId,
  clientId,
  page = 1,
  limit = 50
) => {
  // Validation sécurité
  const isOwner = await sessionBelongsToClient(sessionId, clientId);
  if (!isOwner) {
    throw new ApiError("Accès non autorisé à cette session", 403);
  }

  if (page < 1 || limit < 1 || limit > 100) {
    throw new ApiError("Paramètres de pagination invalides", 400);
  }

  const offset = (page - 1) * limit;

  try {
    const messages = await getSessionMessages(sessionId, limit, offset);
    const total = await countSessionMessages(sessionId);

    return {
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère les nouveaux messages depuis un certain ID
 * @param {string} sessionId - ID de la session
 * @param {string} clientId - ID du client
 * @param {string} lastMessageId - ID du dernier message connu
 * @returns {Promise<Object>} Nouveaux messages
 */
export const getNewMessagesService = async (
  sessionId,
  clientId,
  lastMessageId = null
) => {
  // Validation sécurité
  const isOwner = await sessionBelongsToClient(sessionId, clientId);
  if (!isOwner) {
    throw new ApiError("Accès non autorisé à cette session", 403);
  }

  try {
    const newMessages = await getNewMessages(sessionId, lastMessageId);
    const lastMessage =
      newMessages.length > 0 ? newMessages[newMessages.length - 1] : null;

    return {
      success: true,
      has_updates: newMessages.length > 0,
      messages: newMessages,
      last_message_id: lastMessage ? lastMessage.id : lastMessageId,
    };
  } catch (error) {
    throw error;
  }
};

// ==================== UTILITAIRES ====================

/**
 * Génère une barre de progression visuelle
 * @param {number} current - Étape actuelle
 * @param {number} total - Total d'étapes
 * @returns {string} Barre de progression
 */
const generateProgressBar = (current, total) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;

  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percentage}%`;
};

/**
 * Retourne l'emoji correspondant au statut d'un ticket
 * @param {string} status - Statut du ticket
 * @returns {string} Emoji
 */
const getTicketStatusEmoji = (status) => {
  const emojis = {
    en_attente: "⏳",
    en_cours_etude: "🔍",
    rejete: "❌",
    accepte: "✅",
    assigne: "👤",
    en_cours_traitement: "⚙️",
    traite: "🎉",
  };

  return emojis[status] || "📋";
};

/**
 * Retourne l'emoji correspondant au statut d'une commande
 * @param {string} status - Statut de la commande
 * @returns {string} Emoji
 */
const getOrderStatusEmoji = (status) => {
  const emojis = {
    en_attente: "⏳",
    contrat_accepte: "📝",
    en_cours_developpement: "🚧",
    livraison: "🚚",
    livree: "🎉",
    annulee: "❌",
  };

  return emojis[status] || "📦";
};
