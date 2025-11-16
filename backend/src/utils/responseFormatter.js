/**
 * Utilitaires de Réponse API
 *
 * Formats de réponse standardisés pour toute l'API.
 * Permet au frontend d'avoir une structure cohérente et prévisible.
 */

/**
 * Réponse de succès
 *
 * @param {Object} data - Données à retourner
 * @param {string} message - Message optionnel
 * @returns {Object} Réponse formatée
 */
export const successResponse = (data, message = "Succès") => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Réponse d'erreur
 *
 * @param {string} message - Message d'erreur
 * @param {number} statusCode - Code HTTP
 * @returns {Object} Réponse formatée
 */
export const errorResponse = (message, statusCode = 500) => {
  return {
    success: false,
    message,
    error: {
      message,
      statusCode,
    },
  };
};

/**
 * Réponse avec pagination
 *
 * @param {Array} data - Données
 * @param {number} total - Total d'éléments
 * @param {number} page - Page actuelle
 * @param {number} limit - Éléments par page
 * @returns {Object} Réponse avec pagination
 */
export const paginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      current: page,
      total: totalPages,
      count: data.length,
      totalItems: total,
    },
  };
};
