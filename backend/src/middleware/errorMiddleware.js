/**
 * Middleware de Gestion des Erreurs Globales
 *
 * Capture toutes les erreurs non traitées et retourne une réponse d'erreur cohérente.
 * Évite que le serveur crash et expose des infos sensibles.
 */

/**
 * Classe personnalisée pour les erreurs API
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Middleware de gestion des erreurs
 * À placer en DERNIER dans l'app (après toutes les autres routes/middlewares)
 */
export const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Erreur serveur interne";

  // Log l'erreur pour le debug
  console.error("❌ Erreur:", {
    statusCode,
    message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Si en développement, on peut envoyer plus de détails
  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        stack: err.stack, // Ne pas afficher en production!
      },
    });
  }

  // En production, renvoyer un message générique
  return res.status(statusCode).json({
    success: false,
    error: {
      message: statusCode === 500 ? "Erreur serveur interne" : message,
      statusCode,
    },
  });
};

/**
 * Middleware pour les routes non trouvées
 */
export const notFoundMiddleware = (req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      message: "Route non trouvée",
      path: req.path,
      statusCode: 404,
    },
  });
};
