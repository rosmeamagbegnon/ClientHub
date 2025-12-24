/**
 * Système de logging centralisé
 * 
 * PROBLÈME RÉSOLU :
 * Avant : Pas de système de logs, utilisation de console.log() partout
 * Pourquoi c'était mauvais :
 * - Pas de contrôle sur les logs en production
 * - Difficile à déboguer
 * - Pas de niveaux de log (info, warn, error)
 * - Logs sensibles (tokens) pourraient être exposés
 * 
 * SOLUTION :
 * Logger centralisé avec niveaux et contrôle par environnement
 * - Logs désactivés en production (sauf erreurs)
 * - Niveaux de log (debug, info, warn, error)
 * - Formatage cohérent
 * - Protection des données sensibles
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogOptions {
  /**
   * Si true, masque les données sensibles (tokens, passwords)
   */
  sanitize?: boolean;
  /**
   * Contexte supplémentaire (nom du service, composant, etc.)
   */
  context?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  /**
   * Log un message de debug (uniquement en développement)
   */
  debug(message: string, data?: any, options?: LogOptions): void {
    if (this.isDevelopment) {
      this.log("debug", message, data, options);
    }
  }

  /**
   * Log un message informatif
   */
  info(message: string, data?: any, options?: LogOptions): void {
    this.log("info", message, data, options);
  }

  /**
   * Log un avertissement
   */
  warn(message: string, data?: any, options?: LogOptions): void {
    this.log("warn", message, data, options);
  }

  /**
   * Log une erreur (toujours affiché, même en production)
   */
  error(message: string, error?: any, options?: LogOptions): void {
    this.log("error", message, error, options);
  }

  /**
   * Log une requête API
   */
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API ${method}`, { url, data }, { sanitize: true });
  }

  /**
   * Log une réponse API
   */
  apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? "error" : "debug";
    this.log(level, `API ${method} ${status}`, { url, data }, { sanitize: true });
  }

  /**
   * Log une erreur API
   */
  apiError(method: string, url: string, error: any): void {
    this.error(`API ${method} Error`, { url, error }, { sanitize: true });
  }

  private log(level: LogLevel, message: string, data?: any, options?: LogOptions): void {
    // En production, on n'affiche que les erreurs
    if (this.isProduction && level !== "error") {
      return;
    }

    const timestamp = new Date().toISOString();
    const context = options?.context ? `[${options.context}]` : "";
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${context}`;

    // Sanitize les données sensibles
    const sanitizedData = options?.sanitize ? this.sanitizeData(data) : data;

    switch (level) {
      case "debug":
        console.debug(prefix, message, sanitizedData || "");
        break;
      case "info":
        console.info(prefix, message, sanitizedData || "");
        break;
      case "warn":
        console.warn(prefix, message, sanitizedData || "");
        break;
      case "error":
        console.error(prefix, message, sanitizedData || "");
        break;
    }
  }

  /**
   * Masque les données sensibles dans les logs
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    if (typeof data === "string") {
      // Masque les tokens JWT
      return data.replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, "Bearer [REDACTED]");
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (typeof data === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Masque les champs sensibles
        if (["password", "token", "authorization", "secret"].includes(key.toLowerCase())) {
          sanitized[key] = "[REDACTED]";
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }

    return data;
  }
}

// Export d'une instance singleton
export const logger = new Logger();

