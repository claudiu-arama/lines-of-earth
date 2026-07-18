export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: unknown;
  public readonly expose?: boolean;

  constructor(options: {
    statusCode: number;
    errorCode: string;
    message: string;
    details?: unknown;
    expose?: boolean;
  }) {
    super(options.message);

    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.errorCode = options.errorCode;
    this.details = options.details;
    this.expose = options.expose ?? true;

    Error.captureStackTrace?.(this, this.constructor);
  }
}
