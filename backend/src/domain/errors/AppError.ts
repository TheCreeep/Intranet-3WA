export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    // Maintenir la pile d'appels correcte pour les erreurs personnalisées (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
    // Nécessaire si vous ciblez ES5 ou inférieur pour la propriété `name`
    this.name = this.constructor.name;
  }
} 