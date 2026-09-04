export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
